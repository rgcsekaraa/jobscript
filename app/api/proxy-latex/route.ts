// app/api/proxy-latex/route.ts (using TeXLive.net)
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { text, command } = await request.json();

  if (!text || !command) {
    return NextResponse.json(
      { error: 'Missing text or command' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch('https://texlive.net/cgi-bin/latex.cgi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        content: text,
        engine: command, // e.g., pdflatex
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('LaTeX compilation error:', errorData);
      return NextResponse.json(
        { error: errorData || 'Failed to compile LaTeX' },
        { status: response.status }
      );
    }

    const pdfBuffer = await response.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    const pdfUrl = `data:application/pdf;base64,${pdfBase64}`;

    return NextResponse.json({ pdfUrl });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Server error';
    console.error('Server error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
