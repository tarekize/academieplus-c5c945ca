import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

// Custom URL scheme registered in android/app/src/main/AndroidManifest.xml.
// Google/Supabase redirect the system browser here once sign-in completes,
// which Android routes back into the app instead of a dead "localhost" page.
export const NATIVE_AUTH_CALLBACK_URL = "com.academieplus.app://auth/callback";
const NATIVE_AUTH_CALLBACK_PREFIX = "com.academieplus.app://auth";

/**
 * Starts the Google OAuth flow in the system browser (Chrome Custom Tabs /
 * SFSafariViewController) instead of the app's own WebView — Google refuses
 * to sign users in from an embedded WebView, which is what sent users to a
 * broken "localhost" redirect before.
 */
export async function signInWithGoogleNative() {
  const { Browser } = await import("@capacitor/browser");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: NATIVE_AUTH_CALLBACK_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error("Impossible de démarrer la connexion Google.");

  await Browser.open({ url: data.url, presentationStyle: "popover" });
}

async function completeSessionFromCallbackUrl(url: string) {
  const parsed = new URL(url);
  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));

  const errorDescription =
    parsed.searchParams.get("error_description") || hashParams.get("error_description");
  if (errorDescription) throw new Error(errorDescription);

  // PKCE flow: the callback carries a one-time ?code= to exchange.
  const code = parsed.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  // Implicit flow: tokens come back in the #fragment.
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
  }
}

/**
 * Registers the deep-link listener that catches the app coming back to the
 * foreground via NATIVE_AUTH_CALLBACK_URL and finishes the Supabase session.
 * Call once at startup (native platforms only).
 */
export async function initNativeGoogleAuthListener() {
  if (!Capacitor.isNativePlatform()) return;

  const [{ App }, { Browser }] = await Promise.all([
    import("@capacitor/app"),
    import("@capacitor/browser"),
  ]);

  App.addListener("appUrlOpen", async ({ url }) => {
    if (!url.startsWith(NATIVE_AUTH_CALLBACK_PREFIX)) return;

    try {
      await Browser.close();
    } catch {
      // Already closed by the OS — ignore.
    }

    try {
      await completeSessionFromCallbackUrl(url);
    } catch (err) {
      console.error("Native Google sign-in failed:", err);
    }
  });
}
