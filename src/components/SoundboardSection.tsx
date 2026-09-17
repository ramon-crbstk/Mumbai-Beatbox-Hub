import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Radio, 
  Sparkles, 
  Flame, 
  Activity, 
  RotateCcw,
  Keyboard
} from 'lucide-react';
import { BEATBOX_SOUNDS, BeatboxSound, beatboxEngine } from '../utils/beatboxSoundEngine';
import { ScrollReveal } from './animations/MotionComponents';

export const SoundboardSection: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'kick' | 'snare' | 'bass' | 'fx'>('all');
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
  const [recentSequence, setRecentSequence] = useState<string[]>([]);
  const cancelDemoRef = useRef<(() => void) | null>(null);

  // Handle pad trigger
  const triggerSound = (sound: BeatboxSound) => {
    beatboxEngine.playSound(sound.id);
    setActiveSoundId(sound.id);

    // Record into recent sequence tape (keep last 6)
    setRecentSequence((prev) => [...prev.slice(-5), sound.phonetic]);

    // Reset visual trigger active state after 180ms
    setTimeout(() => {
      setActiveSoundId((cur) => (cur === sound.id ? null : cur));
    }, 180);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
        return;
      }

      const matchedSound = BEATBOX_SOUNDS.find((s) => s.hotkey === e.key);
      if (matchedSound) {
        e.preventDefault();
        triggerSound(matchedSound);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
      beatboxEngine.setVolume(0);
    } else {
      setIsMuted(false);
      beatboxEngine.setVolume(val / 100);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      beatboxEngine.setVolume(volume / 100);
    } else {
      setIsMuted(true);
      beatboxEngine.setVolume(0);
    }
  };

  // Handle demo groove playback
  const handlePlayDemo = () => {
    if (isPlayingDemo) {
      if (cancelDemoRef.current) cancelDemoRef.current();
      setIsPlayingDemo(false);
      return;
    }

    setIsPlayingDemo(true);
    const cancel = beatboxEngine.playDemoGroove((soundId) => {
      setActiveSoundId(soundId);
      const sound = BEATBOX_SOUNDS.find((s) => s.id === soundId);
      if (sound) {
        setRecentSequence((prev) => [...prev.slice(-5), sound.phonetic]);
      }
      setTimeout(() => {
        setActiveSoundId((cur) => (cur === soundId ? null : cur));
      }, 160);
    });

    cancelDemoRef.current = cancel;

    setTimeout(() => {
      setIsPlayingDemo(false);
      cancelDemoRef.current = null;
    }, 1800);
  };

  const filteredSounds = filter === 'all' 
    ? BEATBOX_SOUNDS 
    : BEATBOX_SOUNDS.filter((s) => s.category === filter);

  return (
    <section id="soundboard" className="py-14 sm:py-20 bg-[#100E0B] border-b-2 border-[#FFC93C]/20 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#FFC93C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#E4402A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0.05} className="mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#181512] text-[#FFC93C] border border-[#FFC93C]/60 text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-xs">
                <Radio className="w-3.5 h-3.5 text-[#FFC93C] animate-pulse" />
                <span>INTERACTIVE SAMPLER // CYPHERSOUND MPC</span>
              </div>
              <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4] leading-none">
                Street Beatbox Soundboard
              </h2>
              <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-2 max-w-2xl leading-relaxed">
                Tap the pads below or use keyboard keys <span className="text-[#FFC93C] font-bold">[ 1 – 0 ]</span> to fire short acoustic beatbox techniques — synthesized live in your browser with zero latency.
              </p>
            </div>

            {/* Header Controls: Demo Groove & Key Helper */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#181512] border border-[#F4EFE4]/20 text-xs font-mono text-[#F4EFE4]/70">
                <Keyboard className="w-3.5 h-3.5 text-[#FFC93C]" />
                <span>HOTKEYS: 1 TO 0</span>
              </div>

              <button
                type="button"
                onClick={handlePlayDemo}
                className={`px-4 py-2 text-xs font-mono font-bold uppercase flex items-center gap-2 transition-all cursor-pointer border shadow-sm active:scale-95 ${
                  isPlayingDemo
                    ? 'bg-[#E4402A] text-[#F4EFE4] border-[#E4402A] animate-pulse'
                    : 'bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] border-[#FFC93C]'
                }`}
                title="Play an automated 2-bar demo cypher groove"
              >
                {isPlayingDemo ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>STOPPING...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>DEMO 2-BAR GROOVE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* MPC Soundboard Console Wrapper */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="relative bg-[#181512] border-2 border-[#14120F] shadow-[8px_8px_0px_0px_#14120F] p-4 sm:p-6 md:p-8">
            
            {/* Corner Paper Tape Accents for gritty street aesthetic */}
            <div className="absolute -top-2 left-8 w-16 h-4 bg-[#FFC93C]/80 -rotate-2 border border-[#14120F]/40 pointer-events-none shadow-xs z-10" />
            <div className="absolute -bottom-2 right-8 w-16 h-4 bg-[#E4402A]/80 rotate-2 border border-[#14120F]/40 pointer-events-none shadow-xs z-10" />

            {/* Top Sampler Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-[#F4EFE4]/15">
              
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono text-[#F4EFE4]/50 uppercase mr-1 hidden sm:inline">Sound Type:</span>
                {[
                  { id: 'all', label: 'All (10)' },
                  { id: 'kick', label: 'Kick' },
                  { id: 'snare', label: 'Snares' },
                  { id: 'bass', label: 'Bass / Liproll' },
                  { id: 'fx', label: 'Scratches & FX' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilter(cat.id as typeof filter)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold uppercase transition-colors cursor-pointer border ${
                      filter === cat.id
                        ? 'bg-[#FFC93C] text-[#14120F] border-[#FFC93C]'
                        : 'bg-[#14120F] text-[#F4EFE4]/70 hover:text-[#F4EFE4] border-[#F4EFE4]/20'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Volume & Audio Feedback Meter */}
              <div className="flex items-center gap-4">
                {/* Active Level LED Indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#14120F] border border-[#F4EFE4]/20">
                  <Activity className={`w-3.5 h-3.5 transition-colors ${activeSoundId ? 'text-[#FFC93C] animate-ping' : 'text-[#F4EFE4]/30'}`} />
                  <span className="text-[10px] font-mono font-bold uppercase text-[#F4EFE4]/80">
                    {activeSoundId ? 'TRIGGERED' : 'STANDBY'}
                  </span>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    className="text-[#F4EFE4]/70 hover:text-[#FFC93C] transition-colors cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-[#E4402A]" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1.5 bg-[#14120F] rounded-none accent-[#FFC93C] cursor-pointer"
                    title={`Master Volume: ${isMuted ? 0 : volume}%`}
                  />
                  <span className="text-[10px] font-mono text-[#F4EFE4]/60 w-6 text-right">
                    {isMuted ? '0%' : `${volume}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Soundboard Pads Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {filteredSounds.map((sound) => {
                const isActive = activeSoundId === sound.id;

                return (
                  <button
                    key={sound.id}
                    id={`sound-pad-${sound.id}`}
                    type="button"
                    onClick={() => triggerSound(sound)}
                    className={`group relative text-left p-3.5 sm:p-4 border-2 transition-all duration-100 cursor-pointer select-none active:scale-[0.96] flex flex-col justify-between min-h-[120px] sm:min-h-[135px] ${
                      isActive
                        ? 'bg-[#FFC93C] border-[#FFC93C] text-[#14120F] -translate-y-1 shadow-[0px_0px_16px_rgba(255,201,60,0.5)]'
                        : 'bg-[#14120F] hover:bg-[#1f1b16] border-[#F4EFE4]/20 hover:border-[#FFC93C] text-[#F4EFE4] shadow-[3px_3px_0px_0px_#100E0B]'
                    }`}
                  >
                    {/* Top Row: Hotkey Tag & Category Indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
                          isActive
                            ? 'bg-[#14120F] text-[#FFC93C] border-[#14120F]'
                            : 'bg-[#181512] text-[#F4EFE4]/70 border-[#F4EFE4]/20 group-hover:border-[#FFC93C]/50'
                        }`}
                      >
                        KEY {sound.hotkey}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sound.color }}
                        title={`Category: ${sound.category}`}
                      />
                    </div>

                    {/* Middle: Phonetic Callout */}
                    <div className="my-1">
                      <div className={`font-['Anton'] text-2xl sm:text-3xl tracking-tight leading-none transition-colors ${
                        isActive ? 'text-[#14120F]' : 'text-[#FFC93C]'
                      }`}>
                        {sound.phonetic}
                      </div>
                      <div className={`font-bold text-xs sm:text-sm uppercase tracking-wide truncate mt-1 ${
                        isActive ? 'text-[#14120F]' : 'text-[#F4EFE4]'
                      }`}>
                        {sound.name}
                      </div>
                    </div>

                    {/* Bottom: Description Microcopy */}
                    <div className={`text-[10px] font-mono line-clamp-2 mt-1 leading-tight ${
                      isActive ? 'text-[#14120F]/80' : 'text-[#F4EFE4]/50'
                    }`}>
                      {sound.description}
                    </div>

                    {/* Active Ripple Accent */}
                    {isActive && (
                      <span className="absolute inset-0 border-2 border-[#14120F] pointer-events-none animate-ping opacity-30" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Sequence Ticker & Beat Pattern Log */}
            <div className="mt-6 pt-4 border-t border-[#F4EFE4]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-[#F4EFE4]/50 uppercase whitespace-nowrap text-[11px]">Recent Hits:</span>
                {recentSequence.length === 0 ? (
                  <span className="text-[#F4EFE4]/40 italic">Tap any pad or press hotkeys to construct a beat...</span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {recentSequence.map((phonetic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#14120F] text-[#FFC93C] font-bold border border-[#FFC93C]/30 text-[11px] font-mono animate-fadeIn"
                      >
                        {phonetic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {recentSequence.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRecentSequence([])}
                  className="text-[11px] text-[#F4EFE4]/50 hover:text-[#FFC93C] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Ticker</span>
                </button>
              )}
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
