import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { WeatherData, WeatherState, CityDetail } from '@/types';
import type { RootState } from '../store';

const initialState: WeatherState = {
  cities: [],
  selectedCity: null,
  loading: false,
  error: null,
  refreshInterval: null,
};

// Default cities to fetch weather data for
const defaultCities = [
  { id: '5128581', name: 'New York' },
  { id: '2643743', name: 'London' },
  { id: '1850147', name: 'Tokyo' },
  { id: '2988507', name: 'Paris' },
  { id: '1796236', name: 'Shanghai' },
];

// OpenWeather API configuration
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Define type for forecast data item
interface ForecastDataItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

// Mock data for fallback when API fails
const mockWeatherData: WeatherData[] = [
  {
    cityId: '5128581',
    name: 'New York',
    country: 'US',
    temperature: 22.5,
    humidity: 65,
    conditions: 'Clear',
    description: 'clear sky',
    icon: '01d',
    windSpeed: 5.2,
    pressure: 1012,
    visibility: 10000,
    timestamp: Date.now(),
  },
  {
    cityId: '2643743',
    name: 'London',
    country: 'GB',
    temperature: 16.8,
    humidity: 72,
    conditions: 'Clouds',
    description: 'scattered clouds',
    icon: '03d',
    windSpeed: 4.1,
    pressure: 1009,
    visibility: 9000,
    timestamp: Date.now(),
  },
  {
    cityId: '1850147',
    name: 'Tokyo',
    country: 'JP',
    temperature: 28.2,
    humidity: 58,
    conditions: 'Rain',
    description: 'light rain',
    icon: '10d',
    windSpeed: 3.6,
    pressure: 1015,
    visibility: 8000,
    timestamp: Date.now(),
  },
  {
    cityId: '2988507',
    name: 'Paris',
    country: 'FR',
    temperature: 19.5,
    humidity: 63,
    conditions: 'Clouds',
    description: 'broken clouds',
    icon: '04d',
    windSpeed: 3.9,
    pressure: 1011,
    visibility: 10000,
    timestamp: Date.now(),
  },
  {
    cityId: '1796236',
    name: 'Shanghai',
    country: 'CN',
    temperature: 26.7,
    humidity: 70,
    conditions: 'Haze',
    description: 'haze',
    icon: '50d',
    windSpeed: 4.8,
    pressure: 1010,
    visibility: 5000,
    timestamp: Date.now(),
  },
];

// Mock forecast data for fallback
const mockForecastData = [
  {
    timestamp: Date.now() - 3600000 * 24,
    temperature: 21.5,
    humidity: 68,
    conditions: 'Clear',
    description: 'clear sky',
    icon: '01d',
    windSpeed: 4.8,
    pressure: 1013,
  },
  {
    timestamp: Date.now() - 3600000 * 18,
    temperature: 20.1,
    humidity: 70,
    conditions: 'Clouds',
    description: 'few clouds',
    icon: '02n',
    windSpeed: 3.2,
    pressure: 1012,
  },
  {
    timestamp: Date.now() - 3600000 * 12,
    temperature: 19.2,
    humidity: 75,
    conditions: 'Clouds',
    description: 'scattered clouds',
    icon: '03n',
    windSpeed: 2.5,
    pressure: 1011,
  },
  {
    timestamp: Date.now() - 3600000 * 6,
    temperature: 21.8,
    humidity: 65,
    conditions: 'Clear',
    description: 'clear sky',
    icon: '01d',
    windSpeed: 4.0,
    pressure: 1012,
  },
  {
    timestamp: Date.now(),
    temperature: 23.5,
    humidity: 60,
    conditions: 'Clear',
    description: 'clear sky',
    icon: '01d',
    windSpeed: 5.2,
    pressure: 1012,
  },
  {
    timestamp: Date.now() + 3600000 * 6,
    temperature: 22.7,
    humidity: 62,
    conditions: 'Clouds',
    description: 'few clouds',
    icon: '02d',
    windSpeed: 4.8,
    pressure: 1011,
  },
  {
    timestamp: Date.now() + 3600000 * 12,
    temperature: 19.8,
    humidity: 70,
    conditions: 'Clouds',
    description: 'scattered clouds',
    icon: '03n',
    windSpeed: 3.5,
    pressure: 1010,
  },
  {
    timestamp: Date.now() + 3600000 * 18,
    temperature: 18.2,
    humidity: 75,
    conditions: 'Clear',
    description: 'clear sky',
    icon: '01n',
    windSpeed: 2.8,
    pressure: 1012,
  },
];

