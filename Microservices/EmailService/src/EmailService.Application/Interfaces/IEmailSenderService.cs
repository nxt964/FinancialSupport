using EmailService.Application.DTOs.Users;

namespace EmailService.Application.Interfaces;

public interface IEmailSenderService
{
    Task ConfirmNewEmailAsync(ConfirmNewEmail request);
}