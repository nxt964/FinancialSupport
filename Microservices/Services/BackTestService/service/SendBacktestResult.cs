using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace BacktestService.Services
{
    public class SendBacktestResult
    {
        private readonly string _dataFolder;

        public SendBacktestResult(IWebHostEnvironment env)
        {
            // Use the content root path as base
            _dataFolder = Path.Combine(env.ContentRootPath, "python", "plots");

            // Ensure the directory exists
            Directory.CreateDirectory(_dataFolder);
        }

        public string GetChartFilePath(string fileName = "chart.html")
        {
            return Path.Combine(_dataFolder, fileName);
        }
    }
}