// Helper function to create a mock city detail
const createMockCityDetail = (cityId: string): CityDetail => {
  const cityData = mockWeatherData.find(city => city.cityId === cityId) || mockWeatherData[0];
  
  return {
    id: cityId,
    name: cityData.name,
    country: cityData.country,
    timezone: 0,
    coordinates: {
      lat: 0,
      lon: 0
    },
    currentWeather: {
      temperature: cityData.temperature,
      feelsLike: cityData.temperature - 2,
      humidity: cityData.humidity,
      conditions: cityData.conditions,
      description: cityData.description,
      icon: cityData.icon,
      windSpeed: cityData.windSpeed,
      pressure: cityData.pressure,
      visibility: cityData.visibility,
      sunrise: Date.now() - 21600000, // 6 hours ago
      sunset: Date.now() + 21600000,  // 6 hours from now
    },
    history: mockForecastData,
  };
};

export const searchCityByName = createAsyncThunk<WeatherData, string, { rejectValue: string }>(
  'weather/searchCityByName',
  async (cityName: string, { rejectWithValue }) => {
    try {
      // Check if API key is available in environment variables
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.warn('OpenWeather API key is missing.');
        return rejectWithValue('API key not found. Please provide a valid OpenWeather API key.');
      }
      
      try {
        const response = await axios.get(`${API_BASE_URL}/weather`, {
          params: {
            q: cityName,
            appid: apiKey,
            units: 'metric'
          }
        });
        
        const data = response.data;
        return {
          cityId: data.id.toString(),
          name: data.name,
          country: data.sys.country,
          temperature: data.main.temp,
          humidity: data.main.humidity,
          conditions: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          windSpeed: data.wind.speed,
          pressure: data.main.pressure,
          visibility: data.visibility,
          timestamp: Date.now(),
        } as WeatherData;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Handle specific error codes
          if (error.response?.status === 401 || error.response?.status === 403) {
            return rejectWithValue('API key is invalid or unauthorized. Please check your OpenWeather API key.');
          }
          
          if (error.response?.status === 404) {
            return rejectWithValue(`City "${cityName}" not found. Please try another city name.`);
          }
          
          if (error.response?.status === 429) {
            return rejectWithValue('OpenWeather API rate limit exceeded. Please try again later.');
          }
          
          console.error('Error searching for city:', error.message);
          return rejectWithValue(`Failed to search for "${cityName}". ${error.message}`);
        }
        
        console.error('Error searching for city:', error);
        return rejectWithValue(`Failed to search for "${cityName}". Please try again later.`);
      }
    } catch (error) {
      console.error('Unexpected error in searchCityByName:', error);
      return rejectWithValue(`An unexpected error occurred while searching for "${cityName}".`);
    }
  }
);

