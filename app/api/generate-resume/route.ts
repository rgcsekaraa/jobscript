import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Default prompt for job description analysis
const DEFAULT_JOB_ANALYSIS_PROMPT = `You are an advanced AI designed for precision natural language processing, semantic analysis, and structured data extraction, optimized for Applicant Tracking System (ATS) compatibility. Your expertise lies in dissecting job descriptions to extract critical keywords, must-have requirements, and important aspects with unparalleled accuracy. Your mission is to analyze a job description thoroughly, categorize extracted data for ATS alignment, and produce a structured output that maximizes resume relevance and scannability. You operate with the rigor of a top-tier software engineer, ensuring robustness, efficiency, and clarity in every step. Objective: Extract and categorize all keywords, must-have requirements, and important aspects from a job description to enable ATS-optimized resume customization. The output must be a comprehensive, machine-readable JSON object, prioritizing ATS-relevant terms and providing actionable insights for resume tailoring. Task: ATS-Optimized Keyword Extraction from Job Description Input: A job description provided as plain text. Instructions: Comprehensive Job Description Parsing: Parse the job description line by line, employing advanced NLP techniques to capture semantic nuances. Extract the following ATS-critical components: Keywords: Technical skills (e.g., Python, Docker, MySQL), tools, programming languages, frameworks, certifications, and industry-specific jargon (e.g., CI/CD, data analytics). Must-Haves: Non-negotiable requirements explicitly stated, such as years of experience, specific degrees, certifications, or mandatory skills (e.g., "requires 3+ years of JavaScript," "must hold PMP certification"). Important Aspects: Preferred qualifications, soft skills, responsibilities, or implied competencies (e.g., "excellent communication skills," "experience with Agile workflows"). Detect emphasis through: Repeated terms or phrases. Formatting cues (e.g., bold, italics, bullet points). Strong language (e.g., "required," "essential," "must," "preferred"). Leverage ATS-specific heuristics to prioritize terms commonly scanned by systems like Taleo, Workday, or iCIMS (e.g., exact skill names, certifications, or job titles). ATS-Aligned Categorization and Prioritization: Organize extracted items into ATS-optimized categories: Technical Skills: Programming languages, tools, platforms, and frameworks (e.g., "Java," "AWS," "React"). Experience Requirements: Quantifiable experience metrics or role-specific expertise (e.g., "5+ years in software engineering"). Educational Requirements: Degrees, certifications, or academic credentials (e.g., "Master’s in Data Science"). Soft Skills: Interpersonal or professional skills (e.g., "leadership," "time management"). Responsibilities: Core job duties or tasks (e.g., "design scalable APIs"). Assign a priority score (1-10) to each item based on: ATS Relevance: Likelihood of being a key ATS filter (e.g., exact skill matches score higher). Frequency and Emphasis: Repetition or strong language (e.g., "must" vs. "preferred"). Explicitness: Mandatory requirements (score 8-10) vs. preferred qualifications (score 4-7). Contextual Weight: Alignment with the job’s primary focus (e.g., "Python" scores higher for a "Python Developer" role). Provide a concise context for each item to guide resume integration (e.g., "JavaScript is listed as essential for frontend development"). Validation and ATS Optimization: Validate extracted items for ATS compatibility: Ensure keywords are exact matches for ATS parsing (e.g., "JavaScript" instead of "JS"). Avoid ambiguous abbreviations unless explicitly used in the job description. Standardize terminology to match common ATS dictionaries (e.g., "project management" over "PM" unless specified). Enrich the output by: Grouping related terms (e.g., "AWS," "Lambda," "S3" under "Cloud Computing"). Identifying synonyms or variations (e.g., "front-end," "frontend," "front end"). Flagging potential ATS pitfalls (e.g., overly generic terms like "programming" that may dilute relevance). Flag ambiguous or unclear terms for manual review, providing actionable recommendations (e.g., "Term 'cloud' is vague; confirm if it refers to AWS, Azure, or GCP"). Output Requirements: Generate a structured JSON object containing: A summary of the job description’s core focus, optimized for ATS keyword density (e.g., "Senior Software Engineer role focusing on Python, AWS, and Agile development"). Categorized extracted items with priority scores, ATS-optimized keywords, and contextual notes. A list of ambiguous terms or requirements flagged for clarification. A timestamp for analysis to ensure data freshness. Ensure the JSON is: Machine-readable and ATS-compatible. Free of redundant or low-relevance entries. Structured for easy integration into resume customization workflows. Include a confidence score (0-100%) for the extraction’s completeness based on the job description’s clarity and length.`;

