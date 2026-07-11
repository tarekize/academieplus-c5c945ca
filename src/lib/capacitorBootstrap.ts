import { Capacitor } from "@capacitor/core";
import { initNativeGoogleAuthListener } from "./nativeGoogleAuth";

/**
 * Native-shell setup (status bar color, splash screen dismissal, back
 * gesture, Google sign-in deep link). No-ops automatically in a regular
 * browser tab — only runs inside the Capacitor app shell (Android/iOS), so
 * this is safe to call unconditionally from web.
 */
export async function initNativeApp() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setBackgroundColor({ color: "#38BDF8" });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    // Plugin not installed/available on this platform — ignore.
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    // Plugin not installed/available on this platform — ignore.
  }

  try {
    const { App } = await import("@capacitor/app");
    // The Android back gesture/button fires this instead of navigating the
    // WebView itself. Without a listener, Capacitor's default behavior is to
    // close the app the moment there's no more in-app history to go back to
    // (e.g. right on the home screen) — that's the "swipe closes the app"
    // bug. Route it through the SPA's own history first, and minimize
    // (rather than kill) the app only once there's truly nowhere left to go.
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    });
  } catch {
    // Plugin not installed/available on this platform — ignore.
  }

  await initNativeGoogleAuthListener();
}
