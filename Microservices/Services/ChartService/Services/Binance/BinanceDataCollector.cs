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
    private readonly BinanceRestClient _restClient;
    private readonly ChartBroadcastService _chartBroadcastService;
    private readonly string _symbol;
    private readonly string _interval;

    private List<Candle>? _cachedHistory;
    private DateTime _cachedAtUtc;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromSeconds(60);

    public BinanceDataCollector(
        ChartBroadcastService chartBroadcastService,
        string symbol,
        string interval)
    {
        _socketClient = new BinanceSocketClient();
        _restClient = new BinanceRestClient();
        _chartBroadcastService = chartBroadcastService;
        _symbol = symbol;
        _interval = interval;
    }

    public async Task StartAsync(string connectionId)
    {
        // 1.Gửi 1000 nến lịch sử về cho client
        await SendHistoryCandlesToClientAsync(connectionId);

        // 2. Subscribe websocket để nhận realtime
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
    }

    private async Task<List<Candle>> GetHistoryCandles()
    {
        var historyCandles = await _restClient.SpotApi.ExchangeData.GetKlinesAsync(
            _symbol,
            Utils.MapInterval(_interval),
        limit: 1000
        );

        if (!historyCandles.Success || historyCandles.Data == null)
        {
            throw new Exception($"Failed to get historical candles: {historyCandles.Error?.Message}");
        }

        //Console.WriteLine($"[DataCollector] Get history candles of {_symbol}_{_interval} successfully! Broasdcast is sending...");

        var historyCandlesDto = historyCandles.Data.Select(kline => new Candle
        {
            OpenTime = kline.OpenTime,
            Open = kline.OpenPrice,
            High = kline.HighPrice,
            Low = kline.LowPrice,
            Close = kline.ClosePrice,
            Volume = kline.Volume,
            CloseTime = kline.CloseTime
        }).ToList();

        return historyCandlesDto;
    }

    public async Task SendHistoryCandlesToClientAsync(string connectionId)
    {
        var now = DateTime.UtcNow;

        if (_cachedHistory == null || (now - _cachedAtUtc) > _cacheDuration)
        {
            _cachedHistory = await GetHistoryCandles();
            _cachedAtUtc = now;
        }

        await _chartBroadcastService.BroadcastHistoryCandlesToClientAsync(connectionId, _symbol, _interval, _cachedHistory);
    }

    public Task StopAsync()
    {
        return _socketClient.UnsubscribeAllAsync();
    }
}
