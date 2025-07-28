using UserService.Application.Interfaces;

namespace UserService.API.Middlewares;

public class JwtMiddleware(
    RequestDelegate next
    )
{
    public async Task InvokeAsync(HttpContext context)
    {
        var token = context.Request.Headers.Authorization.FirstOrDefault()?.Split(" ").Last();
        var tokenService = context.RequestServices.GetService<ITokenAppService>();
        
        if (!string.IsNullOrEmpty(token) && tokenService != null)
        {
            var isBanned = await tokenService.IsTokenInBlackListAsync(token);
            if (!isBanned)
            {
                var principle = tokenService.GetPrincipalFromToken(token);
                if (principle != null) context.User = principle;
            }
        }

        await next(context);
    }
}