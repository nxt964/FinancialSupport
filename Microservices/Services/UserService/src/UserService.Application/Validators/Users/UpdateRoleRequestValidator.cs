using FluentValidation;
using UserService.Application.DTOs.Users;

namespace UserService.Application.Validators.Users;

public class UpdateRoleRequestValidator : AbstractValidator<UpdateRoleRequest>
{
    public UpdateRoleRequestValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("UserId is required.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("Role is required.")
            .Must(role => role == "User" || role == "Premium")
            .WithMessage("Role must be one of: User, Premium");
    }
} 