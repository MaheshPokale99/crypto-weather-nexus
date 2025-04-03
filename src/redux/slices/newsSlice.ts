import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { NewsItem, NewsState } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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

export const fetchNewsData = createAsyncThunk(
  'news/fetchNewsData',
  async (category: string = 'crypto', { rejectWithValue }) => {
    try {
      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_NEWSDATA_API_KEY) {
        return rejectWithValue('NewsData.io API key is missing. Please add it to your environment variables.');
      }

      const query = categoryToQuery[category] || categoryToQuery.crypto;
      
      const response = await axios.get(NEWSDATA_API_ENDPOINT, {
        params: {
          apikey: process.env.NEXT_PUBLIC_NEWSDATA_API_KEY,
          q: query,
          language: 'en',
          category: 'business,top'
        }
      });
      
      if (response.data && response.data.results) {
        // Transform the NewsData.io API response to match our NewsItem interface
        const newsItems: NewsItem[] = response.data.results.map((item: any) => ({
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
        return rejectWithValue('No results found in the API response.');
      }
    } catch (error) {
      console.error('Error fetching news data:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          return rejectWithValue('API rate limit exceeded. Please try again later.');
        }
        if (error.response?.status === 401) {
          return rejectWithValue('Invalid API key. Please check your NewsData.io API key.');
        }
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue('An unexpected error occurred. Please try again later.');
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