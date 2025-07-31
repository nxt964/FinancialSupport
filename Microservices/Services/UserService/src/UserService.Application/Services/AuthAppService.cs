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

        var redisKey = $"register:{confirmationCode}_{request.Email}";
        await redisService.SetAsync(redisKey, request, TimeSpan.FromMinutes(10));
        
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
    
    private static string GenerateConfirmationCode()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
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
    
    public async Task<ConfirmRegisterResponse> ConfirmRegisterAsync(ConfirmRegisterRequest request)
    {
        var redisKey = $"register:{request.Code}_{request.Email}";
        var regInfo = await redisService.GetAsync<RegisterRequest>(redisKey);
        if (regInfo == null)
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

    public async Task<ResetPasswordTokenResponse> RequestResetPasswordTokenAsync(ResetPasswordTokenRequest request)
    {
        var resetToken = await authDomainService.GenerateResetPasswordTokenAsync(request.Email);
        var resetCode = GenerateConfirmationCode();
        var resetKey = $"reset_code:{resetCode}_{request.Email}";
        await redisService.SetAsync(resetKey, resetToken, TimeSpan.FromMinutes(10));
        
        await eventPublisher.PublishPasswordResetAsync(new PasswordResetEvent
        {
            Email = request.Email,
            ResetCode = resetCode
        });
        return new ResetPasswordTokenResponse { Message = "Reset password code sent to your email." };
    }

    public async Task<ConfirmResetPasswordTokenResponse> ValidateResetPasswordTokenAsync(ConfirmResetPasswordTokenRequest request)
    {
        var redisKey = $"reset_code:{request.Code}_{request.Email}";
        var resetToken = await redisService.GetAsync<string>(redisKey);
        if (string.IsNullOrEmpty(resetToken)) throw new ValidationException("Invalid or expired reset code.");
        await redisService.DeleteAsync(redisKey);
        return new ConfirmResetPasswordTokenResponse
        {
            ResetToken = resetToken,
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
}
