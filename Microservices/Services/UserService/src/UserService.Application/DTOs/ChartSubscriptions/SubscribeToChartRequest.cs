using System.ComponentModel.DataAnnotations;

namespace UserService.Application.DTOs.ChartSubscriptions;

public class SubscribeToChartRequest
{
    [Required(ErrorMessage = "Symbol is required")]
    public string Symbol { get; set; } = string.Empty;

    [Required(ErrorMessage = "Interval is required")]
    public string Interval { get; set; } = string.Empty;
}
