using System.Diagnostics;
using UserService.Application.DTOs.Identities;
using UserService.Application.Exceptions;
using UserService.Application.Interfaces;
using UserService.Domain.Interfaces;
using UserService.Domain.Services;
using Shared.RedisService;
using UserService.Domain.Entities;
using Shared.Events;

namespace UserService.Application.Services;

public class AuthAppService(
    IAuthDomainService authDomainService,
    ITokenAppService tokenAppService,
    IUserDomainService userDomainService,
    IEventPublisher eventPublisher,
    IRedisService redisService
    ) : IAuthAppService
{
    public async Task<LoginResponse> AuthenticateAsync(LoginRequest request)
    {
        var userId = await authDomainService.AuthenticateAsync(request.Username, request.Password);
        if(userId == null) throw new ValidationException("Wrong username or password");
        
        var user = await userDomainService.GetByIdAsync(userId.Value);
        var userRole = await userDomainService.GetUserRoleAsync(userId.Value);
        
        var (accessToken, refreshToken) = await tokenAppService.GenerateTokenAsync(userId.Value, user.Email);

        return new LoginResponse()
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            Email = user.Email,
            Id = user.Id,
            Role = userRole,
            UserName = user.Username
        };
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        var isUserExisted = await authDomainService.IsEmailOrUsernameExistedAsync(request.Email, request.Username);
        if(isUserExisted) throw new BadRequestException("Email or username already exists");
        
        var confirmationCode = GenerateConfirmationCode();

        var redisKey = $"register_{request.Email}";

        var registerInfo = new RegisterInfo()
        {
            Email = request.Email,
            Username = request.Username,
            Password = request.Password,
            ConfirmationCode = confirmationCode,
        };
        await redisService.SetAsync(redisKey, registerInfo, TimeSpan.FromMinutes(10));
        
        await eventPublisher.PublishUserRegisteredAsync(new UserRegisteredEvent
        {
            Email = request.Email,
            Username = request.Username,
            ConfirmationCode = confirmationCode
        });

        return new RegisterResponse
        {
            Message = "Code send to your Email"
        };
    }
    
    public async Task<ResendCodeResponse> ResendRegisterCodeAsync(ResendCodeRequest request)
    {
        // Check if user already exists
        var isUserExisted = await authDomainService.IsEmailOrUsernameExistedAsync(request.Email, request.Username);
        if (isUserExisted) 
            throw new BadRequestException("Email or username already exists");
        
        // Generate new confirmation code
        var confirmationCode = GenerateConfirmationCode();
        
        // Store in Redis with new expiration
        var redisKey = $"register_{request.Email}";
        var regInfo = await redisService.GetAsync<RegisterInfo>(redisKey);
        if(regInfo == null) throw new ValidationException("Registration info expired or not found");
        
        var elapsed = DateTime.UtcNow - regInfo.TimeStamp;
        var cooldown = TimeSpan.FromMinutes(1);

        if (elapsed < cooldown)
        {
            var remaining = cooldown - elapsed;
            throw new BadRequestException($"Please wait {remaining.Seconds} seconds before submitting again!");
        }
        regInfo.ConfirmationCode = confirmationCode;
        regInfo.TimeStamp = DateTime.Now;
        await redisService.SetAsync(redisKey, regInfo, TimeSpan.FromMinutes(10));
        
        // Publish event to send email
        await eventPublisher.PublishUserRegisteredAsync(new UserRegisteredEvent
        {
            Email = request.Email,
            Username = request.Username,
            ConfirmationCode = confirmationCode
        });

        return new ResendCodeResponse
        {
            Message = "New confirmation code sent to your email"
        };
    }
    
    public async Task<ConfirmRegisterResponse> ConfirmRegisterAsync(ConfirmRegisterRequest request)
    {
        var redisKey = $"register_{request.Email}";
        var regInfo = await redisService.GetAsync<RegisterInfo>(redisKey);
        if (regInfo?.ConfirmationCode != request.Code)
            throw new ValidationException("Registration info expired or not found");

        var userId = await authDomainService.CreateAsync(regInfo.Email, regInfo.Username, regInfo.Password);
        var user = new User
        {
            Id = userId,
            Email = regInfo.Email,
            Username = regInfo.Username
        };

        await userDomainService.AddAsync(user);

        await redisService.DeleteAsync(redisKey);

        return new ConfirmRegisterResponse
        {
            Id = userId,
            Message = "Confirm User successfully!"
        };
    }

    public async Task<ChangePasswordResponse> UpdatePasswordAsync(ChangePasswordRequest request)
    {
        if(request.Id == null) throw new UnauthorizedAccessException();
        await authDomainService.ChangePasswordAsync(request.Id.Value, request.OldPassword, request.NewPassword);
        return new ChangePasswordResponse
        {
            Message = "Password changed successfully"
        };
    }

    public async Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        return await tokenAppService.RefreshAccessTokenAsync(request);
    }

    public async Task<ResetPasswordTokenResponse> RequestResetPasswordTokenAsync(ResetPasswordTokenRequest request)
    {
        var resetToken = await authDomainService.GenerateResetPasswordTokenAsync(request.Email);
        var resetCode = GenerateConfirmationCode();
        var resetKey = $"reset_code_{request.Email}";
        var resetInfo = new ResetPasswordTokenInfo
        {
            ResetToken = resetToken,
            ConfirmationCode = resetCode,
        };
        await redisService.SetAsync(resetKey, resetInfo, TimeSpan.FromMinutes(10));
        
        await eventPublisher.PublishPasswordResetAsync(new PasswordResetEvent
        {
            Email = request.Email,
            ResetCode = resetCode
        });
        return new ResetPasswordTokenResponse { Message = "Reset password code sent to your email." };
    }
    
    public async Task<ResendCodeResponse> ResendResetPasswordCodeAsync(ResendCodeRequest request)
    {
        // Generate new reset code
        var resetCode = GenerateConfirmationCode();
        
        // Store in Redis with new expiration
        var resetKey = $"reset_code_{request.Email}";
        var resetInfo = await redisService.GetAsync<ResetPasswordTokenInfo>(resetKey);
        if(resetInfo == null) throw new ValidationException("Reset code expired or not found");
        
        var elapsed = DateTime.UtcNow - resetInfo.TimeStamp;
        var cooldown = TimeSpan.FromMinutes(1);

        if (elapsed < cooldown)
        {
            var remaining = cooldown - elapsed;
            throw new BadRequestException($"Please wait {remaining.Seconds} seconds before submitting again!");
        }
        resetInfo.ConfirmationCode = resetCode;
        resetInfo.TimeStamp = DateTime.Now;
        await redisService.SetAsync(resetKey, resetInfo, TimeSpan.FromMinutes(10));
        
        // Publish event to send email
        await eventPublisher.PublishPasswordResetAsync(new PasswordResetEvent
        {
            Email = request.Email,
            ResetCode = resetCode
        });

        return new ResendCodeResponse
        {
            Message = "New reset password code sent to your email"
        };
    }

    public async Task<ConfirmResetPasswordTokenResponse> ValidateResetPasswordTokenAsync(ConfirmResetPasswordTokenRequest request)
    {
        var redisKey = $"reset_code_{request.Email}";
        var resetInfo = await redisService.GetAsync<ResetPasswordTokenInfo>(redisKey);
        
        if(resetInfo?.ConfirmationCode != request.Code)
            throw new ValidationException("Invalid or expired reset code.");
        
        await redisService.DeleteAsync(redisKey);
        return new ConfirmResetPasswordTokenResponse
        {
            ResetToken = resetInfo.ResetToken,
            Message = "Reset code is valid."
        };
    }

    public async Task<ResetPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request)
    {
        await authDomainService.ResetPasswordAsync(request.Email, request.ResetToken, request.NewPassword);
        return new ResetPasswordResponse { Message = "Password has been reset successfully." };
    }

    public async Task<LogoutResponse> LogoutAsync(LogoutRequest request)
    {
        await authDomainService.LogoutAsync(request.Id);
        Debug.Assert(request.AccessToken != null);
        await tokenAppService.RevokeTokenAsync(request.Id, request.AccessToken);
        return new LogoutResponse { Message = "Logout successful" };
    }        
    
    private static string GenerateConfirmationCode()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }
}
