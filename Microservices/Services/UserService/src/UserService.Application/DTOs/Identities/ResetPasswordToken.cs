namespace UserService.Application.DTOs.Identities;

public class ResetPasswordTokenRequest
{
    public string Email { get; set; }
}

public class ResetPasswordTokenInfo
{
    
    public string ResetToken { get; set; }
    
    public string ConfirmationCode { get; set; }
    
    public DateTime TimeStamp { get; set; } = DateTime.UtcNow;
}

public class ResetPasswordTokenResponse : BaseReponse
{
}