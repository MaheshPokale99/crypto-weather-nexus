'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';
import ApiErrorDisplay from '@/components/shared/ApiErrorDisplay';
import { fetchNewsData } from '@/redux/slices/newsSlice';

const NewsSection: React.FC = () => {
  const { news, loading, error } = useAppSelector(state => state.news);
  const dispatch = useAppDispatch();
  
  // Take only the top 3 news items for the home page section
  const topNews = Array.isArray(news) ? news.slice(0, 3) : [];
  
  // Check if error is related to API key
  const isApiKeyError = error && error.toLowerCase().includes('api key');
  
  const handleRetry = () => {
    dispatch(fetchNewsData('crypto'));
  };
  
  const formatPublishedDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Latest News</h2>
        <Link href="/news" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center">
          View all
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {loading && topNews.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="md" />
        </div>
      ) : isApiKeyError ? (
        <ApiErrorDisplay 
          message={error} 
          apiName="NewsData" 
          retry={handleRetry}
        />
      ) : error ? (
        <ErrorDisplay message={error} retry={handleRetry} compact={true} />
      ) : (
        <div className="space-y-4">
          {topNews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No news articles available. Please check your API key.</p>
            </div>
          ) : (
            topNews.map(article => (
              <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-md">
                      {article.source || 'Unknown source'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPublishedDate(article.publishedAt)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Read full article
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))
          )}
          
          {loading && topNews.length > 0 && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default NewsSection; 