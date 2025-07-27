namespace UserService.Application.DTOs.Identities;

public class ConfirmRegisterRequest
{
    public string Code { get; set; }
}

public class ConfirmRegisterResponse : BaseReponse
{
}