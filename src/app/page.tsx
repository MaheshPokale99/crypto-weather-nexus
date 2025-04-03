'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchWeatherData } from '@/redux/slices/weatherSlice';
import { fetchCryptoData } from '@/redux/slices/cryptoSlice';
import { fetchNewsData } from '@/redux/slices/newsSlice';
import { addNotification } from '@/redux/slices/notificationsSlice';
import { webSocketService } from '@/utils/websocket';
import MainLayout from '@/components/layout/MainLayout';
import WeatherSection from '@/components/home/WeatherSection';
import CryptoSection from '@/components/home/CryptoSection';
import NewsSection from '@/components/home/NewsSection';

export default function Home() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Initial data fetching
    dispatch(fetchWeatherData());
    dispatch(fetchCryptoData());
    dispatch(fetchNewsData());
    
    // Initialize WebSocket service
    webSocketService.init();
    
    // Set up auto refresh
    const refreshInterval = setInterval(() => {
      dispatch(fetchWeatherData());
      dispatch(fetchCryptoData());
      dispatch(fetchNewsData('crypto'));
    }, 60000); // Refresh every 60 seconds
    
    // Add demo notifications
    setTimeout(() => {
      dispatch(addNotification({
        type: 'welcome',
        title: 'Welcome to Crypto Weather Nexus',
        message: 'Stay updated with the latest cryptocurrency, weather, and news.',
        timestamp: Date.now(),
      }));
    }, 1000);
    
    setTimeout(() => {
      dispatch(addNotification({
        type: 'weather_alert',
        title: 'Weather Alert in London',
        message: 'Heavy rain expected in the next 24 hours.',
        timestamp: Date.now(),
      }));
    }, 3000);
    
    setTimeout(() => {
      dispatch(addNotification({
        type: 'price_alert',
        title: 'Bitcoin price alert',
        message: 'Bitcoin price has increased by 2% in the last hour.',
        timestamp: Date.now(),
      }));
    }, 5000);

    // Clean up on unmount
    return () => {
      clearInterval(refreshInterval);
      webSocketService.disconnect();
    };
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 p-6 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-2">Welcome to Crypto Weather Nexus</h2>
          <p className="mb-4">Your one-stop dashboard for cryptocurrency, weather updates, and relevant news.</p>
          <div className="flex space-x-3">
            <a 
              href="/crypto" 
              className="px-4 py-2 bg-white text-indigo-700 font-medium rounded-md hover:bg-gray-100 transition duration-150 ease-in-out"
            >
              Explore Crypto
            </a>
            <a 
              href="/weather" 
              className="px-4 py-2 border border-white text-white font-medium rounded-md hover:bg-white hover:bg-opacity-10 transition duration-150 ease-in-out"
            >
              Check Weather
            </a>
          </div>
        </div>
        
        {/* Weather Section */}
        <WeatherSection />
        
        {/* Crypto Section */}
        <CryptoSection />
        
        {/* News Section */}
        <NewsSection />
      </div>
    </MainLayout>
  );
}
