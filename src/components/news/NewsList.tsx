import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import NewsItem from './NewsItem';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface NewsListProps {
  limit?: number;
  retry: () => void;
}

const NewsList: React.FC<NewsListProps> = ({ limit, retry }) => {
  const { news, loading, error } = useAppSelector(state => state.news);
  
  if (loading && news.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return <ErrorDisplay message={error} retry={retry} />;
  }
  
  const displayNews = limit ? news.slice(0, limit) : news;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayNews.map((item) => (
        <NewsItem key={item.id} news={item} />
      ))}
      {loading && news.length > 0 && (
        <div className="col-span-full flex justify-center p-4">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
};

export default NewsList; 