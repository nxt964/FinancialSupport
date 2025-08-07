import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from '../news/news.service';
import { load } from 'cheerio';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import { config } from 'dotenv';

config();

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  constructor(private newsService: NewsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async scheduledCrawl() {
    this.logger.log('⏰ Running daily scheduled crawl');
    await this.getNews(1);
  }

  async getNews(page: number): Promise<void> {
    const url = `${process.env.CRAWL_SITE_URL}/page/${page}/`;
    const response = await axios.get(url);
    const $ = load(response.data);

    const articleNodes = $(
      'section.list-feed > div.list-post-cards > div.list-card > article',
    );

    const newsItems: Prisma.NewsCreateInput[] = [];

    for (let i = 0; i < articleNodes.length; i++) {
      const article = articleNodes[i];
      const anchor = $(article).find('a').first();
      const title = anchor.find('h2').text().trim();
      const fullUrl = anchor.attr('href') || '';

      // Cover image
      const noscriptHtml = $(article).find('div.cover noscript').html() || '';

      // 2. Load the noscript HTML content into a new Cheerio instance
      const $img = load(noscriptHtml)('img');

      // 3. Extract the real src
      let coverImageUrl = $img.attr('src') || '';

      // 4. Resize the image by replacing dimensions
      coverImageUrl = coverImageUrl.replace(
        /-\d+x\d+(?=\.\w{3,4}$)/,
        '-768x403',
      );

      // Fetch article page
      if (!fullUrl) continue;

      const articlePage = await axios.get(fullUrl);
      const $$ = load(articlePage.data);

      // Author
      const author = $$('.author-info a').text().trim() || 'Unknown';

      // Date
      const rawDate = $$('.post-date')
        .text()
        .replace('at', '')
        .replace('UTC', '')
        .trim();
      let publishedDate = new Date();
      if (!isNaN(Date.parse(rawDate))) {
        publishedDate = new Date(rawDate);
      }

      // Content
      const contentNode = $$('.full-article').length
        ? $$('.full-article')
        : $$('.post-box article');

      const paragraphs = contentNode.find('p').toArray();
      const content = paragraphs.map((p) => $$(p).text().trim()).join('\n');

      // Skip sponsored posts
      if (content.toLowerCase().includes('this is a sponsored post')) continue;

      let sentimentLabel = null;
      let sentimentScore = null;

      try {
        const sentiment = await axios.post(`${process.env.SENTIMENT_API_URL}`, {
          text: content,
        });
        sentimentLabel = sentiment.data.label;
        sentimentScore = sentiment.data.score;
      } catch (err) {
        console.warn(`⚠️ Sentiment API failed: ${err.message}`);
      }

      const created = await this.newsService.create({
        title,
        url: fullUrl,
        author,
        sentimentLabel,
        sentimentScore,
        publishedDate,
        content,
        coverImageUrl,
      });

      newsItems.push(created);

      console.log(`📰 ${title}`);
    }
  }
}
