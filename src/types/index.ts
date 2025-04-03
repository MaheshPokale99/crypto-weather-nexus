// Weather Types
export interface WeatherData {
  cityId: string;
  name: string;
  country: string;
  temperature: number;
  humidity: number;
  conditions: string;
  description?: string;
  icon: string;
  windSpeed?: number;
  pressure?: number;
  visibility?: number;
  timestamp: number;
}

export interface WeatherHistoryData {
  timestamp: number;
  temperature: number;
  humidity: number;
  conditions: string;
  description?: string;
  icon?: string;
  windSpeed?: number;
  pressure?: number;
}

export interface CityDetail {
  id: string;
  name: string;
  country: string;
  timezone?: number;
  coordinates?: {
    lat: number;
    lon: number;
  };
  currentWeather?: {
    temperature: number;
    feelsLike?: number;
    humidity: number;
    conditions: string;
    description?: string;
    icon: string;
    windSpeed?: number;
    pressure?: number;
    visibility?: number;
    sunrise?: number;
    sunset?: number;
  };
  history: WeatherHistoryData[];
}

// Crypto Types
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  timestamp: number;
}

export interface CryptoHistoryData {
  price: number;
  timestamp: number;
}

export interface CryptoDetail {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  allTimeHigh: number;
  history: CryptoHistoryData[];
}

// News Types
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

// User Preferences
export interface UserPreferences {
  favoriteCities: string[];
  favoriteCryptos: string[];
  theme: 'light' | 'dark' | 'system';
}

// Notifications
export interface Notification {
  id: string;
  type: 'price_alert' | 'weather_alert' | 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// App State
export interface AppState {
  weather: WeatherState;
  crypto: CryptoState;
  news: NewsState;
  preferences: UserPreferences;
  notifications: NotificationsState;
}

export interface WeatherState {
  cities: WeatherData[];
  selectedCity: CityDetail | null;
  loading: boolean;
  error: string | null;
  refreshInterval: number | null;
}

export interface CryptoState {
  cryptos: CryptoData[];
  selectedCrypto: CryptoDetail | null;
  loading: boolean;
  error: string | null;
  refreshInterval: number | null;
}

export interface NewsState {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  currentCategory: string;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
} 