using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.Exceptions;
using UserService.Infrastructure.Identity;

namespace UserService.Infrastructure.Services;

public class UserDomainService(
    ApplicationDbContext context, 
    UserManager<ApplicationUser> userManager)
    : IUserDomainService
{
    public async Task<User> GetByIdAsync(Guid id)
    {
        var user = await context.Users.FindAsync(id);
        if(user == null) throw new NotFoundException("User not found");
        
        return user;
    }
    
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await context.Users.ToListAsync();
    }

    public async Task AddAsync(User user)
    {
        await context.Users.AddAsync(user);
        await context.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        // Update the User entity
        context.Users.Update(user);
        
        // Update the corresponding ApplicationUser if it exists
        var applicationUser = await userManager.FindByIdAsync(user.Id.ToString());
        if (applicationUser != null)
        {
            applicationUser.UserName = user.Username;
            applicationUser.Email = user.Email;
            applicationUser.NormalizedUserName = user.Username.ToUpper();
            applicationUser.NormalizedEmail = user.Email.ToUpper();
            
            await userManager.UpdateAsync(applicationUser);
        }
        
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await context.Users.FindAsync(id);
        if (user == null) throw new NotFoundException("User not found");
        
        // Delete the corresponding ApplicationUser first
        var applicationUser = await userManager.FindByIdAsync(id.ToString());
        if (applicationUser != null)
        {
            await userManager.DeleteAsync(applicationUser);
        }
        
        // Delete the User entity
        context.Users.Remove(user);
        await context.SaveChangesAsync();
    }
} 