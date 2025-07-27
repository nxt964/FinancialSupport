using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.DTOs.Identities;
using UserService.Application.DTOs.Users;
using UserService.Application.Interfaces;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthAppService authAppService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await authAppService.RegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("confirm-register")]
    public async Task<IActionResult> ConfirmRegister([FromBody] ConfirmRegisterRequest request)
    {
        var result = await authAppService.ConfirmRegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await authAppService.AuthenticateAsync(request);
        return Ok(result);
    }

    [HttpPost("reset-password-request")]
    public async Task<IActionResult> ResetPasswordRequest([FromBody] ResetPasswordTokenRequest request)
    {
        var result = await authAppService.RequestResetPasswordTokenAsync(request);
        return Ok(result);
    }

    [HttpPost("confirm-reset-password-request")]
    public async Task<IActionResult> ConfirmResetPasswordRequest([FromBody] ConfirmResetPasswordTokenRequest request)
    {
        var result = await authAppService.ValidateResetPasswordTokenAsync(request);
        return Ok(result);
    }
    
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await authAppService.ResetPasswordAsync(request);
        return Ok(result);
    }
    
    [Authorize]
    [HttpPost("update-password")]
    public async Task<IActionResult> UpdatePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null)
        {
            return Forbid();
        }
        request.Id = Guid.Parse(userIdFromToken);
        await authAppService.UpdatePasswordAsync(request);
        return Ok(new { Message = "Password updated successfully" });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await authAppService.RefreshTokenAsync(request);
        return Ok(result);
    }
    
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null)
        {
            return Forbid();
        }
        request.Id = Guid.Parse(userIdFromToken);
        var result = await authAppService.LogoutAsync(request);
        return Ok(result);
    }
}