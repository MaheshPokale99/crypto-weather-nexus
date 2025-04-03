'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import WeatherCard from '@/components/weather/WeatherCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';
import ApiErrorDisplay from '@/components/shared/ApiErrorDisplay';
import { fetchWeatherData } from '@/redux/slices/weatherSlice';

const WeatherSection: React.FC = () => {
  const { cities, loading, error } = useAppSelector(state => state.weather);
  const dispatch = useAppDispatch();
  
  // Take only the top 3 cities for the home page section
  const topCities = Array.isArray(cities) ? cities.slice(0, 3) : [];
  
  // Check if error is related to API key
  const isApiKeyError = error && error.toLowerCase().includes('api key');
  
  const handleRetry = () => {
    dispatch(fetchWeatherData());
  };
  
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weather</h2>
        <Link href="/weather" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center">
          View all
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {loading && topCities.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="md" />
        </div>
      ) : isApiKeyError ? (
        <ApiErrorDisplay 
          message={error} 
          apiName="OpenWeather" 
          retry={handleRetry}
        />
      ) : error ? (
        <ErrorDisplay message={error} retry={handleRetry} compact={true} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topCities.map(city => (
            <WeatherCard key={city.cityId} weather={city} />
          ))}
          {loading && topCities.length > 0 && (
            <div className="col-span-full flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default WeatherSection; 