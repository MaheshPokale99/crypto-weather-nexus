'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchCityDetail } from '@/redux/slices/weatherSlice';
import { toggleFavoriteCity } from '@/redux/slices/preferencesSlice';
import MainLayout from '@/components/layout/MainLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';
import ApiErrorDisplay from '@/components/shared/ApiErrorDisplay';
import { WeatherData, CityDetail } from '@/types';

export default function WeatherDetailPage({ params }: { params: { cityId: string } }) {
  const dispatch = useAppDispatch();
  const { cities, selectedCity, loading: detailsLoading, error: detailsError } = useAppSelector(state => state.weather);
  const { favoriteCities, temperatureUnit } = useAppSelector(state => state.preferences);
  
  const { cityId } = params;
  
  // Find the city in the cities array
  const cityBasicInfo = cities.find((city: WeatherData) => city.cityId === cityId);
  const isFavorite = favoriteCities.includes(cityId);
  
  // Check if error is related to API key
  const isApiKeyError = detailsError && detailsError.toLowerCase().includes('api key');
  
  useEffect(() => {
    if (cityId) {
      dispatch(fetchCityDetail(cityId));
    }
  }, [dispatch, cityId]);

  const handleRetry = () => {
    dispatch(fetchCityDetail(cityId));
  };

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
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleFavoriteToggle = () => {
    dispatch(toggleFavoriteCity(cityId));
  };

  if (detailsLoading && !cityBasicInfo && !selectedCity) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (isApiKeyError) {
    return (
      <MainLayout>
        <ApiErrorDisplay 
          message={detailsError} 
          apiName="OpenWeather" 
          retry={handleRetry}
        />
      </MainLayout>
    );
  }

  if (detailsError) {
    return (
      <MainLayout>
        <ErrorDisplay message={detailsError} retry={handleRetry} />
      </MainLayout>
    );
  }

  if (!cityBasicInfo && !selectedCity) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">City not found</h1>
          <p className="text-gray-600 dark:text-gray-300">
            We couldn&apos;t find weather data for the requested city.
          </p>
        </div>
      </MainLayout>
    );
  }
  
  // Use either the detailed data or basic data
  const city = selectedCity || cityBasicInfo;
  
  // Ensure we have a valid city before rendering
  if (!city) {
    return (
      <MainLayout>
        <ErrorDisplay 
          message="Unable to display weather data" 
          retry={handleRetry} 
        />
      </MainLayout>
    );
  }
  
  // Helper function to get current weather data correctly based on the type
  const getWeatherData = () => {
    // Type guard function to check if it's a CityDetail
    const isCityDetail = (data: WeatherData | CityDetail): data is CityDetail => {
      return 'currentWeather' in data;
    };
    
    if (isCityDetail(city)) {
      // It's a CityDetail
      return {
        temperature: city.currentWeather?.temperature ?? 0,
        feelsLike: city.currentWeather?.feelsLike,
        humidity: city.currentWeather?.humidity ?? 0,
        conditions: city.currentWeather?.conditions ?? 'Unknown',
        icon: city.currentWeather?.icon ?? '01d',
        windSpeed: city.currentWeather?.windSpeed,
        pressure: city.currentWeather?.pressure,
      };
    } else {
      // It's a WeatherData
      return {
        temperature: city.temperature,
        feelsLike: undefined,
        humidity: city.humidity,
        conditions: city.conditions,
        icon: city.icon,
        windSpeed: city.windSpeed,
        pressure: city.pressure,
      };
    }
  };
  
  const weatherData = getWeatherData();
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{city.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">{city.country}</p>
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
                  src={getWeatherIcon(weatherData.icon)} 
                  alt={weatherData.conditions} 
                  className="w-20 h-20"
                />
                <div className="ml-4">
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {formatTemperature(weatherData.temperature)}
                  </p>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                    {weatherData.conditions}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:ml-auto w-full md:w-auto">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Feels Like</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatTemperature(weatherData.feelsLike || weatherData.temperature)}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{weatherData.humidity}%</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{weatherData.windSpeed || '—'} km/h</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pressure</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{weatherData.pressure || '—'} hPa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Forecast Section */}
        {selectedCity && selectedCity.history && selectedCity.history.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Weather History</h2>
              
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-2">
                  {selectedCity.history.map((item, index) => (
                    <div key={index} className="flex-shrink-0 w-24 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(item.timestamp)}</p>
                      <img 
                        src={getWeatherIcon(item.icon || '01d')} 
                        alt={item.conditions} 
                        className="w-10 h-10 mx-auto my-1"
                      />
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {formatTemperature(item.temperature)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.humidity}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Weather History</h2>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Detailed historical data is unavailable. Please check your API connection or retry.
              </p>
              <button 
                onClick={handleRetry}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 