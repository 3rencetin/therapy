/** @deprecated Seans odası — yeni akışta terapist odası kullanılır. */
export function liveKitRoomName(sessionId: string): string {
  return `terapi-session-${sessionId}`;
}

/** Terapist başına kalıcı LiveKit odası. */
export function therapistLiveKitRoomName(profileId: string): string {
  return `terapi-therapist-${profileId}`;
}
