'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import WeatherSection from '@/components/home/WeatherSection';
import CryptoSection from '@/components/home/CryptoSection';
import NewsSection from '@/components/home/NewsSection';
import { useAppDispatch } from '@/redux/hooks';
import { startWeatherDataRefresh } from '@/redux/slices/weatherSlice';
import { startCryptoDataRefresh } from '@/redux/slices/cryptoSlice';
import { fetchNewsData } from '@/redux/slices/newsSlice';
import { addNotification } from '@/redux/slices/notificationsSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Start data refresh every 60 seconds
    dispatch(startWeatherDataRefresh(60000));
    dispatch(startCryptoDataRefresh(60000));
    dispatch(fetchNewsData('crypto'));
    
    // Demo notifications
    dispatch(addNotification({
      type: 'info',
      title: 'Welcome to Crypto Weather Nexus',
      message: 'Stay updated with the latest crypto and weather information.',
      timestamp: Date.now()
    }));
    
    // Add some demo notifications with delay
    setTimeout(() => {
      dispatch(addNotification({
        type: 'weather_alert',
        title: 'Weather Alert: New York',
        message: 'Expect rain in New York City in the next 24 hours.',
        timestamp: Date.now()
      }));
    }, 2000);
    
    setTimeout(() => {
      dispatch(addNotification({
        type: 'price_alert',
        title: 'Price Alert: Bitcoin',
        message: 'Bitcoin price has increased by 2.5% in the last hour.',
        timestamp: Date.now()
      }));
    }, 4000);
  }, [dispatch]);
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 p-6 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-2">Welcome to Crypto Weather Nexus</h2>
          <p className="mb-4">Your one-stop dashboard for cryptocurrency, weather updates, and relevant news.</p>
          <div className="flex space-x-3">
            <Link 
              href="/crypto" 
              className="px-4 py-2 bg-white text-indigo-700 font-medium rounded-md hover:bg-gray-100 transition duration-150 ease-in-out"
            >
              Explore Crypto
            </Link>
            <Link 
              href="/weather" 
              className="px-4 py-2 border border-white text-white font-medium rounded-md hover:bg-white hover:bg-opacity-10 transition duration-150 ease-in-out"
            >
              Check Weather
            </Link>
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
