using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Http;

namespace ApiGateway.Middlewares;

public class CustomRateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CustomRateLimitMiddleware> _logger;
    private readonly IIpPolicyStore _ipPolicyStore;
    private readonly IClientPolicyStore _clientPolicyStore;

    public CustomRateLimitMiddleware(
        RequestDelegate next, 
        ILogger<CustomRateLimitMiddleware> logger,
        IIpPolicyStore ipPolicyStore,
        IClientPolicyStore clientPolicyStore)
    {
        _next = next;
        _logger = logger;
        _ipPolicyStore = ipPolicyStore;
        _clientPolicyStore = clientPolicyStore;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
        // Apply higher rate limit for chartHub endpoints (but still count against quota)
        if (path.StartsWith("/api/charthub"))
        {
            _logger.LogDebug("Skipping rate limiting for chartHub endpoint: {Path}", path);
            await _next(context);
            return;
        }
        
        // Set client ID based on user role for premium rate limiting
        var userRole = context.Request.Headers["X-User-Role"].FirstOrDefault();
        if (!string.IsNullOrEmpty(userRole))
        {
            _logger.LogInformation("Request from user with role: {UserRole}", userRole);
            if (userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            {
                // Remove existing header and add new one
                context.Request.Headers.Remove("X-ClientId");
                context.Request.Headers.Add("X-ClientId", "admin-user");
                _logger.LogInformation("✅ Set ClientId to admin-user for Admin user");
            } 
            else if (userRole.Equals("Premium", StringComparison.OrdinalIgnoreCase))
            {
                context.Request.Headers.Remove("X-ClientId");
                context.Request.Headers.Add("X-ClientId", "premium-user");
                _logger.LogInformation("✅ Set ClientId to premium-user for Premium user");
            }
            else
            {
                context.Request.Headers.Remove("X-ClientId");
                context.Request.Headers.Add("X-ClientId", "standard-user");
                _logger.LogInformation("✅ Set ClientId to standard-user for {Role} user", userRole);
            }
        }
        else
        {
            _logger.LogInformation("⚠️ No user role found, using anonymous rate limiting");
        }

        // Debug: Log all headers to see what's being set
        var clientIdHeader = context.Request.Headers["X-ClientId"].FirstOrDefault();
        _logger.LogInformation("🔍 Final ClientId header value: '{ClientId}'", clientIdHeader ?? "null");

        await _next(context);
    }
    
    private async Task LogRateLimitInfo(HttpContext context)
    {
        try
        {
            var clientIp = GetClientIpAddress(context);
            var clientId = context.Request.Headers["X-ClientId"].FirstOrDefault();
            var path = context.Request.Path.Value ?? "";
            var method = context.Request.Method;
            
            if (context.Response.StatusCode == 429)
            {
                _logger.LogInformation("🚫 RATE LIMIT BLOCKED - IP: {ClientIp}, ClientId: {ClientId}, Method: {Method}, Path: {Path}, Status: {StatusCode}", 
                    clientIp, clientId, method, path, context.Response.StatusCode);
                
                // Try to get current request count from headers (if available)
                var remainingHeader = context.Response.Headers["X-Rate-Limit-Remaining"].FirstOrDefault();
                var limitHeader = context.Response.Headers["X-Rate-Limit-Limit"].FirstOrDefault();
                var resetHeader = context.Response.Headers["X-Rate-Limit-Reset"].FirstOrDefault();
                
                if (!string.IsNullOrEmpty(remainingHeader) && !string.IsNullOrEmpty(limitHeader))
                {
                    _logger.LogInformation("📊 Rate Limit Details - Limit: {Limit}, Remaining: {Remaining}, Reset: {Reset}", 
                        limitHeader, remainingHeader, resetHeader);
                }
            }
            else
            {
                // Log successful requests with rate limit info
                var remainingHeader = context.Response.Headers["X-Rate-Limit-Remaining"].FirstOrDefault();
                var limitHeader = context.Response.Headers["X-Rate-Limit-Limit"].FirstOrDefault();
                
                if (!string.IsNullOrEmpty(remainingHeader) && !string.IsNullOrEmpty(limitHeader))
                {
                    _logger.LogDebug("✅ Request Allowed - IP: {ClientIp}, ClientId: {ClientId}, Method: {Method}, Path: {Path}, Remaining: {Remaining}/{Limit}", 
                        clientIp, clientId, method, path, remainingHeader, limitHeader);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging rate limit information");
        }
    }
    
    private string GetClientIpAddress(HttpContext context)
    {
        // Check for forwarded IP first (for load balancers/proxies)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }
        
        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }
        
        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
} 