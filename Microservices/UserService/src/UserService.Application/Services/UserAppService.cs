using UserService.Application.DTOs.Users;
using UserService.Application.Exceptions;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;

namespace UserService.Application.Services;

public class UserAppService(
    IUserDomainService userDomainService
    ) : IUserAppService
{
    public async Task<User> GetByIdAsync(Guid id)
    {
        return await userDomainService.GetByIdAsync(id);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await userDomainService.GetAllAsync();
    }

    public async Task<ChangeInformationReponse> UpdateAsync(ChangeInfomationRequest request)
    {
        var user = await userDomainService.GetByIdAsync(request.Id);
        
        if (request.NewUsername != null) user.Username = request.NewUsername;
        if (request.NewEmail != null) user.Email = request.NewEmail;
        if (request.NewProfileImage != null) user.ProfileImage = request.NewProfileImage;
        
        await userDomainService.UpdateAsync(user);
        return new ChangeInformationReponse()
        {
            Message = $"Successfully updated user {user.Username}"
        };
    }
    
    public async Task DeleteAsync(Guid id)
    {
        await userDomainService.DeleteAsync(id);
    }
} 