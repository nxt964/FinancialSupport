using System.Net.Http;
using System.Text.Json;

namespace BacktestService.Services
{
    public class BinanceService
    {
        private readonly HttpClient _httpClient;

        public BinanceService()
        {
            _httpClient = new HttpClient(new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (sender, cert, chain, errors) => true
            });
        }

        public async Task<string> DownloadCandles(string symbol, string interval)
        {
            string url = $"https://localhost:7114/api/Binance/history-candles?symbol={symbol}&interval={interval}";
            string folder = "data";
            Directory.CreateDirectory(folder);
            string filePath = Path.Combine(folder, "candles.json");

            Console.WriteLine($"Đang tải dữ liệu từ {url}...");
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            string jsonData = await response.Content.ReadAsStringAsync();
            
            // Save the candles data
            await File.WriteAllTextAsync(filePath, jsonData);

            // Also save the request parameters for the Python script to read
            var requestData = new
            {
                symbol = symbol,
                interval = interval,
                timestamp = DateTime.Now
            };
            
            string requestFilePath = Path.Combine(folder, "request_data.json");
            string requestJson = JsonSerializer.Serialize(requestData, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(requestFilePath, requestJson);

            Console.WriteLine($"✅ Đã lưu dữ liệu vào {filePath}");
            Console.WriteLine($"✅ Đã lưu thông tin request vào {requestFilePath}");
            return filePath;
        }
    }
}