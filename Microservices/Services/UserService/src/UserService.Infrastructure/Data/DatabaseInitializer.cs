using Microsoft.Extensions.Logging;

namespace UserService.Infrastructure.Data;

public class DatabaseInitializer(
    ApplicationDbContext context,
    ILogger<DatabaseInitializer> logger,
    DatabaseContextSeed seed)
{
    public async Task InitializeAsync()
    {
        try
        {
            logger.LogInformation("Initializing database...");

            try
            {
                await seed.SeedDatabaseAsync(context);
                logger.LogInformation("Database seeding completed successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during database seeding. Application will continue but some data may be missing.");
            }

            logger.LogInformation("Database initialization completed.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Critical error during database initialization.");
            throw;
        }
    }
}