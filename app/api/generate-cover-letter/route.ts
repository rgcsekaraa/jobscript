import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';

// Default prompt for cover letter generation
const DEFAULT_COVER_LETTER_PROMPT = `
  You are a professional cover letter writer tasked with generating a tailored cover letter. Use the provided job description and base cover letter to create a new cover letter that:
  - Matches the writing style, tone, structure, and length of the base cover letter exactly.
  - Replaces only the specified elements (e.g., company name, job title, skills, qualifications, and experiences) with details directly relevant to the job description.
  - Includes only skills, qualifications, and experiences explicitly mentioned in or clearly aligned with the job description.
  - Avoids adding new content, skills, or details not present in the job description or base cover letter.
  - Ensures all placeholders (e.g., [Company Name], [Job Title]) are replaced accurately with corresponding details from the job description.
`;

export async function GET() {
  // Return the default prompt
  return NextResponse.json({
    coverLetterPrompt: DEFAULT_COVER_LETTER_PROMPT,
  });
}

export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/generate-cover-letter');
  try {
    // Get API key from headers or environment
    const apiKey =
      request.headers.get('X-OpenAI-Api-Key') || process.env.KEY_4_OPENAI;
    if (!apiKey) {
      console.error('No OpenAI API key provided');
      return NextResponse.json(
        { error: 'No OpenAI API key provided. Please set it in Settings.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Parse form data
    console.log('Parsing form data');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const customCoverLetterPrompt = formData.get(
      'customCoverLetterPrompt'
    ) as string;

    console.log('Form data parsed', {
      hasFile: !!file,
      hasJobDescription: !!jobDescription,
      hasCustomPrompt: !!customCoverLetterPrompt,
    });

    if (!file || !jobDescription) {
      console.log('Missing file or job description');
      return NextResponse.json(
        { error: 'Missing file or job description' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['txt', 'docx'].includes(fileExtension)) {
      console.log('Invalid file type', { fileExtension });
      return NextResponse.json(
        { error: 'Please upload a .txt or .docx file' },
        { status: 400 }
      );
    }

    // Validate file size (client already checks, but double-check here)
    if (file.size > 2 * 1024 * 1024) {
      console.log('File size exceeds 2MB', { fileSize: file.size });
      return NextResponse.json(
        { error: 'File size exceeds 2MB' },
        { status: 400 }
      );
    }

    // Read file content
    console.log('Reading file content');
    let fileContent: string;
    try {
      if (fileExtension === 'txt') {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        fileContent = fileBuffer.toString('utf-8');
      } else {
        // .docx file
        const fileBuffer = await file.arrayBuffer();
        if (fileBuffer.byteLength === 0) {
          console.log('Empty .docx file buffer');
          return NextResponse.json(
            { error: 'Uploaded .docx file is empty' },
            { status: 400 }
          );
        }
        const result = await mammoth.extractRawText({
          buffer: Buffer.from(fileBuffer),
        });
        fileContent = result.value;
      }
      console.log('File content read', {
        fileContentLength: fileContent.length,
      });

      if (!fileContent.trim()) {
        console.log('Empty file content');
        return NextResponse.json(
          { error: 'Uploaded file is empty' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json(
        { error: 'Failed to read uploaded file: Invalid or corrupted file' },
        { status: 400 }
      );
    }

    // Generate cover letter with Open AI
    console.log('Generating cover letter with Open AI');
    try {
      const prompt = `
        ${customCoverLetterPrompt || DEFAULT_COVER_LETTER_PROMPT}
        
        Job Description:
        ${jobDescription}
        
        Base Cover Letter:
        ${fileContent}
        
        Output the tailored cover letter in plain text:
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional cover letter writer.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message.content || '';
      console.log('Cover letter generated', { contentLength: content.length });

      if (!content) {
        console.log('No content generated by Open AI');
        return NextResponse.json(
          { error: 'Failed to generate cover letter: No content returned' },
          { status: 500 }
        );
      }

      console.log('Returning generated cover letter');
      return NextResponse.json({ content });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to generate cover letter',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to process request',
      },
      { status: 500 }
    );
  }
}
