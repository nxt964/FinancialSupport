using FluentValidation;
using UserService.Application.DTOs.Identities;
using UserService.Domain.Const;

namespace UserService.Application.Validators.Identities;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.OldPassword)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(UserConst.PasswordMinLength).WithMessage($"Password must be at least {UserConst.PasswordMinLength} characters.")
            .MaximumLength(UserConst.PasswordMaxLength).WithMessage($"Password must not exceed {UserConst.PasswordMaxLength} characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"\d").WithMessage("Password must contain at least one digit.")
            .Matches(@"[@$!%*?&#]").WithMessage("Password must contain at least one special character.");
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(UserConst.PasswordMinLength).WithMessage($"Password must be at least {UserConst.PasswordMinLength} characters.")
            .MaximumLength(UserConst.PasswordMaxLength).WithMessage($"Password must not exceed {UserConst.PasswordMaxLength} characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"\d").WithMessage("Password must contain at least one digit.")
            .Matches(@"[@$!%*?&#]").WithMessage("Password must contain at least one special character.");
        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
    }
} 