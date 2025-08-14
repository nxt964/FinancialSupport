using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Application.DTOs.Identities;
using UserService.Application.Interfaces;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthAppService authAppService) : ApiController
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await authAppService.RegisterAsync(request);
        return Success(result);
    }

    [HttpPost("confirm-register")]
    public async Task<IActionResult> ConfirmRegister([FromBody] ConfirmRegisterRequest request)
    {
        var result = await authAppService.ConfirmRegisterAsync(request);
        return Success(result);
    }

    [HttpPost("resend-register-code")]
    public async Task<IActionResult> ResendRegisterCode([FromBody] ResendCodeRequest request)
    {
        var result = await authAppService.ResendRegisterCodeAsync(request);
        return Success(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await authAppService.AuthenticateAsync(request);
        return Success(result);
    }

    [HttpPost("reset-password-request")]
    public async Task<IActionResult> ResetPasswordRequest([FromBody] ResetPasswordTokenRequest request)
    {
        var result = await authAppService.RequestResetPasswordTokenAsync(request);
        return Success(result);
    }

    [HttpPost("confirm-reset-password-request")]
    public async Task<IActionResult> ConfirmResetPasswordRequest([FromBody] ConfirmResetPasswordTokenRequest request)
    {
        var result = await authAppService.ValidateResetPasswordTokenAsync(request);
        return Success(result);
    }
    
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await authAppService.ResetPasswordAsync(request);
        return Success(result);
    }

    [HttpPost("resend-reset-password-code")]
    public async Task<IActionResult> ResendResetPasswordCode([FromBody] ResendCodeRequest request)
    {
        var result = await authAppService.ResendResetPasswordCodeAsync(request);
        return Success(result);
    }
    
    [Authorize]
    [HttpPost("update-password")]
    public async Task<IActionResult> UpdatePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null)
        {
            throw new UnauthorizedAccessException();
        }
        request.Id = Guid.Parse(userIdFromToken);
        await authAppService.UpdatePasswordAsync(request);
        return Success("Password updated successfully");
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await authAppService.RefreshTokenAsync(request);
        return Success(result);
    }
    
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdFromToken == null)
        {
            throw new UnauthorizedAccessException();
        }
        var token = HttpContext.Request.Headers.Authorization.FirstOrDefault()?.Split(" ").Last();
        if (string.IsNullOrEmpty(token))
        {
            return Failure<string>("Access token is missing.");
        }
        request.AccessToken = token;
        request.Id = Guid.Parse(userIdFromToken);
        var result = await authAppService.LogoutAsync(request);
        return Success(result);
    }
}