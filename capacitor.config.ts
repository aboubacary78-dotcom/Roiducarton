import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.roiducarton.game',
  appName: 'Le Roi du Carton',
  // Vite construit le site dans dist/public (voir le script "build").
  webDir: 'dist/public',
  backgroundColor: '#FBF6F0',
  plugins: {
    AdMob: {
      // Met ton App ID AdMob réel ici avant la publication.
      // Ces valeurs sont aussi à renseigner dans les fichiers natifs
      // (AndroidManifest.xml et Info.plist), voir STORE_PUBLISHING.md.
    },
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#FBF6F0',
      showSpinner: false,
    },
  },
};

export default config;
