'use server';

import axios from 'axios';
import * as cheerio from 'cheerio'; // Use ES module import
import { URL } from 'url';

// Regex pattern for emails
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;

// Default configuration
const MAX_PAGES = 100;
const CONCURRENCY = 5;

function isBinaryFile(url: string): boolean {
  return !!url.match(
    /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|tar|gz|mp4|mov|avi|wmv|mp3|wav|jpg|jpeg|png|gif|svg)$/i
  );
}

async function fetchWithRetry(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await axios.get(url, { timeout: 15000 });
      return res;
    } catch (err) {
      if (i === retries) {
        console.warn(
          `Failed to fetch ${url} after ${retries} retries: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`
        );
        throw new Error(
          `Failed to fetch ${url}: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`
        );
      }
      console.log(`Retrying ${url} (${i + 1}/${retries})`);
    }
  }
}

function extractLinks(base: string, html: string): string[] {
  try {
    if (typeof html !== 'string' || !html.trim()) {
      console.warn('Invalid HTML input for extractLinks:', typeof html);
      return [];
    }

    const $ = cheerio.load(html);
    const links = new Set<string>();

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      try {
        if (href) {
          const absoluteUrl = new URL(href, base).href;
          if (absoluteUrl.startsWith(base)) links.add(absoluteUrl);
        }
      } catch {}
    });

    console.log(`Extracted ${links.size} links from ${base}`);
    return [...links];
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error in extractLinks: ${err.message}`);
    } else {
      console.error('Error in extractLinks: Unknown error');
    }
    return [];
  }
}

export async function crawlWebsiteForEmails(startUrl: string) {
  try {
    // Validate URL
    const baseUrl = new URL(startUrl);
    const baseDomain = baseUrl.origin;

    const queue: string[] = [startUrl];
    const visited = new Set<string>();
    const foundEmails = new Set<string>();

    console.log(`Starting email crawl for ${startUrl}`);

    async function worker() {
      while (queue.length > 0 && visited.size < MAX_PAGES) {
        const url = queue.shift();
        if (!url || visited.has(url)) continue;

        visited.add(url);
        console.log(`Crawling: ${url} (${visited.size}/${MAX_PAGES})`);

        if (isBinaryFile(url)) {
          console.log(`Skipping binary file: ${url}`);
          continue;
        }

        try {
          const res = await fetchWithRetry(url);
          const contentType = res.headers['content-type'] || '';
          if (!contentType.includes('text/html')) {
            console.log(`Not HTML (${contentType}): ${url}`);
            continue;
          }

          const html = res.data;
          if (typeof html !== 'string') {
            console.warn(`Non-string response for ${url}: ${typeof html}`);
            continue;
          }

          // Extract emails
          (html.match(EMAIL_REGEX) || []).forEach((email: string) =>
            foundEmails.add(email)
          );

          // Extract links
          const links = extractLinks(baseDomain, html);
          links.forEach((link) => {
            if (!visited.has(link) && queue.length + visited.size < MAX_PAGES) {
              queue.push(link);
            }
          });
        } catch (err) {
          console.warn(
            `Failed to process ${url}: ${
              err instanceof Error ? err.message : 'Unknown error'
            }`
          );
        }
      }
    }

    // Run workers concurrently
    const workers = Array(CONCURRENCY)
      .fill(0)
      .map(() => worker());
    await Promise.all(workers);

    console.log('Crawl complete', { emailsFound: foundEmails.size });

    return { emails: [...foundEmails] };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown crawl error';
    console.error('Crawl error:', errorMessage);
    throw new Error(errorMessage);
  }
}
