using Binance.Net.Enums;

public static class Utils
{
    public static string GetGroupName(string symbol, string interval)
    {
        return $"{symbol.ToLower()}_{interval}";
    }

    public static KlineInterval MapInterval(string interval)
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
