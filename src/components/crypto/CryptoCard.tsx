'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toggleFavoriteCrypto } from '@/redux/slices/preferencesSlice';
import { CryptoData } from '@/types';

interface CryptoCardProps {
  crypto: CryptoData;
  isFavorite?: boolean;
}

export default function CryptoCard({ crypto, isFavorite: propIsFavorite }: CryptoCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { favoriteCryptos } = useAppSelector(state => state.preferences);
  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : favoriteCryptos.includes(crypto.id);
  
  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return '$' + price.toFixed(6);
    } else if (price < 1) {
      return '$' + price.toFixed(4);
    } else if (price < 1000) {
      return '$' + price.toFixed(2);
    } else {
      return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
  };
  
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1_000_000_000) {
      return '$' + (marketCap / 1_000_000_000).toFixed(2) + 'B';
    } else if (marketCap >= 1_000_000) {
      return '$' + (marketCap / 1_000_000).toFixed(2) + 'M';
    } else {
      return '$' + marketCap.toLocaleString('en-US');
    }
  };
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFavoriteCrypto(crypto.id));
  };
  
  const handleViewDetails = () => {
    router.push(`/crypto/${crypto.id}`);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {crypto.symbol && (
              <div className="mr-3 flex-shrink-0 w-10 h-10 bg-indigo-600 dark:bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold">
                {crypto.symbol.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{crypto.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">{crypto.symbol}</p>
            </div>
          </div>
          <button
            onClick={handleToggleFavorite}
            className="focus:outline-none"
            aria-label={isFavorite ? `Remove ${crypto.name} from favorites` : `Add ${crypto.name} to favorites`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${
                isFavorite
                  ? 'text-yellow-500 fill-current'
                  : 'text-gray-400 dark:text-gray-600 hover:text-yellow-500 dark:hover:text-yellow-500'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={isFavorite ? 0 : 2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(crypto.price)}
            </span>
            <span className={`text-sm font-medium ${
              crypto.priceChange24h >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {crypto.priceChange24h >= 0 ? '+' : ''}
              {crypto.priceChange24h.toFixed(2)}%
            </span>
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Market Cap</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatMarketCap(crypto.marketCap)}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Updated</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(crypto.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={handleViewDetails}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center justify-center w-full"
          >
            <span>See price history and details</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 