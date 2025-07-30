using Microsoft.AspNetCore.Diagnostics;
using System.Text.Json;

namespace ApiGateway.Middlewares;

public class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger
    ) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "An unhandled exception occurred");

        var response = new
        {
            error = "An error occurred while processing your request",
            statusCode = 500,
            timestamp = DateTime.UtcNow
        };

        httpContext.Response.StatusCode = 500;
        httpContext.Response.ContentType = "application/json";

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await httpContext.Response.WriteAsync(
            JsonSerializer.Serialize(response, options),
            cancellationToken);

        return true;
    }
}