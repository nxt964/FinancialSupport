using Shared.Events;

namespace UserService.Application.Interfaces;

public interface IEventPublisher
{
    Task PublishUserRegisteredAsync(UserRegisteredEvent evt, CancellationToken cancellationToken = default);
    Task PublishPasswordResetAsync(PasswordResetEvent evt, CancellationToken cancellationToken = default);
    Task PublishUserLoginAsync(UserLoginEvent evt, CancellationToken cancellationToken = default);
    Task PublishUserProfileUpdatedAsync(UserProfileUpdatedEvent evt, CancellationToken cancellationToken = default);
} 