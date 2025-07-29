using System.Reflection;
using EmailService.Application.Interfaces;

namespace EmailService.Application.Services;

public class TemplateService : ITemplateService
{
    private readonly string _templatesPath;

    public TemplateService()
    {
        var projectPath = Directory.GetParent(Directory.GetCurrentDirectory())?.FullName;
        var templateProject = Assembly.GetExecutingAssembly().GetName().Name;
        _templatesPath = Path.Combine(projectPath, templateProject, "Templates");

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