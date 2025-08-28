using Microsoft.EntityFrameworkCore;
using UserService.Domain.Entities;
using UserService.Domain.Services;
using UserService.Infrastructure.Data;

namespace UserService.Infrastructure.Services;

public class ChartSubcriptionDomainService(ApplicationDbContext context) : IChartSubcriptionDomainService
{
    public async Task<bool> SubscribeToChart(Guid userId, string symbol, string interval)
    {
        try
        {
            var existingSubscription = await context.ChartSubscriptions
                .FirstOrDefaultAsync(cs => cs.UserId == userId && cs.Symbol == symbol);

            if (existingSubscription != null)
            {
                if (existingSubscription.Interval == interval)
                {
                    return true;
                }
                existingSubscription.Interval = interval;
            }
            else
            {
                var subscription = new ChartSubciption
                {
                    UserId = userId,
                    Symbol = symbol,
                    Interval = interval
                };
                context.ChartSubscriptions.Add(subscription);
            }

            await context.SaveChangesAsync();
            return true;
        }
        catch(Exception e)
        {
            throw new InvalidOperationException($"Unable to subscribe to chart: {e}");
        }
    }

    public async Task<bool> UnsubscribeFromChart(Guid userId, string symbol)
    {
        try
        {
            var subscription = await context.ChartSubscriptions
                .FirstOrDefaultAsync(cs => cs.UserId == userId && cs.Symbol == symbol);

            if (subscription == null)
            {
                return true;
            }

            context.ChartSubscriptions.Remove(subscription);
            await context.SaveChangesAsync();

            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<IEnumerable<ChartSubciption>> GetAllSubscriptions(Guid userId)
    {
        try
        {
            return await context.ChartSubscriptions
                .Where(cs => cs.UserId == userId)
                .ToListAsync();
        }
        catch
        {
            return new List<ChartSubciption>();
        }
    }
}