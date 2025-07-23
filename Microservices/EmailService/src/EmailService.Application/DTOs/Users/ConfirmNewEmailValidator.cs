using FluentValidation;

namespace EmailService.Application.DTOs.Users;

public class ConfirmNewEmailValidator : AbstractValidator<ConfirmNewEmail>
{
    public ConfirmNewEmailValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters.");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MaximumLength(255).WithMessage("Username must not exceed 255 characters.");
;

        RuleFor(x => x.ConfirmationLink)
            .NotEmpty().WithMessage("Confirm token is required.");
    }
} 