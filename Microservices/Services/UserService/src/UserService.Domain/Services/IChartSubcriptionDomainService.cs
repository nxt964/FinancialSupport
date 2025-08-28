using UserService.Domain.Entities;

namespace UserService.Domain.Services;

public interface IChartSubcriptionDomainService
{
    Task<bool> SubscribeToChart(Guid userId, string symbol, string interval);
    Task<bool> UnsubscribeFromChart(Guid userId, string symbol);
    Task<IEnumerable<ChartSubciption>> GetAllSubscriptions(Guid userId);
}