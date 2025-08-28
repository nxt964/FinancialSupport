namespace UserService.Application.DTOs.ChartSubscriptions;

public class ChartSubscriptionResponse
{
    public string Symbol { get; set; } = string.Empty;
    public string Interval { get; set; } = string.Empty;
    public DateTime SubscribedAt { get; set; }
}
