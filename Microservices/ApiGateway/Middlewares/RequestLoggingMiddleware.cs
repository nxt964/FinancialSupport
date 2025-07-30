namespace ApiGateway.Middlewares;

public class RequestLoggingMiddleware(
    RequestDelegate next, 
    ILogger<RequestLoggingMiddleware> logger
    )
{
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        logger.LogInformation(
            "Request: {Method} {Path} from {RemoteIpAddress}",
            context.Request.Method,
            context.Request.Path,
            context.Connection.RemoteIpAddress);

        await next(context);

        stopwatch.Stop();

        logger.LogInformation(
            "Response: {StatusCode} in {ElapsedMilliseconds}ms",
            context.Response.StatusCode,
            stopwatch.ElapsedMilliseconds);
    }
}