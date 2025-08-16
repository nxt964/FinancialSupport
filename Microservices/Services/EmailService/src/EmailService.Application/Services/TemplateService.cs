using System.Reflection;
using EmailService.Application.Interfaces;

namespace EmailService.Application.Services;

public class TemplateService : ITemplateService
{
    private readonly string _templatesPath;

    public TemplateService()
    {
        // Get the directory where the assembly is located
        var assemblyLocation = Assembly.GetExecutingAssembly().Location;
        var assemblyDirectory = Path.GetDirectoryName(assemblyLocation);
        
        // In Docker, templates are copied to /app/EmailService.Application/Templates
        // In development, they're in the project's Templates folder
        if (Directory.Exists(Path.Combine(assemblyDirectory, "Templates")))
        {
            _templatesPath = Path.Combine(assemblyDirectory, "Templates");
        }
        else
        {
            // Fallback for Docker container - maintain the folder structure
            _templatesPath = "/app/EmailService.Application/Templates";
        }
    }

    public async Task<string> GetTemplateAsync(string templateName)
    {
        using var reader = new StreamReader(Path.Combine(_templatesPath, templateName));

        return await reader.ReadToEndAsync();
    }

    public string ReplaceInTemplate(string input, IDictionary<string, string> replaceWords)
    {
        var response = input;
        foreach (var temp in replaceWords)
            response = response.Replace(temp.Key, temp.Value);
        return response;
    }
}