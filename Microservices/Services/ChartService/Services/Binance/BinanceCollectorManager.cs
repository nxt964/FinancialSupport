using Binance.Net.Clients;
using Binance.Net.Enums;
using ChartsService.Services;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

public class BinanceCollectorManager
{
    private readonly ConcurrentDictionary<string, BinanceDataCollector> _collectors = new();
    private readonly ChartBroadcastService _chartBroadcastService;

    public BinanceCollectorManager(ChartBroadcastService chartBroadcastService)
    {
        _chartBroadcastService = chartBroadcastService;
    }

    public async Task EnsureCollectorRunning(string symbol, string interval, string connectionId)
    {
        string key = Utils.GetGroupName(symbol, interval);

        if (!_collectors.ContainsKey(key))
        {
            var collector = new BinanceDataCollector(_chartBroadcastService, symbol, interval);
            Console.WriteLine($"[CollectionManager] Create new collector for group: {key}");
            _collectors[key] = collector;
            await collector.StartAsync(connectionId);
        }
        else
        {
            var collector = _collectors[key];
            await collector.SendHistoryCandlesToClientAsync(connectionId);
        }
    }

    public async Task StopCollector(string symbol, string interval)
    {
        var key = Utils.GetGroupName(symbol, interval);
        if (_collectors.TryRemove(key, out var collector))
        {
            await collector.StopAsync();
            Console.WriteLine($"[CollectorManager] Stopped collector {key}");
        }
    }
}
