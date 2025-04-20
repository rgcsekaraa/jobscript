'use client';

import { useState } from 'react';

export default function HyphenRemoverPage() {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  // Handle Paste from clipboard
  const handlePasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      setToast({ message: 'Text pasted from clipboard!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to paste from clipboard', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Clear input
  const handleClearInput = () => {
    setInputText('');
    setToast({ message: 'Input cleared!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Reset All
  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setToast({ message: 'All fields reset!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Copy input
  const handleCopyInput = async () => {
    if (!inputText.trim()) {
      setToast({ message: 'No input text to copy', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(inputText);
      setToast({ message: 'Input text copied to clipboard!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to copy input text', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Sanitize with 3-second delay
  const handleSanitize = () => {
    if (!inputText.trim()) {
      setToast({ message: 'Please enter text to sanitize', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        // Replace em-dash (U+2014) with a single space
        const sanitized = inputText.replace(/\u2014/g, ' ');
        setOutputText(sanitized);
        setToast({ message: 'Text sanitized successfully!', type: 'success' });
      } catch (err) {
        console.error('Sanitize error:', err);
        setToast({ message: 'Failed to sanitize text', type: 'error' });
      } finally {
        setIsLoading(false);
        setTimeout(() => setToast(null), 3000);
      }
    }, 3000); // 3-second delay
  };

  // Handle Copy output
  const handleCopyOutput = async () => {
    if (!outputText.trim()) {
      setToast({ message: 'No output text to copy', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      setToast({
        message: 'Output text copied to clipboard!',
        type: 'success',
      });
    } catch {
      setToast({ message: 'Failed to copy output text', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Clear output
  const handleClearOutput = () => {
    setOutputText('');
    setToast({ message: 'Output cleared!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="mx-auto px-4 py-8 min-h-screen flex flex-col">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Hyphen Remover</h1>
          <div className="flex gap-2">
            <button className="btn btn-neutral" onClick={handleReset}>
              Reset All
            </button>
          </div>
        </div>
        <p className="mt-2">
          Enter text to remove em-dashes (—) and replace them with spaces.
        </p>
      </header>

      {/* Toast */}
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

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 flex-grow">
        {/* Left: Input Text */}
        <div className="lg:w-1/2 card bg-base-100 shadow-xl p-6">
          <h2 className="card-title mb-4">Input Text</h2>
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={handleCopyInput}
              className="btn btn-primary btn-sm"
            >
              Copy
            </button>
            <button
              onClick={handlePasteInput}
              className="btn btn-outline btn-sm"
            >
              Paste
            </button>
            <button
              onClick={handleClearInput}
              className="btn btn-outline btn-sm"
            >
              Clear
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="textarea textarea-bordered w-full h-64"
            placeholder="Enter text with em-dashes (e.g., I’m seeking opportunities—frontend or backend.)"
          />
        </div>

        {/* Right: Output Text */}
        <div className="lg:w-1/2 card bg-base-100 shadow-xl p-6">
          <h2 className="card-title mb-4">Sanitized Output</h2>
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={handleCopyOutput}
              className="btn btn-primary btn-sm"
              disabled={!outputText.trim()}
            >
              Copy
            </button>
            <button
              onClick={handleClearOutput}
              className="btn btn-outline btn-sm"
              disabled={!outputText.trim()}
            >
              Clear
            </button>
          </div>
          {isLoading ? (
            <div className="flex w-full flex-col gap-2">
              <div className="skeleton h-4 w-1/2"></div>
              <div className="skeleton h-4 w-5/6"></div>
              <div className="skeleton h-4 w-4/6"></div>
              <div className="skeleton h-4 w-3/6"></div>
              <div className="skeleton h-4 w-5/6"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-1/4"></div>
              <div className="skeleton h-4 w-1/3"></div>
              <div className="skeleton h-4 w-1/2"></div>
              <div className="skeleton h-4 w-3/4"></div>
              <div className="skeleton h-4 w-2/3"></div>
              <div className="skeleton h-4 w-1/2"></div>
            </div>
          ) : (
            <textarea
              value={outputText}
              readOnly
              className="textarea textarea-bordered w-full h-64"
              placeholder="Sanitized text will appear here."
            />
          )}
        </div>
      </div>

      {/* Sanitize Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSanitize}
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  );
}
