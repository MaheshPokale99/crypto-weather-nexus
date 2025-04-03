import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { NewsItem, NewsState } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { addNotification } from './notificationsSlice';

const initialState: NewsState = {
  news: [],
  loading: false,
  error: null,
  currentCategory: 'crypto'
};

// NewsData.io API endpoint
const NEWSDATA_API_ENDPOINT = 'https://newsdata.io/api/1/news';

// Map our app categories to API query terms
const categoryToQuery: Record<string, string> = {
  business: 'business',
  technology: 'technology',
  crypto: 'cryptocurrency OR bitcoin OR blockchain',
  finance: 'finance',
  weather: 'weather OR climate',
  all: 'cryptocurrency OR finance OR business'
};

// Define an interface for the raw news item from the API
interface NewsDataApiResult {
  article_id: string;
  title: string;
  description: string;
  link: string;
  source_id: string;
  pubDate: string;
  image_url: string;
}

// Mock news data for fallback
const mockNewsData: Record<string, NewsItem[]> = {
  crypto: [
    {
      id: '1',
      title: 'Bitcoin Reaches New All-Time High as Institutional Adoption Grows',
      description: 'The world\'s largest cryptocurrency has surpassed its previous record as major financial institutions continue to invest in digital assets.',
      url: 'https://example.com/crypto-news-1',
      source: 'CryptoNews',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=500&auto=format'
    },
    {
      id: '2',
      title: 'Ethereum 2.0 Upgrade on Track for Q3 Completion',
      description: 'The much-anticipated upgrade to the Ethereum network is proceeding as planned, promising improved scalability and reduced energy consumption.',
      url: 'https://example.com/crypto-news-2',
      source: 'BlockchainToday',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=500&auto=format'
    },
    {
      id: '3',
      title: 'New Regulatory Framework for Cryptocurrencies Proposed',
      description: 'Government officials have unveiled a comprehensive plan to regulate digital assets while encouraging innovation in the blockchain space.',
      url: 'https://example.com/crypto-news-3',
      source: 'FinancialTimes',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=500&auto=format'
    }
  ],
  weather: [
    {
      id: '4',
      title: 'Record Temperatures Expected Across Southern Europe This Summer',
      description: 'Meteorologists predict an unusually hot summer season with potential drought conditions in several Mediterranean countries.',
      url: 'https://example.com/weather-news-1',
      source: 'ClimateReport',
      publishedAt: new Date(Date.now() - 4500000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?w=500&auto=format'
    },
    {
      id: '5',
      title: 'New Hurricane Tracking Technology Improves Prediction Accuracy',
      description: 'Advanced satellite systems and AI-powered models are helping forecasters provide more precise warnings for coastal communities.',
      url: 'https://example.com/weather-news-2',
      source: 'WeatherChannel',
      publishedAt: new Date(Date.now() - 9000000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1514632595-4944383f2737?w=500&auto=format'
    }
  ],
  business: [
    {
      id: '6',
      title: 'Global Supply Chain Challenges Expected to Ease by Year End',
      description: 'Industry experts predict normalization of shipping and manufacturing as pandemic-related disruptions gradually resolve.',
      url: 'https://example.com/business-news-1',
      source: 'BusinessInsider',
      publishedAt: new Date(Date.now() - 5400000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500&auto=format'
    },
    {
      id: '7',
      title: 'Tech Giants Face New Antitrust Regulations',
      description: 'Lawmakers have introduced legislation aimed at preventing monopolistic practices in the technology sector.',
      url: 'https://example.com/business-news-2',
      source: 'TechDaily',
      publishedAt: new Date(Date.now() - 7800000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=500&auto=format'
    }
  ]
};

// Fallback for categories without specific mock data
mockNewsData.technology = mockNewsData.business;
mockNewsData.finance = mockNewsData.business;
mockNewsData.all = [...mockNewsData.crypto, ...mockNewsData.business].slice(0, 5);

export const fetchNewsData = createAsyncThunk(
  'news/fetchNewsData',
  async (category: string = 'crypto', { rejectWithValue, dispatch }) => {
    try {
      // Check if API key is available
      const apiKey = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;
      if (!apiKey) {
        console.warn('NewsData.io API key is missing. Using mock data.');
        return { 
          newsItems: mockNewsData[category] || mockNewsData.crypto, 
          category 
        };
      }

      const query = categoryToQuery[category] || categoryToQuery.crypto;
      
      const response = await axios.get(NEWSDATA_API_ENDPOINT, {
        params: {
          apikey: apiKey,
          q: query,
          language: 'en',
          category: 'business,top'
        }
      });
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        // Transform the NewsData.io API response to match our NewsItem interface
        const newsItems: NewsItem[] = response.data.results.map((item: NewsDataApiResult) => ({
          id: item.article_id || uuidv4(),
          title: item.title || 'No title available',
          description: item.description || 'No description available',
          url: item.link,
          source: item.source_id,
          publishedAt: item.pubDate,
          imageUrl: item.image_url
        }));
        
        return { newsItems, category };
      } else {
        console.warn('No results found in the API response. Using mock data.');
        return { 
          newsItems: mockNewsData[category] || mockNewsData.crypto, 
          category 
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error codes
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn('NewsData.io API key is invalid or unauthorized. Using mock data.');
          
          // Notify the user about the API key issue
          dispatch(addNotification({
            type: 'error',
            title: 'API Key Error',
            message: 'Invalid NewsData.io API key. Using demo data instead.',
            timestamp: Date.now()
          }));
          
          return { 
            newsItems: mockNewsData[category] || mockNewsData.crypto, 
            category 
          };
        }
        
        if (error.response?.status === 429) {
          console.warn('NewsData.io API rate limit exceeded. Using mock data.');
          
          // Notify the user about the rate limit
          dispatch(addNotification({
            type: 'warning',
            title: 'API Rate Limit',
            message: 'NewsData.io API rate limit exceeded. Using demo data instead.',
            timestamp: Date.now()
          }));
          
          return { 
            newsItems: mockNewsData[category] || mockNewsData.crypto, 
            category 
          };
        }
        
        console.error('Error fetching news data:', error.response?.data || error.message);
        
        // Notify the user about the general API error
        dispatch(addNotification({
          type: 'error',
          title: 'News Data Error',
          message: 'Failed to fetch news data. Using demo content instead.',
          timestamp: Date.now()
        }));
        
        return { 
          newsItems: mockNewsData[category] || mockNewsData.crypto, 
          category 
        };
      }
      
      console.error('Unexpected error fetching news data:', error);
      return { 
        newsItems: mockNewsData[category] || mockNewsData.crypto, 
        category 
      };
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNewsCategory: (state, action: PayloadAction<string>) => {
      state.currentCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsData.fulfilled, (state, action: PayloadAction<{newsItems: NewsItem[], category: string}>) => {
        state.news = action.payload.newsItems;
        state.currentCategory = action.payload.category;
        state.loading = false;
      })
      .addCase(fetchNewsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setNewsCategory } = newsSlice.actions;
export default newsSlice.reducer; 