using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UserService.Application.Interfaces;
using UserService.Application.Options;
using UserService.Application.Services;
using UserService.Application.Validators.Identities;
using KafkaService;

namespace UserService.Application;

public static class ApplicationModule
{
    public static void AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddKafkaService();
        
        services.AddScoped<IUserAppService, UserAppService>();
        services.AddScoped<IAuthAppService, AuthAppService>();
        services.AddScoped<IEventPublisher, EventPublisher>();

        AddJwtSettings(services, configuration);

        services.AddFluentValidation();
    }

    private static void AddJwtSettings(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
        services.AddScoped<ITokenAppService, TokenAppService>();
    }
    
    private static void AddFluentValidation(this IServiceCollection services)
    {
        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>(); 
    }
}