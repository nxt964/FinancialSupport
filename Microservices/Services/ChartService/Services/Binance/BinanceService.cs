using Binance.Net.Clients;
using Binance.Net.Enums;
using Binance.Net.Objects.Models.Spot;
using ChartService.Models;

public class BinanceService
{
    private readonly BinanceRestClient _restClient;

    // In-memory cache cho các symbol đang giao dịch
    private List<BinanceSymbol> _cachedTradingSymbols = new();
    private DateTime _lastExchangeInfoFetch = DateTime.MinValue;
    private readonly TimeSpan _exchangeInfoCacheDuration = TimeSpan.FromHours(1);

    public BinanceService()
    {
        _restClient = new BinanceRestClient();
    }
    private async Task<List<BinanceSymbol>> GetTradingSymbolsAsync()
    {
        if (_cachedTradingSymbols.Count > 0 && DateTime.UtcNow - _lastExchangeInfoFetch < _exchangeInfoCacheDuration)
            return _cachedTradingSymbols;

        var exchangeInfoResult = await _restClient.SpotApi.ExchangeData.GetExchangeInfoAsync();

        if (!exchangeInfoResult.Success || exchangeInfoResult.Data == null)
            throw new Exception("Failed to get exchange info");

        _cachedTradingSymbols = exchangeInfoResult.Data.Symbols
            .Where(s => s.Status == SymbolStatus.Trading)
            .ToList();

        _lastExchangeInfoFetch = DateTime.UtcNow;

        return _cachedTradingSymbols;
    }

    public async Task<List<Candle>> GetHistoryCandles(string symbol, string interval)
    {
        var historyCandles = await _restClient.SpotApi.ExchangeData.GetKlinesAsync(
            symbol,
            Utils.MapInterval(interval),
        limit: 1000
        );

        if (!historyCandles.Success || historyCandles.Data == null)
        {
            throw new Exception($"Failed to get historical candles: {historyCandles.Error?.Message}");
        }

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

    public async Task<List<SymbolInfo>> SearchSymbolsAsync(string keyword)
    {
        var tradingSymbols = await GetTradingSymbolsAsync();
        var tickersResult = await _restClient.SpotApi.ExchangeData.GetTickersAsync();

        if (!tickersResult.Success || tickersResult.Data == null)
            throw new Exception("Failed to get tickers");

        var keywordUpper = keyword.ToUpperInvariant();

        // Lấy danh sách symbols đang giao dịch, có chứa keyword trong BaseAsset
        var filteredSymbols = tradingSymbols
            .Where(s => s.Status == SymbolStatus.Trading
                        && s.BaseAsset.Contains(keywordUpper, StringComparison.OrdinalIgnoreCase))
            .Select(s => s.Name)
            .ToHashSet();

        // Ghép với ticker data để lấy thông tin giá và % thay đổi
        var result = tickersResult.Data
            .Where(t => filteredSymbols.Contains(t.Symbol))
            .OrderBy(t => !t.Symbol.StartsWith(keywordUpper)) // Ưu tiên symbol bắt đầu bằng keyword
            .Select(t => new SymbolInfo
            {
                Symbol = t.Symbol,
                Price = t.LastPrice,
                PriceChangePercent = t.PriceChangePercent,
            })
            .ToList();

        return result;
    }

    public async Task<List<SymbolInfo>> GetTopHotSymbolsAsync()
    {
        var tickers = await _restClient.SpotApi.ExchangeData.GetTickersAsync();

        if (!tickers.Success) return new List<SymbolInfo>();

        return tickers.Data
            .Where(t => t.QuoteVolume > 0)
            .OrderByDescending(t => t.TotalTrades)
            .Take(20)
            .Select(t => new SymbolInfo
            {
                Symbol = t.Symbol,
                Price = t.LastPrice,
                PriceChangePercent = t.PriceChangePercent
            })
            .ToList();
    }

    public async Task<TickInfo> GetPriceFormatForSymbol(string symbol)
    {
        var tradingSymbols = await GetTradingSymbolsAsync();

        var symbolInfo = tradingSymbols
            .FirstOrDefault(s => s.Name.Equals(symbol, StringComparison.OrdinalIgnoreCase));;

        if (symbolInfo == null)
            throw new Exception($"Symbol '{symbol}' not found in exchange info");

        var priceFilter = symbolInfo.Filters
            .FirstOrDefault(f => f.FilterType == SymbolFilterType.Price);

        if (priceFilter == null)
            throw new Exception($"Price filter not found for symbol {symbol}");

        // Get TickSize dynamically
        decimal tickSize = priceFilter.GetType().GetProperty("TickSize")?.GetValue(priceFilter) as decimal? ?? 0m;
        
        int precision = tickSize.ToString("0.########", System.Globalization.CultureInfo.InvariantCulture)
            .Split('.')
            .ElementAtOrDefault(1)?.Length ?? 0;

        return new TickInfo {
            TicketSize = tickSize,
            Precision = precision,
        };
    }
}
