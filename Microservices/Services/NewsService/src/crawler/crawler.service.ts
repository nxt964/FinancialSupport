import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { NewsService } from "../news/news.service";
import { load } from "cheerio";
import axios from "axios";
import { config } from "dotenv";
import { HfService } from "src/hf/hf.service";

config();

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function extractPrimaryCategory($$: ReturnType<typeof load>) {
  const firstTag = $$('.news-cats .big-cat a[rel="tag"]').first();
  const name = firstTag.text().trim();
  if (!name) return null;
  return { name, slug: slugify(name) };
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  constructor(
    private newsService: NewsService,
    private hf: HfService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async scheduledCrawl() {
    this.logger.log("⏰ Running daily scheduled crawl");
    await this.getNews(1);
  }

  async analyzeArticle(content: string) {
    const summary = await this.hf.summarize(content);
    const sentiment = await this.hf.sentiment(summary);
    return sentiment;
  }

  async getNews(page: number): Promise<void> {
    const url = `${process.env.CRAWL_SITE_URL}/page/${page}/`;
    const response = await axios.get(url);
    const $ = load(response.data);

    const articleNodes = $(
      "section.list-feed > div.list-post-cards > div.list-card > article"
    );

    for (let i = 0; i < articleNodes.length; i++) {
      const article = articleNodes[i];
      const anchor = $(article).find("a").first();
      const title = anchor.find("h2").text().trim();
      const fullUrl = anchor.attr("href") || "";

      const exists = await this.newsService.findByUrl(fullUrl);
      if (exists) {
        this.logger.log(
          `⏭️ Found existing article "${title}", skipping rest of page`
        );
        break; // <-- stop crawling further articles from this page
      }

      // Cover image
      const noscriptHtml = $(article).find("div.cover noscript").html() || "";

      // 2. Load the noscript HTML content into a new Cheerio instance
      const $img = load(noscriptHtml)("img");

      // 3. Extract the real src
      let coverImageUrl = $img.attr("src") || "";

      // 4. Resize the image by replacing dimensions
      coverImageUrl = coverImageUrl.replace(
        /-\d+x\d+(?=\.\w{3,4}$)/,
        "-768x403"
      );

      // Fetch article page
      if (!fullUrl) continue;

      const articlePage = await axios.get(fullUrl);
      const $$ = load(articlePage.data);

      // Author
      const author = $$(".author-info a").text().trim() || "Unknown";

      // Date
      const rawDate = $$(".post-date").text().trim();

      let publishedDate = new Date();
      if (rawDate.includes("Updated:")) {
        const updatedPart = rawDate.split("Updated:")[1].trim();

        const cleanDate = updatedPart
          .replace(/\bat\b/g, "")
          .replace("UTC", "")
          .trim();

        const parsed = new Date(cleanDate + " UTC");
        if (!isNaN(parsed.getTime())) {
          publishedDate = parsed;
        }
      } else {
        const cleanDate = rawDate
          .replace(/\bat\b/g, "")
          .replace("UTC", "")
          .trim();
        const parsed = new Date(cleanDate + " UTC");
        if (!isNaN(parsed.getTime())) {
          publishedDate = parsed;
        }
      }

      // Content
      const contentNode = $$(".full-article").length
        ? $$(".full-article")
        : $$(".post-box article");

      const paragraphs = contentNode.find("p").toArray();
      const content = paragraphs.map((p) => $$(p).text().trim()).join("\n");

      // Skip sponsored posts
      if (content.toLowerCase().includes("this is a sponsored post")) continue;

      const cat = extractPrimaryCategory($$) || {
        name: "General",
        slug: "general",
      };

      let sentimentLabel: string | null = null;
      let sentimentScore: number | null = null;

      try {
        const { label, score } = await this.analyzeArticle(content);
        sentimentLabel = label;
        sentimentScore = score;
      } catch (err) {
        console.warn(`⚠️ Sentiment API failed: ${err.message}`);
      }

      await this.newsService.create({
        title,
        url: fullUrl,
        author,
        sentimentLabel,
        sentimentScore,
        publishedDate,
        content,
        coverImageUrl,
        category: {
          connectOrCreate: {
            where: { slug: cat.slug },
            create: { name: cat.name, slug: cat.slug },
          },
        },
      });

      console.log(`📰 ${title}`);
    }
  }
}
