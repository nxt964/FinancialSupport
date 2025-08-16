using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

public class BinanceDownloader
{
    public async Task DownloadCandlesAsync(string url, string outputPath)
    {
        try
        {
            using (HttpClientHandler handler = new HttpClientHandler())
            {
                handler.ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true;

                using (HttpClient client = new HttpClient(handler))
                {
                    Console.WriteLine($"Đang tải dữ liệu từ {url}...");

                    HttpResponseMessage response = await client.GetAsync(url);
                    response.EnsureSuccessStatusCode();

                    string jsonData = await response.Content.ReadAsStringAsync();

                    await File.WriteAllTextAsync(outputPath, jsonData);

                    Console.WriteLine($"✅ Đã lưu dữ liệu vào {outputPath}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Lỗi: {ex.Message}");
        }
    }
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
