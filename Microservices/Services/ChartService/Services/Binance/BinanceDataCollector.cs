using Binance.Net.Clients;
using Binance.Net.Enums;
using ChartService.Models;
using ChartsService.Services;
using CryptoExchange.Net.Interfaces;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;

public class BinanceDataCollector
{
    private readonly BinanceSocketClient _socketClient;
    private readonly ChartBroadcastService _chartBroadcastService;
    private readonly BinanceService _binanceService;
    private readonly string _symbol;
    private readonly string _interval;

    private List<Candle>? _cachedHistory;
    private DateTime _cachedAtUtc;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromSeconds(60);

    public BinanceDataCollector(
        ChartBroadcastService chartBroadcastService,
        BinanceService binanceService,
        string symbol,
        string interval)
    {
        _socketClient = new BinanceSocketClient();
        _chartBroadcastService = chartBroadcastService;
        _binanceService = binanceService;
        _symbol = symbol;
        _interval = interval;
    }

    public async Task StartAsync(string connectionId)
    {
        // 1.Gửi 1000 nến lịch sử về cho client
        await SendHistoryCandlesToClientAsync(connectionId);

        // 2. Subscribe websocket để nhận realtime Candle (cho chart) và Ticker (cho thông tin Symbol)
        await _socketClient.SpotApi.ExchangeData.SubscribeToKlineUpdatesAsync(
            _symbol,
            Utils.MapInterval(_interval),
            async update =>
            {
                var UpdatedCandleDto = new Candle
                {
                    OpenTime = update.Data.Data.OpenTime,
                    Open = update.Data.Data.OpenPrice,
                    High = update.Data.Data.HighPrice,
                    Low = update.Data.Data.LowPrice,
                    Close = update.Data.Data.ClosePrice,
                    Volume = update.Data.Data.Volume,
                    CloseTime = update.Data.Data.CloseTime
                };

                //Console.WriteLine($"[DataCollector] Get new candle of {groupName} successfully! Broasdcast is sending...");
                await _chartBroadcastService.BroadcastNewCandleAsync(_symbol, _interval, UpdatedCandleDto);
            });

        await _socketClient.SpotApi.ExchangeData.SubscribeToTickerUpdatesAsync(
            _symbol,
            async update =>
            {
                var symbolInfo = await _binanceService.GetSymbolInfoAsync(_symbol);

                var newTicker = new Ticker
                {
                    LastPrice = update.Data.LastPrice,
                    Change = update.Data.PriceChange,
                    PercentChange = update.Data.PriceChangePercent,
                    High = update.Data.HighPrice,
                    Low = update.Data.LowPrice,
                    Volume = update.Data.Volume,
                    BaseAsset = symbolInfo.BaseAsset,
                    QuoteAsset = symbolInfo.QuoteAsset
                };

                await _chartBroadcastService.BroadcastNewTickerAsync(_symbol, _interval, newTicker);
            });
    }

    public async Task SendHistoryCandlesToClientAsync(string connectionId)
    {
        var now = DateTime.UtcNow;

        if (_cachedHistory == null || (now - _cachedAtUtc) > _cacheDuration)
        {
            _cachedHistory = await _binanceService.GetHistoryCandles(_symbol, _interval);
            _cachedAtUtc = now;
        }

        await _chartBroadcastService.BroadcastHistoryCandlesToClientAsync(connectionId, _symbol, _interval, _cachedHistory);
    }

    public Task StopAsync()
    {
        return _socketClient.UnsubscribeAllAsync();
    }
}
