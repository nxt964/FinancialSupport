using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UserService.Application.Interfaces;
using UserService.Application.Options;
using UserService.Application.Services;
using UserService.Application.Validators.Identities;

namespace UserService.Infrastructure.Data;

public static class ApplicationModule
{
    public static IServiceCollection AddAppService(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IUserAppService, UserAppService>();
        services.AddScoped<IAuthAppService, AuthAppService>();
        
        AddJwtSettings(services, configuration);
        AddEmailClient(services, configuration);

        services.AddFluentValidation();
        
        return services;
    }

    private static IServiceCollection AddJwtSettings(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.AddScoped<ITokenAppService, TokenAppService>();

        return services;
    }

    private static IServiceCollection AddEmailClient(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpClient<IEmailServiceClient, EmailServiceClient>(client =>
        {
            var emailServiceUrl = configuration["EmailService:BaseUrl"] ?? "https://localhost:44567";
            client.BaseAddress = new Uri(emailServiceUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
    
            // var apiKey = configuration["EmailService:ApiKey"];
            // if (!string.IsNullOrEmpty(apiKey))
            // {
            //     client.DefaultRequestHeaders.Add("X-API-Key", apiKey);
            // }
        });
        
        return services;
    }
    
    private static void AddFluentValidation(this IServiceCollection services)
    {
        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>(); 
    }
}