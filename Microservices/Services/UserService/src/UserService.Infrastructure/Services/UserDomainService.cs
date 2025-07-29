using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.Exceptions;
using UserService.Infrastructure.Identity;
using InvalidOperationException = UserService.Infrastructure.Exceptions.InvalidOperationException;

namespace UserService.Infrastructure.Services;

public class UserDomainService(
    ApplicationDbContext context, 
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager)
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

    public async Task<string> GetUserRoleAsync(Guid userId)
    {
        var applicationUser = await userManager.FindByIdAsync(userId.ToString());
        if (applicationUser == null)
        {
            throw new NotFoundException("User not found");
        }

        var roles = await userManager.GetRolesAsync(applicationUser);
        return roles.FirstOrDefault() ?? "User";
    }

    public async Task UpdateUserRoleAsync(Guid userId, string role)
    {
        var applicationUser = await userManager.FindByIdAsync(userId.ToString());
        if (applicationUser == null)
        {
            throw new NotFoundException("User not found");
        }

        // Ensure the role exists
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }

        // Remove all existing roles
        var currentRoles = await userManager.GetRolesAsync(applicationUser);
        if (currentRoles.Any())
        {
            await userManager.RemoveFromRolesAsync(applicationUser, currentRoles);
        }

        // Add the new role
        var result = await userManager.AddToRoleAsync(applicationUser, role);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to update role: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        // Update the User entity role as well
        var user = await context.Users.FindAsync(userId);
        if (user != null)
        {
            user.Role = role;
            context.Users.Update(user);
            await context.SaveChangesAsync();
        }
    }
} 