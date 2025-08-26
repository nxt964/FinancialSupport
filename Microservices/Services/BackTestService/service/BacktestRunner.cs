using System.Diagnostics;
using System.Net.Http;
using System.Text.Json;

namespace BacktestService.Services
{
    public class BacktestRunner
    {
        public async Task<string> Run(int strategyChoice)
        {
            // Read the candles.json data to verify it exists
            string dataFolder = "data";
            string candlesFilePath = Path.Combine(dataFolder, "candles.json");
            string requestFilePath = Path.Combine(dataFolder, "request_data.json");

            if (!File.Exists(candlesFilePath))
            {
                return "Error: candles.json file not found. Please download data first.";
            }

            // Read and log the request data
            if (File.Exists(requestFilePath))
            {
                string requestJson = await File.ReadAllTextAsync(requestFilePath);
                Console.WriteLine("=== REQUEST DATA FROM JSON ===");
                Console.WriteLine(requestJson);
                Console.WriteLine("==============================");
            }

            // Read and log some info about the candles data
            string candlesJson = await File.ReadAllTextAsync(candlesFilePath);
            Console.WriteLine($"Candles data size: {candlesJson.Length} characters");
            Console.WriteLine($"Running Python backtest with strategy {strategyChoice}...");

            var processInfo = new ProcessStartInfo
            {
                FileName = "python3",
                Arguments = $"-u python/backtest.py {strategyChoice}",  // <- -u = unbuffered stdout/stderr
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
                WorkingDirectory = "/app"
            };

            using var process = Process.Start(processInfo);
            if (process == null)
                return "Failed to start Python process.";

            string output = await process.StandardOutput.ReadToEndAsync();
            string error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (!string.IsNullOrEmpty(error))
                output += "\nERRORS:\n" + error;
            
            Console.WriteLine($"Backtest completed with strategy {strategyChoice}.");
            Console.WriteLine("=== PYTHON OUTPUT ===");
            Console.WriteLine(output);
            Console.WriteLine("====================");
            
            return output;
        }
    }
}