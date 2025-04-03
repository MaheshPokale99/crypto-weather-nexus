'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchCryptoDetail } from '@/redux/slices/cryptoSlice';
import { toggleFavoriteCrypto } from '@/redux/slices/preferencesSlice';
import MainLayout from '@/components/layout/MainLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorDisplay from '@/components/shared/ErrorDisplay';
import ApiErrorDisplay from '@/components/shared/ApiErrorDisplay';
import { CryptoData, CryptoDetail } from '@/types';
import TransparentApexCharts from '@/components/charts/TransparentApexCharts';

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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  const handleFavoriteToggle = () => {
    dispatch(toggleFavoriteCrypto(cryptoId));
  };

  // Function to prepare price chart data
  const preparePriceChartData = () => {
    if (!selectedCrypto || !selectedCrypto.history || selectedCrypto.history.length === 0) {
      return null;
    }

    // Sort by timestamp to ensure chronological order
    const historyData = [...selectedCrypto.history].sort((a, b) => a.timestamp - b.timestamp);

    const dates = historyData.map(item => formatDate(item.timestamp));
    const prices = historyData.map(item => item.price);
    
    // Calculate simple moving average for 7 periods if we have enough data
    let smaData = [];
    if (historyData.length >= 7) {
      for (let i = 6; i < historyData.length; i++) {
        let sum = 0;
        for (let j = 0; j < 7; j++) {
          sum += historyData[i - j].price;
        }
        smaData.push(sum / 7);
      }
      // Pad the beginning with nulls for alignment
      smaData = Array(6).fill(null).concat(smaData);
    }

    return {
      options: {
        chart: {
          type: 'line',
          height: 350,
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            },
          },
          animations: {
            enabled: true,
          },
          background: 'transparent',
        },
        stroke: {
          curve: 'smooth',
          width: [3, 2],
        },
        colors: ['#8b5cf6', '#0ea5e9'],
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.3,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 100]
          }
        },
        markers: {
          size: 0,
        },
        grid: {
          borderColor: '#383838',
        },
        xaxis: {
          categories: dates,
          labels: {
            style: {
              colors: '#888',
            },
          },
          tooltip: {
            enabled: false,
          }
        },
        yaxis: {
          title: {
            text: 'Price (USD)',
            style: {
              color: '#888'
            }
          },
          labels: {
            formatter: function(val: number) {
              return formatPrice(val).replace('$', '');
            },
            style: {
              colors: '#888',
            }
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function(value: number) {
              return formatPrice(value);
            }
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          labels: {
            colors: '#888'
          }
        },
        title: {
          text: '30-Day Price History',
          align: 'left',
          style: {
            fontSize: '16px',
            color: '#888'
          }
        }
      },
      series: [
        {
          name: "Price",
          data: prices
        },
        ...(smaData.length > 0 ? [{
          name: "7-Day MA",
          data: smaData
        }] : [])
      ],
    };
  };

  // Function to prepare trading volume chart data
  const prepareVolumeChartData = () => {
    // Check if selectedCrypto exists and if it has the volumeHistory property
    // with the correct type using a type guard
    if (!selectedCrypto) return null;
    
    // Type guard to check if volumeHistory property exists and is an array
    const hasVolumeHistory = (
      crypto: any
    ): crypto is CryptoDetail & { volumeHistory: Array<{ timestamp: number, volume: number }> } => {
      return (
        'volumeHistory' in crypto && 
        Array.isArray(crypto.volumeHistory) && 
        crypto.volumeHistory.length > 0
      );
    };

    if (!hasVolumeHistory(selectedCrypto)) return null;

    // Sort by timestamp to ensure chronological order
    const volumeData = [...selectedCrypto.volumeHistory].sort((a, b) => a.timestamp - b.timestamp);

    const dates = volumeData.map(item => formatDate(item.timestamp));
    const volumes = volumeData.map(item => item.volume);

    return {
      options: {
        chart: {
          type: 'bar',
          height: 250,
          toolbar: {
            show: false,
          },
          background: 'transparent',
        },
        plotOptions: {
          bar: {
            columnWidth: '60%',
            colors: {
              ranges: [{
                from: 0,
                to: Infinity,
                color: '#0ea5e9'
              }]
            }
          }
        },
        dataLabels: {
          enabled: false,
        },
        grid: {
          borderColor: '#383838',
        },
        xaxis: {
          categories: dates,
          labels: {
            style: {
              colors: '#888',
            },
          }
        },
        yaxis: {
          title: {
            text: 'Volume (USD)',
            style: {
              color: '#888'
            }
          },
          labels: {
            formatter: function(val: number) {
              if (val >= 1_000_000_000) {
                return '$' + (val / 1_000_000_000).toFixed(1) + 'B';
              } else if (val >= 1_000_000) {
                return '$' + (val / 1_000_000).toFixed(1) + 'M';
              } else if (val >= 1_000) {
                return '$' + (val / 1_000).toFixed(1) + 'K';
              }
              return '$' + val.toFixed(0);
            },
            style: {
              colors: '#888',
            }
          },
        },
        tooltip: {
          y: {
            formatter: function(value: number) {
              return formatMarketCap(value);
            }
          }
        },
        title: {
          text: 'Trading Volume',
          align: 'left',
          style: {
            fontSize: '16px',
            color: '#888'
          }
        }
      },
      series: [{
        name: 'Volume',
        data: volumes
      }],
    };
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

  const priceChartData = preparePriceChartData();
  const volumeChartData = prepareVolumeChartData();
  
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Price History</h2>
            
            {priceChartData ? (
              <div className="mt-4">
                <TransparentApexCharts
                  type="area"
                  height={350}
                  options={priceChartData.options}
                  series={priceChartData.series}
                />
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 h-64 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No price history data available
                </p>
              </div>
            )}

            {/* Volume Chart */}
            {volumeChartData && (
              <div className="mt-8">
                <TransparentApexCharts
                  type="bar"
                  height={250}
                  options={volumeChartData.options}
                  series={volumeChartData.series}
                />
              </div>
            )}

            {/* Market Stats Table */}
            {selectedCrypto && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Market Statistics</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr>
                        <td className="py-3 pl-4 pr-3 text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap Rank</td>
                        <td className="py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-white">
                          {(selectedCrypto as any).marketCapRank ? `#${(selectedCrypto as any).marketCapRank}` : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pl-4 pr-3 text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</td>
                        <td className="py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-white">{formatMarketCap(selectedCrypto.marketCap)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 pl-4 pr-3 text-sm font-medium text-gray-500 dark:text-gray-400">24h Trading Volume</td>
                        <td className="py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-white">{formatMarketCap(selectedCrypto.volume24h || 0)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 pl-4 pr-3 text-sm font-medium text-gray-500 dark:text-gray-400">Fully Diluted Valuation</td>
                        <td className="py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-white">
                          {(selectedCrypto as any).fullyDilutedValuation 
                            ? formatMarketCap((selectedCrypto as any).fullyDilutedValuation) 
                            : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pl-4 pr-3 text-sm font-medium text-gray-500 dark:text-gray-400">Circulating Supply</td>
                        <td className="py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-white">{selectedCrypto.circulatingSupply?.toLocaleString() || 'N/A'} {(cryptoDetail.symbol || '').toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td className="py-3 pl-4 pr-3 text-sm font-medium text-gray-500 dark:text-gray-400">Total Supply</td>
                        <td className="py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-white">{selectedCrypto.totalSupply?.toLocaleString() || 'N/A'} {(cryptoDetail.symbol || '').toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td className="py-3 pl-4 pr-3 text-sm font-medium text-gray-500 dark:text-gray-400">Max Supply</td>
                        <td className="py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-white">{selectedCrypto.maxSupply?.toLocaleString() || 'Unlimited'} {(cryptoDetail.symbol || '').toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td className="py-3 pl-4 pr-3 text-sm font-medium text-gray-500 dark:text-gray-400">All-Time High</td>
                        <td className="py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-white">{selectedCrypto.allTimeHigh ? formatPrice(selectedCrypto.allTimeHigh) : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 pl-4 pr-3 text-sm font-medium text-gray-500 dark:text-gray-400">All-Time Low</td>
                        <td className="py-3 pl-3 pr-4 text-sm text-gray-900 dark:text-white">
                          {(selectedCrypto as any).allTimeLow 
                            ? formatPrice((selectedCrypto as any).allTimeLow) 
                            : 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Price History</h2>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Detailed price history data is unavailable. Please check your API connection or retry.
              </p>
              <button 
                onClick={handleRetry}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
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