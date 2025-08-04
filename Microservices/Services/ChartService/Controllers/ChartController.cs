using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using ChartService.Models;

namespace ChartService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChartController : ControllerBase
    {
        private readonly BinanceService _binanceService;
        private readonly RedisService _redisService;

        public ChartController(BinanceService binanceService, RedisService redisService)
        {
            _binanceService = binanceService;
            _redisService = redisService;
        }

        [HttpGet("historical/{symbol}/{interval}")]
        public async Task<IActionResult> GetHistoricalCandles(string symbol, string interval)
        {
            var key = $"candles:{symbol}:{interval}";
            var cached = await _redisService.GetAsync(key);

            if (!string.IsNullOrEmpty(cached))
            {
                var candles = JsonSerializer.Deserialize<List<Candle>>(cached);
                return Ok(candles);
            }

            var data = await _binanceService.GetHistoricalCandlesAsync(symbol, interval);
            await _redisService.SetAsync(key, JsonSerializer.Serialize(data), TimeSpan.FromMinutes(5));
            return Ok(data);
        }

        [HttpGet("realtime/{symbol}/{interval}")]
        public async Task RealtimeUpdates(string symbol, string interval)
        {
            await _binanceService.SubscribeLiveCandlesAsync(symbol, interval, async candle =>
            {
                Console.WriteLine($"New candle received for {symbol}: {candle.Data}");
            });
        }
    }
}
