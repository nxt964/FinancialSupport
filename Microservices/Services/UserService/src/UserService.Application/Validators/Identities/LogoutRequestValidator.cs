using FluentValidation;
using UserService.Application.DTOs.Identities;

namespace UserService.Application.Validators.Identities;

public class LogoutRequestValidator : AbstractValidator<LogoutRequest>
{
    public LogoutRequestValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("UserID is required.");
    }
} 