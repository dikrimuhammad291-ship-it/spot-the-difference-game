// Mirror Mystery — tiny synthesised sound effects.
//
// Every sound is built with the Web Audio API (oscillators + gain envelopes),
// so the game needs no audio files and makes no network request.

let ctx = null;
let enabled = true;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq, startAt, dur, type = 'sine', vol = 0.18) {
  const ac = audio();
  if (!ac || !enabled) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(vol, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(startAt);
  osc.stop(startAt + dur + 0.05);
}

function now() {
  const ac = audio();
  return ac ? ac.currentTime : 0;
}

export const sound = {
  get enabled() {
    return enabled;
  },
  setEnabled(on) {
    enabled = on;
  },
  // Warm the audio context on the first user gesture so later sounds play.
  unlock() {
    audio();
  },
  click() {
    tone(660, now(), 0.07, 'triangle', 0.08);
  },
  // Two-note chime when a difference is found.
  found() {
    const t = now();
    tone(880, t, 0.16, 'sine', 0.2);
    tone(1318, t + 0.09, 0.24, 'sine', 0.18);
  },
  // Low buzz for a wrong click.
  miss() {
    const t = now();
    tone(160, t, 0.18, 'sawtooth', 0.1);
    tone(120, t + 0.05, 0.18, 'sawtooth', 0.08);
  },
  // Rising shimmer when a hint is used.
  hint() {
    const t = now();
    tone(523, t, 0.12, 'sine', 0.14);
    tone(784, t + 0.08, 0.12, 'sine', 0.14);
    tone(1046, t + 0.16, 0.2, 'sine', 0.12);
  },
  // Short tick for the last seconds of the timer.
  tick() {
    tone(1200, now(), 0.05, 'square', 0.05);
  },
  // Little victory arpeggio when a level is cleared.
  win() {
    const t = now();
    [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.11, 0.22, 'triangle', 0.16));
  },
  // Sad descending notes when time runs out.
  lose() {
    const t = now();
    [392, 330, 262].forEach((f, i) => tone(f, t + i * 0.16, 0.24, 'triangle', 0.14));
  },
};
