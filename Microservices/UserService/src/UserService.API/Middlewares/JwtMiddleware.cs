using UserService.Application.Interfaces;

namespace UserService.API.Middlewares;

public class JwtMiddleware(
    RequestDelegate next,
    IConfiguration configuration,
    ILogger<JwtMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        string? token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

        if (!string.IsNullOrEmpty(token))
        {
            var tokenService = context.RequestServices.GetService<ITokenAppService>();
            var principle = tokenService?.GetPrincipalFromToken(token);
            if (principle != null) context.User = principle;
        }

        await next(context);
    }
}