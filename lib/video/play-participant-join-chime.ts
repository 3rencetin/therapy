/**
 * Belirgin, hoş bir iki vuruşlu bildirim (Web Audio). Ek dosya gerektirmez.
 * `AudioContext.resume()` ile birçok tarayıcıda oturum içi çalınır.
 */
export function playParticipantJoinChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    void ctx.resume().catch(() => {});

    const t0 = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.exponentialRampToValueAtTime(0.55, t0 + 0.02);
    master.gain.exponentialRampToValueAtTime(0.12, t0 + 0.45);
    master.connect(ctx.destination);

    const playBell = (freq: number, start: number, length: number, peak: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(freq, t0 + start);
      const s = t0 + start;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(peak, s + 0.018);
      g.gain.exponentialRampToValueAtTime(0.0001, s + length);
      o.connect(g);
      g.connect(master);
      o.start(s);
      o.stop(s + length + 0.04);
    };

    /* Beşli aralık: parlak üst not, sıcak alt not */
    playBell(988, 0, 0.16, 0.42);
    playBell(740, 0.12, 0.22, 0.38);
  } catch {
    /* autoplay / kısıtlar */
  }
}
