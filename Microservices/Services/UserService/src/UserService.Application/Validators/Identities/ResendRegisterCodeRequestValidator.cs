using FluentValidation;
using UserService.Application.DTOs.Identities;

namespace UserService.Application.Validators.Identities;

public class ResendRegisterCodeRequestValidator : AbstractValidator<ResendRegisterCodeRequest>
{
    public ResendRegisterCodeRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters")
            .MaximumLength(50).WithMessage("Username cannot exceed 50 characters");
    }
}
