using System.Net.Http;

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
            await File.WriteAllTextAsync(filePath, jsonData);

            Console.WriteLine($"✅ Đã lưu dữ liệu vào {filePath}");
            return filePath;
        }
    }
}
