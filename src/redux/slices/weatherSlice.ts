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

export const searchCityByName = createAsyncThunk(
  'weather/searchCityByName',
  async (cityName: string, { rejectWithValue }) => {
    try {
      // Check if API key is available in environment variables
      if (!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
        return rejectWithValue('OpenWeather API key is missing. Please add it to your environment variables.');
      }
      
      const response = await axios.get(`${API_BASE_URL}/weather`, {
        params: {
          q: cityName,
          appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
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
      console.error('Error searching for city:', error);
      return rejectWithValue(`City "${cityName}" not found. Please try another city name.`);
    }
  }
);

export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async (_, { rejectWithValue }) => {
    try {
      // Check if API key is available in environment variables
      if (!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
        return rejectWithValue('OpenWeather API key is missing. Please add it to your environment variables.');
      }
      
      const weatherPromises = defaultCities.map(async (city) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/weather`, {
            params: {
              id: city.id,
              appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
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
          };
        } catch (err) {
          console.error(`Failed to fetch weather for ${city.name}:`, err);
          // Return null for this city, we'll filter these out later
          return null;
        }
      });
      
      const results = await Promise.all(weatherPromises);
      // Filter out any null values (failed requests)
      const validResults = results.filter(result => result !== null) as WeatherData[];
      
      if (validResults.length === 0) {
        return rejectWithValue('Failed to fetch weather data for any city. Please try again later.');
      }
      
      return validResults;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return rejectWithValue('An unexpected error occurred while fetching weather data.');
    }
  }
);

export const fetchCityDetail = createAsyncThunk(
  'weather/fetchCityDetail',
  async (cityId: string, { rejectWithValue }) => {
    try {
      // Check if API key is available in environment variables
      if (!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
        return rejectWithValue('OpenWeather API key is missing. Please add it to your environment variables.');
      }
      
      // Get current weather data
      const currentResponse = await axios.get(`${API_BASE_URL}/weather`, {
        params: {
          id: cityId,
          appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
          units: 'metric'
        }
      });
      
      // Get 5-day forecast data (includes historical data points)
      const forecastResponse = await axios.get(`${API_BASE_URL}/forecast`, {
        params: {
          id: cityId,
          appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
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
    } catch (error) {
      console.error('Error fetching city detail:', error);
      return rejectWithValue('Failed to fetch detailed weather data for this city.');
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