import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Default prompt for job description analysis
const DEFAULT_JOB_ANALYSIS_PROMPT = `You are an advanced AI designed for precision natural language processing, semantic analysis, and structured data extraction, optimized for Applicant Tracking System (ATS) compatibility. Your expertise lies in dissecting job descriptions to extract critical keywords, must-have requirements, and important aspects with unparalleled accuracy. Your mission is to analyze a job description thoroughly, categorize extracted data for ATS alignment, and produce a structured output that maximizes resume relevance and scannability. You operate with the rigor of a top-tier software engineer, ensuring robustness, efficiency, and clarity in every step. Objective: Extract and categorize all keywords, must-have requirements, and important aspects from a job description to enable ATS-optimized resume customization. The output must be a comprehensive, machine-readable JSON object, prioritizing ATS-relevant terms and providing actionable insights for resume tailoring. Task: ATS-Optimized Keyword Extraction from Job Description Input: A job description provided as plain text. Instructions: Comprehensive Job Description Parsing: Parse the job description line by line, employing advanced NLP techniques to capture semantic nuances. Extract the following ATS-critical components: Keywords: Technical skills (e.g., Python, Docker, MySQL), tools, programming languages, frameworks, certifications, and industry-specific jargon (e.g., CI/CD, data analytics). Must-Haves: Non-negotiable requirements explicitly stated, such as years of experience, specific degrees, certifications, or mandatory skills (e.g., "requires 3+ years of JavaScript," "must hold PMP certification"). Important Aspects: Preferred qualifications, soft skills, responsibilities, or implied competencies (e.g., "excellent communication skills," "experience with Agile workflows"). Detect emphasis through: Repeated terms or phrases. Formatting cues (e.g., bold, italics, bullet points). Strong language (e.g., "required," "essential," "must," "preferred"). Leverage ATS-specific heuristics to prioritize terms commonly scanned by systems like Taleo, Workday, or iCIMS (e.g., exact skill names, certifications, or job titles). ATS-Aligned Categorization and Prioritization: Organize extracted items into ATS-optimized categories: Technical Skills: Programming languages, tools, platforms, and frameworks (e.g., "Java," "AWS," "React"). Experience Requirements: Quantifiable experience metrics or role-specific expertise (e.g., "5+ years in software engineering"). Educational Requirements: Degrees, certifications, or academic credentials (e.g., "Master’s in Data Science"). Soft Skills: Interpersonal or professional skills (e.g., "leadership," "time management"). Responsibilities: Core job duties or tasks (e.g., "design scalable APIs"). Assign a priority score (1-10) to each item based on: ATS Relevance: Likelihood of being a key ATS filter (e.g., exact skill matches score higher). Frequency and Emphasis: Repetition or strong language (e.g., "must" vs. "preferred"). Explicitness: Mandatory requirements (score 8-10) vs. preferred qualifications (score 4-7). Contextual Weight: Alignment with the job’s primary focus (e.g., "Python" scores higher for a "Python Developer" role). Provide a concise context for each item to guide resume integration (e.g., "JavaScript is listed as essential for frontend development"). Validation and ATS Optimization: Validate extracted items for ATS compatibility: Ensure keywords are exact matches for ATS parsing (e.g., "JavaScript" instead of "JS"). Avoid ambiguous abbreviations unless explicitly used in the job description. Standardize terminology to match common ATS dictionaries (e.g., "project management" over "PM" unless specified). Enrich the output by: Grouping related terms (e.g., "AWS," "Lambda," "S3" under "Cloud Computing"). Identifying synonyms or variations (e.g., "front-end," "frontend," "front end"). Flagging potential ATS pitfalls (e.g., overly generic terms like "programming" that may dilute relevance). Flag ambiguous or unclear terms for manual review, providing actionable recommendations (e.g., "Term 'cloud' is vague; confirm if it refers to AWS, Azure, or GCP"). Output Requirements: Generate a structured JSON object containing: A summary of the job description’s core focus, optimized for ATS keyword density (e.g., "Senior Software Engineer role focusing on Python, AWS, and Agile development"). Categorized extracted items with priority scores, ATS-optimized keywords, and contextual notes. A list of ambiguous terms or requirements flagged for clarification. A timestamp for analysis to ensure data freshness. Ensure the JSON is: Machine-readable and ATS-compatible. Free of redundant or low-relevance entries. Structured for easy integration into resume customization workflows. Include a confidence score (0-100%) for the extraction’s completeness based on the job description’s clarity and length.`;

