using FluentValidation;
using UserService.Application.DTOs.Identities;
using UserService.Domain.Const;

namespace UserService.Application.Validators.Identities;

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(x => x.ResetToken)
            .NotNull().WithMessage("Confirm token is required");
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(UserConst.EmailMaxLength).WithMessage("Email must not exceed 128 characters.")
            .EmailAddress().WithMessage("Email must be valid.");
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .MaximumLength(64).WithMessage("Password must not exceed 64 characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"\d").WithMessage("Password must contain at least one digit.")
            .Matches(@"[@$!%*?&#]").WithMessage("Password must contain at least one special character.");
        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
    }
} 