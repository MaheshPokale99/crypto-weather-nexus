import { Socket } from 'socket.io-client';
import { store } from '@/redux/store';
import { updateCryptoPrice } from '@/redux/slices/cryptoSlice';
import { addNotification } from '@/redux/slices/notificationsSlice';

// Define interface for simulated weather alert
interface WeatherAlert {
  cityId: string;
  cityName: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private cryptoSocket: WebSocket | null = null;
  private weatherAlertInterval: NodeJS.Timeout | null = null;

  // Initialize connections
  init(): void {
    this.initCryptoSocket();
    this.initWeatherAlerts();
  }

  // Connect to CoinCap WebSocket
  private initCryptoSocket(): void {
    // CoinCap WebSocket, see: https://docs.coincap.io/
    try {
      // Check if we already have an active connection
      if (this.cryptoSocket && this.cryptoSocket.readyState !== WebSocket.CLOSED) {
        this.cryptoSocket.close();
      }
      
      // Fallback to simulation if browser doesn't support WebSockets
      if (typeof WebSocket === 'undefined') {
        console.warn('WebSocket not supported in this environment. Using simulated data.');
        this.simulateCryptoUpdates();
        return;
      }

      // Add a flag to track connection attempts
      let connectionAttempted = false;
      
      // Use a try-catch block specifically for the WebSocket creation
      try {
        // If we're running in a browser without HTTPS and the WebSocket endpoint uses wss://, 
        // we might encounter issues - let's handle multiple potential endpoints
        const endpoints = [
          'wss://ws.coincap.io/prices?assets=bitcoin,ethereum',
          'ws://ws.coincap.io/prices?assets=bitcoin,ethereum'
        ];
        
        // Try the first endpoint
        this.cryptoSocket = new WebSocket(endpoints[0]);
        connectionAttempted = true;
        
        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.cryptoSocket && this.cryptoSocket.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket connection timed out, falling back to simulation');
            this.cryptoSocket?.close();
            this.simulateCryptoUpdates();
          }
        }, 5000);
        
        this.cryptoSocket.onopen = () => {
          console.log('Connected to CoinCap WebSocket');
          clearTimeout(connectionTimeout);
        };

        // Add a retry mechanism if connection fails
        let retryCount = 0;
        const MAX_RETRIES = 3;
        
        this.cryptoSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const state = store.getState();
            // Ensure cryptos exists and is an array before accessing it
            const cryptos = Array.isArray(state?.crypto?.cryptos) ? state.crypto.cryptos : [];
            
            // Reset retry count on successful message
            retryCount = 0;
            
            // Process bitcoin updates
            if (data.bitcoin) {
              store.dispatch(updateCryptoPrice({
                id: 'bitcoin',
                price: parseFloat(data.bitcoin),
                priceChange24h: 0, // We don't get this from the websocket
              }));
              
              // Generate a notification for significant price change (>1%)
              const currentPrice = parseFloat(data.bitcoin);
              const bitcoin = cryptos.find(c => c?.id === 'bitcoin');
              
              if (bitcoin && bitcoin.price && Math.abs((currentPrice - bitcoin.price) / bitcoin.price) > 0.01) {
                const increase = currentPrice > bitcoin.price;
                store.dispatch(addNotification({
                  type: 'price_alert',
                  title: `Bitcoin ${increase ? 'up' : 'down'} by 1%+`,
                  message: `Bitcoin price has ${increase ? 'increased' : 'decreased'} to $${currentPrice.toLocaleString()}`,
                  timestamp: Date.now(),
                }));
              }
            }
            
            // Process ethereum updates
            if (data.ethereum) {
              store.dispatch(updateCryptoPrice({
                id: 'ethereum',
                price: parseFloat(data.ethereum),
                priceChange24h: 0, // We don't get this from the websocket
              }));
              
              // Similar notification logic for Ethereum
              const currentPrice = parseFloat(data.ethereum);
              const ethereum = cryptos.find(c => c?.id === 'ethereum');
              
              if (ethereum && ethereum.price && Math.abs((currentPrice - ethereum.price) / ethereum.price) > 0.01) {
                const increase = currentPrice > ethereum.price;
                store.dispatch(addNotification({
                  type: 'price_alert',
                  title: `Ethereum ${increase ? 'up' : 'down'} by 1%+`,
                  message: `Ethereum price has ${increase ? 'increased' : 'decreased'} to $${currentPrice.toLocaleString()}`,
                  timestamp: Date.now(),
                }));
              }
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };

        this.cryptoSocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          // Clear timeout to avoid duplicated fallback calls
          clearTimeout(connectionTimeout);
          
