export function createSound() {
  let context,
    enabled = false;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) throw new Error("Audio unavailable");
  function play(kind) {
    if (!enabled || document.hidden || context?.state !== "running") return;
    const now = context.currentTime;
    const oscillator = context.createOscillator(),
      gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(kind === "success" ? 280 : 150, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      kind === "success" ? 420 : 65,
      now + 0.065,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
  return {
    async toggle() {
      context ||= new Context();
      enabled = !enabled;
      if (enabled) await context.resume();
      else await context.suspend();
      return enabled;
    },
    play,
    silence() {
      enabled = false;
      if (context?.state === "running") void context.suspend();
    },
  };
}
