using System.ComponentModel.DataAnnotations;

namespace UserService.Application.DTOs.ChartSubscriptions;

public class UnsubscribeFromChartRequest
{
    [Required(ErrorMessage = "Symbol is required")]
    public string Symbol { get; set; } = string.Empty;
}
