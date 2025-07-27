using System.Net;
using Newtonsoft.Json;
using UserService.Application.DTOs;
using UserService.Application.Exceptions;
using UserService.Infrastructure.Exceptions;
using InvalidOperationException = System.InvalidOperationException;

namespace UserService.API.Middlewares;

public class GlobalExceptionHandler(
    RequestDelegate next, 
    ILogger<GlobalExceptionHandler> logger
    )
{

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        HttpStatusCode statusCode;
        var message = new List<string> { ex.Message };

        switch (ex)
        {
            case NotFoundException:
                statusCode = HttpStatusCode.NotFound;
                break;

            case UnauthorizedException:
                statusCode = HttpStatusCode.Unauthorized;
                break;

            case ValidationException:
                statusCode = HttpStatusCode.BadRequest;
                break;

            case BadRequestException:
                statusCode = HttpStatusCode.BadRequest;
                break;

            case InvalidOperationException:
                statusCode = HttpStatusCode.Conflict;
                break;

            default:
                statusCode = HttpStatusCode.InternalServerError;
                logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
                break;
        }

        var result = JsonConvert.SerializeObject(ApiResult<string>.Failure(message));

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsync(result);
    }
}