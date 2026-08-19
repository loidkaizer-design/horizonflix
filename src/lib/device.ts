export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile|Silk/i.test(ua);
}

/** Heuristic: are we running inside an app WebView rather than a normal browser? */
export function isWebView(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isAndroidWebView = /\bwv\b/.test(ua) || /Version\/[\d.]+ Chrome\//.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const iosStandaloneBrowser = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
  const isIOSWebView = isIOS && !iosStandaloneBrowser;
  const hasNativeBridge =
    "ReactNativeWebView" in window ||
    "flutter_inappwebview" in window ||
    ("webkit" in window &&
      Boolean((window as unknown as { webkit?: { messageHandlers?: unknown } }).webkit
        ?.messageHandlers));
  return isAndroidWebView || isIOSWebView || hasNativeBridge;
}
