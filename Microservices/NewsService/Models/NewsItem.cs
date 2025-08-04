namespace NewsService.Models;
using NewsService.Models;

public class NewsItem
{
    public Guid Id { get; set; } = Guid.NewGuid(); // thêm Id để tiện truy vấn
    public required string Title { get; set; }
    public required string Url { get; set; }
    public required string Content { get; set; }

    public Sentiment Sentiment { get; set; } = new Sentiment();

    public DateTime PublishedAt { get; set; }
    public string Source { get; set; } = ""; // ví dụ "cafef", "vietstock"
    public DateTime CrawledAt { get; set; } = DateTime.UtcNow; // để biết khi nào crawl
}