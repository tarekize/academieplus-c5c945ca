import type { CapacitorConfig } from "@capacitor/cli";

// This file lives in application_mobile/, one level below the web app's
// project root, so paths (webDir) are relative to THIS file's directory —
// running any `npx cap ...` command must be done from inside application_mobile/.
const config: CapacitorConfig = {
  appId: "com.academieplus.app",
  appName: "AcadémiePlus",
  webDir: "../dist",
  backgroundColor: "#0c1a2e",
  server: {
    // Uncomment androidScheme/cleartext only if you need to point the app at
    // a live dev server (e.g. Vite on your machine) instead of the bundled
    // build. Leave commented for a normal production/USB install.
    // url: "http://192.168.1.50:8081",
    // cleartext: true,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#0c1a2e",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#38BDF8",
    },
  },
};

export default config;
