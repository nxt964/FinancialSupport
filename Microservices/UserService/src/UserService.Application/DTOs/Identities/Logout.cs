using System.ComponentModel.DataAnnotations;

namespace UserService.Application.DTOs.Identities;

public class LogoutRequest
{
    [Required]
    public Guid Id { get; set; }
    
    public string? AccessToken { get; set; }
}

public class LogoutResponse : BaseReponse
{
}