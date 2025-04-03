import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import axios from 'axios';
import { CryptoState, CryptoData, CryptoDetail } from '@/types';

// State interface extension for local use
interface DetailedCryptoState extends CryptoState {
  lastUpdated: number | null;
}

const initialState: DetailedCryptoState = {
  cryptos: [],
  selectedCrypto: null,
  loading: false,
  error: null,
  refreshInterval: null,
  lastUpdated: null,
};

// CoinGecko API base URL
const API_BASE_URL = 'https://api.coingecko.com/api/v3';
// Check if API key exists
const hasCoinGeckoAPIKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY ? true : false;

// Helper function to get mock crypto data
const getMockCryptoData = (): CryptoData[] => {
  return [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      price: 65000 + (Math.random() * 2000 - 1000),
      priceChange24h: Math.random() * 8 - 4,
      marketCap: 1250000000000,
      timestamp: Date.now(),
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      price: 3500 + (Math.random() * 200 - 100),
      priceChange24h: Math.random() * 10 - 5,
      marketCap: 420000000000,
      timestamp: Date.now(),
    },
    {
      id: 'ripple',
      symbol: 'xrp',
      name: 'XRP',
      price: 0.65 + (Math.random() * 0.1 - 0.05),
      priceChange24h: Math.random() * 12 - 6,
      marketCap: 32000000000,
      timestamp: Date.now(),
    },
    {
      id: 'cardano',
      symbol: 'ada',
      name: 'Cardano',
      price: 0.45 + (Math.random() * 0.08 - 0.04),
      priceChange24h: Math.random() * 9 - 4.5,
      marketCap: 15000000000,
      timestamp: Date.now(),
    },
    {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      price: 145 + (Math.random() * 15 - 7.5),
      priceChange24h: Math.random() * 14 - 7,
      marketCap: 65000000000,
      timestamp: Date.now(),
    }
  ];
};