export const fetchWeatherData = createAsyncThunk<WeatherData[], void, { rejectValue: string }>(
  'weather/fetchWeatherData',
  async (_, { rejectWithValue }) => {
    try {
      // Check if API key is available in environment variables
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.warn('OpenWeather API key is missing.');
        return rejectWithValue('API key not found. Please provide a valid OpenWeather API key.');
      }
      
      const weatherPromises = defaultCities.map(async (city) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/weather`, {
            params: {
              id: city.id,
              appid: apiKey,
              units: 'metric'
            }
          });
          
          const data = response.data;
          return {
            cityId: city.id,
            name: data.name,
            country: data.sys.country,
            temperature: data.main.temp,
            humidity: data.main.humidity,
            conditions: data.weather[0].main,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            windSpeed: data.wind.speed,
            pressure: data.main.pressure,
            visibility: data.visibility,
            timestamp: Date.now(),
          } as WeatherData;
        } catch (err) {
          if (axios.isAxiosError(err)) {
            console.error(`Failed to fetch weather for ${city.name}:`, err.message);
            throw err; // Rethrow to be caught by the outer catch
          }
          throw err;
        }
      });
      
      try {
        const results = await Promise.all(weatherPromises);
        return results;
      } catch (fetchError) {
        if (axios.isAxiosError(fetchError)) {
          // Handle specific error codes
          if (fetchError.response?.status === 401 || fetchError.response?.status === 403) {
            return rejectWithValue('API key is invalid or unauthorized. Please check your OpenWeather API key.');
          }
          
          if (fetchError.response?.status === 429) {
            return rejectWithValue('OpenWeather API rate limit exceeded. Please try again later.');
          }
        }
        
        return rejectWithValue('Unable to fetch weather data. Please check your connection and try again.');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return rejectWithValue('An unexpected error occurred while fetching weather data.');
    }
  }
);

export const fetchCityDetail = createAsyncThunk<CityDetail, string, { rejectValue: string }>(
  'weather/fetchCityDetail',
  async (cityId: string, { rejectWithValue }) => {
    try {
      // Check if API key is available in environment variables
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.warn('OpenWeather API key is missing.');
        return rejectWithValue('API key not found. Please provide a valid OpenWeather API key.');
      }
      
      try {
        // Get current weather data
        const currentResponse = await axios.get(`${API_BASE_URL}/weather`, {
          params: {
            id: cityId,
            appid: apiKey,
            units: 'metric'
          }
        });
        
        // Get 5-day forecast data (includes historical data points)
        const forecastResponse = await axios.get(`${API_BASE_URL}/forecast`, {
          params: {
            id: cityId,
            appid: apiKey,
            units: 'metric'
          }
        });
        
        // Create history array from the forecast data
        // OpenWeather's free API provides forecast in 3-hour steps
        const historyData = forecastResponse.data.list.map((item: ForecastDataItem) => ({
          timestamp: item.dt * 1000, // Convert to milliseconds
          temperature: item.main.temp,
          humidity: item.main.humidity,
          conditions: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          windSpeed: item.wind.speed,
          pressure: item.main.pressure,
        }));
        
        return {
          id: cityId,
          name: currentResponse.data.name,
          country: currentResponse.data.sys.country,
          timezone: currentResponse.data.timezone,
          coordinates: {
            lat: currentResponse.data.coord.lat,
            lon: currentResponse.data.coord.lon
          },
          currentWeather: {
            temperature: currentResponse.data.main.temp,
            feelsLike: currentResponse.data.main.feels_like,
            humidity: currentResponse.data.main.humidity,
            conditions: currentResponse.data.weather[0].main,
            description: currentResponse.data.weather[0].description,
            icon: currentResponse.data.weather[0].icon,
            windSpeed: currentResponse.data.wind.speed,
            pressure: currentResponse.data.main.pressure,
            visibility: currentResponse.data.visibility,
            sunrise: currentResponse.data.sys.sunrise * 1000, // Convert to milliseconds
            sunset: currentResponse.data.sys.sunset * 1000,   // Convert to milliseconds
          },
          history: historyData,
        };
      } catch (err) {
        if (axios.isAxiosError(err)) {
          // Handle specific error codes
          if (err.response?.status === 401 || err.response?.status === 403) {
            return rejectWithValue('API key is invalid or unauthorized. Please check your OpenWeather API key.');
          }
          
          if (err.response?.status === 404) {
            return rejectWithValue(`City with ID '${cityId}' not found. Please check the ID and try again.`);
          }
          
          if (err.response?.status === 429) {
            return rejectWithValue('OpenWeather API rate limit exceeded. Please try again later.');
          }
        }
        
        console.error('Error fetching city detail:', err);
        return rejectWithValue('Failed to fetch city details. The API may be unavailable.');
      }
    } catch (error) {
      console.error('Error in fetchCityDetail flow:', error);
      return rejectWithValue('An unexpected error occurred while fetching city details.');
    }
  }
);

// Start periodic refresh
export const startWeatherDataRefresh = createAsyncThunk(
  'weather/startDataRefresh',
  async (intervalMs: number = 60000, { dispatch }) => {
    // Initial fetch
    await dispatch(fetchWeatherData());
    
    // Set up interval for periodic refresh
    const intervalId = window.setInterval(() => {
      dispatch(fetchWeatherData());
    }, intervalMs);
    
    return intervalId;
  }
);

// Stop periodic refresh
export const stopWeatherDataRefresh = createAsyncThunk(
  'weather/stopDataRefresh',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { refreshInterval } = state.weather;
    
    if (refreshInterval) {
      window.clearInterval(refreshInterval);
    }
    
    return null;
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    clearSelectedCity: (state) => {
      state.selectedCity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action: PayloadAction<WeatherData[]>) => {
        state.cities = action.payload;
        state.loading = false;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchCityByName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCityByName.fulfilled, (state, action: PayloadAction<WeatherData>) => {
        // Check if the city already exists in the state
        const cityExists = state.cities.some(city => city.cityId === action.payload.cityId);
        
        // If the city doesn't exist, add it to the state
        if (!cityExists) {
          state.cities.push(action.payload);
        } else {
          // If the city exists, update its data
          state.cities = state.cities.map(city => 
            city.cityId === action.payload.cityId ? action.payload : city
          );
        }
        state.loading = false;
      })
      .addCase(searchCityByName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCityDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCityDetail.fulfilled, (state, action: PayloadAction<CityDetail>) => {
        state.selectedCity = action.payload;
        state.loading = false;
      })
      .addCase(fetchCityDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(startWeatherDataRefresh.fulfilled, (state, action) => {
        state.refreshInterval = action.payload;
      })
      .addCase(stopWeatherDataRefresh.fulfilled, (state) => {
        state.refreshInterval = null;
      });
  },
});

export const { clearSelectedCity } = weatherSlice.actions;
export default weatherSlice.reducer; 