'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCryptoData } from '@/redux/slices/cryptoSlice';
import MainLayout from '@/components/layout/MainLayout';
import CryptoCard from '@/components/crypto/CryptoCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';

export default function CryptoPage() {
  const dispatch = useAppDispatch();
  const { cryptos, loading, error } = useAppSelector(state => state.crypto);
  const { favoriteCryptos } = useAppSelector(state => state.preferences);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    dispatch(fetchCryptoData());
  }, [dispatch]);
  
  // Ensure cryptocurrencies is an array before filtering
  const safeCryptos = Array.isArray(cryptos) ? cryptos : [];
  
  // Filter cryptocurrencies based on search query
  const filteredCryptos = safeCryptos.filter(crypto => 
    crypto?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto?.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter favorite cryptocurrencies based on search query
  const filteredFavoriteCryptos = filteredCryptos.filter(crypto => 
    crypto?.id && favoriteCryptos.includes(crypto.id)
  );
  
  const handleRefresh = () => {
    dispatch(fetchCryptoData());
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cryptocurrencies</h1>
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
        
        {/* Live Prices Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 p-4 rounded-lg text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium">Live prices via CoinCap WebSocket API. Click on any cryptocurrency for detailed metrics.</span>
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
            placeholder="Search cryptocurrencies by name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {loading && cryptos.length === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorDisplay message={error} retry={handleRefresh} />
        ) : (
          <>
            {/* Favorites Section */}
            {filteredFavoriteCryptos.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Favorites</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFavoriteCryptos.map(crypto => (
                    <CryptoCard key={crypto.id} crypto={crypto} />
                  ))}
                </div>
              </section>
            )}
            
            {/* All Cryptocurrencies */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">All Cryptocurrencies</h2>
              {filteredCryptos.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No matching cryptocurrencies found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try a different search term or refresh to see all cryptocurrencies.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCryptos.map(crypto => (
                    <CryptoCard key={crypto.id} crypto={crypto} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
} 