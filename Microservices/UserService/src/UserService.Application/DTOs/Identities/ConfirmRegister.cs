using System.ComponentModel.DataAnnotations;
using UserService.Domain.Const;

namespace UserService.Application.DTOs.Identities;

public class ConfirmRegisterRequest
{
    [Required]
    [StringLength(UserConst.EmailMaxLength)]
    public string Email  { get; set; }
    [Required]
    public string Code { get; set; }
}

public class ConfirmRegisterResponse : BaseReponse
{
}