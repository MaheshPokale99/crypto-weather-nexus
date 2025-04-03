import React from 'react';
import { format } from 'date-fns';
import { NewsItem as NewsItemType } from '@/types';
import Card from '../shared/Card';

interface NewsItemProps {
  news: NewsItemType;
}

const NewsItem: React.FC<NewsItemProps> = ({ news }) => {
  return (
    <Card 
      className="h-full cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={() => window.open(news.url, '_blank')}
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          {news.imageUrl && (
            <div className="mb-4 overflow-hidden rounded-md">
              <img 
                src={news.imageUrl} 
                alt={news.title} 
                className="w-full h-40 object-cover hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=News';
                }}
              />
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2 mb-2">
            {news.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
            {news.description}
          </p>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <span>{news.source}</span>
          <span>{format(new Date(news.publishedAt), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </Card>
  );
};

export default NewsItem; 