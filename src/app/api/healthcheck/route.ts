import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const healthcheck = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    features: {
      mockData: process.env.NEXT_PUBLIC_ALLOW_MOCK_DATA === 'true',
      weatherApi: !!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
      cryptoApi: !!process.env.NEXT_PUBLIC_COINGECKO_API_KEY,
      newsApi: !!process.env.NEXT_PUBLIC_NEWSDATA_API_KEY
    }
  };

  return NextResponse.json(healthcheck);
} 