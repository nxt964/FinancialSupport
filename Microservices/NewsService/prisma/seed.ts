// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { load } from 'cheerio';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function crawlPage(page: number) {
  const url = `${process.env.CRAWL_SITE_URL}/page/${page}/`;
  const response = await axios.get(url);
  const $ = load(response.data);

  const articleNodes = $(
    'section.list-feed > div.list-post-cards > div.list-card > article',
  );

  for (let i = 0; i < articleNodes.length; i++) {
    const article = articleNodes[i];
    const anchor = $(article).find('a').first();
    const title = anchor.find('h2').text().trim();
    const fullUrl = anchor.attr('href') || '';
    if (!title || !fullUrl) continue;

    const noscriptHtml = $(article).find('div.cover noscript').html() || '';
    const $img = load(noscriptHtml)('img');
    let coverImageUrl = $img.attr('src') || '';
    coverImageUrl = coverImageUrl.replace(/-\d+x\d+(?=\.\w{3,4}$)/, '-768x403');

    const articlePage = await axios.get(fullUrl);
    const $$ = load(articlePage.data);

    const author = $$('.author-info a').text().trim() || 'Unknown';

    const rawDate = $$('.post-date')
      .text()
      .replace('at', '')
      .replace('UTC', '')
      .trim();
    let publishedDate = new Date();
    if (!isNaN(Date.parse(rawDate))) {
      publishedDate = new Date(rawDate);
    }

    const contentNode = $$('.full-article').length
      ? $$('.full-article')
      : $$('.post-box article');
    const paragraphs = contentNode.find('p').toArray();
    const content = paragraphs.map((p) => $$(p).text().trim()).join('\n');

    if (content.toLowerCase().includes('this is a sponsored post')) continue;

    let sentimentLabel = null;
    let sentimentScore = null;
    try {
      const sentiment = await axios.post(process.env.SENTIMENT_API_URL!, {
        text: content,
      });
      sentimentLabel = sentiment.data.label;
      sentimentScore = sentiment.data.score;
    } catch (err) {
      console.warn(`⚠️ Sentiment API failed: ${err.message}`);
    }

    await prisma.news.create({
      data: {
        title,
        url: fullUrl,
        content,
        author,
        coverImageUrl,
        sentimentLabel,
        sentimentScore,
        publishedDate,
        crawledAt: new Date(),
      },
    });

    console.log(`📰 Seeded: ${title}`);
  }
}

async function main() {
  for (let page = 1; page <= 10; page++) {
    console.log(`🔎 Crawling page ${page}...`);
    await crawlPage(page);
  }
  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
