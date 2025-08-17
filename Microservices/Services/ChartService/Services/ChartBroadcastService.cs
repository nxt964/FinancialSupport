using Binance.Net.Enums;
using ChartService.Models;
using Microsoft.AspNetCore.SignalR;
using System.Reflection.Metadata;
using System.Text.Json;

namespace ChartsService.Services
{
    public class ChartBroadcastService
    {
        private readonly IHubContext<ChartHub> _hubContext;

        public ChartBroadcastService(IHubContext<ChartHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task BroadcastHistoryCandlesToClientAsync(string connectionId, string symbol, string interval, List<Candle> historyCandles)
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveHistoryCandles",
                new 
                {
                    SymbolCheck = symbol,
                    IntervalCheck = interval,
                    HistoryCandles = historyCandles
                });
            //Console.WriteLine($"[Broadcast] Send history candles {symbol}_{interval}  to {connectionId} successfully!");
        }

        public async Task BroadcastNewCandleAsync(string symbol, string interval, Candle newCandle)
        {
            string groupName = Utils.GetGroupName(symbol, interval);
            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveRealtimeCandle", new {
                SymbolCheck = symbol,
                IntervalCheck = interval,
                NewCandle = newCandle
            });
            //Console.WriteLine($"[Broadcast] Send new candle to {groupName} successfully!");
        }

        public async Task BroadcastNewTickerAsync(string symbol, string interval, Ticker newTicker)
        {
            string groupName = Utils.GetGroupName(symbol, interval);
            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveRealtimeTicker", new
            {
                SymbolCheck = symbol,
                IntervalCheck = interval,
                NewTicker = newTicker
            });
            //Console.WriteLine($"[Broadcast] Send new ticker to {groupName} successfully!");
        }
    }
}