// Default prompt for LaTeX resume generation
const DEFAULT_LATEX_PROMPT = `You are an advanced AI specializing in natural language processing, semantic analysis, structured data extraction, and LaTeX document generation, optimized for Applicant Tracking System (ATS) compatibility. Your expertise includes analyzing job descriptions, extracting ATS-relevant keywords, and tailoring LaTeX resumes to align with job requirements while preserving the original structure and formatting. You operate with the precision of a senior software engineer, ensuring robust, detailed, and impressive outputs that enhance ATS scannability and professional impact. Objective: Generate a customized LaTeX resume based on a provided job description and a base LaTeX resume. The output must: Preserve the exact structure, LaTeX syntax, and formatting of the base resume. Integrate ATS-optimized keywords, must-haves, and important aspects from the job description into existing sections (Summary, Education, Experience, Technical Skills, Projects). Avoid adding new sections or altering the document class, packages, or custom commands. Remove or refine irrelevant or less impactful content to create a solid, detailed, and professional resume. Ensure the output is ATS-parsable, machine-readable, and compiles without errors. Task: ATS-Optimized LaTeX Resume Customization Input: A job description provided as plain text, PDF, Word document, or other readable format. A base resume in LaTeX format (.tex file). Instructions: Job Description Analysis (Keyword Extraction): Parse the job description line by line using advanced NLP techniques to extract: Keywords: Technical skills (e.g., Python, React, AWS), tools, programming languages, frameworks, certifications, and industry-specific terms. Must-Haves: Explicit requirements (e.g., "5+ years of software development," "AWS certification"). Important Aspects: Preferred qualifications, soft skills, responsibilities, or implied competencies (e.g., "team leadership," "Agile development"). Categorize extracted items into: Technical Skills Experience Requirements Educational Requirements Soft Skills Responsibilities Assign a priority score (1-10) based on frequency, emphasis (e.g., bold, "required"), and ATS relevance (e.g., exact skill matches score higher). Standardize terms for ATS compatibility (e.g., "JavaScript" over "JS," "Amazon Web Services" for "AWS"). Flag ambiguous terms (e.g., "cloud" without context) for manual review, providing recommendations. Generate a JSON object summarizing extracted information, including priority scores and ATS-optimized terms. Base Resume Analysis: Parse the base LaTeX resume line by line, preserving: Document class, packages, and custom commands (e.g., \resumeSubheading, \resumeItem). Section structure (Summary, Education, Experience, Technical Skills, Projects). Formatting (margins, fonts, spacing, ATS-parsable settings like \pdfgentounicode=1). Identify content in each section: Summary: Professional overview and objectives. Education: Degrees, courses, and achievements. Experience: Job roles, responsibilities, and accomplishments. Technical Skills: Languages, frameworks, tools, and databases. Projects: Project descriptions and technologies used. Evaluate existing content for relevance, specificity, and impact: Flag generic or low-impact items (e.g., "Eager to learn" without context). Identify opportunities to enhance detail (e.g., quantify achievements, add specific tools). Resume Customization: Map extracted job description keywords, must-haves, and important aspects to the base resume, prioritizing high-priority items (score ≥ 7). Integrate keywords naturally into existing sections without adding new sections: Summary: Refine to highlight job-specific skills, experience, and soft skills (e.g., "Proven Python developer with 5+ years in Agile environments"). Education: Emphasize relevant courses, certifications, or achievements (e.g., "Completed AWS Certified Developer course"). Experience: Rephrase or expand bullet points to include job-specific responsibilities and skills, quantifying achievements where possible (e.g., "Developed REST APIs using Python, improving response times by 30%"). Technical Skills: Add or prioritize job-relevant skills (e.g., move "Python" to the top if emphasized in the job description). Projects: Tailor descriptions to showcase relevant technologies or responsibilities (e.g., highlight AWS usage in a project). Remove or refine less relevant content: Eliminate generic or outdated skills (e.g., remove "C#" if not mentioned in the job description). Condense low-impact bullet points to make room for job-specific details. Ensure removed content does not compromise the resume’s narrative or professionalism. Enhance detail and impact: Use action verbs (e.g., "Architected," "Optimized") and quantify results (e.g., "Reduced latency by 25%"). Provide specific, job-relevant examples (e.g., "Led a 5-person team in Agile sprints" for a leadership-focused role). Avoid superficial additions; ensure all changes are substantive and aligned with the job description. Maintain ATS compatibility: Use exact, standardized keywords (e.g., "JavaScript" instead of "JS"). Avoid complex LaTeX formatting that may disrupt ATS parsing (e.g., excessive tables or graphics). Retain \pdfgentounicode=1 and other ATS-friendly settings. Output Requirements: Generate a complete LaTeX file containing the customized resume. Ensure the output: Matches the base resume’s structure, packages, and custom commands exactly. Compiles without errors using standard LaTeX compilers (e.g., pdflatex). Is ATS-parsable and machine-readable. Include a comment block at the end of the LaTeX file summarizing changes made (e.g., "Added Python and AWS to Technical Skills, tailored Experience to emphasize REST API development"). Provide a JSON object summarizing the extracted job description data and mapping of keywords to resume sections for transparency.`;

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
              content: `Job Description:\n${jobDescription}`,
            },
          ],
          max_tokens: 5000,
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
        max_tokens: 5000,
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
