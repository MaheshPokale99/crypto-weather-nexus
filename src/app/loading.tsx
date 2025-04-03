export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <h2 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Loading...
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please wait while we fetch your data
        </p>
      </div>
    </div>
  );
} 