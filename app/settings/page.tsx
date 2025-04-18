'use client';
import ThemeToggle from '@/components/ThemeToggle';
import { use, useState } from 'react';

export default function SettingsPage() {
  // State to manage OpenAI API key
  const [apiKey, setApiKey] = useState('');

  // State to manage theme toggle (Light/Dark mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle API Key Save
  const handleSaveApiKey = () => {
    // Save logic (e.g., to localStorage, server, etc.)
    console.log('API Key Saved:', apiKey);
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode); // Tailwind Dark Mode toggle
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p>Customize your app preferences.</p>

      {/* OpenAI API Key */}
      <div className="mt-6 w-1/2">
        <label htmlFor="apiKey" className="block text-lg font-medium mb-2">
          OpenAI API Key
        </label>
        <input
          type="text"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg mb-2"
          placeholder="Enter your OpenAI API Key"
        />
        <button
          onClick={handleSaveApiKey}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Save
        </button>
      </div>

      {/* Theme Toggle */}
      <div className="mt-6">
        <div className="flex items-center mb-2">
          <h2 className="text-lg font-medium mr-3">Theme Preferences :</h2>{' '}
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150 cursor-pointer">
            <ThemeToggle />
          </div>
        </div>
        <p className="text-sm mb-4">
          Switch between light and dark modes to suit your preference.
        </p>
      </div>
    </div>
  );
}
