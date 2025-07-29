using FluentValidation;
using UserService.Application.DTOs.Users;
using UserService.Domain.Const;

namespace UserService.Application.Validators.Users;

public class ChangeInfomationRequestValidator : AbstractValidator<ChangeInfomationRequest>
{
    public ChangeInfomationRequestValidator()
    {
        RuleFor(x => x)
            .Must(x => 
                !string.IsNullOrWhiteSpace(x.NewUsername) || 
                !string.IsNullOrWhiteSpace(x.NewEmail) || 
                !string.IsNullOrWhiteSpace(x.NewProfileImage))
            .WithMessage("At least one of NewUsername, NewEmail, or NewProfileImage must be provided.");

        When(x => !string.IsNullOrWhiteSpace(x.NewEmail), () =>
        {
            RuleFor(x => x.NewEmail)
                .NotEmpty().WithMessage("New email is required.") 
                .MaximumLength(UserConst.EmailMaxLength)
                .WithMessage($"Email must not exceed {UserConst.EmailMaxLength} characters.")
                .EmailAddress().WithMessage("Email must be a valid email address.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.NewUsername), () =>
        {
            RuleFor(x => x.NewUsername)
                .MaximumLength(UserConst.UsernameMaxLength)
                .WithMessage($"Username must not exceed {UserConst.UsernameMaxLength} characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.NewProfileImage), () =>
        {
            RuleFor(x => x.NewProfileImage)
                .MaximumLength(UserConst.ProfileImageMaxLength)
                .WithMessage($"Profile image URL must not exceed {UserConst.ProfileImageMaxLength} characters.");
        });
    }
}