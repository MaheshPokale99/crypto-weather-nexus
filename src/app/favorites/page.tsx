'use client';

import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import MainLayout from '@/components/layout/MainLayout';
import WeatherCard from '@/components/weather/WeatherCard';
import CryptoCard from '@/components/crypto/CryptoCard';
import { CryptoData } from '@/types';

export default function FavoritesPage() {
  const { cities, loading: citiesLoading } = useAppSelector(state => state.weather);
  const { cryptos, loading: cryptosLoading } = useAppSelector(state => state.crypto);
  const { favoriteCities, favoriteCryptos } = useAppSelector(state => state.preferences);
  
  const favoriteCitiesData = cities.filter(city => favoriteCities.includes(city.cityId));
  const favoriteCryptosData = cryptos.filter((crypto: CryptoData) => favoriteCryptos.includes(crypto.id));
  
  const hasFavorites = favoriteCitiesData.length > 0 || favoriteCryptosData.length > 0;
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Favorites</h1>
        
        {!hasFavorites ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No favorites yet</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Add your favorite cities or cryptocurrencies by clicking the heart icon on any weather or crypto card.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Favorite Cities */}
            {favoriteCitiesData.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Favorite Cities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteCitiesData.map(city => (
                    <WeatherCard key={city.cityId} weather={city} isFavorite={true} />
                  ))}
                </div>
              </section>
            )}
            
            {/* Favorite Cryptocurrencies */}
            {favoriteCryptosData.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Favorite Cryptocurrencies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteCryptosData.map((crypto: CryptoData) => (
                    <CryptoCard key={crypto.id} crypto={crypto} isFavorite={true} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 