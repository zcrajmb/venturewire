import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractReadingTime, slugify } from '../utils';

const parser = new Parser();

export interface Article {
  title: string;
  url: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  publishedAt: Date;
  author?: string;
  readingTime?: number;
}

/**
 * Scrape articles from RSS feed
 */
export async function scrapeRSSFeed(feedUrl: string): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const articles: Article[] = [];

    for (const item of feed.items.slice(0, 20)) {
      articles.push({
        title: item.title || 'Untitled',
        url: item.link || '',
        summary: item.contentSnippet || item.summary,
        content: item.content,
        imageUrl: extractImageFromContent(item.content || item.description || ''),
        publishedAt: new Date(item.pubDate || Date.now()),
        author: item.author,
        readingTime: item.content
          ? extractReadingTime(item.content)
          : item.contentSnippet
            ? extractReadingTime(item.contentSnippet)
            : 5,
      });
    }

    return articles;
  } catch (error) {
    console.error(`Error scraping RSS feed ${feedUrl}:`, error);
    return [];
  }
}

/**
 * Scrape a single article page
 */
export async function scrapeArticlePage(url: string): Promise<Article | null> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': process.env.USER_AGENT || 'VentureWire/1.0',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);

    // Extract common meta tags
    const title = $('meta[property="og:title"]').attr('content') ||
      $('title').text() || 'Untitled';
    const summary = $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') || '';
    const imageUrl = $('meta[property="og:image"]').attr('content');

    // Extract article content (try common selectors)
    let content = '';
    const contentSelectors = ['article', 'main', '.post-content', '.article-content', '.entry-content'];
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length) {
        content = element.text();
        break;
      }
    }

    if (!content) {
      content = $('body').text();
    }

    return {
      title,
      url,
      summary: summary || content.slice(0, 200),
      content,
      imageUrl,
      publishedAt: new Date(),
      readingTime: extractReadingTime(content),
    };
  } catch (error) {
    console.error(`Error scraping article ${url}:`, error);
    return null;
  }
}

/**
 * Extract image from HTML content
 */
export function extractImageFromContent(htmlContent: string): string | undefined {
  const $ = cheerio.load(htmlContent);
  const img = $('img').first().attr('src');
  return img ? (img.startsWith('http') ? img : undefined) : undefined;
}

/**
 * List of VC firms with their scraping details
 */
export const VC_FIRMS = [
  {
    name: 'Andreessen Horowitz',
    slug: 'a16z',
    website: 'https://a16z.com',
    blogUrl: 'https://a16z.com/articles',
    rssUrl: 'https://a16z.com/feed/',
    logoUrl: 'https://a16z.com/wp-content/themes/twentytwentythree-child/img/header-a16z-logo.svg',
  },
  {
    name: 'Sequoia Capital',
    slug: 'sequoia',
    website: 'https://www.sequoiacap.com',
    blogUrl: 'https://www.sequoiacap.com/article',
    rssUrl: 'https://www.sequoiacap.com/feed/',
    logoUrl: 'https://www.sequoiacap.com/static/assets/logos/sequoia-logo.svg',
  },
  {
    name: 'Benchmark',
    slug: 'benchmark',
    website: 'https://www.benchmark.com',
    blogUrl: 'https://www.benchmark.com/blog',
    rssUrl: 'https://www.benchmark.com/blog/feed.xml',
    logoUrl: 'https://www.benchmark.com/images/logo.svg',
  },
  {
    name: 'Accel',
    slug: 'accel',
    website: 'https://www.accel.com',
    blogUrl: 'https://www.accel.com/stories',
    rssUrl: 'https://www.accel.com/feed.xml',
    logoUrl: 'https://www.accel.com/assets/logos/accel-logo.svg',
  },
  {
    name: 'Bessemer Venture Partners',
    slug: 'bessemer',
    website: 'https://www.bvp.com',
    blogUrl: 'https://www.bvp.com/insights',
    rssUrl: 'https://www.bvp.com/feed',
    logoUrl: 'https://www.bvp.com/images/bvp-logo.svg',
  },
];

/**
 * Scrape all articles from all configured VC firms
 */
export async function scrapeAllArticles() {
  const allArticles: { firm: string; articles: Article[] }[] = [];

  for (const firm of VC_FIRMS) {
    if (firm.rssUrl) {
      try {
        const articles = await scrapeRSSFeed(firm.rssUrl);
        allArticles.push({
          firm: firm.name,
          articles,
        });
      } catch (error) {
        console.error(`Failed to scrape ${firm.name}:`, error);
      }
    }
  }

  return allArticles;
}
