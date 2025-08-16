using System.ComponentModel.DataAnnotations;
using UserService.Domain.Const;

namespace UserService.Application.DTOs.Identities;

public class RegisterRequest
{
    [Required]
    [StringLength(UserConst.UsernameMaxLength)]
    public string Username { get; set; } = string.Empty;
    [Required]
    [StringLength(UserConst.EmailMaxLength)]
    public string Email { get; set; } = string.Empty;
    [Required]
    [StringLength(UserConst.PasswordMaxLength)]
    public string Password { get; set; } = string.Empty;
}

public class RegisterInfo : RegisterRequest
{
    public string ConfirmationCode { get; set; }
    
    public DateTime TimeStamp { get; set; } = DateTime.UtcNow;
}

public class RegisterResponse : BaseReponse
{
    public string Message { get; set; } = "Verification code sent to your email.";   
}