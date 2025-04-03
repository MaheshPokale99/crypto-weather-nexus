'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <h1 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
          Something went wrong
        </h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          We&apos;re sorry, but an unexpected error occurred while loading this page.
        </p>
        <p className="p-2 mb-4 text-sm font-mono text-left bg-gray-100 rounded dark:bg-gray-900 dark:text-gray-300">
          {error?.message || 'Unknown error'}
        </p>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
} 