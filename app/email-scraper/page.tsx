'use client';

import { useState, useEffect } from 'react';

export default function EmailCrawlerPage() {
  const [url, setUrl] = useState<string>('');
  const [emails, setEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  // Validate URL
  const validateUrl = (inputUrl: string): boolean => {
    try {
      new URL(inputUrl);
      return true;
    } catch {
      return false;
    }
  };

  // Handle Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setToast({ message: 'URL pasted from clipboard!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to paste from clipboard', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Clear input
  const handleClear = () => {
    setUrl('');
    setEmails([]);
    setError('');
    setToast({ message: 'Input cleared!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Crawl submission
  const handleCrawl = async () => {
    if (!url.trim()) {
      setToast({ message: 'Please enter a website URL', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!validateUrl(url)) {
      setToast({ message: 'Invalid URL format', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsLoading(true);
    setError('');
    setEmails([]);
    try {
      const response = await fetch('/api/email-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      console.log('Crawl response:', {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Crawl API error:', errorText);
        throw new Error(`Failed to crawl website: ${errorText}`);
      }

      const data = await response.json();
      console.log('Crawl result:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.emails.length === 0) {
        setError('No emails found');
        setToast({ message: 'No emails found on the website', type: 'error' });
      } else {
        setEmails(data.emails);
        setToast({
          message: 'Emails extracted successfully!',
          type: 'success',
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to crawl website';
      console.error('Crawl error:', errorMessage);
      setError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Copy emails to clipboard
  const handleCopyEmails = async () => {
    if (emails.length === 0) {
      setToast({ message: 'No emails to copy', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(emails.join('\n'));
      setToast({ message: 'Emails copied to clipboard!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to copy emails', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Download emails as CSV
  const handleDownloadCsv = () => {
    if (emails.length === 0) {
      setToast({ message: 'No emails to download', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const csvContent = `Emails\n${emails.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-results.csv';
    a.click();
    URL.revokeObjectURL(url);

    setToast({ message: 'Emails downloaded as CSV!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="container mx-auto min-h-screen flex flex-col">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Email Crawler</h1>
        </div>
        <p className="mt-2">Enter a website URL to extract email addresses.</p>
      </header>

      {/* Toast */}
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

      {/* URL Input */}
      <div className="card bg-base-100 shadow-xl p-6 mb-6">
        <label htmlFor="websiteUrl" className="block text-sm font-medium mb-2">
          Website URL
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            id="websiteUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input input-bordered flex-grow"
            placeholder="https://example.com"
          />
          <div className="flex gap-2">
            <button onClick={handlePaste} className="btn btn-outline btn-sm">
              Paste
            </button>
            <button onClick={handleClear} className="btn btn-outline btn-sm">
              Clear
            </button>
            <button
              onClick={handleCrawl}
              className="btn btn-primary btn-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Crawl'
              )}
            </button>
          </div>
        </div>
        {error && <p className="text-error mt-2">{error}</p>}
      </div>

      {/* Email Results */}
      <div className="card bg-base-100 shadow-xl p-6 flex-grow">
        <h2 className="card-title mb-4">Extracted Emails</h2>
        {emails.length > 0 ? (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleCopyEmails}
                className="btn btn-primary btn-sm"
              >
                Copy Emails
              </button>
              <button
                onClick={handleDownloadCsv}
                className="btn btn-secondary btn-sm"
              >
                Download CSV
              </button>
            </div>
            <ul className="list-disc pl-5">
              {emails.map((email, index) => (
                <li key={index} className="mb-1">
                  {email}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-center text-gray-500">
            {error || 'Enter a website URL to crawl for emails.'}
          </p>
        )}
      </div>
    </div>
  );
}
