public class Ticker
{
    public decimal LastPrice { get; set; }
    public decimal Change { get; set; }
    public decimal PercentChange { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Volume { get; set; }

    public string BaseAsset { get; set; } = string.Empty;
    public string QuoteAsset { get; set; } = string.Empty;
}