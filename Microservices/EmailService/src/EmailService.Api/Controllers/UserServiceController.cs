using EmailService.Application.DTOs.Users;
using EmailService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;

namespace EmailService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserServiceController(
    IEmailSenderService emailSenderService
    ) : ApiController
{
    [HttpPost("confirm-email")]
    public async Task<IActionResult> SendConfirmNewEmail([FromBody] ConfirmNewEmail request)
    {
        await emailSenderService.ConfirmNewEmailAsync(request);
        return Ok(new { message = "Confirmation email sent." });
    }
    [HttpPost("confirm-reset-password")]
    public async Task<IActionResult> SendConfirmNewEmail([FromBody] ResetPassword request)
    {
        await emailSenderService.ResetPasswordAsync(request);
        return Ok(new { message = "Reset password email sent." });
    }
} 