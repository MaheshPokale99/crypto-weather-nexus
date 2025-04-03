import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">About</h3>
            <div className="mt-4 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-300">
                CryptoWeather Nexus provides real-time weather data, cryptocurrency prices, and news headlines in one convenient dashboard.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/weather" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Weather
                </Link>
              </li>
              <li>
                <Link href="/crypto" className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Crypto
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Sources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a 
                  href="https://openweathermap.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  OpenWeatherMap
                </a>
              </li>
              <li>
                <a 
                  href="https://coincap.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  CoinCap API
                </a>
              </li>
              <li>
                <a 
                  href="https://www.coingecko.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  CoinGecko API
                </a>
              </li>
              <li>
                <a 
                  href="https://newsdata.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  NewsData.io
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-base text-gray-500 dark:text-gray-400 text-center">
            &copy; {new Date().getFullYear()} CryptoWeather Nexus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 