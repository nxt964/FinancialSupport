using System.Text;
using System.Text.Json;

namespace ApiGateway.Middlewares;

// Models for user context
public class UserContext
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    public string Role { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

public class TokenValidationResponse
{
    public bool IsValid { get; set; }
    public Guid? UserId { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? Message { get; set; }
}

public class TokenValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly HttpClient _httpClient;
    private readonly ILogger<TokenValidationMiddleware> _logger;


    public TokenValidationMiddleware(
        RequestDelegate next, 
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<TokenValidationMiddleware> logger)
    {
        _next = next;
        _httpClient = httpClientFactory.CreateClient();
        _logger = logger;
        var userServiceUrl = configuration["UserService:BaseUrl"] ?? "https://localhost:44568";

        // Configure HttpClient for UserService
        _httpClient.BaseAddress = new Uri(userServiceUrl);
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";


        _logger.LogInformation("Request to route: {Path}", path);

        // Extract Bearer token
        var token = ExtractBearerToken(context);
        if (!string.IsNullOrEmpty(token))
        {
            var userContext = await ValidateTokenWithUserService(token);
            if (userContext != null)
            {
                AddUserContextHeaders(context, userContext);
                _logger.LogInformation("Token validation successful for route: {Path}, User: {UserId}, Role: {Role}", 
                    path, userContext.UserId, userContext.Role);
            }
        }
        

        // Continue to next middleware
        await _next(context);
    }
    
    private string? ExtractBearerToken(HttpContext context)
    {
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        return authHeader?.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) == true 
            ? authHeader.Substring("Bearer ".Length).Trim() 
            : null;
    }

    private async Task<UserContext?> ValidateTokenWithUserService(string token)
    {
        try
        {
            var request = new { Token = token };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/api/token/validate", content);

            if (!response.IsSuccessStatusCode) return null;
            var responseContent = await response.Content.ReadAsStringAsync();
            var validationResponse = JsonSerializer.Deserialize<TokenValidationResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            if (validationResponse is { IsValid: true, UserId: not null })
            {
                return new UserContext
                {
                    UserId = validationResponse.UserId.ToString()!,
                    Email = validationResponse.Email!,
                    Role = validationResponse.Role!,
                    FirstName = validationResponse.Username!,
                    LastName = validationResponse.Email!
                };
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token with UserService");
            return null;
        }
    }

    private void AddUserContextHeaders(HttpContext context, UserContext userContext)
    {
        context.Request.Headers["X-User-Id"] = userContext.UserId;
        context.Request.Headers["X-User-Email"] = userContext.Email;
        context.Request.Headers["X-User-Role"] = userContext.Role;
        context.Request.Headers["X-User-FirstName"] = userContext.FirstName;
        context.Request.Headers["X-User-LastName"] = userContext.LastName;
    }
}