'use client';

import { fetchWithApiKey } from '@/lib/api';
import { useState, useRef, useEffect } from 'react';

interface GeneratedContent {
  content: string;
  error?: string;
}

interface Prompts {
  jobAnalysisPrompt: string;
  latexPrompt: string;
}

export default function ResumePage() {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    content: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isLatexConverted, setIsLatexConverted] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [prompts, setPrompts] = useState<Prompts>({
    jobAnalysisPrompt: '',
    latexPrompt: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generatedContentRef = useRef<HTMLTextAreaElement>(null);
  const jobDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const overleafFormRef = useRef<HTMLFormElement>(null);

  const fileTypes = ['.txt', '.tex'];
  const maxSizeMB = 2;

  // Load prompts from local storage or fetch defaults
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        // Check local storage first
        const storedPrompts = localStorage.getItem('customPrompts');
        if (storedPrompts) {
          setPrompts(JSON.parse(storedPrompts));
          return;
        }

        // Fetch default prompts from server
        const response = await fetch('/api/generate-resume', {
          method: 'GET',
        });
        const data = await response.json();
        setPrompts(data);
        localStorage.setItem('customPrompts', JSON.stringify(data));
      } catch (error) {
        setToast({
          message: 'Failed to fetch default prompts',
          type: 'error',
        });
        setTimeout(() => setToast(null), 3000);
      }
    };

    fetchPrompts();
  }, []);

  // Handle saving prompts
  const handleSavePrompts = () => {
    localStorage.setItem('customPrompts', JSON.stringify(prompts));
    setIsPromptModalOpen(false);
    setToast({
      message: 'Prompts saved successfully!',
      type: 'success',
    });
    setTimeout(() => setToast(null), 3000);
  };

  // Validate LaTeX
  const validateLatex = (content: string): boolean => {
    const hasDocClass = content.includes('\\documentclass');
    const hasBeginDoc = content.includes('\\begin{document}');
    const hasEndDoc = content.includes('\\end{document}');
    return hasDocClass && hasBeginDoc && hasEndDoc;
  };

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !fileTypes.includes(`.${fileExtension}`)) {
      setToast({
        message: 'Please upload a LaTeX/text file',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setToast({ message: 'File size exceeds 2MB', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setFile(selectedFile);
    setToast({
      message: 'Base Resume uploaded successfully!',
      type: 'success',
    });
    setTimeout(() => setToast(null), 3000);
  };

  // Clear file input
  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setJobDescription('');
    setGeneratedContent({ content: '' });
    setIsLoading(false);
    setIsLatexConverted(false);
    setPdfUrl('');
    setFile(null);
    setToast({
      message: 'File cleared successfully!',
      type: 'success',
    });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset all form values
  const handleReset = () => {
    setJobDescription('');
    setGeneratedContent({ content: '' });
    setFile(null);
    setIsLoading(false);
    setIsLatexConverted(false);
    setPdfUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setToast({
      message: 'Form reset successfully!',
      type: 'success',
    });
    setTimeout(() => setToast(null), 3000);
  };

  // Copy job description
  const handleCopyJobDescription = async () => {
    if (jobDescriptionRef.current) {
      try {
        const text = jobDescriptionRef.current.value;
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
        } else {
          jobDescriptionRef.current.select();
          document.execCommand('copy');
        }
        setToast({
          message: 'Job description copied to clipboard!',
          type: 'success',
        });
        setTimeout(() => setToast(null), 3000);
      } catch (error) {
        setToast({
          message: 'Failed to copy job description',
          type: 'error',
        });
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  // Paste job description
  const handlePasteJobDescription = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        setJobDescription(text);
        setToast({
          message: 'Job description pasted successfully!',
          type: 'success',
        });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({
          message: 'Clipboard API not supported in this browser',
          type: 'error',
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      setToast({
        message: 'Failed to paste job description',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Copy generated content
  const handleCopyGeneratedContent = async () => {
    if (generatedContentRef.current) {
      try {
        const text = generatedContentRef.current.value;
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
        } else {
          generatedContentRef.current.select();
          document.execCommand('copy');
        }
        setToast({
          message: 'Generated content copied to clipboard!',
          type: 'success',
        });
        setTimeout(() => setToast(null), 3000);
      } catch (error) {
        setToast({
          message: 'Failed to copy generated content',
          type: 'error',
        });
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  // Paste generated content
  const handlePasteGeneratedContent = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        setGeneratedContent({ content: text });
        setToast({
          message: 'Content pasted successfully!',
          type: 'success',
        });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({
          message: 'Clipboard API not supported in this browser',
          type: 'error',
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      setToast({
        message: 'Failed to paste content',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Handle generate resume
  const handleGenerate = async () => {
    if (!jobDescription) {
      setToast({ message: 'Please enter a job description', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!file) {
      setToast({ message: 'Please upload a resume', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobDescription', jobDescription);
      formData.append('customJobAnalysisPrompt', prompts.jobAnalysisPrompt);
      formData.append('customLatexPrompt', prompts.latexPrompt);

      const response = await fetchWithApiKey('/api/generate-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate resume');
      }

      setGeneratedContent({ content: data.content });
      setToast({
        message: 'Resume content generated successfully!',
        type: 'success',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      setGeneratedContent({ content: '', error: errorMessage });
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Handle LaTeX to PDF conversion
  const handleConvertToLatex = async () => {
    if (!generatedContent.content) {
      setToast({
        message: 'No generated content to convert',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!validateLatex(generatedContent.content)) {
      setToast({
        message:
          'Invalid LaTeX content: Missing \\documentclass, \\begin{document}, or \\end{document}',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/proxy-latex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: generatedContent.content,
          command: 'pdflatex',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to compile LaTeX to PDF');
      }

      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
        setIsLatexConverted(true);
        setToast({
          message: 'LaTeX converted to PDF successfully!',
          type: 'success',
        });
      } else {
        throw new Error('No PDF URL returned from proxy');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Handle Open in Overleaf
  const handleOpenInOverleaf = () => {
    if (!generatedContent.content) {
      setToast({
        message: 'No generated content to open in Overleaf',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (overleafFormRef.current) {
      overleafFormRef.current.submit();
      setToast({
        message: 'Opening in Overleaf...',
        type: 'success',
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Handle download PDF
  const handleDownload = () => {
    if (!isLatexConverted || !pdfUrl) {
      setToast({
        message: 'Please convert LaTeX to PDF first',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({
      message: 'PDF downloaded successfully!',
      type: 'success',
    });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Resume Generator</h1>
        <div className="flex gap-2">
          <button
            className="btn btn-accent"
            onClick={() => setIsPromptModalOpen(true)}
          >
            Edit Prompts
          </button>
          <button className="btn btn-neutral" onClick={handleReset}>
            Reset All
          </button>
        </div>
      </div>

      <div className="justify-end mb-2">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Upload your base LaTeX resume
          </legend>
          <div className="flex items-center gap-2">
            <input
              type="file"
              className="file-input file-input-bordered"
              accept=".txt, .tex"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <button
              className="btn btn-outline btn-sm"
              onClick={handleClearFile}
              disabled={!file}
            >
              Clear
            </button>
          </div>
        </fieldset>
      </div>

      {/* DaisyUI Toast */}
      {toast && (
        <div className="toast toast-top toast-end">
          <div role="alert" className={`alert alert-${toast.type} alert-soft`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              {toast.type === 'success' ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Prompt Editing Modal */}
      <dialog id="prompt_modal" className="modal" open={isPromptModalOpen}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit Prompts</h3>
          <div className="mt-4">
            <label className="block font-semibold mb-2">
              Job Description Analysis Prompt
            </label>
            <textarea
              className="textarea w-full h-32"
              value={prompts.jobAnalysisPrompt}
              onChange={(e) =>
                setPrompts({ ...prompts, jobAnalysisPrompt: e.target.value })
              }
              placeholder="Enter prompt for job description analysis..."
            />
          </div>
          <div className="mt-4">
            <label className="block font-semibold mb-2">
              LaTeX Resume Generation Prompt
            </label>
            <textarea
              className="textarea w-full h-32"
              value={prompts.latexPrompt}
              onChange={(e) =>
                setPrompts({ ...prompts, latexPrompt: e.target.value })
              }
              placeholder="Enter prompt for LaTeX resume generation..."
            />
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleSavePrompts}>
              Save
            </button>
            <button className="btn" onClick={() => setIsPromptModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>

      {/* Overleaf Form */}
      <form
        id="overleaf_form"
        action="https://www.overleaf.com/docs"
        method="post"
        target="_blank"
        ref={overleafFormRef}
      >
        <input type="hidden" name="snip" value={generatedContent.content} />
        <input type="hidden" name="engine" value="pdflatex" />
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side - Job Description */}
        <div>
          <div className="flex justify-between mb-2">
            <h2 className="text-xl font-semibold">Job Description</h2>
            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={handleCopyJobDescription}
              >
                Copy
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={handlePasteJobDescription}
              >
                Paste
              </button>
            </div>
          </div>
          <textarea
            className="textarea w-full h-96"
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            ref={jobDescriptionRef}
          />
        </div>

        {/* Right Side - Generated Content */}
        <div>
          <div className="flex justify-between mb-2">
            <h2 className="text-xl font-semibold">Generated LaTeX Code</h2>
            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={handleCopyGeneratedContent}
              >
                Copy
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={handlePasteGeneratedContent}
              >
                Paste
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleOpenInOverleaf}
                disabled={!generatedContent.content}
              >
                Open in Overleaf
              </button>
            </div>
          </div>
          <div className="border rounded p-4 h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex w-full flex-col gap-2">
                <div className="skeleton h-4 w-1/2"></div>
                <div className="skeleton h-4 w-5/6"></div>
                <div className="skeleton h-4 w-4/6"></div>
                <div className="skeleton h-4 w-3/6"></div>
                <div className="skeleton h-4 w-5/6"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="flex w-full flex-col gap-2">
                  <div className="skeleton h-4 w-1/4"></div>
                  <div className="skeleton h-4 w-5/6"></div>
                  <div className="skeleton h-4 w-4/6"></div>
                  <div className="skeleton h-4 w-3/6"></div>
                  <div className="skeleton h-4 w-5/6"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-1/4"></div>
                  <div className="skeleton h-4 w-5/6"></div>
                  <div className="skeleton h-4 w-4/6"></div>
                </div>
              </div>
            ) : generatedContent.error ? (
              <div role="alert" className="alert alert-error alert-soft">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{generatedContent.error}</span>
              </div>
            ) : (
              <textarea
                className="textarea w-full h-full"
                value={generatedContent.content}
                onChange={(e) =>
                  setGeneratedContent({ content: e.target.value })
                }
                placeholder="Generated content will appear here..."
                ref={generatedContentRef}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center flex justify-center gap-4">
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Resume'}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleConvertToLatex}
          disabled={isLoading || !generatedContent.content}
        >
          {isLoading ? 'Converting...' : 'Convert LaTeX to PDF'}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleDownload}
          disabled={isLoading || !isLatexConverted}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
