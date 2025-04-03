import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toggleFavoriteCity } from '@/redux/slices/preferencesSlice';
import { WeatherData } from '@/types';
import Card from '../shared/Card';

interface WeatherCardProps {
  weather: WeatherData;
  isFavorite?: boolean;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, isFavorite: propIsFavorite }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const favoriteCities = useAppSelector(state => state.preferences.favoriteCities);
  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : favoriteCities.includes(weather.cityId);

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFavoriteCity(weather.cityId));
  };

  const handleCardClick = () => {
    router.push(`/weather/${weather.cityId}`);
  };

  return (
    <Card
      className="h-full cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{weather.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{weather.country}</p>
        </div>
        <button 
          onClick={handleFavoriteToggle}
          className="focus:outline-none"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-500">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 hover:text-yellow-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          )}
        </button>
      </div>
      <div className="mt-4 flex items-center">
        <img 
          src={getWeatherIcon(weather.icon)} 
          alt={weather.conditions} 
          className="w-16 h-16"
        />
        <div className="ml-4">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(weather.temperature)}°C</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{weather.conditions}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{weather.humidity}%</p>
        </div>
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {new Date(weather.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button 
          onClick={handleCardClick}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center justify-center w-full"
        >
          <span>See detailed forecast</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </Card>
  );
};

export default WeatherCard; 