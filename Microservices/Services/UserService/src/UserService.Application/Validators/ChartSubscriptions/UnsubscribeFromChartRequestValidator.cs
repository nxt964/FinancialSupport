using FluentValidation;
using UserService.Application.DTOs.ChartSubscriptions;
using UserService.Domain.Const;

namespace UserService.Application.Validators.ChartSubscriptions;

public class UnsubscribeFromChartRequestValidator : AbstractValidator<UnsubscribeFromChartRequest>
{
    public UnsubscribeFromChartRequestValidator()
    {
        RuleFor(x => x.Symbol)
            .NotEmpty().WithMessage("Symbol is required")
            .MaximumLength(ChartSubciptionConst.SymbolMaxLength).WithMessage($"Symbol cannot exceed {ChartSubciptionConst.SymbolMaxLength} characters")
            .Matches(@"^[A-Z0-9]+$").WithMessage("Symbol must contain only uppercase letters and numbers");
    }
}
