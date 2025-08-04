using HtmlAgilityPack;
using NewsService.Models;

namespace NewsService.Services;

public class NewsCrawler
{
    private readonly HtmlWeb _web;

    public NewsCrawler()
    {
        _web = new HtmlWeb();
    }
    public async Task<List<NewsItem>> GetNewsAsync(string url)
    {
        var doc = await _web.LoadFromWebAsync(url);

        var articleNodes = doc.DocumentNode.SelectNodes("//div[contains(@class, 'list-post-excerpt')]/article/a");

        Console.WriteLine("--- Extracted CryptoSlate Articles ---");

        if (articleNodes is null or { Count: 0 })
        {
            Console.WriteLine("No articles found.");
            return [];
        }

        var newsItems = new List<NewsItem>();

        foreach (var node in articleNodes)
        {
            var titleNode = node.SelectSingleNode(".//h2");
            if (titleNode == null) continue;

            var title = titleNode.InnerText.Trim();
            var fullUrl = node.GetAttributeValue("href", "");
            // var fullUrl = href.StartsWith("http") ? href : "https://cryptoslate.com" + href;

            // Fetch the individual article page
            var postDoc = await _web.LoadFromWebAsync(fullUrl);

            // Try different potential content containers
            var contentNode = postDoc.DocumentNode.SelectSingleNode("//article[contains(@class, 'full-article')]");
            contentNode ??= postDoc.DocumentNode.SelectSingleNode("//div[contains(@class, 'post-box')]//article");
            
            var paragraphs = contentNode?.SelectNodes(".//p");
            var content = string.Join("\n", paragraphs?.Select(p => p.InnerText.Trim()) ?? []);
            
            if (content.Contains("this is a sponsored post", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("⚠️ Skipped sponsored post");
                continue;
            }

            newsItems.Add(new NewsItem
            {
                Title = title,
                Url = fullUrl,
                Content = content,
                PublishedAt = DateTime.UtcNow
            });

            Console.WriteLine($"📰 {title}");
            Console.WriteLine($"🔗 {fullUrl}");
            Console.WriteLine($"📝 Content: {(string.IsNullOrWhiteSpace(content) ? "[No content extracted]" : content[..Math.Min(300, content.Length)] + "...")}");
            Console.WriteLine();
        }

        return newsItems;
    }
}