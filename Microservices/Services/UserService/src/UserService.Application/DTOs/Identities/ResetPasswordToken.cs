namespace UserService.Application.DTOs.Identities;

public class ResetPasswordTokenRequest
{
    public string Email { get; set; }
}

public class ResetPasswordTokenResponse : BaseReponse
{
}