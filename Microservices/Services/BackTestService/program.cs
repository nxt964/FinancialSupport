using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        string apiUrl = "https://localhost:7114/api/Binance/history-candles?symbol=ETHUSDT&interval=5m";

        // Create data directory if it doesn't exist
        Directory.CreateDirectory("data");
        string outputFile = "data/candles.json";

        Console.WriteLine("🔄 Step 1: Downloading candle data...");
        var downloader = new BinanceDownloader();
        await downloader.DownloadCandlesAsync(apiUrl, outputFile);

        if (File.Exists(outputFile))
        {
            Console.WriteLine($"✅ Data file confirmed at: {Path.GetFullPath(outputFile)}");
            Console.WriteLine($"📁 File size: {new FileInfo(outputFile).Length} bytes");

            // Small delay to ensure file is fully written
            await Task.Delay(1000);

            // ✅ Get strategy number from your existing call/function (1–4)
            // Replace GetStrategyChoice() with your real function that returns 1..4.
            int strategyChoice = GetStrategyChoice();

            Console.WriteLine($"\n🐍 Step 2: Running Python backtest with strategy #{strategyChoice}...");
            await RunPythonBacktest(strategyChoice);
        }
        else
        {
            Console.WriteLine("❌ Failed to download data. Python backtest will not run.");
        }

        Console.WriteLine("\n✅ Process completed!");
        //Console.ReadKey();
    }

    /// <summary>
    /// TODO: Replace this with YOUR real call that returns a number 1..4.
    /// </summary>
    static int GetStrategyChoice()
    {
        // Example placeholder: always return 1.
        // Plug in your logic that returns 1, 2, 3, or 4.
        return 1;
    }

    static async Task RunPythonBacktest(int strategyChoice)
    {
        try
        {
            var processInfo = new ProcessStartInfo
            {
                FileName = "python",
                Arguments = $"backtest.py {strategyChoice}",   // <-- pass choice to Python
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = false,
                WorkingDirectory = "python"  // Set working directory to python folder
            };

            using (var process = Process.Start(processInfo))
            {
                if (process != null)
                {
                    // Read output in real-time
                    string output = await process.StandardOutput.ReadToEndAsync();
                    string error = await process.StandardError.ReadToEndAsync();

                    await process.WaitForExitAsync();

                    if (!string.IsNullOrEmpty(output))
                        Console.WriteLine(output);

                    if (!string.IsNullOrEmpty(error))
                    {
                        Console.WriteLine($"❌ Python Error Output:");
                        Console.WriteLine(error);
                    }

                    if (process.ExitCode == 0)
                        Console.WriteLine("🎉 Python backtest completed successfully!");
                    else
                        Console.WriteLine($"❌ Python backtest failed with exit code: {process.ExitCode}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error running Python script: {ex.Message}");
            //Console.WriteLine("Make sure Python is installed and in your PATH");
            //Console.WriteLine("You can manually run: python python/backtest.py 1");
        }
    }
}
