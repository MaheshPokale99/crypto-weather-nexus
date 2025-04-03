'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchCryptoDetail } from '@/redux/slices/cryptoSlice';
import { toggleFavoriteCrypto } from '@/redux/slices/preferencesSlice';
import MainLayout from '@/components/layout/MainLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';
import ApiErrorDisplay from '@/components/shared/ApiErrorDisplay';
import { CryptoData, CryptoDetail } from '@/types';

// Define an interface for price history data
interface PriceHistoryItem {
  timestamp: number;
  price: number;
}

export default function CryptoDetailPage({ params }: { params: { cryptoId: string } }) {
  const dispatch = useAppDispatch();
  const { cryptos, selectedCrypto, loading: detailsLoading, error: detailsError } = useAppSelector(state => state.crypto);
  const { favoriteCryptos } = useAppSelector(state => state.preferences);
  
  const { cryptoId } = params;
  
  // Find the crypto in the cryptos array
  const cryptoOverview = cryptos.find((crypto: CryptoData) => crypto.id === cryptoId);
  const isFavorite = favoriteCryptos.includes(cryptoId);
  
  // Check if error is related to API key
  const isApiKeyError = detailsError && detailsError.toLowerCase().includes('api key');
  
  useEffect(() => {
    if (cryptoId) {
      dispatch(fetchCryptoDetail(cryptoId));
    }
  }, [dispatch, cryptoId]);

  const handleRetry = () => {
    dispatch(fetchCryptoDetail(cryptoId));
  };

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
  
  const formatPercentage = (percentage: number) => {
    return (percentage >= 0 ? '+' : '') + percentage.toFixed(2) + '%';
  };
  
  const handleFavoriteToggle = () => {
    dispatch(toggleFavoriteCrypto(cryptoId));
  };

  if (detailsLoading && !cryptoOverview && !selectedCrypto) {
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
          apiName="CoinGecko" 
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

  // If we don't have detailed data or basic data, show not found
  if (!selectedCrypto && !cryptoOverview) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cryptocurrency not found</h1>
          <p className="text-gray-600 dark:text-gray-300">
            We couldn&apos;t find price data for the requested cryptocurrency.
          </p>
        </div>
      </MainLayout>
    );
  }
  
  // Use the detailed crypto data if available, otherwise fall back to the basic data
  const cryptoDetail = selectedCrypto || cryptoOverview;
  
  // Ensure we have a valid cryptoDetail before rendering
  if (!cryptoDetail) {
    return (
      <MainLayout>
        <ErrorDisplay 
          message="Unable to display cryptocurrency data" 
          retry={handleRetry} 
        />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0 w-12 h-12 bg-indigo-600 dark:bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold">
              {(cryptoDetail.symbol || '').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{cryptoDetail.name}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">{(cryptoDetail.symbol || '').toUpperCase()}</p>
            </div>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(cryptoDetail.price)}
                </span>
                <span className={`ml-3 text-lg font-medium ${
                  cryptoDetail.priceChange24h >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercentage(cryptoDetail.priceChange24h)}
                </span>
              </div>
              <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date(('timestamp' in cryptoDetail) ? cryptoDetail.timestamp : Date.now()).toLocaleString()}
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {formatMarketCap(cryptoDetail.marketCap)}
                </p>
              </div>
              
              {selectedCrypto && (
                <>
                  <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">24h Volume</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {formatMarketCap(selectedCrypto.volume24h || 0)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Circulating Supply</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {selectedCrypto.circulatingSupply?.toLocaleString() || 'N/A'} {(cryptoDetail.symbol || '').toUpperCase()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">All Time High</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {selectedCrypto.allTimeHigh ? formatPrice(selectedCrypto.allTimeHigh) : 'N/A'}
                    </p>
                  </div>
                </>
              )}
              
              {!selectedCrypto && (
                <>
                  <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg col-span-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Detailed data unavailable. Use the retry button or check your API key to view detailed information.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Price Chart Section */}
        {selectedCrypto && selectedCrypto.history && selectedCrypto.history.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Price History (30 Days)</h2>
            <div className="h-64 w-full">
              {/* This is where a real chart would be rendered using the history data */}
              <div className="bg-gray-100 dark:bg-gray-700 h-full rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Historical price chart would render here using {selectedCrypto.history.length} real data points
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Price History</h2>
            <div className="bg-gray-100 dark:bg-gray-700 h-64 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-center px-4">
                Historical price data is unavailable. Please check your API connection or retry.
                <br />
                <button 
                  onClick={handleRetry}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Retry
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 