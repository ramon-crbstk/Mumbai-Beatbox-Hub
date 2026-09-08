import React, { useState, useRef, useEffect } from 'react';
import { COMMUNITY_MEMBERS } from '../data/communityData';
import { CommunityMember } from '../types';
import { Play, Square, ChevronLeft, ChevronRight, Mic, MapPin, Volume2, Radio, Headphones, Sparkles, Filter, Database } from 'lucide-react';
import { fetchCommunityMembers, isSupabaseConfigured } from '../lib/supabase';

interface MembersSectionProps {
  onOpenAdmin?: () => void;
  refreshTrigger?: number;
}

export const MembersSection: React.FC<MembersSectionProps> = ({ onOpenAdmin, refreshTrigger = 0 }) => {
  const [membersList, setMembersList] = useState<(CommunityMember & { photoUrl: string })[]>(COMMUNITY_MEMBERS);
  const [isDbSynced, setIsDbSynced] = useState(false);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<{ [id: string]: number }>({});
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadMembers() {
      const remote = await fetchCommunityMembers();
      if (isMounted && remote && remote.length > 0) {
        setMembersList(remote);
        setIsDbSynced(isSupabaseConfigured());
      }
    }
    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);
  
  // Audio state references
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundTimerRef = useRef<number | null>(null);
  const intervalTimerRef = useRef<number | null>(null);

  // Stop any active audio synthesizers safely
  const stopAllAudio = () => {
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // audio context already closed
      }
      audioContextRef.current = null;
    }
    if (soundTimerRef.current) {
      clearTimeout(soundTimerRef.current);
      soundTimerRef.current = null;
    }
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    setActiveMemberId(null);
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Web Audio API custom beatbox generator for each member
  const playVoiceNote = (member: CommunityMember & { photoUrl: string }) => {
    // If clicked on the already playing member, stop it
    if (activeMemberId === member.id) {
      stopAllAudio();
      return;
    }

    // Stop current audio if playing
    stopAllAudio();

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      setActiveMemberId(member.id);
      setPlaybackProgress((prev) => ({ ...prev, [member.id]: 0 }));

      // Duration in seconds (parsed from voiceNoteDuration e.g. "0:16" -> 16s or demo loop 8-12s)
      const durationSeconds = parseInt(member.voiceNoteDuration.split(':')[1] || '14', 10);
      const totalSteps = durationSeconds;
      let currentStep = 0;

      intervalTimerRef.current = window.setInterval(() => {
        currentStep += 1;
        setPlaybackProgress((prev) => ({
          ...prev,
          [member.id]: Math.min(100, Math.round((currentStep / totalSteps) * 100)),
        }));
        if (currentStep >= totalSteps) {
          stopAllAudio();
        }
      }, 1000);

      // Synthesize rhythmic sounds according to soundType
      const schedulePattern = () => {
        if (!ctx || ctx.state === 'closed') return;
        const now = ctx.currentTime;
        const bpm = member.soundType === 'fast-tech' ? 140 : member.soundType === 'trap-click' ? 128 : 95;
        const stepDuration = 60 / bpm / 2; // 8th note duration

        for (let i = 0; i < 16; i++) {
          const time = now + i * stepDuration;

          if (member.soundType === 'bass-growl') {
            // Low sub-bass kick + inward sawtooth rumble
            if (i % 4 === 0) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(80, time);
              osc.frequency.exponentialRampToValueAtTime(32, time + 0.3);
              gain.gain.setValueAtTime(0.7, time);
              gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(time);
              osc.stop(time + 0.36);
            }
            if (i % 4 === 2) {
              // Vocal snare / throat pop
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.type = 'triangle';
              osc2.frequency.setValueAtTime(240, time);
              osc2.frequency.exponentialRampToValueAtTime(70, time + 0.15);
              gain2.gain.setValueAtTime(0.5, time);
              gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              osc2.start(time);
              osc2.stop(time + 0.16);
            }
          } else if (member.soundType === 'liproll') {
            // Deep hollow pop + wobble
            if (i % 2 === 0) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(110, time);
              osc.frequency.exponentialRampToValueAtTime(40, time + 0.22);
              gain.gain.setValueAtTime(0.6, time);
              gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(time);
              osc.stop(time + 0.23);
            }
            if (i % 4 === 1 || i % 4 === 3) {
              // Lip click roll
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'square';
              osc.frequency.setValueAtTime(450, time);
              osc.frequency.exponentialRampToValueAtTime(120, time + 0.06);
              gain.gain.setValueAtTime(0.3, time);
              gain.gain.exponentialRampToValueAtTime(0.01, time + 0.06);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(time);
              osc.stop(time + 0.07);
            }
          } else if (member.soundType === 'fast-tech') {
            // Rapid double-tongue hi-hats & sharp spit snares
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const isSnare = i % 4 === 2;
            osc.type = isSnare ? 'triangle' : 'square';
            osc.frequency.setValueAtTime(isSnare ? 320 : 800 + (i % 3) * 100, time);
            osc.frequency.exponentialRampToValueAtTime(isSnare ? 50 : 200, time + (isSnare ? 0.12 : 0.04));
            gain.gain.setValueAtTime(isSnare ? 0.6 : 0.25, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + (isSnare ? 0.12 : 0.04));
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + (isSnare ? 0.13 : 0.05));
          } else if (member.soundType === 'polyphonic') {
            // Harmonics + bass fundamental
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.type = 'sine';
            osc2.type = 'sawtooth';
            osc1.frequency.setValueAtTime(130, time);
            osc2.frequency.setValueAtTime(260 + (i % 4) * 35, time);
            gain.gain.setValueAtTime(0.35, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + stepDuration * 0.9);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            osc1.start(time);
            osc2.start(time);
            osc1.stop(time + stepDuration * 0.95);
            osc2.stop(time + stepDuration * 0.95);
          } else if (member.soundType === 'scratch') {
            // Vinyl frequency chirp scratch
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            const startFreq = i % 2 === 0 ? 300 : 750;
            const endFreq = i % 2 === 0 ? 800 : 250;
            osc.frequency.setValueAtTime(startFreq, time);
            osc.frequency.linearRampToValueAtTime(endFreq, time + 0.1);
            gain.gain.setValueAtTime(0.4, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.11);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.12);
          } else {
            // Trap-click & 808
            if (i % 4 === 0) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(150, time);
              osc.frequency.exponentialRampToValueAtTime(38, time + 0.35);
              gain.gain.setValueAtTime(0.75, time);
              gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(time);
              osc.stop(time + 0.36);
            }
            if (i % 2 !== 0) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'square';
              osc.frequency.setValueAtTime(600, time);
              osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
              gain.gain.setValueAtTime(0.2, time);
              gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(time);
              osc.stop(time + 0.06);
            }
          }
        }
      };

      schedulePattern();

      // Schedule another loop if audio still playing after 16 steps
      soundTimerRef.current = window.setTimeout(() => {
        if (activeMemberId === member.id) {
          schedulePattern();
        }
      }, 3500);

    } catch (err) {
      console.warn('Audio playback error:', err);
      stopAllAudio();
    }
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  const filteredMembers = selectedFilter === 'all'
    ? membersList
    : membersList.filter((m) => m.soundType === selectedFilter);

  const filterOptions = [
    { label: 'All Beatboxers (22)', value: 'all' },
    { label: 'Inward & Sub Bass', value: 'bass-growl' },
    { label: 'Liproll & Glitch', value: 'liproll' },
    { label: 'Fast Tech & Speed', value: 'fast-tech' },
    { label: 'Polyphonic & Harmonics', value: 'polyphonic' },
    { label: 'Vinyl Scratch', value: 'scratch' },
    { label: 'Trap & 808s', value: 'trap-click' },
  ];

  return (
    <section id="members" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#FFC93C]/20 relative overflow-hidden">
      {/* Background Graphic Lines */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC93C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E4402A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14120F] text-[#FFC93C] border border-[#FFC93C] text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#FFC93C]" />
              <span>ROSTER & AUDIO ARCHIVE // 20+ ARTISTS</span>
            </div>
            
            <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4]">
              Members of the Community
            </h2>
            
            <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-2 max-w-2xl leading-relaxed">
              Meet the vocal percussionists representing Mumbai's streets. Tap <span className="text-[#FFC93C] font-bold">START</span> on any card below to listen to their showcase voice notes, recorded live in our cyphers.
            </p>
          </div>

          {/* Navigation Controls: Left & Right Scroll Buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right mr-2">
              <span className="text-xs font-mono text-[#FFC93C] font-bold">HORIZONTAL DIRECTORY</span>
              <span className="text-[11px] font-mono text-[#F4EFE4]/50">Scroll left-right for all members</span>
            </div>
            
            <button
              id="members-scroll-left-btn"
              onClick={handleScrollLeft}
              aria-label="Scroll members left"
              className="p-3 bg-[#1E1B16] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#FFC93C]/40 hover:border-[#FFC93C] transition-colors shadow-md active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="members-scroll-right-btn"
              onClick={handleScrollRight}
              aria-label="Scroll members right"
              className="p-3 bg-[#1E1B16] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#FFC93C]/40 hover:border-[#FFC93C] transition-colors shadow-md active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filters for fast navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin scrollbar-thumb-[#FFC93C]/20 text-xs font-mono">
          <span className="flex items-center gap-1 text-[#FFC93C] font-bold uppercase tracking-wider pr-2 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" /> Filter Sound:
          </span>
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedFilter(opt.value)}
              className={`px-3 py-1.5 whitespace-nowrap font-mono transition-all border ${
                selectedFilter === opt.value
                  ? 'bg-[#FFC93C] text-[#14120F] border-[#FFC93C] font-bold shadow'
                  : 'bg-[#1E1B16] text-[#F4EFE4]/70 border-[#FFC93C]/20 hover:border-[#FFC93C]/60 hover:text-[#F4EFE4]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Horizontal Scrollable Row for 20+ Member Cards */}
        <div
          ref={scrollContainerRef}
          id="members-scroll-container"
          className="flex gap-6 overflow-x-auto pb-8 pt-2 scroll-smooth snap-x snap-mandatory focus:outline-none scrollbar-thin scrollbar-track-[#1E1B16] scrollbar-thumb-[#FFC93C]/40 hover:scrollbar-thumb-[#FFC93C]"
          tabIndex={0}
          role="region"
          aria-label="Community members showcase list"
        >
          {filteredMembers.map((member, index) => {
            const isPlaying = activeMemberId === member.id;
            const progress = playbackProgress[member.id] || 0;

            return (
              <div
                key={member.id}
                id={`member-card-${member.id}`}
                className={`snap-start shrink-0 w-[290px] sm:w-[320px] bg-[#1A1713] border-2 transition-all duration-300 flex flex-col justify-between group ${
                  isPlaying
                    ? 'border-[#FFC93C] shadow-[0_0_25px_rgba(255,201,60,0.25)] scale-[1.01]'
                    : 'border-[#FFC93C]/25 hover:border-[#FFC93C]/70 hover:shadow-lg'
                }`}
              >
                {/* Top Section: Photo of the Member */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#242019]">
                  <img
                    src={member.photoUrl}
                    alt={`${member.name} - Mumbai Beatboxer`}
                    className="w-full h-full object-cover object-center filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback if network blocks unsplash
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Fallback Initials Avatar Box in case image is missing */}
                  <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#1E1B16] to-[#2B261F] text-[#FFC93C]">
                    <span className="font-['Anton'] text-4xl">{member.avatarInitials}</span>
                    <span className="font-mono text-[10px] text-[#F4EFE4]/60 mt-1 uppercase tracking-widest">
                      MHB ARTIST #{index + 1}
                    </span>
                  </div>

                  {/* Badge: Member Index & Area */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-[#14120F]/90 text-[#FFC93C] border border-[#FFC93C]/60 text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-sm">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="px-2 py-0.5 bg-[#14120F]/90 text-[#F4EFE4] text-[10px] font-mono flex items-center gap-1 backdrop-blur-sm">
                      <MapPin className="w-2.5 h-2.5 text-[#FFC93C]" />
                      {member.area}
                    </span>
                  </div>

                  {/* Specialty Ribbon */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <span className="inline-block px-2.5 py-1 bg-[#14120F]/95 text-[#FFC93C] text-[11px] font-mono font-bold uppercase tracking-wider border border-[#FFC93C]/40 truncate max-w-full">
                      ★ {member.specialty}
                    </span>
                  </div>

                  {/* Live Pulse Indicator if Playing */}
                  {isPlaying && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#E4402A] text-[#F4EFE4] text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F4EFE4]" />
                      PLAYING VOICE
                    </div>
                  )}
                </div>

                {/* Middle Section: Member Name & Bio */}
                <div className="p-4 border-b border-[#FFC93C]/15 bg-[#171410] flex-grow">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4] group-hover:text-[#FFC93C] transition-colors leading-tight">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-[#FFC93C] font-semibold">{member.handle}</span>
                        <span className="text-[10px] font-mono text-[#F4EFE4]/50">• {member.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Voice Note Player with START / STOP button */}
                <div className="p-4 bg-[#14120F] space-y-3">
                  
                  {/* Voice Note Info Header */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#F4EFE4]/80 font-medium truncate max-w-[180px] flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-[#FFC93C] shrink-0" />
                      {member.voiceNoteTitle}
                    </span>
                    <span className="text-[#FFC93C] font-mono font-bold shrink-0">
                      {isPlaying ? `0:${String(Math.floor((progress / 100) * 16)).padStart(2, '0')}` : member.voiceNoteDuration}
                    </span>
                  </div>

                  {/* Equalizer Waveform Animation Bars */}
                  <div className="h-8 bg-[#1A1713] border border-[#FFC93C]/20 px-2 flex items-center justify-between gap-1 overflow-hidden">
                    {[35, 75, 45, 90, 60, 100, 40, 80, 50, 95, 65, 30, 85, 55, 70, 40, 90, 60, 45, 80].map((baseHeight, barIdx) => {
                      return (
                        <div
                          key={barIdx}
                          className={`w-1 transition-all duration-150 ${
                            isPlaying
                              ? 'bg-[#FFC93C]'
                              : barIdx < (progress / 5)
                              ? 'bg-[#FFC93C]/60'
                              : 'bg-[#F4EFE4]/20'
                          }`}
                          style={{
                            height: isPlaying
                              ? `${Math.max(15, Math.sin(barIdx + Date.now() / 150) * 40 + baseHeight * 0.5)}%`
                              : `${Math.max(12, baseHeight * 0.4)}%`,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Playback Progress Bar */}
                  <div className="w-full bg-[#231F19] h-1.5 overflow-hidden">
                    <div
                      className="bg-[#FFC93C] h-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Sound Player Button: START / STOP */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <button
                      id={`voice-btn-${member.id}`}
                      onClick={() => playVoiceNote(member)}
                      className={`w-full py-2.5 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                        isPlaying
                          ? 'bg-[#E4402A] text-[#F4EFE4] hover:bg-[#c9321e] border border-[#E4402A]'
                          : 'bg-[#FFC93C] text-[#14120F] hover:bg-[#ffcf56] border border-[#FFC93C]'
                      }`}
                      aria-label={isPlaying ? `Stop voice note of ${member.name}` : `Start voice note of ${member.name}`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>STOP VOICE NOTE</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>START VOICE NOTE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Directory Footer Info & Scroll Tip */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#F4EFE4]/60 border-t border-[#FFC93C]/20 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFC93C]" />
            <span>Showing {filteredMembers.length} active vocalists across Western, Central, and Harbour zones</span>
            {isDbSynced && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFC93C]/10 text-[#FFC93C] border border-[#FFC93C]/40 text-[10px] uppercase">
                <Database className="w-3 h-3" />
                Live Supabase Sync
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#FFC93C] font-semibold">Want your voice note featured here?</span>
            <a
              href="#contact"
              className="underline hover:text-[#F4EFE4] transition-colors"
            >
              Submit Routine Drop →
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
