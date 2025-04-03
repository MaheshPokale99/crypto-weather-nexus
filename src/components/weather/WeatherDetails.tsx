import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { CityDetail } from '@/types';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface WeatherDetailsProps {
  city: CityDetail;
  isFavorite: boolean;
}

const WeatherDetails: React.FC<WeatherDetailsProps> = ({ city, isFavorite }) => {
  const [chartView, setChartView] = useState<'temperature' | 'humidity'>('temperature');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const chartData = {
    labels: city.history.map(point => formatDate(point.timestamp)),
    datasets: [
      {
        label: chartView === 'temperature' ? 'Temperature (°C)' : 'Humidity (%)',
        data: city.history.map(point => 
          chartView === 'temperature' ? point.temperature : point.humidity
        ),
        borderColor: chartView === 'temperature' ? 'rgb(255, 99, 132)' : 'rgb(53, 162, 235)',
        backgroundColor: chartView === 'temperature' ? 'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: chartView === 'temperature' ? 'Temperature History' : 'Humidity History',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      }
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-4">
              <img 
                src={`https://openweathermap.org/img/wn/${city.currentWeather?.icon || '01d'}@2x.png`}
                alt={city.currentWeather?.conditions || 'Weather icon'}
                className="w-16 h-16"
              />
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
                  {city.name}, {city.country}
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
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {city.currentWeather?.conditions} - {city.currentWeather?.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {city.currentWeather?.temperature.toFixed(1)}°C
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-300">
              Feels like: {city.currentWeather?.feelsLike?.toFixed(1)}°C
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Humidity</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{city.currentWeather?.humidity}%</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Wind Speed</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{city.currentWeather?.windSpeed} m/s</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Pressure</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{city.currentWeather?.pressure} hPa</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Visibility</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {city.currentWeather?.visibility ? (city.currentWeather.visibility / 1000).toFixed(1) : 'N/A'} km
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Historical Data</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartView('temperature')}
              className={`px-3 py-1 text-sm rounded ${
                chartView === 'temperature'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setChartView('humidity')}
              className={`px-3 py-1 text-sm rounded ${
                chartView === 'humidity'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Humidity
            </button>
          </div>
        </div>
        
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Forecast Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Condition
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Temperature
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Humidity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Wind
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {city.history.map((point, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(point.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <img 
                        src={`https://openweathermap.org/img/wn/${point.icon || '01d'}.png`}
                        alt={point.conditions}
                        className="w-8 h-8 mr-2"
                      />
                      {point.conditions}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {point.temperature.toFixed(1)}°C
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {point.humidity}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {point.windSpeed?.toFixed(1) || 'N/A'} m/s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default WeatherDetails; 