// Fetch cryptocurrency data from CoinGecko API
export const fetchCryptoData = createAsyncThunk<CryptoData[], void, { rejectValue: string }>(
  'crypto/fetchCryptoData',
  async (_, { rejectWithValue }) => {
    try {
      // Maximum number of retries
      const MAX_RETRIES = 3;
      let retries = 0;
      
      // Function to retry with exponential backoff
      const fetchWithRetry = async () => {
        try {
          // Check if API key is available in environment variables
          if (!process.env.NEXT_PUBLIC_COINGECKO_API_KEY) {
            console.warn('CoinGecko API key is missing.');
            return rejectWithValue('API key not found. Please provide a valid CoinGecko API key.') as any;
          }
          
          try {
            const response = await axios.get(API_BASE_URL + '/coins/markets', {
              params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 10,
                page: 1,
                sparkline: false,
                x_cg_demo_api_key: process.env.NEXT_PUBLIC_COINGECKO_API_KEY
              }
            });
            
            // Define the coin data interface
            interface CoinGeckoApiResponse {
              id: string;
              symbol: string;
              name: string;
              current_price: number;
              price_change_percentage_24h: number | null;
              market_cap: number;
            }
            
            return response.data.map((coin: CoinGeckoApiResponse) => ({
              id: coin.id,
              symbol: coin.symbol,
              name: coin.name,
              price: coin.current_price,
              priceChange24h: coin.price_change_percentage_24h || 0,
              marketCap: coin.market_cap,
              timestamp: Date.now(),
            }));
          } catch (error) {
            console.error('Error fetching crypto data:', error);
            
            // Handle specific error codes
            if (axios.isAxiosError(error)) {
              // If 401 unauthorized or 403 forbidden, API key is invalid
              if (error.response?.status === 401 || error.response?.status === 403) {
                return rejectWithValue('API key is invalid or unauthorized. Please check your CoinGecko API key.') as any;
              }
              
              // If we get a 429 (rate limit) error and haven't exceeded max retries
              if (error.response?.status === 429 && retries < MAX_RETRIES) {
                retries++;
                const delayMs = 1000 * Math.pow(2, retries); // Exponential backoff
                
                console.log(`Rate limit exceeded. Retrying in ${delayMs/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                
                // Try again after waiting
                return fetchWithRetry();
              }
              
              if (error.response?.status === 429) {
                return rejectWithValue('API rate limit exceeded. Please try again later.') as any;
              }
            }
            
            // For any other error
            return rejectWithValue('Unable to fetch cryptocurrency data. Please check your connection and try again.') as any;
          }
        } catch (error) {
          console.error('Unexpected error in fetchWithRetry:', error);
          return rejectWithValue('An unexpected error occurred while fetching cryptocurrency data.') as any;
        }
      };
      
      return await fetchWithRetry();
    } catch (error) {
      console.error('Error in fetchCryptoData:', error);
      return rejectWithValue('An unexpected error occurred while fetching cryptocurrency data.');
    }
  }
);

// Fetch cryptocurrency details including historical data
export const fetchCryptoDetail = createAsyncThunk<CryptoDetail, string, { rejectValue: string }>(
  'crypto/fetchDetail',
  async (cryptoId: string, { rejectWithValue }) => {
    try {
      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_COINGECKO_API_KEY) {
        console.warn('CoinGecko API key is missing.');
        return rejectWithValue('API key not found. Please provide a valid CoinGecko API key.');
      }
      
      // Prepare API request config with API key
      const apiKeyParam = {
        x_cg_api_key: process.env.NEXT_PUBLIC_COINGECKO_API_KEY
      };
      
      const historyParams = {
        vs_currency: 'usd',
        days: 30,
        interval: 'daily',
        ...apiKeyParam
      };
      
      try {
        // Get coin details
        const coinResponse = await axios.get(`${API_BASE_URL}/coins/${cryptoId}`, {
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: false,
            x_cg_api_key: process.env.NEXT_PUBLIC_COINGECKO_API_KEY
          }
        });
        
        // Get historical market data for the coin
        const historyResponse = await axios.get(
          `${API_BASE_URL}/coins/${cryptoId}/market_chart`, 
          { params: historyParams }
        );
        
        const coinData = coinResponse.data;
        const historyData = historyResponse.data.prices.map((item: [number, number]) => ({
          timestamp: item[0],
          price: item[1]
        }));
        
        // Create detailed cryptocurrency object with API data
        const detailedCrypto: CryptoDetail = {
          id: coinData.id,
          name: coinData.name,
          symbol: coinData.symbol,
          price: coinData.market_data.current_price.usd,
          priceChange24h: coinData.market_data.price_change_percentage_24h,
          marketCap: coinData.market_data.market_cap.usd,
          volume24h: coinData.market_data.total_volume.usd,
          circulatingSupply: coinData.market_data.circulating_supply || 0,
          totalSupply: coinData.market_data.total_supply || 0,
          maxSupply: coinData.market_data.max_supply,
          allTimeHigh: coinData.market_data.ath.usd,
          history: historyData,
        };

        return detailedCrypto;
      } catch (apiError) {
        console.warn('CoinGecko API error for details:', apiError);
        
        if (axios.isAxiosError(apiError)) {
          if (apiError.response?.status === 401 || apiError.response?.status === 403) {
            return rejectWithValue('API key is invalid or unauthorized. Please check your CoinGecko API key.');
          }
          
          if (apiError.response?.status === 404) {
            return rejectWithValue(`Cryptocurrency '${cryptoId}' not found. Please check the ID and try again.`);
          }
          
          if (apiError.response?.status === 429) {
            return rejectWithValue('API rate limit exceeded. Please try again later.');
          }
        }
        
        return rejectWithValue('Failed to fetch cryptocurrency details. The API may be rate limited or unavailable.');
      }
    } catch (error) {
      console.error('Unhandled error in fetchCryptoDetail:', error);
      return rejectWithValue('An unexpected error occurred while fetching cryptocurrency details.');
    }
  }
);

// Start periodic refresh
export const startCryptoDataRefresh = createAsyncThunk(
  'crypto/startDataRefresh',
  async (intervalMs: number = 60000, { dispatch }) => {
    // Initial fetch
    await dispatch(fetchCryptoData());
    
    // Set up interval for periodic refresh
    const intervalId = window.setInterval(() => {
      dispatch(fetchCryptoData());
    }, intervalMs);
    
    return intervalId;
  }
);

// Stop periodic refresh
export const stopCryptoDataRefresh = createAsyncThunk(
  'crypto/stopDataRefresh',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { refreshInterval } = state.crypto;
    
    if (refreshInterval) {
      window.clearInterval(refreshInterval);
    }
    
    return null;
  }
);

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    clearSelectedCrypto: (state) => {
      state.selectedCrypto = null;
    },
    updateCryptoPrice: (state, action: PayloadAction<{id: string, price: number, priceChange24h: number}>) => {
      // Ensure cryptos is initialized as an array
      if (!Array.isArray(state.cryptos)) {
        state.cryptos = [];
      }
      
      const { id, price, priceChange24h } = action.payload;
      const existingCrypto = state.cryptos.find(crypto => crypto?.id === id);
      
      if (existingCrypto) {
        // Update existing crypto
        existingCrypto.price = price;
        existingCrypto.priceChange24h = priceChange24h;
        existingCrypto.timestamp = Date.now();
      } else {
        // Add new crypto (this can happen if websocket starts before API fetch)
        state.cryptos.push({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
          symbol: id.substring(0, 3), // Use first 3 chars as symbol
          price,
          priceChange24h,
          marketCap: 0, // We don't have this info from websocket
          timestamp: Date.now(),
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptoData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptoData.fulfilled, (state, action: PayloadAction<CryptoData[]>) => {
        state.cryptos = action.payload;
        state.loading = false;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchCryptoData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCryptoDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptoDetail.fulfilled, (state, action: PayloadAction<CryptoDetail>) => {
        state.selectedCrypto = action.payload;
        state.loading = false;
      })
      .addCase(fetchCryptoDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(startCryptoDataRefresh.fulfilled, (state, action) => {
        state.refreshInterval = action.payload;
      })
      .addCase(stopCryptoDataRefresh.fulfilled, (state) => {
        state.refreshInterval = null;
      });
  },
});

export const { clearSelectedCrypto, updateCryptoPrice } = cryptoSlice.actions;
export default cryptoSlice.reducer; 