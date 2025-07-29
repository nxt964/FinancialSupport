namespace UserService.Application.Interfaces;

public interface IEmailServiceClient
{
    void SendConfirmEmailAsync(string email, string username, string confirmationCode);
    
    void SendResetPasswordCodeAsync(string email, string code);
} 