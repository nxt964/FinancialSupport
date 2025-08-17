using Binance.Net.Clients;
using Binance.Net.Enums;
using Binance.Net.Interfaces;
using Binance.Net.Objects.Models.Spot;
using ChartService.Models;

public class BinanceService
{
    private readonly BinanceRestClient _restClient;

    // In-memory cache cho các symbol đang giao dịch
    private List<BinanceSymbol> _cachedTradingSymbols = new();
    private Dictionary<string, BinanceSymbol> _symbolMap = new();
    private List<IBinanceTick> _cachedTickers = new();
    private List<SymbolInfo> _cachedHotTrading = new();
    private List<SymbolInfo> _cachedTopVolume = new();
    private List<SymbolInfo> _cachedTopGainers = new();
    private List<SymbolInfo> _cachedTopLosers = new();

    private DateTime _lastCacheUpdate = DateTime.MinValue;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(5);

    public BinanceService()
    {
        _restClient = new BinanceRestClient();
    }
    /// <summary>
    /// Cập nhật cache từ Binance API (ExchangeInfo + Tickers)
    /// </summary>
    private async Task UpdateCacheAsync()
    {
        if (_cachedTradingSymbols.Count > 0 &&
            _cachedTickers.Count > 0 &&
            DateTime.UtcNow - _lastCacheUpdate < _cacheDuration)
            return;

        var exchangeInfoResult = await _restClient.SpotApi.ExchangeData.GetExchangeInfoAsync();
        var tickersResult = await _restClient.SpotApi.ExchangeData.GetTickersAsync();

        if (!exchangeInfoResult.Success || !tickersResult.Success)
            throw new Exception("Failed to fetch data from Binance");

        _cachedTradingSymbols = exchangeInfoResult.Data.Symbols
            .Where(s => s.Status == SymbolStatus.Trading)
            .ToList();

        _symbolMap = _cachedTradingSymbols.ToDictionary(s => s.Name, s => s);
        _cachedTickers = tickersResult.Data.ToList();

        // Tính sẵn 4 list
        _cachedHotTrading = FilterUniqueByBaseAsset(
            _cachedTickers.OrderByDescending(t => t.TotalTrades), 20
        );

        _cachedTopVolume = FilterUniqueByBaseAsset(
            _cachedTickers.OrderByDescending(t => t.QuoteVolume), 20
        );

        _cachedTopGainers = FilterUniqueByBaseAsset(
            _cachedTickers.OrderByDescending(t => t.PriceChangePercent), 20
        );

        _cachedTopLosers = FilterUniqueByBaseAsset(
            _cachedTickers.OrderBy(t => t.PriceChangePercent), 20
        );

        _lastCacheUpdate = DateTime.UtcNow;
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

    public async Task<TickInfo> GetPriceFormatForSymbol(string symbol)
    {
        await UpdateCacheAsync();

        if (!_symbolMap.TryGetValue(symbol, out var symbolInfo))
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

        return new TickInfo
        {
            TicketSize = tickSize,
            Precision = precision,
        };
    }

    public async Task<List<SymbolInfo>> SearchSymbolsAsync(string keyword)
    {
        await UpdateCacheAsync();

        var keywordUpper = keyword.ToUpperInvariant()
            .Replace("/", "")
            .Replace("-", "")
            .Trim();

        // Lấy danh sách symbols đang giao dịch, có chứa keyword trong BaseAsset
        var filteredSymbols = _cachedTradingSymbols
            .Where(s => s.Name.Contains(keywordUpper, StringComparison.OrdinalIgnoreCase))
            .Select(s => s.Name)
            .ToHashSet();

        // Ghép với ticker data để lấy thông tin giá và % thay đổi
        var result = _cachedTickers
            .Where(t => filteredSymbols.Contains(t.Symbol))
            .OrderBy(t => !t.Symbol.StartsWith(keywordUpper)) // Ưu tiên symbol bắt đầu bằng keyword
            .Select(t => 
            {
                var sym = _cachedTradingSymbols.First(s => s.Name == t.Symbol);
                return new SymbolInfo
                {
                    Symbol = t.Symbol,
                    Price = t.LastPrice,
                    PriceChangePercent = t.PriceChangePercent,
                    BaseAsset = sym.BaseAsset,
                    QuoteAsset = sym.QuoteAsset
                };
            }).ToList();

        return result;
    }

    public async Task<List<SymbolInfo>> GetHotTradingAsync(int limit = 20)
    {
        await UpdateCacheAsync();

        return _cachedHotTrading;
    }

    public async Task<List<SymbolInfo>> GetTopVolumeAsync(int limit = 20)
    {
        await UpdateCacheAsync();

        return _cachedTopVolume;
    }

    public async Task<List<SymbolInfo>> GetTopGainersAsync(int limit = 20)
    {
        await UpdateCacheAsync();

        return _cachedTopGainers;
    }

    public async Task<List<SymbolInfo>> GetTopLosersAsync(int limit = 20)
    {
        await UpdateCacheAsync();

        return _cachedTopLosers;
    }
    public async Task<SymbolInfo> GetSymbolInfoAsync(string symbol)
    {
        await UpdateCacheAsync();

        if (_symbolMap.TryGetValue(symbol, out var sym))
        {
            return new SymbolInfo
            {
                Symbol = sym.Name,
                BaseAsset = sym.BaseAsset,
                QuoteAsset = sym.QuoteAsset
            };
        }

        throw new Exception($"Symbol {symbol} not found");
    }

    private List<SymbolInfo> FilterUniqueByBaseAsset(IEnumerable<IBinanceTick> ticks, int limit)
    {
        var seenBaseAssets = new HashSet<string>();
        var result = new List<SymbolInfo>();

        foreach (var tick in ticks)
        {
            var info = MapToSymbolInfo(tick);
            if (info == null) continue; // bỏ null

            if (seenBaseAssets.Add(info.BaseAsset)) // nếu chưa gặp BaseAsset này
            {
                result.Add(info);
                if (result.Count >= limit)
                    break;
            }
        }
        return result;
    }

    private SymbolInfo MapToSymbolInfo(IBinanceTick t)
    {
        if (_symbolMap.TryGetValue(t.Symbol, out var sym))
        {
            return new SymbolInfo
            {
                Symbol = t.Symbol,
                Price = t.LastPrice,
                PriceChangePercent = t.PriceChangePercent,
                BaseAsset = sym.BaseAsset,
                QuoteAsset = sym.QuoteAsset
            };
        }
        return null;
    }
}
