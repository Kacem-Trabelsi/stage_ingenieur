// Web Audio API Ringtone Generator (Incoming & Outgoing ringers)

let audioCtx = null;
let currentRingtoneInterval = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// Play realistic incoming telephone ringtone
export const startIncomingRingtone = () => {
  stopRingtone();
  const ctx = getAudioContext();
  if (!ctx) return;

  const playChime = () => {
    try {
      const now = ctx.currentTime;

      // Dual tone ring (440Hz + 480Hz classic phone tone)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);

      // Second burst
      const now2 = now + 1.4;
      const osc3 = ctx.createOscillator();
      const osc4 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc3.type = 'sine';
      osc4.type = 'sine';
      osc3.frequency.setValueAtTime(440, now2);
      osc4.frequency.setValueAtTime(480, now2);

      gain2.gain.setValueAtTime(0.12, now2);
      gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 1.2);

      osc3.connect(gain2);
      osc4.connect(gain2);
      gain2.connect(ctx.destination);

      osc3.start(now2);
      osc4.start(now2);
      osc3.stop(now2 + 1.2);
      osc4.stop(now2 + 1.2);
    } catch (e) {
      // Audio autoplay restrictions
    }
  };

  playChime();
  currentRingtoneInterval = setInterval(playChime, 3800);
};

// Play outgoing dialing ring (soft tone)
export const startOutgoingRingtone = () => {
  stopRingtone();
  const ctx = getAudioContext();
  if (!ctx) return;

  const playBeep = () => {
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      // ignore
    }
  };

  playBeep();
  currentRingtoneInterval = setInterval(playBeep, 3000);
};

// Stop any ongoing ringtone
export const stopRingtone = () => {
  if (currentRingtoneInterval) {
    clearInterval(currentRingtoneInterval);
    currentRingtoneInterval = null;
  }
};
