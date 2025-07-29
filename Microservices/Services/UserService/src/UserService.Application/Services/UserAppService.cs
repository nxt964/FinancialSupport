using UserService.Application.DTOs.Users;
using UserService.Application.Exceptions;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;

namespace UserService.Application.Services;

public class UserAppService(
    IUserDomainService userDomainService,
    ITokenAppService tokenAppService
    ) : IUserAppService
{
    public async Task<User> GetByIdAsync(Guid id)
    {
        return await userDomainService.GetByIdAsync(id);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await userDomainService.GetAllAsync();
    }

    public async Task<ChangeInformationReponse> UpdateAsync(ChangeInfomationRequest request)
    {
        var user = await userDomainService.GetByIdAsync(request.Id);
        
        if (!string.IsNullOrEmpty(request.NewUsername)) user.Username = request.NewUsername;
        if (!string.IsNullOrEmpty(request.NewEmail)) user.Email = request.NewEmail;
        if (!string.IsNullOrEmpty(request.NewProfileImage)) user.ProfileImage = request.NewProfileImage;
        
        await userDomainService.UpdateAsync(user);
        return new ChangeInformationReponse()
        {
            Message = $"Successfully updated user {user.Username}"
        };
    }
    
    public async Task DeleteAsync(Guid id)
    {
        await userDomainService.DeleteAsync(id);
    }

    public async Task<UpdateRoleResponse> UpdateRoleAsync(UpdateRoleRequest request)
    {
        await userDomainService.UpdateUserRoleAsync(request.UserId, request.Role);
        
        return new UpdateRoleResponse()
        {
            UserId = request.UserId,
            Role = request.Role,
            Message = $"Successfully updated role to {request.Role}"
        };
    }

    public async Task<ValidateTokenResponse> ValidateTokenAsync(ValidateTokenRequest request)
    {
        try
        {
            // Check if token is in blacklist
            var isBlacklisted = await tokenAppService.IsTokenInBlackListAsync(request.Token);
            if (isBlacklisted)
            {
                return new ValidateTokenResponse()
                {
                    IsValid = false,
                    Message = "Token is blacklisted"
                };
            }

            // Get principal from token
            var principal = tokenAppService.GetPrincipalFromToken(request.Token);
            if (principal == null)
            {
                return new ValidateTokenResponse()
                {
                    IsValid = false,
                    Message = "Invalid token"
                };
            }

            // Extract user information from claims
            var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var emailClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(emailClaim))
            {
                return new ValidateTokenResponse()
                {
                    IsValid = false,
                    Message = "Token missing required claims"
                };
            }

            var userId = Guid.Parse(userIdClaim);
            
            // Get user information from domain service
            var user = await userDomainService.GetByIdAsync(userId);
            var userRole = await userDomainService.GetUserRoleAsync(userId);
            
            return new ValidateTokenResponse()
            {
                IsValid = true,
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                Roles = new List<string> { userRole },
                Message = "Token is valid"
            };
        }
        catch (Exception ex)
        {
            return new ValidateTokenResponse()
            {
                IsValid = false,
                Message = ex.Message
            };
        }
    }
} 