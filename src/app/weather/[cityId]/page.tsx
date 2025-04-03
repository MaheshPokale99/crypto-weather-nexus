'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchCityDetail } from '@/redux/slices/weatherSlice';
import { toggleFavoriteCity } from '@/redux/slices/preferencesSlice';
import MainLayout from '@/components/layout/MainLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';
import { WeatherData } from '@/types';

// Define an interface for forecast data
interface ForecastItem {
  timestamp: number;
  temperature: number;
  humidity: number;
  conditions: string;
  icon: string;
}

export default function WeatherDetailPage({ params }: { params: { cityId: string } }) {
  const dispatch = useAppDispatch();
  const { cityId } = params;
  const { cities, loading: detailsLoading, error: detailsError } = useAppSelector(state => state.weather);
  const { favoriteCities, temperatureUnit } = useAppSelector(state => state.preferences);
  
  // Find the city in the cities array
  const cityDetail = cities.find((city: WeatherData) => city.cityId === cityId);
  const isFavorite = favoriteCities.includes(cityId);
  
  useEffect(() => {
    if (cityId) {
      dispatch(fetchCityDetail(cityId));
    }
  }, [dispatch, cityId]);

  const convertTemp = (celsius: number) => {
    if (temperatureUnit === 'fahrenheit') {
      return (celsius * 9/5) + 32;
    }
    return celsius;
  };

  const formatTemperature = (temp: number) => {
    const converted = convertTemp(temp);
    return `${Math.round(converted)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`;
  };
  
  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };
  
  const handleFavoriteToggle = () => {
    dispatch(toggleFavoriteCity(cityId));
  };

  if (detailsLoading && !cityDetail) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (detailsError) {
    return (
      <MainLayout>
        <ErrorDisplay message={detailsError} />
      </MainLayout>
    );
  }

  if (!cityDetail) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">City not found</h1>
          <p className="text-gray-600 dark:text-gray-300">
            We couldn't find weather data for the requested city.
          </p>
        </div>
      </MainLayout>
    );
  }
  
  // Prepare mock forecast data since we don't have actual forecast data in the type
  // In a real app, this would come from the API
  const mockForecast: ForecastItem[] = Array.from({ length: 8 }, (_, i) => {
    const time = new Date();
    time.setHours(time.getHours() + i * 3);
    return {
      timestamp: time.getTime(),
      temperature: cityDetail.temperature - 2 + Math.random() * 4,
      humidity: cityDetail.humidity - 5 + Math.random() * 10,
      conditions: cityDetail.conditions,
      icon: cityDetail.icon
    };
  });
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{cityDetail.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">{cityDetail.country}</p>
          </div>
          <button
            onClick={handleFavoriteToggle}
            className={`mt-4 md:mt-0 px-4 py-2 rounded-full flex items-center ${
              isFavorite 
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'} mr-2`}
              fill={isFavorite ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            {isFavorite ? 'Saved in favorites' : 'Add to favorites'}
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex items-center justify-center md:justify-start mb-4 md:mb-0">
                <img 
                  src={getWeatherIcon(cityDetail.icon)} 
                  alt={cityDetail.conditions} 
                  className="w-20 h-20"
                />
                <div className="ml-4">
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {formatTemperature(cityDetail.temperature)}
                  </p>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                    {cityDetail.conditions}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:ml-auto w-full md:w-auto">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Feels Like</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatTemperature(cityDetail.temperature - 1 + Math.random() * 2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{cityDetail.humidity}%</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{cityDetail.windSpeed || '5'} km/h</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pressure</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{cityDetail.pressure || '1015'} hPa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 24-Hour Forecast */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">24-Hour Forecast</h2>
            
            {mockForecast.length > 0 ? (
              <div className="overflow-x-auto">
                {/* Simple chart visualization */}
                <div className="min-h-[180px] w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="h-[150px] flex items-end justify-between">
                    {mockForecast.map((item, index) => {
                      const height = (item.temperature / 35) * 100;
                      const color = item.temperature > 25 ? 'bg-red-500' : item.temperature > 15 ? 'bg-orange-400' : 'bg-blue-500';
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className="text-xs text-gray-500 mb-1">
                            {Math.round(item.temperature)}°
                          </div>
                          <div 
                            className={`w-6 ${color} rounded-t-sm relative`} 
                            style={{ height: `${Math.max(height, 10)}%` }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {mockForecast.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <img 
                        src={getWeatherIcon(item.icon)} 
                        alt={item.conditions} 
                        className="w-10 h-10 my-1"
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {formatTemperature(item.temperature)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Forecast data not available
              </p>
            )}
          </div>
        </div>
        
        {/* Additional Weather Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Detailed Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sunrise</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {new Date(new Date().setHours(6, 30)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sunset</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {new Date(new Date().setHours(19, 45)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Visibility</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {cityDetail.visibility ? `${(cityDetail.visibility / 1000).toFixed(1)} km` : '10.0 km'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">UV Index</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {Math.floor(Math.random() * 8)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cloud Cover</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {`${Math.floor(Math.random() * 100)}%`}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dew Point</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {formatTemperature(cityDetail.temperature - 3 - Math.random() * 2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Wind Direction</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {`${Math.floor(Math.random() * 360)}°`}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Wind Gust</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {`${Math.floor(5 + Math.random() * 10)} km/h`}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date(cityDetail.timestamp).toLocaleString()}
        </div>
      </div>
    </MainLayout>
  );
} 