using FluentValidation;
using UserService.Application.DTOs.Identities;

namespace UserService.Application.Validators.Identities;

public class ConfirmRegisterValidator : AbstractValidator<ConfirmRegisterRequest>
{
    public ConfirmRegisterValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .Matches(@"^\d{6}$").WithMessage("Code must be 6 digits long.");
    }
}