using Binance.Net.Enums;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

public class ChartHub : Hub
{
    private readonly BinanceCollectorManager _collectorManager;
    private static readonly ConcurrentDictionary<string, int> _groupClientCounts = new();

    public ChartHub(BinanceCollectorManager collectorManager)
    {
        _collectorManager = collectorManager;
    }

    public async Task SubscribeSymbol(string symbol, string interval)
    {
        string groupName = Utils.GetGroupName(symbol, interval);

        Console.WriteLine($"[ChartHub] SubcribeSymbol {groupName} from {Context.ConnectionId}");

        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _groupClientCounts.AddOrUpdate(groupName, 1, (_, count) => count + 1);

        await _collectorManager.EnsureCollectorRunning(symbol, interval, Context.ConnectionId);
    }

    public async Task UnsubscribeSymbol(string symbol, string interval)
    {
        string groupName = Utils.GetGroupName(symbol, interval);

        Console.WriteLine($"[ChartHub] UnsubcribeSymbol {groupName} from {Context.ConnectionId}");

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        if (_groupClientCounts.AddOrUpdate(groupName, 0, (_, count) => count > 0 ? count - 1 : 0) == 0)
        {
            // Nếu không còn ai trong group → dừng collector
            await _collectorManager.StopCollector(symbol, interval);
            _groupClientCounts.TryRemove(groupName, out _);
        }
    }
}
