namespace UserService.Application.DTOs.Identities;

public class ConfirmResetPasswordTokenRequest
{
    public string Code { get; set; }
}

public class ConfirmResetPasswordTokenResponse : BaseReponse
{
    public string ResetToken { get; set; }
}