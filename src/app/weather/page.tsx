'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchWeatherData, searchCityByName } from '@/redux/slices/weatherSlice';
import MainLayout from '@/components/layout/MainLayout';
import WeatherCard from '@/components/weather/WeatherCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';

export default function WeatherPage() {
  const dispatch = useAppDispatch();
  const { cities, loading, error } = useAppSelector(state => state.weather);
  const { favoriteCities } = useAppSelector(state => state.preferences);
  const [searchQuery, setSearchQuery] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  
  const handleRefresh = () => {
    dispatch(fetchWeatherData());
  };

  const handleSearchCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (citySearchQuery.trim()) {
      dispatch(searchCityByName(citySearchQuery.trim()));
    }
  };

  // Filter cities based on search query
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter favorite cities based on search query
  const filteredFavoriteCities = filteredCities.filter(city => 
    favoriteCities.includes(city.cityId)
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weather</h1>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white dark:text-gray-900 bg-indigo-600 dark:bg-indigo-400 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* City Search */}
        <div>
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Add a new city</h2>
          <form onSubmit={handleSearchCity} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search for any city by name..."
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white dark:text-gray-900 bg-indigo-600 dark:bg-indigo-400 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Add City'}
            </button>
          </form>
        </div>

        {/* Filter Displayed Cities */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Filter displayed cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Error Display */}
        {error && (
          <ErrorDisplay message={error} retry={handleRefresh} />
        )}
        
        {/* Favorites Section */}
        {filteredFavoriteCities.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Favorites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavoriteCities.map(city => (
                <WeatherCard key={city.cityId} weather={city} />
              ))}
            </div>
          </section>
        )}
        
        {/* All Cities Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">All Cities</h2>
          
          {loading && cities.length === 0 ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No matching cities found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try a different search term or refresh to see all cities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map(city => (
                <WeatherCard key={city.cityId} weather={city} />
              ))}
              {loading && cities.length > 0 && (
                <div className="col-span-full flex justify-center py-4">
                  <LoadingSpinner size="md" />
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
} 