using EmailService.Application.Interfaces;
using MailKit.Net.Smtp;
using EmailService.Application.Common.Email;
using EmailService.Application.DTOs.Users;
using EmailService.Application.Exceptions;
using EmailService.Application.Templates;
using MimeKit;
using MailKit.Security;

namespace EmailService.Application.Services;

public class EmailSenderService (
    SmtpSettings smtpSettings,
    ITemplateService templateService
) : IEmailSenderService
{
    private readonly SmtpSettings _smtpSettings = smtpSettings;
    private readonly ITemplateService _templateService = templateService;
    
    public async Task ConfirmNewEmailAsync(ConfirmNewEmail request)
    {
        var emailTemplate = await _templateService.GetTemplateAsync(TemplateConstants.ConfirmationEmail);
        var emailBody = _templateService.ReplaceInTemplate(emailTemplate,
            new Dictionary<string, string>
            {
                { "{username}", request.Username },
                { "{verificationLink}", request.ConfirmationLink },
            });
        await SendEmailAsync(request.Email, "Confirm your new email", emailBody);
    }
    
    
    //______________________________________IMPLEMENT SEND EMAIL___________________________________________________________________
    
    private MimeMessage CreateEmail(EmailMessage emailMessage)
    {
        var builder = new BodyBuilder { HtmlBody = emailMessage.Body };

        if (emailMessage.Attachments.Count > 0)
            foreach (var attachment in emailMessage.Attachments)
                builder.Attachments.Add(attachment.Name, attachment.Value);

        var email = new MimeMessage
        {
            Subject = emailMessage.Subject,
            Body = builder.ToMessageBody()
        };

        email.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromEmail));
        email.To.Add(new MailboxAddress(emailMessage.ToAddress.Split("@")[0], emailMessage.ToAddress));

        return email;
    }

    private async Task SendEmailAsync(string email, string subject, string body)
    {
        var emailMessage = EmailMessage.Create(
            toAddress: email,
            body: body,
            subject: subject
        );

        await SendAsync(CreateEmail(emailMessage));
    }
    private async Task SendAsync(MimeMessage message)
    {
        using var client = new SmtpClient();

        try
        {
            if (_smtpSettings.SmtpPort == 465)
            {
                // Use SSL
                await client.ConnectAsync(_smtpSettings.SmtpHost, _smtpSettings.SmtpPort, SecureSocketOptions.SslOnConnect);
            }
            else if (_smtpSettings.SmtpPort == 587)
            {
                // Use STARTTLS
                await client.ConnectAsync(_smtpSettings.SmtpHost, _smtpSettings.SmtpPort, SecureSocketOptions.StartTls);
            }
            else
            {
                throw new BadRequestException("StmpPort not found!");
            }

            client.AuthenticationMechanisms.Remove("XOAUTH2");
            await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);

            await client.SendAsync(message);
        }
        catch
        {
            await client.DisconnectAsync(true);
            client.Dispose();

            throw;
        }
    }
}