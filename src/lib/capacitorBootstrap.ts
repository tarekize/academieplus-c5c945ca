import { Capacitor } from "@capacitor/core";

/**
 * Native-shell setup (status bar color, splash screen dismissal). No-ops
 * automatically in a regular browser tab — only runs inside the Capacitor
 * app shell (Android/iOS), so this is safe to call unconditionally from web.
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
}
