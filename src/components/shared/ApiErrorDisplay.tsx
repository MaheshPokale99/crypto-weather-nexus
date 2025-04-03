import React from 'react';

interface ApiErrorDisplayProps {
  message: string;
  apiName: 'CoinGecko' | 'OpenWeather' | 'NewsData';
  retry?: () => void;
}

const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({ message, apiName, retry }) => {
  // Determine which API key is needed
  let apiKeyName = '';
  let apiDocsUrl = '';
  
  switch (apiName) {
    case 'CoinGecko':
      apiKeyName = 'NEXT_PUBLIC_COINGECKO_API_KEY';
      apiDocsUrl = 'https://www.coingecko.com/en/api/documentation';
      break;
    case 'OpenWeather':
      apiKeyName = 'NEXT_PUBLIC_OPENWEATHER_API_KEY';
      apiDocsUrl = 'https://openweathermap.org/api';
      break;
    case 'NewsData':
      apiKeyName = 'NEXT_PUBLIC_NEWSDATA_API_KEY';
      apiDocsUrl = 'https://newsdata.io/docs';
      break;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
      <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      
      <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">API Data Unavailable</h3>
      
      <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
      
      <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-left">
        <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">To fix this issue:</p>
        <ol className="list-decimal ml-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>
            Sign up for a free {apiName} API key at 
            <a 
              href={apiDocsUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              {apiName} API
            </a>
          </li>
          <li>
            Create or update your <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded font-mono text-sm">.env.local</code> file in your project root
          </li>
          <li>
            Add the API key:
            <div className="mt-1 bg-gray-200 dark:bg-gray-600 p-2 rounded font-mono text-sm">
              {apiKeyName}=your_api_key_here
            </div>
          </li>
          <li>Restart the application</li>
        </ol>
      </div>
      
      {retry && (
        <button
          onClick={retry}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ApiErrorDisplay; 