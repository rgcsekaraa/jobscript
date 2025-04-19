// app/linkedin-digester/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithApiKey } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FilterState {
  summary: boolean;
  experience: boolean;
  education: boolean;
  honors: boolean;
  certifications: boolean;
  skills: boolean;
  posts: boolean;
}

export default function LinkedInDigester() {
  const [url, setUrl] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [profileData, setProfileData] = useState<any>(null);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    summary: true,
    experience: true,
    education: true,
    honors: true,
    certifications: true,
    skills: true,
    posts: true,
  });

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  // Validate LinkedIn URL and extract username
  const validateLinkedInUrl = (inputUrl: string): string | null => {
    const regex = /^https:\/\/(www\.)?linkedin\.com\/in\/([a-zA-Z0-9\-]+)\/?$/;
    const match = inputUrl.match(regex);
    if (!match) return null;
    return match[2]; // Username
  };

  // Fetch profile data
  const fetchProfileData = async (username: string) => {
    setIsLoading(true);
    setError('');
    setToast(null);
    setProfileData(null); // Clear previous profile data
    setChatMessages([]); // Clear chat messages on new fetch
    setFilteredData(null); // Clear filtered data on new fetch
    try {
      const response = await fetch(
        `https://linkedingest.onrender.com/api/profile/${username}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      console.log('Profile fetch response:', {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile fetch error:', errorText);
        throw new Error(`Failed to fetch profile data: ${errorText}`);
      }

      const data = await response.json();
      console.log('Profile data:', data);

      if (!data || Object.keys(data).length === 0) {
        throw new Error('No profile data found');
      }

      setProfileData(data);
      setFilteredData(data); // Initially show all data
      setToast({
        message: 'Profile data fetched successfully!',
        type: 'success',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch profile';
      console.error('Error fetching profile:', errorMessage);
      setError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Handle URL submission
  const handleSubmit = async () => {
    if (!url.trim()) {
      setToast({
        message: 'Please enter a LinkedIn profile URL',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const extractedUsername = validateLinkedInUrl(url);
    if (!extractedUsername) {
      setToast({ message: 'Invalid LinkedIn profile URL', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setUsername(extractedUsername);
    await fetchProfileData(extractedUsername);
  };

  // Filter JSON data based on checkbox states
  const updateFilteredData = () => {
    if (!profileData) return;

    const filtered: Record<string, any> = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof FilterState] && profileData[key]) {
        filtered[key] = profileData[key];
      }
    });

    // Always include non-filterable fields (e.g., name, headline)
    if (profileData.name) filtered['name'] = profileData.name;
    if (profileData.headline) filtered['headline'] = profileData.headline;

    setFilteredData(Object.keys(filtered).length > 0 ? filtered : null);
  };

  // Check if all filters are selected
  const areAllFiltersSelected = () => {
    return Object.values(filters).every((value) => value === true);
  };

  // Handle filter checkbox changes
  const handleFilterChange = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Effect to update filtered data when filters change
  useEffect(() => {
    updateFilteredData();
  }, [filters, profileData]);

  // Copy JSON to clipboard
  const handleCopyAll = async () => {
    if (!filteredData) {
      setToast({ message: 'No data to copy', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(filteredData, null, 2)
      );
      setToast({ message: 'JSON copied to clipboard!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to copy JSON', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  // Download JSON as file
  const handleDownload = () => {
    if (!filteredData) {
      setToast({ message: 'No data to download', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username || 'profile'}_linkedin.json`;
    a.click();
    URL.revokeObjectURL(url);

    setToast({ message: 'JSON downloaded successfully!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle chat submission
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) {
      setToast({ message: 'Please enter a question', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');

    if (!profileData) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'No profile data available. Please fetch a profile first.',
        },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      // Use filteredData if any filter is unticked; otherwise, use profileData
      const dataToSend = areAllFiltersSelected()
        ? profileData
        : filteredData || {};
      const prompt = `
        You are an assistant with access to the following LinkedIn profile data in JSON format:
        ${JSON.stringify(dataToSend, null, 2)}
        
        The user has asked: "${chatInput}"
        
        Answer the question based strictly on the provided profile data. If the question is unrelated to the profile data, respond with: "Sorry, I don't know."
        
        Provide a concise and accurate response.
      `;

      console.log('Sending chat request:', {
        promptLength: prompt.length,
        dataSize: JSON.stringify(dataToSend).length,
        question: chatInput,
      });

      const response = await fetchWithApiKey('/api/generate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      console.log('Chat response:', {
        status: response.status,
        statusText: response.statusText,
      });

      const responseText = await response.text();
      console.log('Raw chat response:', responseText);

      if (!response.ok) {
        console.error('Chat API error:', responseText);
        throw new Error(
          `Failed to generate chat response: ${
            responseText || 'No response body'
          }`
        );
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid chat response format:', responseText);
        throw new Error(
          `Invalid response format: ${responseText || 'Empty response'}`
        );
      }

      const data = JSON.parse(responseText);
      console.log('Parsed chat response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content || 'Sorry, I don’t know.',
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to process question';
      console.error('Error in chat:', errorMessage);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage },
      ]);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="container mx-auto min-h-screen flex flex-col">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">LinkedIn Digester</h1>
        </div>
        <p className="mt-2">
          Enter a LinkedIn profile URL to view its data and ask questions.
        </p>
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
        <label htmlFor="linkedinUrl" className="block text-sm font-medium mb-2">
          LinkedIn Profile URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="linkedinUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input input-bordered flex-grow"
            placeholder="https://www.linkedin.com/in/username"
          />
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              'Fetch Profile'
            )}
          </button>
        </div>
        {error && <p className="text-error mt-2">{error}</p>}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 flex-grow">
        {/* Left: JSON Output with Filters */}
        <div className="lg:w-1/2 card bg-base-100 shadow-xl p-6">
          <h2 className="card-title mb-4">
            Profile Ingest of {profileData?.name || 'User'}
          </h2>
          {profileData ? (
            <>
              {/* Action Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleCopyAll}
                  className="btn btn-primary btn-sm"
                >
                  Copy All
                </button>
                <button
                  onClick={handleDownload}
                  className="btn btn-secondary btn-sm"
                >
                  Download
                </button>
              </div>
              {/* Filter Checkboxes */}
              <div className="form-control mb-4 flex gap-2">
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.summary}
                    onChange={() => handleFilterChange('summary')}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Summary</span>
                </label>
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.experience}
                    onChange={() => handleFilterChange('experience')}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Experience</span>
                </label>
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.education}
                    onChange={() => handleFilterChange('education')}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Education</span>
                </label>
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.honors}
                    onChange={() => handleFilterChange('honors')}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Honors</span>
                </label>
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.certifications}
                    onChange={() => handleFilterChange('certifications')}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Certifications</span>
                </label>
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.skills}
                    onChange={() => handleFilterChange('skills')}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Skills</span>
                </label>
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.posts}
                    onChange={() => handleFilterChange('posts')}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Posts</span>
                </label>
              </div>
              {/* JSON Output */}
              <pre className="mockup-code">
                <code>{JSON.stringify(filteredData || {}, null, 2)}</code>
              </pre>
            </>
          ) : (
            <p className="text-center text-gray-500">
              Enter a valid LinkedIn URL to view profile data.
            </p>
          )}
        </div>

        {/* Right: Chat Box */}
        <div className="lg:w-1/2 card bg-base-100 shadow-xl p-6">
          <h2 className="card-title mb-4">Ask About the Profile</h2>
          <div className="flex flex-col h-[400px] overflow-y-auto mb-4 p-4 bg-base-200 rounded-box">
            {chatMessages.length === 0 ? (
              <p className="text-center text-gray-500">
                Ask a question about the profile data.
              </p>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat ${
                    msg.role === 'user' ? 'chat-end' : 'chat-start'
                  }`}
                >
                  <div className="chat-header">
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div
                    className={`chat-bubble ${
                      msg.role === 'user' ? 'chat-bubble-primary' : ''
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
              className="input input-bordered flex-grow"
              placeholder="Ask about the profile..."
            />
            <button
              onClick={handleChatSubmit}
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
