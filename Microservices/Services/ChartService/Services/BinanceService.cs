using Binance.Net.Clients;
using Binance.Net.Enums;
using Binance.Net.Interfaces;
using ChartService.Models;
using CryptoExchange.Net.Objects.Sockets;

public class BinanceService
{
    private readonly BinanceRestClient _restClient;
    private readonly BinanceSocketClient _socketClient;
    private readonly RedisService _redis;

    public BinanceService(RedisService redis)
    {
        _restClient = new BinanceRestClient();
        _socketClient = new BinanceSocketClient();
        _redis = redis;
    }

    public async Task<List<Candle>> GetHistoricalCandlesAsync(string symbol, string interval)
    {
        var key = $"candles:{symbol}:{interval}";
        var cached = await _redis.GetAsync(key);

        if (cached != null)
        {
            return System.Text.Json.JsonSerializer.Deserialize<List<Candle>>(cached)!;
        }

        var response = await _restClient.SpotApi.ExchangeData.GetKlinesAsync(symbol, MapInterval(interval), limit: 1000);
        if (!response.Success || response.Data == null)
        {
            throw new Exception($"Failed to get historical candles: {response.Error?.Message}");
        }

        var result = response.Data.Select(k => new Candle
        {
            OpenTime = k.OpenTime,
            Open = k.OpenPrice,
            High = k.HighPrice,
            Low = k.LowPrice,
            Close = k.ClosePrice,
            Volume = k.Volume,
            CloseTime = k.CloseTime
        }).ToList();

        // Cache trong Redis trong 5 phút
        var json = System.Text.Json.JsonSerializer.Serialize(result);
        await _redis.SetAsync(key, json, TimeSpan.FromMinutes(5));

        return result;
    }

    public async Task<UpdateSubscription> SubscribeLiveCandlesAsync(
        string symbol,
        string interval,
        Action<IBinanceStreamKlineData> handleCandle)
    {
        var result = await _socketClient.SpotApi.ExchangeData.SubscribeToKlineUpdatesAsync(
            symbol,
            MapInterval(interval),
            async data =>
            {
                handleCandle(data.Data);

                // Ghi realtime candle vào Redis
                var dto = new Candle
                {
                    OpenTime = data.Data.Data.OpenTime,
                    Open = data.Data.Data.OpenPrice,
                    High = data.Data.Data.HighPrice,
                    Low = data.Data.Data.LowPrice,
                    Close = data.Data.Data.ClosePrice,
                    Volume = data.Data.Data.Volume,
                    CloseTime = data.Data.Data.CloseTime
                };

                var json = System.Text.Json.JsonSerializer.Serialize(dto);
                var key = $"realtime:{symbol}:{interval}";
                await _redis.SetAsync(key, json, TimeSpan.FromMinutes(2));
            });

        if (!result.Success)
        {
            throw new Exception($"Subscription failed: {result.Error?.Message}");
        }

        return result.Data;
    }

    private KlineInterval MapInterval(string interval)
    {
        return interval switch
        {
            "1m" => KlineInterval.OneMinute,
            "3m" => KlineInterval.ThreeMinutes,
            "5m" => KlineInterval.FiveMinutes,
            "15m" => KlineInterval.FifteenMinutes,
            "30m" => KlineInterval.ThirtyMinutes,
            "1h" => KlineInterval.OneHour,
            "4h" => KlineInterval.FourHour,
            "1d" => KlineInterval.OneDay,
            _ => throw new ArgumentException("Unsupported interval")
        };
    }
}
