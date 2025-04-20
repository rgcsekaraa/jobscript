// app/settings/page.tsx
'use client';

import ThemeToggle from '@/components/ThemeToggle';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState<string>('');
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Load saved API key and show error if not set
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setStoredKey(savedKey);
      setApiKey(savedKey);
      document.cookie = 'has_openai_api_key=true; path=/; max-age=31536000';
    } else {
      setToast({
        message: 'Please set your OpenAI API key to continue.',
        type: 'error',
      });
    }
  }, []);

  // Validate API key by making a test request to OpenAI
  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  };

  // Handle API Key Save
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setToast({
        message: 'Please enter an API key',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setSaving(true);
    const isValid = await validateApiKey(apiKey);
    if (!isValid) {
      setToast({
        message: 'Invalid OpenAI API key. Please check and try again.',
        type: 'error',
      });
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Save to localStorage
    localStorage.setItem('openai_api_key', apiKey);
    setStoredKey(apiKey);
    setIsEditing(false); // Exit edit mode
    document.cookie = 'has_openai_api_key=true; path=/; max-age=31536000';
    setSaving(false);
    setToast({
      message: 'API key saved successfully!',
      type: 'success',
    });
    setTimeout(() => {
      setToast(null);
      window.location.reload();
    }, 1000);
  };

  // Handle API Key Delete
  const handleDeleteApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setStoredKey(null);
    setApiKey('');
    setIsEditing(false);
    document.cookie = 'has_openai_api_key=; path=/; max-age=0';
    setToast({
      message:
        'API key deleted successfully! Please set a new API key to continue.',
      type: 'error',
    });
    setTimeout(() => {
      setToast(null);
      window.location.reload();
    }, 1000);
  };

  // Toggle Edit Mode
  const handleEditApiKey = () => {
    setIsEditing(true);
  };

  return (
    <div className="mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p className="mb-6">
        Please enter your OpenAI API key to access the site.
      </p>

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

      {/* OpenAI API Key */}
      <div className="card bg-base-100 shadow-xl p-6 mb-6 max-w-md">
        <h2 className="card-title mb-4">OpenAI API Key</h2>

        {/* Single API Key Field */}
        <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
          {storedKey && !isEditing
            ? 'Current API Key'
            : 'Enter your OpenAI API Key'}
        </label>
        <div className="flex items-center">
          <input
            type="text"
            id="apiKey"
            value={
              isEditing || !storedKey
                ? apiKey
                : apiKey.slice(0, 8) + '...' + apiKey.slice(-4)
            }
            onChange={(e) => setApiKey(e.target.value)}
            className="input input-bordered w-full"
            placeholder="sk-..."
            readOnly={!!(storedKey && !isEditing)}
          />
          {storedKey && !isEditing ? (
            <>
              <button
                onClick={handleEditApiKey}
                className="btn btn-primary ml-2"
                title="Edit API Key"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={handleDeleteApiKey}
                className="btn btn-error ml-2"
                title="Delete API Key"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={handleSaveApiKey}
              className={`btn ${saving ? 'btn-disabled' : 'btn-primary'} ml-2`}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
