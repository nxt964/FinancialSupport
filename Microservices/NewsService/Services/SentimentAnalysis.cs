using System.Net.Http.Json;
using NewsService.Models;

namespace NewsService.Services;

public class SentimentAnalysis
{
    private readonly HttpClient httpClient;
    private readonly string sentimentApiUrl = "http://localhost:5001/analyze";

    public SentimentAnalysis(HttpClient httpClient)
    {
        this.httpClient = httpClient;
    }

    public async Task<List<NewsItem>> UpdateNewsWithSentiment(List<NewsItem> newsList)
    {
        foreach (var news in newsList)
        {
            try
            {
                var previewText = news.Content.Length > 800 ? news.Content.Substring(0, 800) : news.Content;
                var requestBody = new { text = previewText };

                var response = await httpClient.PostAsJsonAsync(sentimentApiUrl, requestBody);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<Sentiment>();
                    if (result != null)
                    {
                        news.Sentiment.Label = result.Label;
                        news.Sentiment.Score = result.Score;
                    }
                }
                else
                {
                    Console.WriteLine($"[Sentiment Error] {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Exception] Error analyzing sentiment: {ex.Message}");
            }
        }

        return newsList;
    }
}