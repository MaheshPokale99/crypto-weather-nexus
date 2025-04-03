'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import CryptoCard from '@/components/crypto/CryptoCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';
import ApiErrorDisplay from '@/components/shared/ApiErrorDisplay';
import { fetchCryptoData } from '@/redux/slices/cryptoSlice';

const CryptoSection: React.FC = () => {
  const { cryptos, loading, error } = useAppSelector(state => state.crypto);
  const dispatch = useAppDispatch();
  
  // Take only the top 3 cryptos for the home page section
  const topCryptos = Array.isArray(cryptos) ? cryptos.slice(0, 3) : [];
  
  // Check if error is related to API key
  const isApiKeyError = error && error.toLowerCase().includes('api key');
  
  const handleRetry = () => {
    dispatch(fetchCryptoData());
  };
  
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cryptocurrency</h2>
        <Link href="/crypto" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center">
          View all
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {loading && topCryptos.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="md" />
        </div>
      ) : isApiKeyError ? (
        <ApiErrorDisplay 
          message={error} 
          apiName="CoinGecko" 
          retry={handleRetry}
        />
      ) : error ? (
        <ErrorDisplay message={error} retry={handleRetry} compact={true} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topCryptos.map(crypto => (
            <CryptoCard key={crypto.id} crypto={crypto} />
          ))}
          {loading && topCryptos.length > 0 && (
            <div className="col-span-full flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CryptoSection; 