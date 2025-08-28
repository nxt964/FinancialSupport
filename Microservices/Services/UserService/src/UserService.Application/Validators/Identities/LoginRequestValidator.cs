using FluentValidation;
using UserService.Application.DTOs.Identities;
using UserService.Domain.Const;

namespace UserService.Application.Validators.Identities;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MinimumLength(UserConst.UsernameMinLength).WithMessage($"Username must be at least {UserConst.UsernameMinLength} characters.")
            .MaximumLength(UserConst.EmailMaxLength).WithMessage($"Username must not exceed {UserConst.EmailMaxLength} characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(UserConst.PasswordMinLength).WithMessage($"Password must be at least {UserConst.PasswordMinLength} characters.")
            .MaximumLength(UserConst.PasswordMaxLength).WithMessage($"Password must not exceed {UserConst.PasswordMaxLength} characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"\d").WithMessage("Password must contain at least one digit.")
            .Matches(@"[@$!%*?&#]").WithMessage("Password must contain at least one special character.");

    }
} 