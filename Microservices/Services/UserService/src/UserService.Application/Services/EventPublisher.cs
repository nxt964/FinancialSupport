using KafkaService;
using Microsoft.Extensions.Logging;
using Shared.Events;
using UserService.Application.Interfaces;

namespace UserService.Application.Services;

public class EventPublisher : IEventPublisher
{
    private readonly IKafkaService _kafkaService;
    private readonly ILogger<EventPublisher> _logger;

    public EventPublisher(IKafkaService kafkaService, ILogger<EventPublisher> logger)
    {
        _kafkaService = kafkaService;
        _logger = logger;
    }

    public async Task PublishUserRegisteredAsync(UserRegisteredEvent evt, CancellationToken cancellationToken = default)
    {
        try
        {
            await _kafkaService.PublishAsync("user-registered", evt, cancellationToken);
            _logger.LogInformation("User registered event published for {Email}", evt.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish user registered event for {Email}", evt.Email);
            throw;
        }
    }

    public async Task PublishPasswordResetAsync(PasswordResetEvent evt, CancellationToken cancellationToken = default)
    {
        try
        {
            await _kafkaService.PublishAsync("password-reset", evt, cancellationToken);
            _logger.LogInformation("Password reset event published for {Email}", evt.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish password reset event for {Email}", evt.Email);
            throw;
        }
    }

    public async Task PublishUserLoginAsync(UserLoginEvent evt, CancellationToken cancellationToken = default)
    {
        try
        {
            await _kafkaService.PublishAsync("user-login", evt, cancellationToken);
            _logger.LogInformation("User login event published for {Email}", evt.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish user login event for {Email}", evt.Email);
            throw;
        }
    }

    public async Task PublishUserProfileUpdatedAsync(UserProfileUpdatedEvent evt, CancellationToken cancellationToken = default)
    {
        try
        {
            await _kafkaService.PublishAsync("user-profile-updated", evt, cancellationToken);
            _logger.LogInformation("User profile updated event published for {Email}", evt.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish user profile updated event for {Email}", evt.Email);
            throw;
        }
    }
} 