using FluentValidation;
using UserService.Application.DTOs.Identities;
using UserService.Domain.Const;

namespace UserService.Application.Validators.Identities;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MaximumLength(UserConst.UsernameMaxLength).WithMessage("Username must not exceed 50 characters.")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters.")
            .Matches(@"^[a-zA-Z0-9._]+$").WithMessage("Username can only contain letters, numbers, dots, and underscores.");
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(UserConst.EmailMaxLength).WithMessage("Email must not exceed 128 characters.")
            .EmailAddress().WithMessage("Email must be valid.");
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .MaximumLength(64).WithMessage("Password must not exceed 64 characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"\d").WithMessage("Password must contain at least one digit.")
            .Matches(@"[@$!%*?&#]").WithMessage("Password must contain at least one special character.");
    }
} 