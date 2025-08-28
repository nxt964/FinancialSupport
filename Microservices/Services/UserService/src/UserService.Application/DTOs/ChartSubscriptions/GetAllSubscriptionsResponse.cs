namespace UserService.Application.DTOs.ChartSubscriptions;

public class GetAllSubscriptionsResponse
{
    public List<ChartSubscriptionResponse> Subscriptions { get; set; } = new();
    public int TotalCount { get; set; }
}
