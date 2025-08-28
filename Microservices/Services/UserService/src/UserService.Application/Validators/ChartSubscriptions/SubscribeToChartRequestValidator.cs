using FluentValidation;
using UserService.Application.DTOs.ChartSubscriptions;
using UserService.Domain.Const;

namespace UserService.Application.Validators.ChartSubscriptions;

public class SubscribeToChartRequestValidator : AbstractValidator<SubscribeToChartRequest>
{
    public SubscribeToChartRequestValidator()
    {
        RuleFor(x => x.Symbol)
            .NotEmpty().WithMessage("Symbol is required")
            .MaximumLength(ChartSubciptionConst.SymbolMaxLength).WithMessage($"Symbol cannot exceed {ChartSubciptionConst.SymbolMaxLength} characters")
            .Matches(@"^[A-Z0-9]+$").WithMessage("Symbol must contain only uppercase letters and numbers");

        RuleFor(x => x.Interval)
            .NotEmpty().WithMessage("Interval is required")
            .MaximumLength(ChartSubciptionConst.IntervalMaxLength).WithMessage($"Interval cannot exceed {ChartSubciptionConst.IntervalMaxLength} characters")
            .Matches(@"^(1m|3m|5m|15m|30m|1h|2h|4h|6h|8h|12h|1d|3d|1w|1M)$")
            .WithMessage("Interval must be a valid trading interval (1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M)");
    }
}
