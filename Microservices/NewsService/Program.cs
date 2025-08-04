using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NewsService.Services;
using NewsService.Models;

var builder = WebApplication.CreateBuilder(args);

// DI setup
builder.Services.AddHttpClient<SentimentAnalysis>();
builder.Services.AddSingleton<NewsCrawler>();

var app = builder.Build();

// Define endpoint
app.MapGet("/news", async (NewsCrawler crawler, SentimentAnalysis sentiment) =>
{
    var news = await crawler.GetNewsAsync("https://cryptoslate.com");
    var enrichedNews = await sentiment.UpdateNewsWithSentiment(news);
    return Results.Ok(enrichedNews);
});

app.Run();