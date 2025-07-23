using Microsoft.Extensions.DependencyInjection;
using EmailService.Application.Common.Email;
using EmailService.Application.Interfaces;
using EmailService.Application.Services;
using Microsoft.Extensions.Configuration;
using FluentValidation;
namespace EmailService.Application;

public static class ApplicationModule
{

    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddServices();

        // services.RegisterAutoMapper();

        return services;
    }

    private static void AddServices(this IServiceCollection services)
    {
        services.AddScoped<IEmailSenderService, EmailSenderService>();
        services.AddScoped<ITemplateService, TemplateService>();
        services.AddScoped<FluentValidation.IValidator<DTOs.Users.ConfirmNewEmail>, DTOs.Users.ConfirmNewEmailValidator>();
    }
    
    // private static void RegisterAutoMapper(this IServiceCollection services)
    // {
    //     services.AddAutoMapper(typeof(IMappingProfilesMarker));
    // }

    public static void AddEmailConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton(configuration.GetSection("EmailSettings").Get<SmtpSettings>());
    }

}
