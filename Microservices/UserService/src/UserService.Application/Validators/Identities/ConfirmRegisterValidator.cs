using FluentValidation;
using UserService.Application.DTOs.Identities;
using UserService.Domain.Const;

namespace UserService.Application.Validators.Identities;

public class ConfirmRegisterValidator : AbstractValidator<ConfirmRegisterRequest>
{
    public ConfirmRegisterValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .Matches(@"^\d{6}$").WithMessage("Code must be 6 digits long.");
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(UserConst.EmailMaxLength).WithMessage("Email must not exceed 128 characters.")
            .EmailAddress().WithMessage("Email must be valid.");
    }
}