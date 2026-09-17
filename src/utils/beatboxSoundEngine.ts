/**
 * Web Audio API Beatbox Sound Engine
 * Synthesizes authentic acoustic beatbox techniques (percussion, vocal bass, scratches, clicks)
 * with zero external file dependencies, zero latency, and cross-browser reliability.
 */

export interface BeatboxSound {
  id: string;
  name: string;
  phonetic: string;
  category: 'kick' | 'snare' | 'hihat' | 'bass' | 'fx';
  hotkey: string;
  description: string;
  color: string;
}

export const BEATBOX_SOUNDS: BeatboxSound[] = [
  {
    id: 'classic-kick',
    name: 'Classic Kick',
    phonetic: '{B}',
    category: 'kick',
    hotkey: '1',
    description: 'Acoustic lip pop punch with deep 50Hz chest thud',
    color: '#FFC93C',
  },
  {
    id: 'k-snare',
    name: 'K-Snare',
    phonetic: '{K}',
    category: 'snare',
    hotkey: '2',
    description: 'Inward tongue rimshot on soft palate, crisp & sharp',
    color: '#E4402A',
  },
  {
    id: 'hi-hat',
    name: 'Closed Hi-Hat',
    phonetic: '{T}',
    category: 'hihat',
    hotkey: '3',
    description: 'Crisp dental breath burst cutting through the cypher',
    color: '#38BDF8',
  },
  {
    id: 'liproll',
    name: 'Inward Liproll',
    phonetic: '{Brr}',
    category: 'bass',
    hotkey: '4',
    description: 'Sub-bass vibration with loose lip friction & sub wobble',
    color: '#A855F7',
  },
  {
    id: 'throat-bass',
    name: 'Throat Bass',
    phonetic: '{Hrr}',
    category: 'bass',
    hotkey: '5',
    description: 'Deep raspy dual-tone resonance from the false vocal folds',
    color: '#F97316',
  },
  {
    id: 'spit-snare',
    name: 'Spit Snare',
    phonetic: '{Pf}',
    category: 'snare',
    hotkey: '6',
    description: 'Heavy outward explosion between compressed upper lip',
    color: '#EC4899',
  },
  {
    id: 'vocal-scratch',
    name: 'Vocal Scratch',
    phonetic: '{Wika}',
    category: 'fx',
    hotkey: '7',
    description: 'Classic hip-hop turntable chirp swept through hand cup',
    color: '#10B981',
  },
  {
    id: 'click-roll',
    name: 'Hollow Click',
    phonetic: '{Tk-Tk}',
    category: 'fx',
    hotkey: '8',
    description: 'Resonant tongue clop roll resonating against upper palate',
    color: '#FBBF24',
  },
  {
    id: 'sub-808',
    name: 'Chest 808',
    phonetic: '{Oom}',
    category: 'bass',
    hotkey: '9',
    description: 'Sustained sub-acoustic chest bass drop with low hum',
    color: '#6366F1',
  },
  {
    id: 'tabla-bol',
    name: 'Tabla "Dha"',
    phonetic: '{Dha}',
    category: 'fx',
    hotkey: '0',
    description: 'Mumbai street fusion: acoustic Indian percussion bol',
    color: '#14B8A6',
  },
];

class BeatboxEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.85;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Generates white/pink noise buffer for snares, hi-hats, and air textures
   */
  private createNoiseBuffer(duration: number): AudioBuffer {
    const ctx = this.initContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Triggers a specific beatbox technique by ID
   */
  public playSound(soundId: string) {
    const ctx = this.initContext();
    if (!this.masterGain) return;

    const t = ctx.currentTime;

    switch (soundId) {
      case 'classic-kick': {
        // Acoustic Kick: Lip pop transient + rapid sine drop 160Hz -> 38Hz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(38, t + 0.16);

        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        // Acoustic lip click burst
        const noise = ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.02);
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(450, t);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.connect(gain);
        gain.connect(this.masterGain);

        noise.start(t);
        osc.start(t);
        osc.stop(t + 0.23);
        break;
      }

      case 'k-snare': {
        // Inward K-Snare: Sharp rim click + filtered noise burst
        const noise = ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.14);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2800, t);
        filter.Q.setValueAtTime(2.2, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        // Body resonant tone
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
        oscGain.gain.setValueAtTime(0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(t);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }

      case 'hi-hat': {
        // Closed Hi-Hat: Crisp high-frequency breath burst
        const noise = ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.05);

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7500, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(t);
        break;
      }

      case 'liproll': {
        // Inward Liproll: Subby triangle wave with 24Hz vibrato tremolo
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(78, t);
        osc.frequency.exponentialRampToValueAtTime(42, t + 0.32);

        // LFO tremolo simulating lip flap
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(24, t);
        lfoGain.gain.setValueAtTime(0.35, t);

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        osc.connect(gain);
        gain.connect(this.masterGain);

        lfo.start(t);
        osc.start(t);
        osc.stop(t + 0.36);
        lfo.stop(t + 0.36);
        break;
      }

      case 'throat-bass': {
        // Throat Bass: Gritty dual-saw with formant filtering and slight overdrive
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const formant = ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(65, t);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(32.5, t); // sub harmonic

        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(520, t);
        formant.Q.setValueAtTime(3.5, t);

        gain.gain.setValueAtTime(0.85, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc1.connect(formant);
        osc2.connect(formant);
        formant.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.4);
        osc2.stop(t + 0.4);
        break;
      }

      case 'spit-snare': {
        // Spit Snare: Heavy outward explosion {Pf}
        const noise = ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.18);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.Q.setValueAtTime(1.5, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(180, t);
        sub.frequency.exponentialRampToValueAtTime(70, t + 0.12);
        subGain.gain.setValueAtTime(0.6, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        sub.connect(subGain);
        subGain.connect(this.masterGain);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(t);
        sub.start(t);
        sub.stop(t + 0.13);
        break;
      }

      case 'vocal-scratch': {
        // Vocal Scratch: Frequency-swept sine wave + light tape stop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(1450, t + 0.08);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.18);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.21);
        break;
      }

      case 'click-roll': {
        // Hollow Tongue Clop Roll: 2 rapid resonant pulses
        [0, 0.045].forEach((offset) => {
          const clickTime = t + offset;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400, clickTime);
          osc.frequency.exponentialRampToValueAtTime(350, clickTime + 0.025);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(950, clickTime);
          filter.Q.setValueAtTime(8, clickTime);

          gain.gain.setValueAtTime(0.9, clickTime);
          gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.03);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(clickTime);
          osc.stop(clickTime + 0.035);
        });
        break;
      }

      case 'sub-808': {
        // Chest 808 Sub: Booming 90Hz -> 38Hz sine drop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(92, t);
        osc.frequency.exponentialRampToValueAtTime(38, t + 0.45);

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.52);
        break;
      }

      case 'tabla-bol': {
        // Tabla Dha: High metallic ring + bass resonance
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.type = 'sine';
        bass.frequency.setValueAtTime(140, t);
        bass.frequency.exponentialRampToValueAtTime(85, t + 0.25);
        bassGain.gain.setValueAtTime(0.8, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        const ring = ctx.createOscillator();
        const ringGain = ctx.createGain();
        ring.type = 'triangle';
        ring.frequency.setValueAtTime(440, t);
        ring.frequency.exponentialRampToValueAtTime(390, t + 0.2);
        ringGain.gain.setValueAtTime(0.35, t);
        ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        bass.connect(bassGain);
        ring.connect(ringGain);
        bassGain.connect(this.masterGain);
        ringGain.connect(this.masterGain);

        bass.start(t);
        ring.start(t);
        bass.stop(t + 0.29);
        ring.stop(t + 0.23);
        break;
      }

      default:
        break;
    }
  }

  /**
   * Plays an automated 2-bar demo cypher groove combining several sounds
   */
  public playDemoGroove(onStepCallback?: (soundId: string) => void): () => void {
    const pattern = [
      { id: 'classic-kick', delay: 0 },
      { id: 'hi-hat', delay: 200 },
      { id: 'k-snare', delay: 400 },
      { id: 'hi-hat', delay: 600 },
      { id: 'liproll', delay: 800 },
      { id: 'classic-kick', delay: 1100 },
      { id: 'spit-snare', delay: 1300 },
      { id: 'vocal-scratch', delay: 1550 },
    ];

    const timeouts: number[] = [];

    pattern.forEach((step) => {
      const tid = window.setTimeout(() => {
        this.playSound(step.id);
        if (onStepCallback) onStepCallback(step.id);
      }, step.delay);
      timeouts.push(tid);
    });

    return () => {
      timeouts.forEach((tid) => window.clearTimeout(tid));
    };
  }
}

export const beatboxEngine = new BeatboxEngine();
