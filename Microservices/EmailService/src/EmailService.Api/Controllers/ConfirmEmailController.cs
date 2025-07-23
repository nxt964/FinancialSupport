using EmailService.Application.DTOs.Users;
using EmailService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;

namespace EmailService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfirmEmailController : ControllerBase
{
    private readonly IEmailSenderService _emailSenderService;
    private readonly IValidator<ConfirmNewEmail> _validator;

    public ConfirmEmailController(IEmailSenderService emailSenderService, IValidator<ConfirmNewEmail> validator)
    {
        _emailSenderService = emailSenderService;
        _validator = validator;
    }

    [HttpPost]
    public async Task<IActionResult> ConfirmNewEmail([FromBody] ConfirmNewEmail request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        await _emailSenderService.ConfirmNewEmailAsync(request);
        return Ok(new { message = "Confirmation email sent." });
    }
} 