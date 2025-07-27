using UserService.Domain.Entities;

namespace UserService.Domain.Services;

public interface IAuthDomainService
{
    Task<bool> IsEmailOrUsernameExistedAsync(string email, string username);
    
    Task<Guid?>AuthenticateAsync(string email, string password);
    Task<Guid> CreateAsync(string email, string username, string password);

    Task<string> GenerateResetPasswordTokenAsync(string email);

    Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    
    Task ChangePasswordAsync(Guid id, string oldPassword, string newPassword);

    Task LogoutAsync(Guid id);
}