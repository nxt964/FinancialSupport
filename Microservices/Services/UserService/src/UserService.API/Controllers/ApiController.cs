using Microsoft.AspNetCore.Mvc;
using UserService.Application.DTOs;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApiController : ControllerBase
{
    protected IActionResult Success<T>(T result)
    {
        return Ok(ApiResult<T>.Success(result));
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
