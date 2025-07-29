using System.ComponentModel.DataAnnotations;
using UserService.Domain.Const;

namespace UserService.Application.DTOs.Identities;

public class ChangePasswordRequest
{
    public Guid? Id { get; set; }
    [Required]
    [StringLength(UserConst.PasswordMaxLength)]
    public string OldPassword { get; set; } = string.Empty;
    [Required]
    [StringLength(UserConst.PasswordMaxLength)]
    public string NewPassword { get; set; } = string.Empty;
    [Required]
    [StringLength(UserConst.PasswordMaxLength)]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ChangePasswordResponse : BaseReponse
{
    
}