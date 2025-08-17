using Microsoft.AspNetCore.Mvc;
using BacktestService.Services;

[Route("api/[controller]")]
[ApiController]
public class BacktestController : ControllerBase  // Đổi từ BinanceController thành BacktestController
{
    private readonly BinanceService _binanceService;
    private readonly BacktestRunner _backtestRunner;

    public BacktestController(BinanceService binanceService, BacktestRunner backtestRunner)
    {
        _binanceService = binanceService;
        _backtestRunner = backtestRunner;
    }

    [HttpGet("history-candles")]
    public async Task<IActionResult> GetHistoryCandles([FromQuery] string symbol, [FromQuery] string interval)
    {
        if (string.IsNullOrWhiteSpace(symbol)) return BadRequest("Symbol is required.");
        if (string.IsNullOrWhiteSpace(interval)) return BadRequest("Interval is required.");

        var filePath = await _binanceService.DownloadCandles(symbol, interval);
        return Ok(new { File = filePath });
    }

    [HttpPost("run")]  // Đổi từ "backtest" thành "run" để tránh trùng lặp
    public async Task<IActionResult> RunBacktest([FromQuery] int strategy)
    {
        var output = await _backtestRunner.Run(strategy);
        return Ok(new { Output = output });
    }
}