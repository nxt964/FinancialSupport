using System.ComponentModel.DataAnnotations;
using UserService.Domain.Const;

namespace UserService.Application.DTOs.Users;

public class ChangeInfomationRequest
{
    [Required]
    public Guid Id { get; set; }
    
    [StringLength(UserConst.UsernameMaxLength)]
    public string? NewUsername { get; set; } = string.Empty;
    
    [StringLength(UserConst.PasswordMaxLength)]
    public string? NewEmail { get; set; } = string.Empty;
    
    [StringLength(UserConst.ProfileImageMaxLength)]
    public string? NewProfileImage { get; set; } = string.Empty;
}

public class ChangeInformationReponse : BaseReponse
{}