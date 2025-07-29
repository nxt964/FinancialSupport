using Microsoft.Extensions.DependencyInjection;
using EmailService.Application.Common.Email;
using EmailService.Application.Interfaces;
using EmailService.Application.Services;
using EmailService.Application.Validators.Users;
using Microsoft.Extensions.Configuration;
using FluentValidation;
using FluentValidation.AspNetCore;

namespace EmailService.Application;

public static class ApplicationModule
{

    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddServices();
        services.AddEmailConfiguration(configuration);
        services.AddFluentValidation();

        return services;
    }

    private static void AddServices(this IServiceCollection services)
    {
        services.AddScoped<IEmailSenderService, EmailSenderService>();
        services.AddScoped<ITemplateService, TemplateService>();
    }

    private static void AddEmailConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton(configuration.GetSection("EmailSettings").Get<SmtpSettings>());
    }

    private static void AddFluentValidation(this IServiceCollection services)
    {
        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<ConfirmNewEmailValidator>(); 
    }
}
