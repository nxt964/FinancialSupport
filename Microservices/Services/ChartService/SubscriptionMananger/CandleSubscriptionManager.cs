using ChartService.Models;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

public class CandleSubscriptionManager
{
    private readonly BinanceService _binanceService;
    private readonly IHubContext<ChartHub> _hubContext;
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _subscriptions = new();

    public CandleSubscriptionManager(BinanceService binanceService, IHubContext<ChartHub> hubContext)
    {
        _binanceService = binanceService;
        _hubContext = hubContext;
    }

    public async Task Subscribe(string connectionId, string symbol, string interval)
    {
        var cts = new CancellationTokenSource();
        _subscriptions[connectionId] = cts;

        await _binanceService.SubscribeLiveCandlesAsync(symbol, interval, async candle =>
        {
            if (!cts.IsCancellationRequested)
            {
                var dto = new Candle
                {
                    OpenTime = candle.Data.OpenTime,
                    Open = candle.Data.OpenPrice,
                    High = candle.Data.HighPrice,
                    Low = candle.Data.LowPrice,
                    Close = candle.Data.ClosePrice,
                    Volume = candle.Data.Volume,
                    CloseTime = candle.Data.CloseTime
                };

                await _hubContext.Clients.Client(connectionId).SendAsync("NewCandle", dto);
            }
        });
    }

    public void Unsubscribe(string connectionId)
    {
        if (_subscriptions.TryRemove(connectionId, out var cts))
        {
            cts.Cancel();
        }
    }
}
