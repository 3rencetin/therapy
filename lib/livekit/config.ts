export function getLiveKitWsUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim() || process.env.LIVEKIT_URL?.trim();
  if (!url) return null;
  return url.replace(/\/$/, "");
}

/** RoomServiceClient (HTTP Twirp) için taban URL — wss otomatik https yapılır. */
export function getLiveKitHttpHost(): string | null {
  const ws = getLiveKitWsUrl();
  if (!ws) return null;
  if (ws.startsWith("wss://")) return `https://${ws.slice("wss://".length)}`;
  if (ws.startsWith("ws://")) return `http://${ws.slice("ws://".length)}`;
  if (ws.startsWith("https://") || ws.startsWith("http://")) return ws;
  return `https://${ws}`;
}

export function getLiveKitCredentials(): { apiKey: string; apiSecret: string } | null {
  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
  if (!apiKey || !apiSecret) return null;
  return { apiKey, apiSecret };
}

export function isLiveKitConfigured(): boolean {
  return Boolean(getLiveKitWsUrl() && getLiveKitCredentials());
}
