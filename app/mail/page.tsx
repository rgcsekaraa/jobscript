'use client';

import { fetchWithApiKey } from '@/lib/api';
import { useState, useRef } from 'react';

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
  const generatedContentRef = useRef<HTMLTextAreaElement>(null);
  const jobDescriptionRef = useRef<HTMLTextAreaElement>(null);

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
        body: JSON.stringify({ jobDescription }),
      });

      console.log('Response received', {
        status: response.status,
        statusText: response.statusText,
        headers: [...response.headers.entries()],
      });

      // Log raw response text
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      // Check if response is OK
      if (!response.ok) {
        console.error('API error response:', responseText);
        throw new Error(
          `API error: ${response.status} - ${
            responseText || 'No response body'
          }`
        );
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response format:', responseText);
        throw new Error(
          `Invalid response format: ${responseText || 'Empty response'}`
        );
      }

      // Parse JSON
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
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Mail Content Generator</h1>
        <button className="btn btn-secondary" onClick={handleReset}>
          Reset All
        </button>
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
            {generatedContent.error ? (
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
