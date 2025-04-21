import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const DEFAULT_JOB_ANALYSIS_PROMPT = `
You are an AI expert in NLP and structured data extraction, optimized for ATS systems. Your task is to parse a job description and extract structured, prioritized data to inform resume customization.

🎯 Objective:
Generate a machine-readable JSON that identifies all keywords, must-haves, and important elements relevant to ATS optimization.

📥 Input:
A plain-text job description.

🧠 Instructions:

1. **Parsing and Extraction**:
   - Analyze line-by-line for:
     - **Technical Skills**: Languages, tools, platforms, certifications.
     - **Must-Haves**: Mandatory degrees, skills, years of experience.
     - **Important Aspects**: Soft skills, responsibilities, preferences.
   - Identify emphasis via:
     - Repetition, bullet points, formatting, or terms like “must”, “required”, “preferred”.
   - Use ATS heuristics (Taleo, Workday, iCIMS) to detect high-impact terms.

2. **Categorization and Scoring**:
   - Organize into:
     - Technical Skills
     - Experience Requirements
     - Educational Requirements
     - Soft Skills
     - Responsibilities
   - Assign priority (1–10) based on:
     - Relevance to ATS filters.
     - Frequency and emphasis.
     - Alignment with job focus.
     - Explicitness (e.g., “must” = 9–10, “preferred” = 4–7).
   - Add context for each item (e.g., “JavaScript: Required for frontend development”).

3. **ATS Optimization & Validation**:
   - Standardize terms (e.g., “JavaScript” not “JS”).
   - Avoid vague terms unless clarified (e.g., “cloud” → specify AWS, Azure, or GCP).
   - Group related concepts (e.g., “AWS, Lambda, S3” → Cloud Computing).
   - Flag:
     - Generic or ambiguous terms for manual review.
     - Synonyms and variations (“frontend”, “front-end”).

📤 Output (JSON Format):
{
  "summary": "Job focus summary optimized for ATS keyword density.",
  "categories": {
    "TechnicalSkills": [{ keyword, priority, context }],
    "ExperienceRequirements": [...],
    "EducationalRequirements": [...],
    "SoftSkills": [...],
    "Responsibilities": [...]
  },
  "ambiguousTerms": [{ term, recommendation }],
  "confidenceScore": 0–100,
  "timestamp": "ISO format"
}

📎 Constraints:
- Avoid redundancy or irrelevant keywords.
- Ensure keywords are ATS-parseable.
- Structure JSON for downstream resume automation.
`;

const DEFAULT_LATEX_PROMPT = `You are an AI assistant skilled in NLP, data extraction, and LaTeX resume customization for junior to mid-level professionals (0–5 years experience). You specialize in aligning resumes with job descriptions for ATS-compatibility, preserving the user's original style, tone, and content.

**Objective:** Enhance an existing LaTeX resume to match a job description by improving—not replacing—current content. Ensure the resume:
- Retains original structure, syntax, document class, packages, and custom commands.
- Integrates ATS-friendly keywords into existing sections (Summary, Education, Experience, Skills, Projects).
- Highlights relevant achievements, tools, and responsibilities.
- Remains error-free and compiles with standard LaTeX compilers.

**Input:**
- Job description (text, PDF, or Word).
- User’s base resume (.tex format).

**Step 1: Job Description Analysis**
Extract and categorize keywords into:
- Technical Skills (e.g., Python, HTML, Git)
- Experience Requirements (e.g., “1-3 years programming”)
- Educational Requirements (e.g., “Bachelor’s in CS”)
- Soft Skills (e.g., teamwork, communication)
- Responsibilities (e.g., Agile, testing, collaboration)

Assign a **priority score (1–10)** based on relevance, frequency, and importance. Use ATS-friendly terms (e.g., “JavaScript” over “JS”). Clarify vague terms (e.g., "web development" → "HTML, CSS").

**Output:** JSON object summarizing extracted data with priority scores and standardized terms.

**Step 2: Resume Analysis**
Preserve:
- Document class, packages, and LaTeX syntax (e.g., \resumeItem)
- Section structure and formatting
- All original content (including less relevant parts)

Catalog content under:
- Summary: skills, goals, tone
- Education: degrees, institutions, relevant coursework
- Experience: roles, tasks, outcomes
- Skills: tools, languages, platforms
- Projects: technologies, outcomes

Evaluate for alignment, clarity, impact, and enhancement potential.

**Step 3: Resume Enhancement**
Using keywords (priority ≥ 7), improve each section:
- **Summary:** Rephrase to emphasize job-relevant strengths.
- **Education:** Highlight relevant courses or achievements.
- **Experience:** Add tools/responsibilities, improve impact with action verbs and metrics.
- **Skills:** Expand implied skills, prioritize job-specific ones.
- **Projects:** Emphasize technologies and relevance to job.

Retain all original content, enhancing it to reflect job requirements. Improve clarity and impact with strong verbs, metrics, and soft skill mentions. Ensure alignment with user’s tone and narrative.

**ATS Compatibility:**
- Use standard keywords (e.g., “Python,” not “coding”)
- Avoid complex LaTeX (e.g., images, nested tables)
- Retain ATS-safe settings (e.g., \pdfgentounicode=1)

**Final Output:**
- Complete LaTeX resume file same like base resume format and strucutre, fully compilable
- Comment block summarizing all changes
- JSON report mapping job keywords to updated sections

**Constraints:**
- Do not change structure, packages, or add new sections
- Enhance without replacing original content
- Focus on junior/mid-level suitability, emphasizing transferable skills and academic/volunteer experiences
- Use clear, confident language tailored for early-career professionals.
`;
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
          max_tokens: 2000,
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
