using ChartService.Models;
using Microsoft.AspNetCore.SignalR;

public class ChartHub : Hub
{
    private readonly CandleSubscriptionManager _subscriptionManager;
    private readonly BinanceService _binanceService;
    private readonly RedisService _redisService;

    public ChartHub(CandleSubscriptionManager subscriptionManager, BinanceService binanceService, RedisService redisService)
    {
        _subscriptionManager = subscriptionManager;
        _binanceService = binanceService;
        _redisService = redisService;
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _subscriptionManager.Unsubscribe(Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }

    public async Task SubscribeCandle(string symbol, string interval)
    {
        var candles = await _binanceService.GetHistoricalCandlesAsync(symbol, interval);

        // Check có realtime candle mới trong Redis không
        var realtimeJson = await _redisService.GetAsync($"realtime:{symbol}:{interval}");
        if (realtimeJson != null)
        {
            var lastCandle = System.Text.Json.JsonSerializer.Deserialize<Candle>(realtimeJson);
            if (lastCandle != null && lastCandle.OpenTime > candles.Last().OpenTime)
            {
                candles.Add(lastCandle);
            }
        }

        await Clients.Caller.SendAsync("HistoryCandles", candles);
        await _subscriptionManager.Subscribe(Context.ConnectionId, symbol, interval);
    }

    public Task UnsubscribeCandle(string symbol, string interval)
    {
        _subscriptionManager.Unsubscribe(Context.ConnectionId);
        return Task.CompletedTask;
    }
}
