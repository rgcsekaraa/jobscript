import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Default prompt for job description analysis
const DEFAULT_JOB_ANALYSIS_PROMPT = `You are an expert job description analyzer. Extract key skills, must-haves, and other relevant requirements from the provided job description. Provide a concise summary in plain text, listing the key skills, qualifications, and responsibilities.`;

// Default prompt for LaTeX resume generation
const DEFAULT_LATEX_PROMPT = `You are a professional LaTeX resume writer. Generate a tailored LaTeX resume based on the provided base LaTeX resume and the extracted job details (key skills, must-haves, and requirements). Output valid LaTeX code same like base resume latex code that can be compiled into a professional resume, ensuring it incorporates the relevant skills and requirements while preserving the structure of the base resume.`;

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  // Return default prompts
  return NextResponse.json({
    jobAnalysisPrompt: DEFAULT_JOB_ANALYSIS_PROMPT,
    latexPrompt: DEFAULT_LATEX_PROMPT,
  });
}

export async function POST(request: NextRequest) {
  console.log('Received POST request');
  try {
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

    console.log('Parsing form data');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const customJobAnalysisPrompt = formData.get(
      'customJobAnalysisPrompt'
    ) as string;
    const customLatexPrompt = formData.get('customLatexPrompt') as string;

    console.log('Form data parsed', {
      hasFile: !!file,
      hasJobDescription: !!jobDescription,
    });

    if (!file || !jobDescription) {
      console.log('Missing file or job description');
      return NextResponse.json(
        { error: 'Missing file or job description' },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const resumeText = fileBuffer.toString('utf-8');
    console.log('File read successfully', {
      resumeTextLength: resumeText.length,
    });

    // Step 1: Extract key skills and must-haves from job description
    let jobDetails = '';
    let retryCount = 0;
    let success = false;

    console.log('Starting job description analysis');
    while (retryCount < MAX_RETRIES && !success) {
      console.log(
        `Attempt ${
          retryCount + 1
        } of ${MAX_RETRIES} for job description analysis`
      );
      try {
        console.log('Calling OpenAI API for job description analysis');
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: customJobAnalysisPrompt || DEFAULT_JOB_ANALYSIS_PROMPT,
            },
            {
              role: 'user',
              content: `Job Description:\n${jobDescription}\n\nExtract key skills, must-haves, and relevant details:`,
            },
          ],
          max_tokens: 500,
        });

        jobDetails = completion.choices[0]?.message.content || '';
        console.log('Job details extracted', {
          jobDetailsLength: jobDetails.length,
        });

        if (!jobDetails) {
          throw new Error('No job details extracted');
        }
        success = true;
        console.log('Job description analysis successful');
      } catch (error) {
        retryCount++;
        console.error(
          `Error during job description analysis (attempt ${retryCount}):`,
          error
        );
        if (retryCount === MAX_RETRIES) {
          console.error(
            'Max retries reached for job description analysis:',
            error
          );
          return NextResponse.json(
            {
              error:
                'Failed to analyze job description after multiple attempts',
            },
            { status: 500 }
          );
        }
        console.log(`Retrying after ${RETRY_DELAY_MS}ms delay`);
        await delay(RETRY_DELAY_MS);
      }
    }

    // Step 2: Generate LaTeX resume code
    console.log('Starting LaTeX resume generation');
    try {
      console.log('Calling OpenAI API for LaTeX resume generation');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: customLatexPrompt || DEFAULT_LATEX_PROMPT,
          },
          {
            role: 'user',
            content: `Base LaTeX Resume:\n${resumeText}\n\nExtracted Job Details:\n${jobDetails}\n\nGenerate tailored LaTeX resume code:`,
          },
        ],
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message.content || '';
      console.log('LaTeX resume generated', { contentLength: content.length });

      if (!content) {
        throw new Error('No LaTeX code generated');
      }

      console.log('Returning generated LaTeX resume');
      return NextResponse.json({ content });
    } catch (error) {
      console.error('Error generating LaTeX resume:', error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to generate LaTeX resume',
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
