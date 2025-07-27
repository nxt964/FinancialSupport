using FluentValidation;
using UserService.Application.DTOs.Identities;

namespace UserService.Application.Validators.Identities;

public class ConfirmResetPasswordTokenRequestValidator : AbstractValidator<ConfirmResetPasswordTokenRequest>
{
    public ConfirmResetPasswordTokenRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotNull().WithMessage("Confirm Code is required");
    }
}