import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  temperatureUnit: 'celsius' | 'fahrenheit';
  favoriteCities: string[]; // City IDs
  favoriteCryptos: string[]; // Crypto IDs
  notificationsEnabled: boolean;
  refreshInterval: number; // in milliseconds
}

const initialState: UserPreferences = {
  theme: 'system',
  temperatureUnit: 'celsius',
  favoriteCities: [],
  favoriteCryptos: [],
  notificationsEnabled: true,
  refreshInterval: 60000, // 1 minute
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    updateTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    updateTemperatureUnit: (state, action: PayloadAction<'celsius' | 'fahrenheit'>) => {
      state.temperatureUnit = action.payload;
    },
    toggleFavoriteCity: (state, action: PayloadAction<string>) => {
      const cityId = action.payload;
      const index = state.favoriteCities.indexOf(cityId);
      if (index >= 0) {
        state.favoriteCities.splice(index, 1);
      } else {
        state.favoriteCities.push(cityId);
      }
    },
    toggleFavoriteCrypto: (state, action: PayloadAction<string>) => {
      const cryptoId = action.payload;
      const index = state.favoriteCryptos.indexOf(cryptoId);
      if (index >= 0) {
        state.favoriteCryptos.splice(index, 1);
      } else {
        state.favoriteCryptos.push(cryptoId);
      }
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    updateRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
  },
});

export const { 
  updateTheme, 
  updateTemperatureUnit, 
  toggleFavoriteCity, 
  toggleFavoriteCrypto,
  toggleNotifications,
  updateRefreshInterval
} = preferencesSlice.actions;

export default preferencesSlice.reducer; 