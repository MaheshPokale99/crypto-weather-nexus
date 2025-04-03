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

export const fetchNewsData = createAsyncThunk<{newsItems: NewsItem[], category: string}, string, { rejectValue: string }>(
  'news/fetchNewsData',
  async (category: string = 'crypto', { rejectWithValue, dispatch }) => {
    try {
      // Check if API key is available
      const apiKey = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;
      if (!apiKey) {
        console.warn('NewsData.io API key is missing.');
        return rejectWithValue('API key not found. Please provide a valid NewsData API key.');
      }

      const query = categoryToQuery[category] || categoryToQuery.crypto;
      
      try {
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
          // API returned an empty result set
          return rejectWithValue(`No news articles found for category "${category}". Please try a different category.`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Handle specific error codes
          if (error.response?.status === 401 || error.response?.status === 403) {
            // Notify the user about the API key issue
            dispatch(addNotification({
              type: 'error',
              title: 'API Key Error',
              message: 'Invalid NewsData.io API key. Please check your API key.',
              timestamp: Date.now()
            }));
            
            return rejectWithValue('API key is invalid or unauthorized. Please check your NewsData API key.');
          }
          
          if (error.response?.status === 429) {
            // Notify the user about the rate limit
            dispatch(addNotification({
              type: 'warning',
              title: 'API Rate Limit',
              message: 'NewsData.io API rate limit exceeded. Please try again later.',
              timestamp: Date.now()
            }));
            
            return rejectWithValue('API rate limit exceeded. Please try again later.');
          }
          
          console.error('Error fetching news data:', error.response?.data || error.message);
          
          // Notify the user about the general API error
          dispatch(addNotification({
            type: 'error',
            title: 'News API Error',
            message: `Failed to fetch news: ${error.response?.data?.message || error.message}`,
            timestamp: Date.now()
          }));
          
          return rejectWithValue(`Failed to fetch news from API: ${error.response?.data?.message || error.message}`);
        }
        
        // Handle non-axios errors
        console.error('Unexpected error fetching news:', error);
        return rejectWithValue('An unexpected error occurred while fetching news data.');
      }
    } catch (error) {
      console.error('Error in fetchNewsData thunk:', error);
      return rejectWithValue('An unexpected error occurred while fetching news data.');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.currentCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsData.fulfilled, (state, action) => {
        state.news = action.payload.newsItems;
        state.currentCategory = action.payload.category;
        state.loading = false;
      })
      .addCase(fetchNewsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCategory } = newsSlice.actions;
export default newsSlice.reducer; 