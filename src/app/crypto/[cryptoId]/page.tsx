'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchCryptoDetail } from '@/redux/slices/cryptoSlice';
import { toggleFavoriteCrypto } from '@/redux/slices/preferencesSlice';
import MainLayout from '@/components/layout/MainLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';
import { CryptoData } from '@/types';

// Define an interface for price history data
interface PriceHistoryItem {
  timestamp: number;
  price: number;
}

export default function CryptoDetailPage({ params }: { params: { cryptoId: string } }) {
  const dispatch = useAppDispatch();
  const { cryptoId } = params;
  const { cryptos, loading: detailsLoading, error: detailsError } = useAppSelector(state => state.crypto);
  const { favoriteCryptos } = useAppSelector(state => state.preferences);
  
  // Find the crypto in the cryptos array
  const cryptoDetail = cryptos.find((crypto: CryptoData) => crypto.id === cryptoId);
  const isFavorite = favoriteCryptos.includes(cryptoId);
  
  useEffect(() => {
    if (cryptoId) {
      dispatch(fetchCryptoDetail(cryptoId));
    }
  }, [dispatch, cryptoId]);

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

  if (detailsLoading && !cryptoDetail) {
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

  if (!cryptoDetail) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cryptocurrency not found</h1>
          <p className="text-gray-600 dark:text-gray-300">
            We couldn't find price data for the requested cryptocurrency.
          </p>
        </div>
      </MainLayout>
    );
  }
  
  // Prepare mock price history data since we don't have actual history data in the type
  // In a real app, this would come from the API
  const mockPriceHistory: PriceHistoryItem[] = Array.from({ length: 24 }, (_, i) => {
    const time = new Date();
    time.setHours(time.getHours() - i);
    // Generate some realistic price fluctuations
    const randomChange = (Math.random() - 0.5) * (cryptoDetail.price * 0.02); // 2% max change
    return {
      timestamp: time.getTime(),
      price: cryptoDetail.price + randomChange * (i / 24)
    };
  }).reverse();
  
  // Mock volume data for volume chart
  const volumeData = mockPriceHistory.map(() => {
    return Math.round(cryptoDetail.price * 100000 * (0.5 + Math.random()));
  });
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0 w-12 h-12 bg-indigo-600 dark:bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold">
              {cryptoDetail.symbol.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{cryptoDetail.name}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">{cryptoDetail.symbol.toUpperCase()}</p>
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
                Last updated: {new Date(cryptoDetail.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {formatMarketCap(cryptoDetail.marketCap)}
                </p>
              </div>
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">24h Volume</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {formatMarketCap(cryptoDetail.marketCap * 0.15)} {/* Mock volume */}
                </p>
              </div>
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Circulating Supply</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {Math.round(cryptoDetail.marketCap / cryptoDetail.price).toLocaleString()} {cryptoDetail.symbol.toUpperCase()}
                </p>
              </div>
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Trading Pairs</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {Math.floor(10 + Math.random() * 90)} {/* Mock trading pairs */}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Price Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Price Chart (24h)</h2>
            
            <div className="overflow-x-auto">
              {/* Simple line chart implementation */}
              <div className="min-h-[180px] w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="relative h-[150px] flex items-end">
                  {/* Area under the curve */}
                  <div className="absolute bottom-0 left-0 right-0 bg-opacity-20 rounded-sm" 
                       style={{
                         background: `linear-gradient(to top, ${cryptoDetail.priceChange24h >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'} 0%, transparent 100%)`,
                         height: '100%'
                       }}
                  />
                  
                  {/* Line chart */}
                  <div className="flex items-end justify-between w-full h-full relative">
                    {mockPriceHistory.map((item, i) => {
                      const maxPrice = Math.max(...mockPriceHistory.map(item => item.price));
                      const minPrice = Math.min(...mockPriceHistory.map(item => item.price));
                      const range = maxPrice - minPrice;
                      const height = ((item.price - minPrice) / (range || 1)) * 95;
                      
                      // Only show every 3rd label to avoid overcrowding
                      const showLabel = i % 3 === 0;
                      
                      return (
                        <div key={i} className="flex flex-col items-center" style={{ height: '100%', flex: '1' }}>
                          {showLabel && (
                            <div className="absolute -bottom-6 text-xs text-gray-500 transform -translate-x-1/2">
                              {new Date(item.timestamp).getHours()}:00
                            </div>
                          )}
                          <div className="relative w-full h-full flex justify-center">
                            {i > 0 && (
                              <div 
                                className={`absolute bottom-0 h-[2px] w-full ${cryptoDetail.priceChange24h >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ 
                                  bottom: `${height}%`,
                                  transform: 'translateY(-50%)',
                                  width: '100%',
                                  left: '-50%'
                                }}
                              />
                            )}
                            <div 
                              className={`w-2 h-2 rounded-full ${cryptoDetail.priceChange24h >= 0 ? 'bg-green-500' : 'bg-red-500'} absolute`}
                              style={{ bottom: `${height}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Volume Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Trading Volume (24h)</h2>
            
            <div className="overflow-x-auto">
              {/* Simple bar chart */}
              <div className="min-h-[150px] w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="h-[120px] flex items-end justify-between">
                  {volumeData.filter((_, i) => i % 3 === 0).map((volume, index) => {
                    const maxVolume = Math.max(...volumeData);
                    const height = (volume / maxVolume) * 100;
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-6 bg-indigo-500 rounded-t-sm"
                          style={{ height: `${Math.max(height, 5)}%` }}
                        ></div>
                        {index % 2 === 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(mockPriceHistory[index * 3].timestamp).getHours()}:00
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Market Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Market Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Market Dominance</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {(cryptoDetail.marketCap / 1000000000000).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, cryptoDetail.marketCap / 10000000000)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">All-Time High</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {formatPrice(cryptoDetail.price * 1.5)} {/* Mock ATH */}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString()} 
                    ({formatPercentage((cryptoDetail.price * 1.5 - cryptoDetail.price) / (cryptoDetail.price * 1.5) * 100)})
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">All-Time Low</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {formatPrice(cryptoDetail.price * 0.1)} {/* Mock ATL */}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(Date.now() - 700 * 24 * 60 * 60 * 1000).toLocaleDateString()} 
                    ({formatPercentage((cryptoDetail.price - cryptoDetail.price * 0.1) / (cryptoDetail.price * 0.1) * 100)})
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Price Changes</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">1h</span>
                    <span className={`text-sm font-medium ${
                      (Math.random() - 0.3) > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercentage((Math.random() - 0.3) * 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">24h</span>
                    <span className={`text-sm font-medium ${
                      cryptoDetail.priceChange24h >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercentage(cryptoDetail.priceChange24h)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">7d</span>
                    <span className={`text-sm font-medium ${
                      (Math.random() - 0.3) > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercentage((Math.random() - 0.3) * 10)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">30d</span>
                    <span className={`text-sm font-medium ${
                      (Math.random() - 0.2) > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercentage((Math.random() - 0.2) * 30)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">1y</span>
                    <span className={`text-sm font-medium ${
                      (Math.random() + 0.3) > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercentage((Math.random() + 0.3) * 100)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 