using System.ComponentModel.DataAnnotations;
using UserService.Domain.Const;

namespace UserService.Application.DTOs.Identities;

public class ResetPasswordRequest
{
    [Required]
    [StringLength(UserConst.PasswordMaxLength)]
    public string NewPassword { get; set; } = string.Empty;
    [Required]
    [StringLength(UserConst.PasswordMaxLength)]
    public string ConfirmPassword { get; set; } = string.Empty;
    [Required]
    public string ResetToken { get; set; } = string.Empty;
    [Required]
    [StringLength(UserConst.EmailMaxLength)]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordResponse : BaseReponse
{}