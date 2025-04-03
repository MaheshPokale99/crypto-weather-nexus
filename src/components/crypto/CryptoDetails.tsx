'use client';

import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { CryptoDetail } from '@/types';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface CryptoDetailsProps {
  crypto: CryptoDetail;
  onFavoriteToggle: () => void;
  isFavorite: boolean;
}

const CryptoDetails: React.FC<CryptoDetailsProps> = ({ crypto, onFavoriteToggle, isFavorite }) => {
  const [chartPeriod, setChartPeriod] = useState<'1d' | '7d' | '30d'>('7d');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: value > 100 ? 0 : value > 1 ? 2 : 6
    }).format(value);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric'
    });
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
  };
  
  // Filter data based on selected period
  const getFilteredData = () => {
    if (!crypto?.history) return { labels: [], prices: [] };
    
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    let filteredHistory;
    
    switch (chartPeriod) {
      case '1d':
        filteredHistory = crypto.history.filter(
          point => point.timestamp >= now - dayInMs
        );
        break;
      case '7d':
        filteredHistory = crypto.history.filter(
          point => point.timestamp >= now - 7 * dayInMs
        );
        break;
      case '30d':
      default:
        filteredHistory = crypto.history;
        break;
    }
    
    // If filtering resulted in too few points, use all data
    if (filteredHistory.length < 2) {
      filteredHistory = crypto.history;
    }
    
    return {
      labels: filteredHistory.map(point => formatDate(point.timestamp)),
      prices: filteredHistory.map(point => point.price),
    };
  };
  
  const chartData = getFilteredData();
  
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Price (USD)',
        data: chartData.prices,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      },
    ],
  };
  
  // Disable linter for this specific line due to Chart.js type complexity
  // @ts-ignore
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Price History (${chartPeriod})`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          // @ts-ignore
          callback: function(value) {
            return formatCurrency(Number(value));
          }
        }
      }
    }
  };
  
  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  // Current time for formatting when last updated isn't available in the data
  const now = new Date();

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-4">
              <img 
                src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png" 
                alt={crypto.name} 
                className="w-16 h-16 rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
                  {crypto.name} <span className="text-gray-500 dark:text-gray-400">{crypto.symbol.toUpperCase()}</span>
                </h1>
                {isFavorite && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-6 h-6 text-yellow-500"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Last updated: {now.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(crypto.price)}
            </div>
            <div className={`text-lg ${getPriceChangeColor(crypto.priceChange24h)}`}>
              {crypto.priceChange24h > 0 ? '+' : ''}
              {crypto.priceChange24h.toFixed(2)}% (24h)
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(crypto.marketCap)}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Volume (24h)</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(crypto.volume24h)}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">All Time High</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(crypto.allTimeHigh)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Circulating Supply</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {formatNumber(crypto.circulatingSupply)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Price History</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartPeriod('1d')}
              className={`px-3 py-1 text-sm rounded ${
                chartPeriod === '1d'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              1D
            </button>
            <button
              onClick={() => setChartPeriod('7d')}
              className={`px-3 py-1 text-sm rounded ${
                chartPeriod === '7d'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setChartPeriod('30d')}
              className={`px-3 py-1 text-sm rounded ${
                chartPeriod === '30d'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              30D
            </button>
          </div>
        </div>
        
        <div className="h-80">
          <Line data={data} options={options} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Supply Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Circulating Supply</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatNumber(crypto.circulatingSupply)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total Supply</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatNumber(crypto.totalSupply)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Max Supply</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {crypto.maxSupply ? formatNumber(crypto.maxSupply) : 'Unlimited'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Price Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Current Price</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(crypto.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">All Time High</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(crypto.allTimeHigh)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Market Cap</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(crypto.marketCap)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">24h Trading Volume</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(crypto.volume24h)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CryptoDetails; 