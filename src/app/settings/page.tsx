'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  updateTemperatureUnit, 
  updateTheme, 
  toggleNotifications,
  updateRefreshInterval
} from '@/redux/slices/preferencesSlice';
import MainLayout from '@/components/layout/MainLayout';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { 
    temperatureUnit, 
    theme, 
    notificationsEnabled,
    refreshInterval 
  } = useAppSelector(state => state.preferences);
  
  const [isSaved, setIsSaved] = useState(false);
  
  // Apply theme to the document when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme class
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  const handleTemperatureUnitChange = (unit: 'celsius' | 'fahrenheit') => {
    dispatch(updateTemperatureUnit(unit));
    showSavedIndicator();
  };
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(updateTheme(newTheme));
    showSavedIndicator();
  };
  
  const handleNotificationToggle = () => {
    dispatch(toggleNotifications());
    showSavedIndicator();
  };
  
  const handleRefreshIntervalChange = (interval: number) => {
    dispatch(updateRefreshInterval(interval));
    showSavedIndicator();
  };
  
  const showSavedIndicator = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          
          {isSaved && (
            <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 py-1 px-3 rounded-full text-sm font-medium animate-fade-in-out">
              Settings saved
            </div>
          )}
        </div>
        
        {/* Theme Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Display Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="flex space-x-4">
                {['light', 'dark', 'system'].map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => handleThemeChange(themeOption as 'light' | 'dark' | 'system')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      theme === themeOption
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current theme
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </span>
            </div>
          </div>
        </section>
        
        {/* Weather Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Weather Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature Unit
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleTemperatureUnitChange('celsius')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    temperatureUnit === 'celsius'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  onClick={() => handleTemperatureUnitChange('fahrenheit')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    temperatureUnit === 'fahrenheit'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Data Refresh Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Refresh Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto-refresh Interval
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={300000}>5 minutes</option>
                <option value={600000}>10 minutes</option>
                <option value={1800000}>30 minutes</option>
                <option value={0}>Manual refresh only</option>
              </select>
            </div>
          </div>
        </section>
        
        {/* Notification Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable notifications
              </span>
              <button
                onClick={handleNotificationToggle}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                role="switch"
                aria-checked={notificationsEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enable notifications for important updates, price alerts, and weather warnings.
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
} 