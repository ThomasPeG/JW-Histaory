import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jwhistory.app',
  appName: 'JWHistory',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,  // Añadir esta línea
    allowNavigation: ['jwhistoryback.onrender.com']  // Añadir esta línea
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#3880ff'
    }
  }
};

export default config;
