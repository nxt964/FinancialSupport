    using System.Diagnostics;
    using System.Net.Http;

    namespace BacktestService.Services
{
    public class BacktestRunner
    {
        public async Task<string> Run(int strategyChoice)
        {
            var processInfo = new ProcessStartInfo
            {
                FileName = "python",
                Arguments = $"backtest.py {strategyChoice}",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
                WorkingDirectory = "python"
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
            return output;
        }
    }
}
