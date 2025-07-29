using FluentValidation;
using UserService.Application.DTOs.Identities;
using UserService.Domain.Const;

namespace UserService.Application.Validators.Identities;

public class ConfirmResetPasswordTokenRequestValidator : AbstractValidator<ConfirmResetPasswordTokenRequest>
{
    public ConfirmResetPasswordTokenRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotNull().WithMessage("Confirm Code is required");
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(UserConst.EmailMaxLength).WithMessage("Email must not exceed 128 characters.")
            .EmailAddress().WithMessage("Email must be valid.");
    }
}