using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace UserService.Infrastructure.Data;

public class AutomatedMigration
{
    public static async Task MigrateAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var initializer = services.GetRequiredService<DatabaseInitializer>();

        if (context.Database.IsNpgsql())
        {
            await context.Database.MigrateAsync();
        }

        await initializer.InitializeAsync();
    }
}