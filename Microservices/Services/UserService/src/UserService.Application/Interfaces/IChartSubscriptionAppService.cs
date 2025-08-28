using UserService.Application.DTOs.ChartSubscriptions;

namespace UserService.Application.Interfaces;

public interface IChartSubscriptionAppService
{
    Task<bool> SubscribeToChartAsync(Guid userId, SubscribeToChartRequest request);
    Task<bool> UnsubscribeFromChartAsync(Guid userId, UnsubscribeFromChartRequest request);
    Task<GetAllSubscriptionsResponse> GetAllSubscriptionsAsync(Guid userId);
}
