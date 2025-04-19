// app/api/email-scraper/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { crawlWebsiteForEmails } from '@/app/actions/email-crawler';

export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/email-scraper');
  try {
    const { url } = await request.json();
    console.log('Request body parsed', { url });

    if (!url || typeof url !== 'string' || !url.trim()) {
      console.log('Missing or invalid URL');
      return NextResponse.json(
        { error: 'Please provide a valid URL' },
        { status: 400 }
      );
    }

    console.log('Starting email crawl for:', url);
    const result = await crawlWebsiteForEmails(url);
    console.log('Crawl result:', { emailsFound: result.emails.length });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to crawl website';
    console.error('Error processing request:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
