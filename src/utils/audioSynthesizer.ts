import { CommunityMember } from '../types';

let globalAudioCtx: AudioContext | null = null;
let globalStopTimer: number | null = null;

export function stopBeatboxSound() {
  if (globalAudioCtx) {
    try {
      globalAudioCtx.close();
    } catch {
      // already closed
    }
    globalAudioCtx = null;
  }
  if (globalStopTimer) {
    window.clearTimeout(globalStopTimer);
    globalStopTimer = null;
  }
}

export function playBeatboxSound(soundType: CommunityMember['soundType']) {
  stopBeatboxSound();

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    globalAudioCtx = ctx;

    const now = ctx.currentTime;
    const bpm = soundType === 'fast-tech' ? 140 : soundType === 'trap-click' ? 128 : 95;
    const stepDuration = 60 / bpm / 2;

    for (let i = 0; i < 16; i++) {
      const time = now + i * stepDuration;

      if (soundType === 'bass-growl') {
        if (i % 4 === 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, time);
          osc.frequency.exponentialRampToValueAtTime(32, time + 0.3);
          gain.gain.setValueAtTime(0.6, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.3);
        }
      } else if (soundType === 'liproll') {
        if (i % 2 === 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(120, time);
          osc.frequency.exponentialRampToValueAtTime(45, time + 0.15);
          gain.gain.setValueAtTime(0.5, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.15);
        }
      } else if (soundType === 'fast-tech') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(i % 2 === 0 ? 150 : 350, time);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.08);
      } else {
        // generic rhythmic beat
        if (i % 4 === 0 || i % 4 === 2) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(i % 4 === 0 ? 90 : 220, time);
          gain.gain.setValueAtTime(0.4, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.12);
        }
      }
    }

    globalStopTimer = window.setTimeout(() => {
      stopBeatboxSound();
    }, 6000);
  } catch (e) {
    console.warn('Audio synthesis failed:', e);
  }
}
