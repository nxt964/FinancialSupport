namespace UserService.Domain.Interfaces;

using UserService.Domain.Entities;

public interface IUserDomainService
{
    Task<User> GetByIdAsync(Guid id);
    Task<IEnumerable<User>> GetAllAsync();
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(Guid id);
} 