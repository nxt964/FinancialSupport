using UserService.Domain.Const;

namespace UserService.Application.DTOs.Users;

public class ValidateTokenRequest
{
    public string Token { get; set; } = string.Empty;
} 

public class ValidateTokenResponse
{
    public bool IsValid { get; set; }
    public Guid? UserId { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? Message { get; set; }
} 