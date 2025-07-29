using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace Shared.RedisService;

public static class RedisServiceExtensions
{
    public static IServiceCollection AddRedisService(this IServiceCollection services, IConfiguration configuration)
    {
        // Register Redis connection
        services.AddSingleton<IConnectionMultiplexer>(sp =>
            ConnectionMultiplexer.Connect(configuration["Redis:ConnectionString"] ?? "localhost:6379"));
        
        // Register Redis service
        services.AddScoped<IRedisService, RedisService>();
        
        return services;
    }
} 