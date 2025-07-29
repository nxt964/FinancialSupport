using System.Security.Claims;
using UserService.Application.DTOs.Identities;

namespace UserService.Application.Interfaces;

public interface ITokenAppService
{
    Task<(string AccessToken, string RefreshToken)> GenerateTokenAsync(Guid id, string email);

    Task<bool> IsTokenInBlackListAsync(string token);
    
    ClaimsPrincipal? GetPrincipalFromToken(string token);
    
    Task<RefreshTokenResponse> RefreshAccessTokenAsync(RefreshTokenRequest request);

    Task<bool> RevokeTokenAsync(Guid userId, string accessToken);
} 