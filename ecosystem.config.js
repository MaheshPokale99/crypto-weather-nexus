module.exports = {
  apps: [
    {
      name: 'crypto-weather-nexus',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_PUBLIC_ALLOW_MOCK_DATA: 'true'
      },
      env_production: {
        PORT: 3000,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    }
  ]
}; 