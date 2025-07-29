using System.ComponentModel.DataAnnotations;
using UserService.Domain.Const;

namespace UserService.Application.DTOs.Identities;

public class LoginRequest
{
    [Required]
    [StringLength(UserConst.UsernameMaxLength)]
    public string Username { get; set; } = string.Empty;
    [Required]
    [StringLength(UserConst.UsernameMaxLength)]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse : BaseReponse
{
    public string UserName { get; set; }
    public string Email { get; set; }
    public string ProfileImage { get; set; } = String.Empty;
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
}