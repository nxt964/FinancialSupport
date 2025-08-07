using Binance.Net.Enums;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

public class ChartHub : Hub
{
    private readonly BinanceCollectorManager _collectorManager;
    private static readonly ConcurrentDictionary<string, int> _groupClientCounts = new();
    private static readonly ConcurrentDictionary<string, HashSet<string>> _connectionGroups = new();

    public ChartHub(BinanceCollectorManager collectorManager)
    {
        _collectorManager = collectorManager;
    }

    public async Task SubscribeSymbol(string symbol, string interval)
    {
        string groupName = Utils.GetGroupName(symbol, interval);
        string connectionId = Context.ConnectionId;

        Console.WriteLine($"[ChartHub] SubcribeSymbol {groupName} from {connectionId}");

        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        _groupClientCounts.AddOrUpdate(groupName, 1, (_, count) => count + 1);

        _connectionGroups.AddOrUpdate(connectionId,
            _ => new HashSet<string> { groupName },
            (_, groups) => { groups.Add(groupName); return groups; });

        await _collectorManager.EnsureCollectorRunning(symbol, interval, connectionId);
    }

    public async Task UnsubscribeSymbol(string symbol, string interval)
    {
        string groupName = Utils.GetGroupName(symbol, interval);
        string connectionId = Context.ConnectionId;

        Console.WriteLine($"[ChartHub] UnsubcribeSymbol {groupName} from {connectionId}");

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        if (_groupClientCounts.AddOrUpdate(groupName, 0, (_, count) => count > 0 ? count - 1 : 0) == 0)
        {
            // Nếu không còn ai trong group → dừng collector
            await _collectorManager.StopCollector(symbol, interval);
            _groupClientCounts.TryRemove(groupName, out _);
        }

        if (_connectionGroups.TryGetValue(connectionId, out var groups))
        {
            groups.Remove(groupName);
            if (groups.Count == 0)
                _connectionGroups.TryRemove(connectionId, out _);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        string connectionId = Context.ConnectionId;

        if (_connectionGroups.TryRemove(connectionId, out var groups))
        {
            foreach (var groupName in groups)
            {
                await Groups.RemoveFromGroupAsync(connectionId, groupName);

                var parts = groupName.Split('_');
                if (parts.Length == 2)
                {
                    var symbol = parts[0];
                    var interval = parts[1];

                    if (_groupClientCounts.AddOrUpdate(groupName, 0, (_, count) => count > 0 ? count - 1 : 0) == 0)
                    {
                        await _collectorManager.StopCollector(symbol, interval);
                        _groupClientCounts.TryRemove(groupName, out _);
                    }
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}
