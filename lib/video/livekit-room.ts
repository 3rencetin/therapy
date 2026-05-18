/** Oda adı UUID ile tekil; URL’de taşınmaz, sunucu token ile kilitler. */
export function liveKitRoomName(sessionId: string): string {
  return `terapi-session-${sessionId}`;
}
