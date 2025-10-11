import { useState } from "react";
import useLocalStorage from "@mesilicon7/use-localstorage";

interface UserPreferences {
  username: string;
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  notifications: boolean;
  language: string;
}

const defaultPreferences: UserPreferences = {
  username: '',
  theme: 'light',
  fontSize: 16,
  notifications: true,
  language: 'en'
};

export default function TestLocalStorage() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'userPreferences', 
    defaultPreferences
  );
  
  const [message, setMessage] = useState<string>('');

  const handleInputChange = (field: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setMessage('✅ Preferences saved automatically!');
    setTimeout(() => setMessage(''), 2000);
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    setMessage('🔄 Preferences reset to defaults!');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">User Preferences</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={preferences.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Theme
          </label>
          <select
            value={preferences.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Size: {preferences.fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="24"
            value={preferences.fontSize}
            onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Notifications */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="notifications"
            checked={preferences.notifications}
            onChange={(e) => handleInputChange('notifications', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
            Enable notifications
          </label>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={preferences.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Preview</h3>
        <div className="text-sm space-y-1">
          <p><strong>Username:</strong> {preferences.username || 'Not set'}</p>
          <p><strong>Theme:</strong> {preferences.theme}</p>
          <p><strong>Font Size:</strong> {preferences.fontSize}px</p>
          <p><strong>Notifications:</strong> {preferences.notifications ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Language:</strong> {preferences.language}</p>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetPreferences}
        className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Reset to Defaults
      </button>
    </div>
  );
}