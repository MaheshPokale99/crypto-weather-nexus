import React from 'react';

interface ErrorDisplayProps {
  message: string;
  retry?: () => void;
  className?: string;
  extraInfo?: string;
  compact?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, retry, className = '', extraInfo, compact = false }) => {
  // Check if error is related to API key issues
  const isApiKeyError = message.toLowerCase().includes('api key');
  
  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{message}</p>
            {extraInfo && !compact && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{extraInfo}</p>
            )}
            
            {isApiKeyError && !compact && (
              <div className="mt-3 text-sm">
                <p className="font-medium">To fix this issue:</p>
                <ol className="list-decimal ml-5 mt-1 space-y-1">
                  <li>Create or update your .env.local file in the project root</li>
                  <li>Add the required API key: 
                    <code className="ml-1 px-1 py-0.5 bg-red-100 dark:bg-red-900 rounded font-mono text-xs">
                      {message.toLowerCase().includes('coingecko') 
                        ? 'NEXT_PUBLIC_COINGECKO_API_KEY'
                        : message.toLowerCase().includes('openweather') 
                        ? 'NEXT_PUBLIC_OPENWEATHER_API_KEY'
                        : 'NEXT_PUBLIC_API_KEY'}
                    </code>
                  </li>
                  <li>Restart the application</li>
                </ol>
              </div>
            )}
          </div>
          {retry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={retry}
                className="rounded-md bg-red-50 dark:bg-red-900 px-3.5 py-2 text-sm font-semibold text-red-800 dark:text-red-200 shadow-sm hover:bg-red-100 dark:hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 