import React, { useState } from 'react';
import { ArrowRight, Volume2, Sparkles, MapPin, Radio } from 'lucide-react';

interface HeroProps {
  onOpenJoinModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenJoinModal }) => {
  const [audioPlayed, setAudioPlayed] = useState<string | null>(null);

  // Synthesize short vocal percussion sounds via Web Audio API
  const playVocalSound = (type: 'kick' | 'snare' | 'bass') => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'kick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
        setAudioPlayed('B (Kick)');
      } else if (type === 'snare') {
        // Spit snare: high burst noise + mid tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
        setAudioPlayed('K (Spit Snare)');
      } else if (type === 'bass') {
        // Throat bass / Inward bass growl
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        setAudioPlayed('Bass Drop');
      }

      setTimeout(() => setAudioPlayed(null), 1200);
    } catch {
      // Audio context disabled or unavailable
    }
  };

  return (
    <section id="home" className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden border-b-2 border-[#FFC93C]/30">
      {/* Background Poster Grain & Hairline Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(#FFC93C 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Flyer Header Stamp */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-[#F4EFE4]/15 font-mono text-xs text-[#F4EFE4]/70">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-[#FFC93C] rounded-none rotate-45" />
            <span className="uppercase tracking-widest text-[#FFC93C] font-semibold">
              STREET FLYER BULLETIN // ISSUE NO. 26
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] tracking-wider uppercase">
            <span className="hidden sm:inline">100% ACOUSTIC VOCAL PERCUSSION</span>
            <span className="px-2 py-0.5 bg-[#FFC93C]/10 text-[#FFC93C] border border-[#FFC93C]/30">
              MUMBAI, MH-01
            </span>
          </div>
        </div>

        {/* Asymmetric Hero Poster Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Narrative */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Cypher Alert Tag - rotated street badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#14120F] border-2 border-[#E4402A] text-[#F4EFE4] text-xs font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_#E4402A] -rotate-1 hover:rotate-0 transition-transform">
              <span className="w-2 h-2 rounded-full bg-[#E4402A] animate-ping" />
              <Radio className="w-3.5 h-3.5 text-[#E4402A]" />
              <span>Next Open Jam: Sat 5:30 PM @ Carter Road Bandra</span>
            </div>

            {/* Poster Headline */}
            <div className="space-y-2">
              <div className="text-xs font-mono tracking-widest uppercase text-[#FFC93C]">
                Official Grassroots Movement
              </div>
              <h1 className="font-['Anton'] text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#F4EFE4] uppercase leading-[0.92]">
                Mumbai <br />
                <span className="text-[#FFC93C] inline-block relative">
                  Beatbox
                  {/* Subtle underline hazard bar */}
                  <span className="absolute left-0 -bottom-2 w-full h-2 bg-[#FFC93C] -skew-x-12 opacity-80" />
                </span>{' '}
                <span className="text-[#F4EFE4]">Hub</span>
              </h1>
            </div>

            {/* Subhead and Supporting Line */}
            <div className="space-y-3 pt-2">
              <p className="font-['Anton'] text-2xl sm:text-3xl text-[#FFC93C] tracking-wide uppercase">
                &ldquo;One mic. One breath. A city of rhythm.&rdquo;
              </p>
              <p className="text-base sm:text-lg text-[#F4EFE4]/85 max-w-2xl leading-relaxed font-sans">
                A grassroots, instrument-free community uniting beatboxers, vocal bassists, and mouth percussionists across Mumbai. From first-time clickers to tournament battlers — the circle is open to all.
              </p>
            </div>

            {/* Action Group */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                id="hero-cta-join"
                onClick={onOpenJoinModal}
                className="group inline-flex items-center gap-3 bg-[#FFC93C] text-[#14120F] px-7 py-3.5 text-sm sm:text-base font-bold uppercase tracking-widest font-mono border-2 border-[#14120F] shadow-[5px_5px_0px_0px_#E4402A] hover:bg-[#F4EFE4] hover:shadow-[2px_2px_0px_0px_#E4402A] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Join a Cypher</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#14120F]" />
              </button>

              <a
                href="#about"
                id="hero-cta-explore"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-[#F4EFE4] bg-[#14120F] border-2 border-[#F4EFE4]/30 hover:border-[#FFC93C] hover:text-[#FFC93C] transition-colors"
              >
                <span>Explore Scene</span>
                <span className="text-[#FFC93C]">↓</span>
              </a>
            </div>

            {/* Location indicator badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-[#F4EFE4]/70">
              <span className="text-[#FFC93C] flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5" /> Cypher Spots:
              </span>
              <span className="px-2 py-0.5 bg-[#F4EFE4]/10 border border-[#F4EFE4]/15">Bandra Carter Rd</span>
              <span className="px-2 py-0.5 bg-[#F4EFE4]/10 border border-[#F4EFE4]/15">Bandstand Steps</span>
              <span className="px-2 py-0.5 bg-[#F4EFE4]/10 border border-[#F4EFE4]/15">Shivaji Park</span>
              <span className="px-2 py-0.5 bg-[#F4EFE4]/10 border border-[#F4EFE4]/15">Marine Drive</span>
            </div>

          </div>

          {/* Right Column: Signature Equalizer Visual Anchor & Vocal Sample Pad */}
          <div className="lg:col-span-5">
            <div className="relative bg-[#14120F] border-2 border-[#FFC93C] p-6 sm:p-7 shadow-[8px_8px_0px_0px_#FFC93C] rotate-1 hover:rotate-0 transition-transform">
              
              {/* Card Corner Stamp */}
              <div className="absolute -top-3 -right-3 bg-[#E4402A] text-[#F4EFE4] text-[10px] font-mono font-bold uppercase px-2.5 py-1 tracking-widest border border-[#14120F] rotate-3 shadow-sm">
                Acoustic Frequency
              </div>

              {/* Kaali-Peeli Taxi Roof Header Stripe */}
              <div className="h-2 w-full bg-taxi-pattern mb-5" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFC93C] animate-ping" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFC93C]">
                    Vocal Equalizer Spectrum
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#F4EFE4]/50">
                  40Hz — 16kHz VOCAL
                </span>
              </div>

              {/* The Signature Equalizer Motif (Orchestrated in Hero as requested) */}
              <div 
                className="h-36 sm:h-44 bg-[#181512] border border-[#FFC93C]/30 p-4 flex items-end justify-between gap-1.5 sm:gap-2.5 rounded-sm relative overflow-hidden"
                aria-label="Vocal audio equalizer bars pulsing rhythmically"
              >
                {/* Visual grid lines behind bars */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 opacity-15">
                  <div className="border-b border-[#F4EFE4]" />
                  <div className="border-b border-[#F4EFE4]" />
                  <div className="border-b border-[#F4EFE4]" />
                  <div className="border-b border-[#F4EFE4]" />
                </div>

                {/* Individual Equalizer Bars */}
                <div className="relative z-10 w-full flex items-end justify-between gap-1 sm:gap-2 h-full">
                  <div className="w-full bg-[#FFC93C] rounded-t-xs animate-eq-1" style={{ minHeight: '15%' }} />
                  <div className="w-full bg-[#FFC93C] rounded-t-xs animate-eq-3" style={{ minHeight: '20%' }} />
                  <div className="w-full bg-[#E4402A] rounded-t-xs animate-eq-5" style={{ minHeight: '30%' }} title="Sub-bass peak" />
                  <div className="w-full bg-[#FFC93C] rounded-t-xs animate-eq-2" style={{ minHeight: '25%' }} />
                  <div className="w-full bg-[#FFC93C] rounded-t-xs animate-eq-4" style={{ minHeight: '18%' }} />
                  <div className="w-full bg-[#FFC93C] rounded-t-xs animate-eq-1" style={{ minHeight: '22%' }} />
                  <div className="w-full bg-[#E4402A] rounded-t-xs animate-eq-3" style={{ minHeight: '35%' }} title="Spit-snare transient" />
                  <div className="w-full bg-[#FFC93C] rounded-t-xs animate-eq-5" style={{ minHeight: '20%' }} />
                  <div className="w-full bg-[#FFC93C] rounded-t-xs animate-eq-2" style={{ minHeight: '15%' }} />
                  <div className="w-full bg-[#FFC93C] rounded-t-xs animate-eq-4" style={{ minHeight: '10%' }} />
                  <div className="w-full bg-[#FFC93C] rounded-t-xs animate-eq-3" style={{ minHeight: '12%' }} />
                </div>
              </div>

              {/* Interactive Vocal Sound Pad (Subtle interactive demonstration of vocal percussion) */}
              <div className="mt-5 pt-4 border-t border-[#F4EFE4]/15">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-mono tracking-wider text-[#F4EFE4]/80 uppercase flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#FFC93C]" />
                    Test Vocal Sounds (Acoustic Web Synth)
                  </span>
                  {audioPlayed && (
                    <span className="text-[10px] font-mono text-[#FFC93C] font-bold uppercase animate-pulse">
                      Playing: {audioPlayed}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => playVocalSound('kick')}
                    className="px-2.5 py-2 bg-[#14120F] border border-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] text-[#F4EFE4] text-xs font-mono font-bold uppercase tracking-wider transition-all text-center cursor-pointer"
                  >
                    B // Kick
                  </button>
                  <button
                    type="button"
                    onClick={() => playVocalSound('snare')}
                    className="px-2.5 py-2 bg-[#14120F] border border-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] text-[#F4EFE4] text-xs font-mono font-bold uppercase tracking-wider transition-all text-center cursor-pointer"
                  >
                    K // Snare
                  </button>
                  <button
                    type="button"
                    onClick={() => playVocalSound('bass')}
                    className="px-2.5 py-2 bg-[#14120F] border border-[#E4402A] text-[#E4402A] hover:bg-[#E4402A] hover:text-[#F4EFE4] text-xs font-mono font-bold uppercase tracking-wider transition-all text-center cursor-pointer"
                  >
                    Throat Bass
                  </button>
                </div>
              </div>

              {/* Bottom Card Footer Details */}
              <div className="mt-4 pt-3 border-t border-[#F4EFE4]/10 flex items-center justify-between text-[11px] font-mono text-[#F4EFE4]/60">
                <span>0 INSTRUMENTS</span>
                <span className="text-[#FFC93C] font-semibold">100% VOCAL HUMAN SOUNDS</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
