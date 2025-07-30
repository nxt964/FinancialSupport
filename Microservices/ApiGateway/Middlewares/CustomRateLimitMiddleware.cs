using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Http;

namespace ApiGateway.Middlewares;

public class CustomRateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CustomRateLimitMiddleware> _logger;

    public CustomRateLimitMiddleware(RequestDelegate next, ILogger<CustomRateLimitMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
        
        // Set client ID based on user role for premium rate limiting
        var userRole = context.Request.Headers["X-User-Role"].FirstOrDefault();
        if (!string.IsNullOrEmpty(userRole))
        {
            if (userRole.Equals("Premium", StringComparison.OrdinalIgnoreCase))
            {
                context.Request.Headers["X-ClientId"] = "premium-user";
                _logger.LogDebug("Applied premium rate limiting for user with role: {Role}", userRole);
            }
            else
            {
                context.Request.Headers["X-ClientId"] = "standard-user";
            }
        }

        // Apply stricter rate limiting for authentication endpoints
        if (path.StartsWith("/api/auth") || path.StartsWith("/api/token"))
        {
            _logger.LogDebug("Authentication endpoint detected: {Path}", path);
        }

        await _next(context);
    }
} 