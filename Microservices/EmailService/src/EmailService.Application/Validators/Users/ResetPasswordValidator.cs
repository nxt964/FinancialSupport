using EmailService.Application.DTOs.Users;
using FluentValidation;

namespace EmailService.Application.Validators.Users;

public class ResetPasswordValidator : AbstractValidator<ResetPassword>
{
    public ResetPasswordValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Verification Code is required.")
            .MaximumLength(6).WithMessage("Confirm token is required.");
    }
}