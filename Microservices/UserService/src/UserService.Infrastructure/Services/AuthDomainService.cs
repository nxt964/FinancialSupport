using Microsoft.AspNetCore.Identity;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;
using UserService.Domain.Services;
using UserService.Infrastructure.Exceptions;
using UserService.Infrastructure.Identity;
using InvalidOperationException = System.InvalidOperationException;

namespace UserService.Infrastructure.Services;

public class AuthDomainService(
    UserManager<ApplicationUser> userManager, 
    SignInManager<ApplicationUser> signInManager)
    : IAuthDomainService
{
    public async Task<bool> IsEmailOrUsernameExistedAsync(string email, string username)
    {
        var user = await userManager.FindByNameAsync(username)
            ?? await userManager.FindByEmailAsync(email);
        return user != null;
    }
    
    public async Task<Guid?> AuthenticateAsync(string email, string password)
    {
        var user = await userManager.FindByEmailAsync(email) 
                   ?? await userManager.FindByNameAsync(email);
        if (user == null) return null;
        var result = await signInManager.CheckPasswordSignInAsync(user, password, false);
        if (!result.Succeeded) return null;
        return user.Id;
    }

    public async Task<Guid> CreateAsync(string email, string username, string password)
    {
        var appUser = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = username,
            CreatedAt = DateTime.UtcNow
        };
        var result = await userManager.CreateAsync(appUser, password);
        if (!result.Succeeded)
            throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));
        return appUser.Id;
    }
    
    public async Task<string> GenerateResetPasswordTokenAsync(string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null) throw new InvalidOperationException("User not found");

        return await userManager.GeneratePasswordResetTokenAsync(user);
    }
    
    public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
            throw new InvalidOperationException("User not found");

        var result = await userManager.ResetPasswordAsync(user, token, newPassword);

        if (result.Succeeded) return true;
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        throw new InvalidOperationException($"Password reset failed: {errors}");
    }
    
    public async Task ChangePasswordAsync(Guid id, string oldPassword, string newPassword)
    {
        var user = await userManager.FindByIdAsync(id.ToString());

        if (user == null)
            throw new NotFoundException("User not found");

        var result = await userManager.ChangePasswordAsync(user, oldPassword, newPassword);

        if (result.Succeeded == false)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Password change failed: {errors}");
        }
    }
    
    public async Task LogoutAsync(Guid id)
    {
        await signInManager.SignOutAsync();
    }
}