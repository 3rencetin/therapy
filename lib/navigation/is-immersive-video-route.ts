/** Görüşme odası: panel kabuğu olmadan tam ekran. */
export function isImmersiveVideoRoute(pathname: string): boolean {
  return /\/call(?:\/|$)/.test(pathname) || pathname.startsWith("/join/invite/");
}
