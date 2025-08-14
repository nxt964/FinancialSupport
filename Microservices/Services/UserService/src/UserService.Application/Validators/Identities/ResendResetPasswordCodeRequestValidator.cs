using FluentValidation;
using UserService.Application.DTOs.Identities;

namespace UserService.Application.Validators.Identities;

public class ResendResetPasswordCodeRequestValidator : AbstractValidator<ResendResetPasswordCodeRequest>
{
    public ResendResetPasswordCodeRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");
    }
}
