import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.academieplus.app",
    appName: "AcademiePlus",
    webDir: "dist",
    backgroundColor: "#0c1a2e",
    server: {
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
