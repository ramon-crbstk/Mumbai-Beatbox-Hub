import React, { useState, useEffect, useRef } from 'react';
import { CommunityMember } from '../types';
import { fetchCommunityMembers } from '../lib/supabase';
import { COMMUNITY_MEMBERS } from '../data/communityData';
import { 
  Sparkles, 
  Play, 
  Square, 
  ExternalLink, 
  MapPin, 
  Instagram, 
  Mic, 
  Radio, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  ArrowRight,
  Headphones
} from 'lucide-react';
import { ScrollReveal } from './animations/MotionComponents';

interface MemberSpotlightSectionProps {
  refreshTrigger?: number;
}

function isValidAudio(url: unknown): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return false;
  try {
    const parsed = new URL(trimmed, window.location.origin);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const MemberSpotlightSection: React.FC<MemberSpotlightSectionProps> = ({ refreshTrigger = 0 }) => {
  const [members, setMembers] = useState<(CommunityMember & { photoUrl: string })[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [loading, setLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch beatboxer profiles from Supabase
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const remote = await fetchCommunityMembers();
      if (active) {
        if (remote && remote.length > 0) {
          setMembers(remote);
        } else {
          // Graceful fallback to community sample data if database is empty
          setMembers(COMMUNITY_MEMBERS.map((m) => ({ ...m, photoUrl: m.photoUrl || '' })));
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  const currentMember = members[selectedIndex] || members[0] || null;
  const rawAudioUrl = currentMember ? (currentMember.voice_note_url || currentMember.voiceNoteUrl || currentMember.audioUrl || currentMember.audio_url) : null;
  const hasAudio = isValidAudio(rawAudioUrl);

  // Stop audio on index change or unmount
  const stopAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      } catch {
        // audio cleanup
      }
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  useEffect(() => {
    stopAudio();
  }, [selectedIndex]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const togglePlayAudio = () => {
    if (!hasAudio || !rawAudioUrl) return;

    if (isPlaying) {
      stopAudio();
      return;
    }

    const sound = new Audio(rawAudioUrl);
    audioRef.current = sound;

    sound.onloadedmetadata = () => {
      if (sound.duration && isFinite(sound.duration)) {
        setDuration(sound.duration);
      }
    };

    sound.ontimeupdate = () => {
      setCurrentTime(sound.currentTime || 0);
    };

    sound.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    sound.onerror = () => {
      console.warn('Voice note playback error for', currentMember?.name);
      setIsPlaying(false);
    };

    sound
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn('Playback error:', err);
        setIsPlaying(false);
      });
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleNext = () => {
    if (members.length <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % members.length);
  };

  const handlePrev = () => {
    if (members.length <= 1) return;
    setSelectedIndex((prev) => (prev - 1 + members.length) % members.length);
  };

  const scrollToRoster = (memberId?: string) => {
    const target = memberId ? document.getElementById(`member-card-${memberId}`) : document.getElementById('members');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const section = document.getElementById('members');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!currentMember && !loading) {
    return null;
  }

  // Construct comprehensive bio narrative
  const displayBio = currentMember?.bio?.trim()
    ? currentMember.bio
    : currentMember
    ? `Vocal percussionist representing Mumbai Beatbox Hub with ${currentMember.experience} of dedicated cypher experience. Specializing in ${currentMember.specialty} across Mumbai's underground street battles, pushing raw acoustic basslines, live mic control, and community collaboration.`
    : '';

  const photo = currentMember ? (currentMember.photo_url || currentMember.photoUrl) : '';

  return (
    <section id="spotlight" className="py-16 md:py-24 bg-[#100E0C] border-b-2 border-[#FFC93C]/20 relative overflow-hidden">
      {/* Background Ambient Glow Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FFC93C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#E4402A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0.05} className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14120F] text-[#FFC93C] border border-[#FFC93C] text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC93C]" />
              <span>FEATURED BEATBOXER // COMMUNITY SPOTLIGHT</span>
            </div>
            <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4]">
              Member Spotlight
            </h2>
            <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-1 max-w-xl">
              Showcasing verified artists from Mumbai's underground scene with their technical specialties and voice note drops.
            </p>
          </div>

          {/* Cycler Controls if multiple members exist */}
          {members.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#F4EFE4]/60">
                {selectedIndex + 1} of {members.length} Artists
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous featured artist"
                  className="p-2 bg-[#181512] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#F4EFE4]/20 hover:border-[#FFC93C] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next featured artist"
                  className="p-2 bg-[#181512] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#F4EFE4]/20 hover:border-[#FFC93C] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </ScrollReveal>

        {/* Featured Spotlight Card */}
        {currentMember && (
          <ScrollReveal direction="up" delay={0.1}>
            <div className="bg-[#181512] border-2 border-[#FFC93C] shadow-[8px_8px_0px_0px_#E4402A] overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                
                {/* Left Column: Visual Artist Frame (5 cols on lg) */}
                <div className="lg:col-span-5 relative bg-[#0D0B09] min-h-[360px] sm:min-h-[420px] lg:min-h-full flex items-center justify-center border-b-2 lg:border-b-0 lg:border-r-2 border-[#FFC93C]/30 overflow-hidden group">
                  {photo ? (
                    <>
                      {/* Ambient soft-blur duplicate for letterbox margins */}
                      <img
                        src={photo}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none"
                      />
                      {/* Crisp uncropped foreground image */}
                      <img
                        src={photo}
                        alt={`${currentMember.name} - Mumbai Beatbox Hub Spotlight`}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="relative z-10 w-full h-full max-h-[500px] object-cover sm:object-contain lg:object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-[#FFC93C]">
                      <span className="font-['Anton'] text-7xl">{currentMember.avatarInitials}</span>
                      <span className="font-mono text-xs uppercase tracking-widest text-[#F4EFE4]/60 mt-2">
                        Mumbai Beatbox Hub Artist
                      </span>
                    </div>
                  )}

                  {/* Top Badge: Territory & Spotlight Tag */}
                  <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#E4402A] text-[#F4EFE4] text-xs font-mono font-bold uppercase tracking-wider border border-[#14120F] shadow-[2px_2px_0px_0px_#14120F]">
                      SPOTLIGHT
                    </span>
                    <span className="px-3 py-1 bg-[#14120F]/90 text-[#F4EFE4] text-xs font-mono flex items-center gap-1 border border-[#F4EFE4]/30 backdrop-blur-xs">
                      <MapPin className="w-3 h-3 text-[#FFC93C]" />
                      {currentMember.area}
                    </span>
                  </div>

                  {/* Bottom Strip: Specialty Pill */}
                  <div className="absolute bottom-3 left-3 right-3 z-20">
                    <div className="p-2.5 bg-[#14120F]/95 border border-[#FFC93C]/50 backdrop-blur-xs flex items-center justify-between">
                      <span className="text-xs font-mono text-[#FFC93C] font-bold uppercase truncate">
                        ★ {currentMember.specialty}
                      </span>
                      <span className="text-[11px] font-mono text-[#F4EFE4]/70 shrink-0 ml-2">
                        {currentMember.experience}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Bio Narrative, Details & Voice Note Upload Links (7 cols on lg) */}
                <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
                  
                  {/* Artist Header Information */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFC93C]">
                        COMMUNITY RESIDENT ARTIST
                      </span>
                      {currentMember.handle && (
                        <a
                          href={`https://instagram.com/${currentMember.handle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#14120F] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#F4EFE4]/20 hover:border-[#FFC93C] text-xs font-mono transition-colors"
                          title="Open Instagram Profile"
                        >
                          <Instagram className="w-3.5 h-3.5 text-[#E4402A]" />
                          <span>{currentMember.handle.startsWith('@') ? currentMember.handle : `@${currentMember.handle}`}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                        </a>
                      )}
                    </div>

                    <h3 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4] leading-none mb-4">
                      {currentMember.name}
                    </h3>

                    {/* Bio Narrative */}
                    <div className="relative pl-4 border-l-2 border-[#FFC93C] mb-6">
                      <p className="text-sm sm:text-base font-mono text-[#F4EFE4]/85 leading-relaxed">
                        {displayBio}
                      </p>
                    </div>

                    {/* Technical Specifications Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 font-mono text-xs">
                      <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
                        <span className="text-[#F4EFE4]/50 block text-[10px] uppercase">Specialty</span>
                        <strong className="text-[#FFC93C] text-xs block truncate mt-0.5">{currentMember.specialty}</strong>
                      </div>
                      <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
                        <span className="text-[#F4EFE4]/50 block text-[10px] uppercase">Territory</span>
                        <strong className="text-[#F4EFE4] text-xs block truncate mt-0.5">{currentMember.area}</strong>
                      </div>
                      <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15 col-span-2 sm:col-span-1">
                        <span className="text-[#F4EFE4]/50 block text-[10px] uppercase">Experience</span>
                        <strong className="text-[#F4EFE4] text-xs block truncate mt-0.5">{currentMember.experience}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Voice Note Upload Section & Direct Links */}
                  <div className="p-5 sm:p-6 bg-[#14120F] border-2 border-[#F4EFE4]/15 space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-[#F4EFE4]/15 pb-3">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-[#FFC93C]" />
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#F4EFE4]">
                          Voice Note Uploads & Audio Stream
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#FFC93C]">
                        {hasAudio ? (currentMember.voiceNoteDuration || 'Available') : 'No Audio File'}
                      </span>
                    </div>

                    {/* Interactive Voice Note Audio Player */}
                    {hasAudio && rawAudioUrl ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#F4EFE4]/70 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-[#FFC93C]" />
                            <span>{isPlaying ? 'Streaming Voice Note...' : 'Routine Recording Ready'}</span>
                          </span>
                          <span className="text-[#FFC93C] font-mono font-bold">
                            {isPlaying
                              ? `${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}`
                              : currentMember.voiceNoteDuration || '0:15'}
                          </span>
                        </div>

                        {/* Audio Progress Scrubber */}
                        <div className="w-full bg-[#242019] h-2.5 overflow-hidden border border-[#FFC93C]/30 relative">
                          <div
                            className="bg-[#FFC93C] h-full transition-all duration-150"
                            style={{
                              width: duration > 0 ? `${(currentTime / duration) * 100}%` : isPlaying ? '60%' : '0%',
                            }}
                          />
                        </div>

                        {/* Audio Playback Trigger */}
                        <button
                          type="button"
                          onClick={togglePlayAudio}
                          className={`w-full py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] transition-all cursor-pointer ${
                            isPlaying
                              ? 'bg-[#E4402A] text-[#F4EFE4] hover:bg-[#c9321e]'
                              : 'bg-[#FFC93C] text-[#14120F] hover:bg-[#F4EFE4]'
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Square className="w-4 h-4 fill-current" />
                              <span>Stop Voice Note</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current" />
                              <span>Play Voice Note Upload</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="py-3 px-4 bg-[#181512] border border-dashed border-[#F4EFE4]/20 text-center font-mono text-xs text-[#F4EFE4]/60">
                        <Mic className="w-4 h-4 text-[#FFC93C]/60 mx-auto mb-1.5" />
                        <span>No voice note upload currently attached to this member profile.</span>
                      </div>
                    )}

                    {/* Direct Links to Voice Note Uploads */}
                    <div className="pt-2 flex flex-wrap items-center gap-2.5">
                      {hasAudio && rawAudioUrl ? (
                        <>
                          {/* Direct External Link to Voice Note File (Cloudinary / MP3) */}
                          <a
                            href={rawAudioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[200px] py-2.5 px-3.5 bg-[#181512] hover:bg-[#201C17] text-[#FFC93C] hover:text-[#F4EFE4] border border-[#FFC93C]/40 hover:border-[#FFC93C] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            title="Open direct voice note audio file in new browser tab"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Open Audio File</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                          </a>

                          {/* Copy Direct Audio URL */}
                          <button
                            type="button"
                            onClick={() => handleCopyLink(rawAudioUrl)}
                            className="py-2.5 px-3 bg-[#181512] hover:bg-[#201C17] text-[#F4EFE4]/80 hover:text-[#FFC93C] border border-[#F4EFE4]/20 hover:border-[#FFC93C]/50 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Copy voice note upload URL to clipboard"
                          >
                            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedUrl ? 'Copied' : 'Copy Audio Link'}</span>
                          </button>
                        </>
                      ) : null}

                      {/* Link to Community Roster Card */}
                      <button
                        type="button"
                        onClick={() => scrollToRoster(currentMember.id)}
                        className="py-2.5 px-4 bg-transparent hover:bg-[#181512] text-[#F4EFE4]/70 hover:text-[#FFC93C] border border-[#F4EFE4]/20 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>View in Roster</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            </div>
          </ScrollReveal>
        )}

      </div>
    </section>
  );
};
