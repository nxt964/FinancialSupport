using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using UserService.Domain.Const;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;
using UserService.Domain.Services;
using UserService.Infrastructure.Identity;

namespace UserService.Infrastructure.Data;

public class DatabaseContextSeed(
    ILogger<DatabaseContextSeed> logger,
    IUserDomainService userRepository,
    IAuthDomainService authRepository,
    RoleManager<IdentityRole<Guid>> roleManager,
    UserManager<ApplicationUser> userManager
)
{
    public async Task SeedDatabaseAsync(ApplicationDbContext context)
    {
        try
        {
            await CreateBasicRolesAsync();
            
            await CreateAdminUserAsync();
            await CreateNormalUserAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private async Task CreateBasicRolesAsync()
    {
        var roles = new[] { "User", "Premium", "Admin" };
        
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
                logger.LogInformation($"Role '{roleName}' created.");
            }
        }
    }

    private async Task CreateAdminUserAsync()
    {
        var adminEmail = "admin@financesupport.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        
        if (adminUser != null)
        {
            logger.LogInformation("Default admin already exists.");
            return;
        }

        // Create the Identity user
        var user = new ApplicationUser
        {
            UserName = "admin",
            Email = adminEmail,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        const string adminPassword = "Admin@123";
        var result = await userManager.CreateAsync(user, adminPassword);
        
        if (result.Succeeded)
        {
            // Assign role using ASP.NET Identity
            await userManager.AddToRoleAsync(user, "Admin");
            
            // Also create your custom User entity
            var customUser = new User
            {
                Id = user.Id,
                Username = user.UserName!,
                Email = user.Email!,
                ProfileImage = "",
                Role = "Admin"
            };
            await userRepository.AddAsync(customUser);
            
            logger.LogInformation("Default admin account created successfully.");
        }
    }

    private async Task CreateNormalUserAsync()
    {
        var normalUserEmail = "user@financesupport.com";
        var normalUser = await userManager.FindByEmailAsync(normalUserEmail);
        
        if (normalUser != null)
        {
            logger.LogInformation("Default normal user already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = "user",
            Email = normalUserEmail,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        const string normalPassword = "User@12345";
        var result = await userManager.CreateAsync(user, normalPassword);

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, "User");

            var customUser = new User
            {
                Id = user.Id,
                Username = user.UserName!,
                Email = user.Email!,
                ProfileImage = "",
                Role = "User"
            };
            await userRepository.AddAsync(customUser);
            
            logger.LogInformation("Default normal user created successfully.");
        }
    }
}