using Microsoft.AspNetCore.Mvc;
using UserService.Application.DTOs.Users;
using UserService.Application.Interfaces;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TokenController(IUserAppService userAppService) : ApiController
{
    [HttpPost("validate")]
    public async Task<IActionResult> ValidateToken([FromBody] ValidateTokenRequest request)
    {
        var response = await userAppService.ValidateTokenAsync(request);
        return Ok(response);
    }
} 