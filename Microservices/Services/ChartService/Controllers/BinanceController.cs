using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class BinanceController : ControllerBase
{
    private readonly BinanceService _binanceService;

    public BinanceController(BinanceService binanceService)
    {
        _binanceService = binanceService;
    }

    [HttpGet("history-candles")]
    public async Task<IActionResult> GetHistoryCandles([FromQuery] string symbol, [FromQuery] string interval)
    {
        if (string.IsNullOrWhiteSpace(symbol)) return BadRequest("Symbol is required.");
        if (string.IsNullOrWhiteSpace(interval)) return BadRequest("Interval is required.");

        var results = await _binanceService.GetHistoryCandles(symbol, interval);
        return Ok(results);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchSymbols([FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword)) return BadRequest("Keyword is required.");

        var results = await _binanceService.SearchSymbolsAsync(keyword);
        return Ok(results);
    }

    [HttpGet("ticket-size")]
    public async Task<IActionResult> GetTiketSize([FromQuery] string symbol)
    {
        var tickInfo = await _binanceService.GetPriceFormatForSymbol(symbol);
        return Ok(tickInfo);
    }

    [HttpGet("hot-trading")]
    public async Task<IActionResult> GetHotTradingSymbols()
    {
        var topSymbols = await _binanceService.GetHotTradingAsync();
        return Ok(topSymbols);
    }

    [HttpGet("top-volume")]
    public async Task<IActionResult> GetTopVolumeSymbols()
    {
        var topSymbols = await _binanceService.GetTopVolumeAsync();
        return Ok(topSymbols);
    }

    [HttpGet("top-gainers")]
    public async Task<IActionResult> GetTopGainersSymbols()
    {
        var topSymbols = await _binanceService.GetTopGainersAsync();
        return Ok(topSymbols);
    }

    [HttpGet("top-losers")]
    public async Task<IActionResult> GetTopLosersSymbols()
    {
        var topSymbols = await _binanceService.GetTopLosersAsync();
        return Ok(topSymbols);
    }
}