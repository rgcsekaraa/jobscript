'use client';

import { fetchWithApiKey } from '@/lib/api';
import { useState, useRef, useEffect } from 'react';

interface GeneratedContent {
  content: string;
  error?: string;
}

export default function MailPage() {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    content: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [emailPrompt, setEmailPrompt] = useState<string>('');
  const generatedContentRef = useRef<HTMLTextAreaElement>(null);
  const jobDescriptionRef = useRef<HTMLTextAreaElement>(null);

  // Load prompt from local storage or fetch default
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        // Check local storage first
        const storedPrompt = localStorage.getItem('customEmailPrompt');
        if (storedPrompt) {
          setEmailPrompt(storedPrompt);
          return;
        }

        // Fetch default prompt from server
        const response = await fetch('/api/generate-mail', {
          method: 'GET',
        });
        const data = await response.json();
        setEmailPrompt(data.emailPrompt);
        localStorage.setItem('customEmailPrompt', data.emailPrompt);
      } catch (error) {
        setToast({
          message: 'Failed to fetch default prompt',
          type: 'error',
        });
        setTimeout(() => setToast(null), 3000);
      }
    };

    fetchPrompt();
  }, []);

  // Handle saving prompt
  const handleSavePrompt = () => {
    localStorage.setItem('customEmailPrompt', emailPrompt);
    setIsPromptModalOpen(false);
    setToast({
      message: 'Prompt saved successfully!',
      type: 'success',
    });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset all form values
  const handleReset = () => {
    setJobDescription('');
    setGeneratedContent({ content: '' });
    setIsLoading(false);
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

  // Clear job description
  const handleClearJobDescription = () => {
    setJobDescription('');
    setToast({
      message: 'Job description cleared successfully!',
      type: 'success',
    });
    setTimeout(() => setToast(null), 3000);
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
          message: 'Generated email copied to clipboard!',
          type: 'success',
        });
        setTimeout(() => setToast(null), 3000);
      } catch (error) {
        setToast({
          message: 'Failed to copy generated email',
          type: 'error',
        });
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  // Clear generated content
  const handleClearGeneratedContent = () => {
    setGeneratedContent({ content: '' });
    setToast({
      message: 'Generated email cleared successfully!',
      type: 'success',
    });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle generate email
  const handleGenerate = async () => {
    if (!jobDescription) {
      setToast({
        message: 'Please enter a job description',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending request to /api/generate-mail', {
        jobDescriptionLength: jobDescription.length,
      });

      const response = await fetchWithApiKey('/api/generate-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          customEmailPrompt: emailPrompt,
        }),
      });

      console.log('Response received', {
        status: response.status,
        statusText: response.statusText,
        headers: [...response.headers.entries()],
      });

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!response.ok) {
        console.error('API error response:', responseText);
        throw new Error(
          `API error: ${response.status} - ${
            responseText || 'No response body'
          }`
        );
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response format:', responseText);
        throw new Error(
          `Invalid response format: ${responseText || 'Empty response'}`
        );
      }

      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedContent({ content: data.content || '' });
      setToast({
        message: 'Email generated successfully!',
        type: 'success',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      console.error('Error in handleGenerate:', errorMessage);
      setGeneratedContent({ content: '', error: errorMessage });
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className=" px-4 py-8 min-h-screen mx-auto">
      <div className="flex justify-between items-center mb-20">
        <h1 className="text-3xl font-bold">Mail Content Generator</h1>
        <div className="flex gap-2">
          <button
            className="btn btn-accent"
            onClick={() => setIsPromptModalOpen(true)}
          >
            Edit Prompt
          </button>
          <button className="btn btn-neutral" onClick={handleReset}>
            Reset All
          </button>
        </div>
      </div>

      {/* DaisyUI Toast */}
      {toast && (
        <div className="toast toast-top toast-center">
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
          <h3 className="font-bold text-lg">Edit Email Prompt</h3>
          <div className="mt-4">
            <label className="block font-semibold mb-2">
              Email Generation Prompt
            </label>
            <textarea
              className="textarea w-full h-32"
              value={emailPrompt}
              onChange={(e) => setEmailPrompt(e.target.value)}
              placeholder="Enter prompt for email generation..."
            />
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleSavePrompt}>
              Save
            </button>
            <button className="btn" onClick={() => setIsPromptModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side - Job Description */}
        <div>
          <div className="flex justify-between mb-2">
            <h2 className="text-xl font-semibold">Description</h2>
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
              <button
                className="btn btn-outline btn-sm"
                onClick={handleClearJobDescription}
              >
                Clear
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
            <h2 className="text-xl font-semibold">Generated Email Content</h2>
            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={handleCopyGeneratedContent}
              >
                Copy
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleClearGeneratedContent}
              >
                Clear
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
                placeholder="Generated email content will appear here..."
                ref={generatedContentRef}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Email'}
        </button>
      </div>
    </div>
  );
}
