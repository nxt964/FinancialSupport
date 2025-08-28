using UserService.Application.DTOs.ChartSubscriptions;
using UserService.Application.Interfaces;
using UserService.Domain.Services;

namespace UserService.Application.Services;

public class ChartSubscriptionAppService(IChartSubcriptionDomainService chartSubscriptionDomainService) : IChartSubscriptionAppService
{
    public async Task<bool> SubscribeToChartAsync(Guid userId, SubscribeToChartRequest request)
    {
        return await chartSubscriptionDomainService.SubscribeToChart(userId, request.Symbol, request.Interval);
    }

    public async Task<bool> UnsubscribeFromChartAsync(Guid userId, UnsubscribeFromChartRequest request)
    {
        return await chartSubscriptionDomainService.UnsubscribeFromChart(userId, request.Symbol);
    }

    public async Task<GetAllSubscriptionsResponse> GetAllSubscriptionsAsync(Guid userId)
    {
        var subscriptions = await chartSubscriptionDomainService.GetAllSubscriptions(userId);
        
        var response = new GetAllSubscriptionsResponse
        {
            Subscriptions = subscriptions.Select(s => new ChartSubscriptionResponse
            {
                Symbol = s.Symbol,
                Interval = s.Interval,
                SubscribedAt = DateTime.UtcNow // Note: You might want to add this field to the entity
            }).ToList(),
            TotalCount = subscriptions.Count()
        };
        
        return response;
    }
}