          // Increment retry count and try again if under max retries
          retryCount++;
          if (retryCount <= MAX_RETRIES) {
            console.log(`WebSocket connection error, retrying (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(() => this.initCryptoSocket(), 1000 * retryCount);
          } else {
            // Fall back to simulation after max retries
            console.log('Max WebSocket connection retries reached, falling back to simulation');
            this.simulateCryptoUpdates();
          }
        };

        this.cryptoSocket.onclose = (event) => {
          console.log('CoinCap WebSocket connection closed', event.code, event.reason);
          clearTimeout(connectionTimeout);
          
          // Only try to reconnect if this was an unexpected closure and under max retries
          if (event.code !== 1000 && retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`WebSocket closed unexpectedly, retrying (${retryCount}/${MAX_RETRIES}) in 5 seconds...`);
            // Try to reconnect in 5 seconds
            setTimeout(() => this.initCryptoSocket(), 5000);
          } else if (retryCount >= MAX_RETRIES) {
            console.log('Max WebSocket reconnection retries reached, falling back to simulation');
            this.simulateCryptoUpdates();
          } else {
            console.log('WebSocket closed normally, not reconnecting');
          }
        };
      } catch (err) {
        console.error('Failed to create WebSocket connection:', err);
        
        // If we attempted a connection but it failed, try simulation
        if (connectionAttempted) {
          this.simulateCryptoUpdates();
        }
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      // Simulate data as fallback
      this.simulateCryptoUpdates();
    }
  }

  // Simulate weather alerts
  private initWeatherAlerts(): void {
    // Generate a random weather alert every 30-90 seconds
    this.weatherAlertInterval = setInterval(() => {
      // Only create an alert 33% of the time
      if (Math.random() > 0.33) return;
      
      const cities = [
        { id: '5128581', name: 'New York' },
        { id: '2643743', name: 'London' },
        { id: '1850147', name: 'Tokyo' },
      ];
      
      const alertTypes = ['Heavy Rain', 'Thunderstorm', 'Extreme Heat', 'Strong Winds', 'Snow'];
      const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomAlertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
      
      const alert: WeatherAlert = {
        cityId: randomCity.id,
        cityName: randomCity.name,
        alertType: randomAlertType,
        severity: randomSeverity,
        message: `${randomAlertType} alert in ${randomCity.name}. Severity: ${randomSeverity}.`,
      };
      
      store.dispatch(addNotification({
        type: 'weather_alert',
        title: `${alert.alertType} in ${alert.cityName}`,
        message: alert.message,
        timestamp: Date.now(),
      }));
      
    }, Math.floor(Math.random() * 60000) + 30000); // Random interval between 30-90 seconds
  }

  // Simulate crypto updates for development when WebSocket fails
  private simulateCryptoUpdates(): void {
    console.log('Using simulated crypto data updates');
    // Update crypto prices every 10 seconds with random fluctuations
    setInterval(() => {
      const state = store.getState();
      // Ensure cryptos exists and is an array before accessing it
      const cryptos = Array.isArray(state?.crypto?.cryptos) ? state.crypto.cryptos : [];
      
      // Find Bitcoin in the state
      const bitcoin = cryptos.find(c => c?.id === 'bitcoin');
      if (bitcoin && bitcoin.price) {
        // Generate a random price fluctuation within 0.5%
        const fluctuation = bitcoin.price * (Math.random() * 0.01 - 0.005);
        const newPrice = bitcoin.price + fluctuation;
        
        store.dispatch(updateCryptoPrice({
          id: 'bitcoin',
          price: newPrice,
          priceChange24h: bitcoin.priceChange24h + (fluctuation > 0 ? 0.1 : -0.1),
        }));
      } else {
        // If Bitcoin isn't in the state yet, add some default data
        store.dispatch(updateCryptoPrice({
          id: 'bitcoin',
          price: 65000 + (Math.random() * 2000 - 1000),
          priceChange24h: Math.random() * 5 - 2.5,
        }));
      }
      
      // Find Ethereum in the state
      const ethereum = cryptos.find(c => c?.id === 'ethereum');
      if (ethereum && ethereum.price) {
        // Generate a random price fluctuation within 0.5%
        const fluctuation = ethereum.price * (Math.random() * 0.01 - 0.005);
        const newPrice = ethereum.price + fluctuation;
        
        store.dispatch(updateCryptoPrice({
          id: 'ethereum',
          price: newPrice,
          priceChange24h: ethereum.priceChange24h + (fluctuation > 0 ? 0.1 : -0.1),
        }));
      } else {
        // If Ethereum isn't in the state yet, add some default data
        store.dispatch(updateCryptoPrice({
          id: 'ethereum',
          price: 3500 + (Math.random() * 200 - 100),
          priceChange24h: Math.random() * 5 - 2.5,
        }));
      }
    }, 10000);
  }

  // Clean up connections
  disconnect(): void {
    if (this.cryptoSocket) {
      this.cryptoSocket.close();
      this.cryptoSocket = null;
    }
    
    if (this.weatherAlertInterval) {
      clearInterval(this.weatherAlertInterval);
      this.weatherAlertInterval = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const webSocketService = new WebSocketService(); 