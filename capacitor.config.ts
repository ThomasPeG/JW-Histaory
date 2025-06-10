import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.jwhistory.app',
  appName: 'JWHistory',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['jwhistoryback.onrender.com']
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#3880ff'
    },
    Keyboard: {
      resize: KeyboardResize.None,
      resizeOnFullScreen: false, // Desactiva el redimensionamiento en pantalla completa
    }
  },
  android: {
    webContentsDebuggingEnabled: false,
    allowMixedContent: true,
    captureInput: true,
    initialFocus: true
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false
  }
};

export default config;
