# Crypto Weather Nexus

A Next.js application that aggregates cryptocurrency data, weather information, and relevant news in one dashboard.

## Features

- **Cryptocurrency Tracking**: Live price updates for major cryptocurrencies with WebSocket integration
- **Weather Information**: Current weather and forecasts for major cities worldwide
- **News Aggregation**: Latest news related to cryptocurrency, finance, and weather
- **Favorites System**: Save your preferred cities and cryptocurrencies for quick access
- **Notifications**: Real-time alerts for significant price changes and weather events
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: Next.js 15.x with React 18
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Data Visualization**: Custom chart components
- **API Integration**: 
  - CoinGecko API for cryptocurrency data
  - OpenWeather API for weather information
  - NewsData.io for news content
  - WebSockets for real-time cryptocurrency updates

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crypto-weather-nexus.git
   cd crypto-weather-nexus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your API keys:
   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
   NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key
   NEXT_PUBLIC_NEWSDATA_API_KEY=your_newsdata_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Building for Production

To build the application for production:

```bash
npm run build
```

If you encounter permissions errors during the build process, try running it with admin privileges or verify folder permissions.

### Deployment Options

1. **Vercel (Recommended)** - Easiest option for Next.js applications:
   - Sign up for a [Vercel account](https://vercel.com)
   - Connect your GitHub repository
   - Vercel will automatically detect the Next.js application and deploy it
   - Configure your environment variables in the Vercel dashboard

2. **Netlify**:
   - Create a new site from your GitHub repository
   - Configure the build command as `npm run build`
   - Set the publish directory to `.next`
   - Add your environment variables in the site settings

3. **Self-hosting**:
   - Build the application: `npm run build`
   - Start the production server: `npm start`
   - Use a process manager like PM2 to keep the application running

### Environment Variables for Production

Ensure the following environment variables are set in your production environment:
- `NEXT_PUBLIC_OPENWEATHER_API_KEY`
- `NEXT_PUBLIC_COINGECKO_API_KEY`
- `NEXT_PUBLIC_NEWSDATA_API_KEY`

## Troubleshooting

### Common Build Issues

1. **API Key Missing Errors**:
   - Ensure all API keys are set in your `.env.local` file
   - For production builds, verify environment variables are properly configured

2. **Permission Issues**:
   - If you encounter EPERM errors during build, try:
     - Running the command with admin privileges
     - Checking folder permissions
     - Deleting the `.next` folder and trying again

3. **ESLint Errors**:
   - Most ESLint errors should be automatically fixed by our configuration
   - For persistent errors, see the ESLint configuration in `.eslintrc.json`

4. **Chart Rendering Issues**:
   - The application implements a fallback for Chart.js rendering
   - Charts will display as simple alternatives when the library isn't available

5. **WebSocket Connections**:
   - In environments where WebSockets aren't supported, the app will fall back to simulated data
   - If CoinCap API rate limits are hit, mock data will be used instead

## API Rate Limits

This application uses several external APIs, which have rate limits:

- **CoinGecko API**: Free tier has limited requests per minute. The app includes fallback to mock data when rate limits are exceeded.
- **OpenWeather API**: Free tier has limited calls per minute.
- **NewsData API**: Free tier has limited requests per day.

## Error Handling

The application includes robust error handling:

- Exponential backoff for API rate limiting
- Graceful fallback to mock data when APIs are unavailable
- WebSocket reconnection logic
- Type safety with TypeScript interfaces

## Project Structure

```
crypto-weather-nexus/
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── crypto/       # Cryptocurrency components
│   │   ├── layout/       # Layout components
│   │   ├── news/         # News components
│   │   ├── shared/       # Shared/common components
│   │   └── weather/      # Weather components
│   ├── redux/            # Redux state management
│   │   ├── slices/       # Redux slices for each feature
│   │   └── store.ts      # Redux store configuration
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript interfaces and types
│   └── utils/            # Utility functions and services
├── .env.local            # Environment variables (not in repo)
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
└── tailwind.config.js    # Tailwind CSS configuration
```

## Known Issues and Limitations

- CoinGecko API may return 429 errors (rate limit exceeded) when using the free tier
- WebSocket connections may fail in some environments
- Some mock data is used when APIs are unavailable

## Browser Support

The application is optimized for modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Acknowledgments

- CoinGecko for cryptocurrency data
- OpenWeather for weather information
- NewsData.io for news content
