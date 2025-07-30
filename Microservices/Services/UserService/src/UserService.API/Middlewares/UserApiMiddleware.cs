using System.Security.Claims;
namespace UserService.API.Middlewares;

public class UserApiMiddleware(RequestDelegate next, ILogger<UserApiMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var endpoint = context.GetEndpoint()?.DisplayName ?? context.Request.Path;
        var method = context.Request.Method;

        logger.LogInformation("Processing request {Method} {Endpoint}", method, endpoint);

        if (context.User.Identity?.IsAuthenticated != true)
        {
            var userId = context.Request.Headers["X-User-Id"].FirstOrDefault();
            var email = context.Request.Headers["X-User-Email"].FirstOrDefault();
            var role = context.Request.Headers["X-User-Role"].FirstOrDefault();
            var firstName = context.Request.Headers["X-User-FirstName"].FirstOrDefault();
            var lastName = context.Request.Headers["X-User-LastName"].FirstOrDefault();

            if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(role))
            {
                var claims = new List<Claim>
                {
                    new(ClaimTypes.NameIdentifier, userId),
                    new(ClaimTypes.Name, email ?? userId),
                    new(ClaimTypes.Email, email ?? ""),
                    new(ClaimTypes.Role, role),
                    new(ClaimTypes.GivenName, firstName ?? ""),
                    new(ClaimTypes.Surname, lastName ?? "")
                };

                var identity = new ClaimsIdentity(claims, "Gateway");
                context.User = new ClaimsPrincipal(identity);

                logger.LogInformation("User {UserId} extracted from headers for {Method} {Endpoint}", userId, method, endpoint);
            }
            else
            {
                logger.LogWarning("Missing required headers to authenticate user for {Method} {Endpoint}", method, endpoint);
            }
        }

        await next(context);

        logger.LogInformation("Completed request {Method} {Endpoint} with status {StatusCode}",
            method, endpoint, context.Response.StatusCode);
    }
}