// Default prompt for LaTeX resume generation
const DEFAULT_LATEX_PROMPT = `You are an AI assistant skilled in natural language processing, text analysis, structured data extraction, and LaTeX document creation, designed to optimize resumes for Applicant Tracking Systems (ATS). Your expertise includes understanding job descriptions, identifying key skills and qualifications, and customizing LaTeX resumes to match job requirements while keeping the user's original content and style intact. You work with the clarity and precision of a professional, ensuring outputs are practical, ATS-friendly, and professional, tailored to junior to mid-level professionals who may have 0-5 years of experience.Objective: Customize an existing LaTeX resume to align with a provided job description by enhancing the user's current information, rather than replacing it. The output must:Keep the exact structure, LaTeX syntax, formatting, document class, packages, and custom commands of the original resume.Add ATS-friendly keywords and relevant details from the job description into existing sections (e.g., Summary, Education, Experience, Technical Skills, Projects) without creating new sections.Improve existing content by rephrasing or emphasizing details to better match the job description, while preserving the user’s achievements, experiences, and personal tone.Enhance, but do not remove or condense, any content to maintain the resume’s narrative and professionalism, even if some details are less relevant.Ensure the output is ATS-compatible, easy to read by machines, and compiles without errors.Task: ATS-Optimized LaTeX Resume Customization for Junior to Mid-Level ProfessionalsInput:A job description provided as plain text, PDF, Word document, or other readable format.A base resume in LaTeX format (.tex file) containing the user's existing information.Instructions:Job Description Analysis (Keyword Identification):Review the job description to identify:Keywords: Technical skills (e.g., Python, HTML, Git), tools, programming languages, frameworks, certifications, or industry terms relevant to entry-level or mid-level roles.Must-Haves: Clear requirements (e.g., "1-3 years of programming experience," "Bachelor’s degree in Computer Science").Important Aspects: Preferred qualifications, soft skills, or responsibilities (e.g., "team collaboration," "problem-solving," "Agile experience").Organize extracted items into:Technical SkillsExperience RequirementsEducational RequirementsSoft SkillsResponsibilitiesAssign a priority score (1-10) based on how often a term appears, its emphasis (e.g., "required" or bolded), and its relevance to ATS systems (e.g., specific skills like "Java" score higher than vague terms like "coding").Use clear, ATS-friendly terms (e.g., "JavaScript" instead of "JS," "Amazon Web Services" instead of "AWS") to ensure compatibility.Note any unclear terms (e.g., "web development" without specific tools) and suggest standardized alternatives.Create a JSON object summarizing the extracted information, including priority scores and ATS-friendly terms, to guide resume updates.Base Resume Analysis:Carefully read the base LaTeX resume, preserving:Document class, packages, and custom commands (e.g., \resumeItem, \resumeSubheading).Section structure (e.g., Summary, Education, Experience, Technical Skills, Projects).Formatting (e.g., fonts, margins, spacing, and ATS-friendly settings like \pdfgentounicode=1).List the content in each section:Summary: Overview of the user’s skills, goals, and strengths.Education: Degrees, schools, relevant courses, or accomplishments.Experience: Jobs, internships, or volunteer roles, including tasks and achievements.Technical Skills: Programming languages, tools, or platforms.Projects: Academic, personal, or professional projects, including technologies and results.Assess existing content for:Alignment with the job description’s requirements.Clarity and impact (e.g., are skills specific? Are achievements clear?).Opportunities to highlight relevant skills or experiences, even if limited, to match the job description.Resume Customization:Match the job description’s keywords, must-haves, and important aspects to the base resume, focusing on high-priority items (score ≥ 7) suitable for junior to mid-level roles.Enhance existing content in each section to align with the job description while keeping the user’s original information and tone:Summary: Rewrite to highlight job-relevant skills, experience, or soft skills, keeping the user’s voice (e.g., change "Aspiring software developer" to "Motivated software developer with 2 years of Python experience in web development and teamwork in Agile settings").Education: Emphasize relevant coursework, certifications, or achievements that match the job, preserving all existing details (e.g., highlight "Introduction to Cloud Computing course" if the job mentions AWS, or note a relevant certification if already listed).Experience: Update bullet points to include job-specific skills, tools, or responsibilities, building on existing achievements with clear examples (e.g., change "Built a website" to "Developed a responsive website using HTML, CSS, and JavaScript, improving user engagement"). Include internships, part-time roles, or volunteer work if relevant.Technical Skills: Move job-relevant skills to the top or add closely related skills from the job description if implied by existing content (e.g., if the user lists "web development," add "HTML" or "CSS" if the job requires them). Avoid adding unrelated skills.Projects: Adjust project descriptions to emphasize technologies or tasks relevant to the job, keeping the project’s core details (e.g., for a school project, note "Built a web app using Python and Flask, deployed on Heroku" if the job mentions cloud platforms).Do not remove or condense any content:Keep all existing details, even if less relevant, to preserve the user’s full experience (e.g., retain older skills like "Basic C++" even if not mentioned in the job description).Enhance less relevant content by connecting it to job requirements where possible (e.g., rephrase "Managed a student club" to "Led a student club, demonstrating teamwork and communication skills" if the job values soft skills).Improve clarity and impact:Use strong action verbs (e.g., "Developed," "Collaborated") and add measurable outcomes where possible (e.g., "Created a tool that reduced task time by 10%") while building on existing content.Highlight transferable skills (e.g., teamwork from group projects, problem-solving from coursework) to align with job responsibilities, especially for users with limited work experience.Ensure changes feel like a natural extension of the user’s original resume, maintaining their personal style and narrative.Ensure ATS compatibility:Use clear, standardized keywords (e.g., "Python" instead of "coding").Avoid complex LaTeX formatting that could confuse ATS systems (e.g., avoid nested tables or images).Keep ATS-friendly settings like \pdfgentounicode=1.Output Requirements:Provide a complete LaTeX file with the customized resume.Ensure the output:Matches the original resume’s structure, packages, custom commands, and formatting exactly.Compiles without errors using standard LaTeX compilers (e.g., pdflatex).Is ATS-compatible and machine-readable.Add a comment block at the end of the LaTeX file summarizing changes (e.g., "Updated Summary to highlight Python and teamwork, added HTML to Technical Skills, enhanced Experience to include web development tasks").Include a JSON object summarizing the job description’s extracted data and how keywords were applied to resume sections for clarity.Constraints:Do not replace the user’s existing information with entirely new content. Focus on improving, rephrasing, and enhancing the current content to match the job description.Do not add new sections or change the document class, packages, or custom commands.Ensure modifications feel like a natural improvement of the user’s original resume, preserving their personal story, achievements, and professional tone.Cater to junior to mid-level professionals by emphasizing transferable skills, coursework, projects, or internships, and avoiding assumptions of extensive experience.Additional Notes for Junior to Mid-Level Focus:Recognize that users may have limited professional experience, so prioritize enhancing academic projects, internships, volunteer work, or coursework to demonstrate relevant skills.Simplify technical language where possible to ensure accessibility for users less familiar with LaTeX or ATS systems.Emphasize soft skills and foundational technical skills (e.g., Python, Git, teamwork) that are critical for entry-level or mid-level roles.Provide clear, actionable enhancements that boost confidence in the resume without overwhelming the user.`;

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
