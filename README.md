# Crypto Weather Nexus

A modern application that combines cryptocurrency market data, weather forecasts, and financial news in one convenient dashboard.

## Features

- Live cryptocurrency tracking with detailed market data
- Real-time weather forecasts for cities worldwide
- Latest financial and crypto news updates
- Favorites system for tracking preferred cryptos and cities
- Light/dark theme toggle
- Responsive design for all devices

## Deployment Guide

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key
NEXT_PUBLIC_NEWSDATA_API_KEY=your_newsdata_api_key
NEXT_PUBLIC_ALLOW_MOCK_DATA=true # Set to true to use mock data when API keys are missing
```

### Deployment on Vercel

1. Fork this repository to your GitHub account
2. Connect the repository to your Vercel account
3. Set the environment variables in the Vercel dashboard
4. Deploy with the following settings:
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`

The application is configured to handle deployment issues automatically:
- TypeScript and ESLint errors are bypassed during build
- The app will fall back to mock data if API keys are unavailable

### Deployment on Netlify

1. Fork this repository to your GitHub account
2. Connect the repository to your Netlify account
3. Set the environment variables in the Netlify dashboard
4. Deploy with the following settings:
   - Build Command: `npm run clean-build`
   - Publish Directory: `.next`

### Manual Deployment

```bash
# Clone the repository
git clone https://github.com/yourusername/crypto-weather-nexus.git
cd crypto-weather-nexus

# Install dependencies
npm install

# Build the application
npm run build

# Start the production server
npm start
```

## Troubleshooting

### API Key Issues

If you encounter 401 (Unauthorized) errors:
- Verify your API keys are correctly set in environment variables
- Check that your API subscriptions are active
- The app will use mock data if valid keys are unavailable

### Build Failures

If you encounter build failures:
- Try using the clean build script: `npm run clean-build`
- Ensure you have the correct Node.js version (18+)
- Check that all dependencies are properly installed

### WebSocket Connection Issues

If you encounter WebSocket connection errors:
- Check your network connection
- Ensure your firewall is not blocking WebSocket connections
- The app will automatically retry connections several times

## Development

```bash
# Start the development server
npm run dev

# Run ESLint
npm run lint
```

## License

MIT
