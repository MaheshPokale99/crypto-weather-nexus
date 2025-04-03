'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchNewsData } from '@/redux/slices/newsSlice';
import MainLayout from '@/components/layout/MainLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';

export default function NewsPage() {
  const dispatch = useAppDispatch();
  const { news, loading, error } = useAppSelector(state => state.news);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize data on page load
  useEffect(() => {
    dispatch(fetchNewsData(selectedCategory));
  }, [dispatch, selectedCategory]);
  
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'crypto', name: 'Crypto' },
    { id: 'finance', name: 'Finance' },
    { id: 'weather', name: 'Weather' }
  ];
  
  const handleRefresh = () => {
    dispatch(fetchNewsData(selectedCategory));
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  // Add extra safeguards for articles
  const safeArticles = Array.isArray(news) ? news : [];
  
  // Filter articles based on search query
  const articles = safeArticles.filter(article => 
    (article.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.source?.toLowerCase().includes(searchQuery.toLowerCase())) ?? false
  );
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News</h1>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search news by title, description or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        {/* Error State */}
        {!loading && error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <ErrorDisplay 
              message={error} 
              retry={handleRefresh}
              extraInfo="News API requires a valid API key. Please check your environment variables."
            />
          </div>
        )}
        
        {/* Empty State */}
        {!loading && !error && articles.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No news articles found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No articles match your search criteria. Try a different search term.' : 'Try changing the category filter or refresh to see the latest news.'}
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Make sure you have set up the News API key in your environment variables.
            </p>
          </div>
        )}
        
        {/* News Content */}
        {!loading && !error && articles.length > 0 && (
          <div className="space-y-6">
            {/* Featured Article */}
            {articles[0] && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Featured</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  {articles[0].imageUrl && (
                    <div className="w-full h-64 overflow-hidden">
                      <img 
                        src={articles[0].imageUrl} 
                        alt={articles[0].title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          // Handle image loading errors by hiding the image
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{articles[0].title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{articles[0].description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{articles[0].source}</span>
                        <span className="text-sm text-gray-400 dark:text-gray-500 ml-2">
                          {new Date(articles[0].publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a href={articles[0].url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
                        Read more →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* News List */}
            {articles.length > 1 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Latest News</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.slice(1).map(article => (
                    <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      {article.imageUrl && (
                        <div className="w-full h-40 overflow-hidden">
                          <img 
                            src={article.imageUrl} 
                            alt={article.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              // Handle image loading errors by hiding the image
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{article.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">{article.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{article.source}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-medium">
                            Read more
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 