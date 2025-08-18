using Microsoft.AspNetCore.Mvc;
using BacktestService.Services;

[Route("api/[controller]")]
[ApiController]
public class BacktestController : ControllerBase
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

    [HttpPost("run")]
    public async Task<IActionResult> RunBacktest([FromQuery] int strategy)
    {
        var output = await _backtestRunner.Run(strategy);
        return Ok(new { Output = output });
    }

    [HttpPost("collect-data")]
    public async Task<IActionResult> CollectData([FromBody] BacktestRequest request)
    {
        try
        {
            // Validate the incoming data
            if (string.IsNullOrWhiteSpace(request.Symbol))
                return BadRequest("Symbol is required.");
            
            if (string.IsNullOrWhiteSpace(request.Interval))
                return BadRequest("Interval is required.");
            
            if (string.IsNullOrWhiteSpace(request.Strategy))
                return BadRequest("Strategy is required.");

            // Log the received data
            Console.WriteLine($"Received backtest request:");
            Console.WriteLine($"Symbol: {request.Symbol}");
            Console.WriteLine($"Interval: {request.Interval}");
            Console.WriteLine($"Strategy: {request.Strategy}");

            // Download candles data
            var filePath = await _binanceService.DownloadCandles(request.Symbol, request.Interval);
            
            // Parse strategy to int and run backtest
            if (int.TryParse(request.Strategy, out int strategyId))
            {
                var backtestOutput = await _backtestRunner.Run(strategyId);
                
                return Ok(new { 
                    Message = "Backtest completed successfully",
                    Symbol = request.Symbol,
                    Interval = request.Interval,
                    Strategy = strategyId,
                    FilePath = filePath,
                    Output = backtestOutput
                });
            }
            else
            {
                return BadRequest("Invalid strategy format.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in CollectData: {ex.Message}");
            return StatusCode(500, new { Error = "Internal server error", Details = ex.Message });
        }
    }
}

// DTO class for the request
public class BacktestRequest
{
    public string Symbol { get; set; }
    public string Interval { get; set; }
    public string Strategy { get; set; }
}