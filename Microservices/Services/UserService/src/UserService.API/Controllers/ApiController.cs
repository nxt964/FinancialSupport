using System.Net;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.DTOs;
using UserService.Application.Exceptions;
using UserService.Infrastructure.Exceptions;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApiController : ControllerBase
{
    
    private static readonly Dictionary<Type, HttpStatusCode> ExceptionToStatus =
        new()
        {
            { typeof(UnauthorizedAccessException), HttpStatusCode.Forbidden },
            { typeof(UnauthenticatedException), HttpStatusCode.Unauthorized },
        };

    protected IActionResult Success<T>(T result)
    {
        return Ok(ApiResult<T>.Success(result));
    }

    protected IActionResult Failure<TException>(TException ex) where TException : Exception
    {
        var statusCode = ExceptionToStatus.TryGetValue(ex.GetType(), out var code)
            ? code
            : HttpStatusCode.InternalServerError;

        return StatusCode((int)statusCode, ApiResult<TException>.Failure(new[] { ex.Message }));
    }

    protected IActionResult Failure<T>(IEnumerable<string> errors)
    {
        return BadRequest(ApiResult<T>.Failure(errors));
    }

    protected IActionResult Failure<T>(string error)
    {
        return BadRequest(ApiResult<T>.Failure(new[] { error }));
    }

    protected IActionResult Success(string message)
    {
        return Ok(ApiResult<string>.Success(message));
    }
}
