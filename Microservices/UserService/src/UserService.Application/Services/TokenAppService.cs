using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using UserService.Application.Interfaces;
using Shared.RedisService;
using UserService.Application.DTOs.Identities;
using UserService.Application.Exceptions;
using UserService.Application.Options;
using ValidationException = System.ComponentModel.DataAnnotations.ValidationException;

namespace UserService.Application.Services;

public class TokenAppService(
    IRedisService redisService, 
    IOptions<JwtSettings> jwtOptions) : ITokenAppService
{
    private readonly JwtSettings _jwtSettings = jwtOptions.Value;

    public async Task<(string AccessToken, string RefreshToken)> GenerateTokenAsync(Guid userId, string email)
    {
        var accessToken = CreateJwtToken(userId, email, _jwtSettings.AccessTokenLifespanMinutes);

        var refreshToken = CreateJwtToken(userId, email, _jwtSettings.RefreshTokenLifespanMinutes);

        // Store refresh token in Redis keyed by userId
        var refreshTokenKey = $"refresh_token:{userId}";
        await redisService.SetAsync(refreshTokenKey, refreshToken, TimeSpan.FromMinutes(_jwtSettings.RefreshTokenLifespanMinutes));

        return (accessToken, refreshToken);
    }

    private string CreateJwtToken(Guid userId, string email, int lifespanMinutes)
    {
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Email, email)
            }),
            Expires = DateTime.UtcNow.AddMinutes(lifespanMinutes),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public async Task<bool> IsTokenInBlackListAsync(string token)
    {
        var key = $"black_list:{token}";
        var value = await redisService.GetAsync<string>(key);
        return !string.IsNullOrEmpty(value);
    }

    private bool ValidateJwt(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);
        try
        {
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out _);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<RefreshTokenResponse> RefreshAccessTokenAsync(RefreshTokenRequest request)
    {
        var isValid = ValidateJwt(request.RefreshToken);

        if (!isValid) throw new ValidationException("Invalid token");
        
        var principal = GetPrincipalFromToken(request.RefreshToken);
        if (principal == null) throw new ValidationException("Invalid refresh token claims");
        
        var email = principal?.FindFirst(ClaimTypes.Email)?.Value;
        var userIdFromToken = principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(email) || userIdFromToken == null) throw new ValidationException("Invalid token");
        var userId = Guid.Parse(userIdFromToken);
        
        var refreshTokenKey = $"refresh_token:{userId}";
        var storedRefreshToken = await redisService.GetAsync<string>(refreshTokenKey);

        if (storedRefreshToken == null || storedRefreshToken != request.RefreshToken)
        {
            throw new ValidationException("Refresh token is invalid or expired");
        }

        // Generate new tokens
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);
        var newAccessToken = CreateJwtToken(userId, email, _jwtSettings.AccessTokenLifespanMinutes);
        var newRefreshToken = CreateJwtToken(userId, email, _jwtSettings.RefreshTokenLifespanMinutes);

        // Replace the refresh token in Redis
        await redisService.SetAsync(refreshTokenKey, newRefreshToken, TimeSpan.FromMinutes(_jwtSettings.RefreshTokenLifespanMinutes));

        return new RefreshTokenResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        };
    }

    public Task<bool> RevokeTokenAsync(Guid userId, string accessToken)
    {
        var redisKey = $"black_list:{accessToken}";
        redisService.SetAsync(redisKey, accessToken, TimeSpan.FromMinutes(_jwtSettings.AccessTokenLifespanMinutes));
        
        var refreshTokenKey = $"refresh_token:{userId}";
        return redisService.DeleteAsync(refreshTokenKey);
    }
    
    public ClaimsPrincipal? GetPrincipalFromToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out _);

            return principal;
        }
        catch
        {
            return null;
        }
    }
}
