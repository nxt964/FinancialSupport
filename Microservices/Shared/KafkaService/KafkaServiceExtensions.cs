using Microsoft.Extensions.DependencyInjection;

namespace KafkaService;

public static class KafkaServiceExtensions
{
    public static IServiceCollection AddKafkaService(this IServiceCollection services)
    {
        services.AddSingleton<IKafkaService, KafkaService>();
        return services;
    }
} 