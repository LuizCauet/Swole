let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return audioContext;
}

function playTapSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 80;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  } catch {
    // Audio not available
  }
}

export function triggerHaptic(style: "light" | "medium" | "success" = "light") {
  const patterns: Record<string, number[]> = {
    light: [10],
    medium: [30],
    success: [30, 20, 30],
  };

  if (navigator.vibrate) {
    navigator.vibrate(patterns[style]);
  } else {
    // iOS fallback — audio tap
    playTapSound();
  }
}
