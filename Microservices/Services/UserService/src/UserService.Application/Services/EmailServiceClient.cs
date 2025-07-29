using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using UserService.Application.Interfaces;

namespace UserService.Application.Services;

public class EmailServiceClient(
    HttpClient httpClient, 
    ILogger<EmailServiceClient> logger
    ) : IEmailServiceClient
{
    public void SendConfirmEmailAsync(string email, string username, string confirmationCode)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                var request = new
                {
                    Email = email,
                    Username = username,
                    ConfirmationCode = confirmationCode
                };

                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync("/api/UserService/confirm-email", content);
                
                if (response.IsSuccessStatusCode)
                {
                    logger.LogInformation("Confirmation email sent successfully to {Email}", email);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    logger.LogError("Failed to send confirmation email. Status: {StatusCode}, Error: {Error}", 
                        response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error sending confirmation email to {Email}", email);
            }
        });
    }

    public void SendResetPasswordCodeAsync(string email, string confirmationCode)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                var request = new
                {
                    Email = email,
                    Code = confirmationCode
                };

                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync("/api/UserService/confirm-reset-password", content);
                
                if (response.IsSuccessStatusCode)
                {
                    logger.LogInformation("Confirmation email sent successfully to {Email}", email);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    logger.LogError("Failed to send reset password email. Status: {StatusCode}, Error: {Error}", 
                        response.StatusCode, errorContent);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error sending reset passwor email to {Email}", email);
            }
        });
    }
} 