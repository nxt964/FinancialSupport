using Microsoft.Extensions.Logging;
using UserService.Domain.Const;
using UserService.Domain.Entities;
using UserService.Domain.Interfaces;
using UserService.Domain.Services;

namespace UserService.Infrastructure.Data;

public class DatabaseContextSeed(
    ILogger<DatabaseContextSeed> logger,
    IUserDomainService userRepository,
    IAuthDomainService authRepository
)
{
    public async Task SeedDatabaseAsync(ApplicationDbContext context)
    {
        try
        {
            var user = new User()
            {
                Username = "admin",
                Email = "admin@financesupport.com",
                ProfileImage = "",
                Role = "ProUser",
            };
            const string adminPassword = "Admin@123";
            
            var existingAdmin = await authRepository.IsEmailOrUsernameExistedAsync(user.Email, user.Username);
            
            if (existingAdmin)
            {
                logger.LogInformation("Default admin already exists.");
                return;
            }
            
            logger.LogInformation("Creating default admin account...");
            
            user.Id = await authRepository.CreateAsync(user.Email, user.Username, adminPassword);
            await userRepository.AddAsync(user);

            logger.LogInformation("Default admin account created successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}