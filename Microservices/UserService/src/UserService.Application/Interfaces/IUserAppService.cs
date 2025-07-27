using UserService.Application.DTOs;
using UserService.Application.DTOs.Identities;
using UserService.Application.DTOs.Users;
using UserService.Domain.Entities;

namespace UserService.Application.Interfaces;

public interface IUserAppService
{
    Task<User> GetByIdAsync(Guid id);
    Task<IEnumerable<User>> GetAllAsync();
    Task<ChangeInformationReponse> UpdateAsync(ChangeInfomationRequest request);
    Task DeleteAsync(Guid id);
} 