namespace UserService.Application.DTOs.Identities;

public class ResendCodeRequest
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
}

public class ResendCodeResponse : BaseReponse
{
}
