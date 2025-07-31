using KafkaService;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Shared.Events;
using EmailService.Application.Interfaces;

namespace EmailService.Application.Services;

public class EmailEventConsumer : BackgroundService
{
    private readonly IKafkaService _kafkaService;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<EmailEventConsumer> _logger;

    public EmailEventConsumer(
        IKafkaService kafkaService,
        IServiceScopeFactory serviceScopeFactory,
        ILogger<EmailEventConsumer> logger)
    {
        _kafkaService = kafkaService;
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email Event Consumer started");

        // Wait a bit for Kafka to be fully ready
        await Task.Delay(5000, stoppingToken);

        // Start consuming user-registered events
        var userRegisteredTask = ConsumeUserRegisteredEvents(stoppingToken);
        
        // Start consuming password-reset events
        var passwordResetTask = ConsumePasswordResetEvents(stoppingToken);

        // Wait for all tasks to complete
        await Task.WhenAll(userRegisteredTask, passwordResetTask);
    }

    private async Task ConsumeUserRegisteredEvents(CancellationToken cancellationToken)
    {
        await _kafkaService.ConsumeAsync<UserRegisteredEvent>(
            groupId: "email-service-user-registered",
            topic: "user-registered",
            messageHandler: async (evt) =>
            {
                try
                {
                    _logger.LogInformation("Processing user registered event for {Email}", evt.Email);
                    
                    using var scope = _serviceScopeFactory.CreateScope();
                    var emailSenderService = scope.ServiceProvider.GetRequiredService<IEmailSenderService>();
                    
                    await emailSenderService.ConfirmNewEmailAsync(new EmailService.Application.DTOs.Users.ConfirmNewEmail
                    {
                        Email = evt.Email,
                        Username = evt.Username,
                        ConfirmationCode = evt.ConfirmationCode
                    });
                    
                    _logger.LogInformation("Successfully sent confirmation email to {Email}", evt.Email);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process user registered event for {Email}", evt.Email);
                }
            },
            cancellationToken);
    }

    private async Task ConsumePasswordResetEvents(CancellationToken cancellationToken)
    {
        await _kafkaService.ConsumeAsync<PasswordResetEvent>(
            groupId: "email-service-password-reset",
            topic: "password-reset",
            messageHandler: async (evt) =>
            {
                try
                {
                    _logger.LogInformation("Processing password reset event for {Email}", evt.Email);
                    
                    using var scope = _serviceScopeFactory.CreateScope();
                    var emailSenderService = scope.ServiceProvider.GetRequiredService<IEmailSenderService>();
                    
                    await emailSenderService.ResetPasswordAsync(new EmailService.Application.DTOs.Users.ResetPassword
                    {
                        Email = evt.Email,
                        Code = evt.ResetCode
                    });
                    
                    _logger.LogInformation("Successfully sent password reset email to {Email}", evt.Email);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process password reset event for {Email}", evt.Email);
                }
            },
            cancellationToken);
    }
} 