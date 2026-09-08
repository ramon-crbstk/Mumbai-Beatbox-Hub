import React, { useState, useEffect } from 'react';
import { FEATURED_VIDEOS } from '../data/communityData';
import { VideoItem } from '../types';
import { Play, Video, X, Volume2, Flame } from 'lucide-react';
import { fetchVideos } from '../lib/supabase';

interface FeaturedVideosSectionProps {
  refreshTrigger?: number;
}

export const FeaturedVideosSection: React.FC<FeaturedVideosSectionProps> = ({ refreshTrigger = 0 }) => {
  const [videosList, setVideosList] = useState<VideoItem[]>(FEATURED_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadVideos() {
      const items = await fetchVideos();
      if (active && items && items.length > 0) {
        setVideosList(items);
      }
    }
    loadVideos();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  const toggleSoundRoutine = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      setIsPlayingDemo(true);

      // Play a quick 4-count beatbox pattern
      const times = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75];
      times.forEach((t, i) => {
        const isKick = i % 2 === 0;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(isKick ? 120 : 250, ctx.currentTime + t);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + t + 0.15);
        gain.gain.setValueAtTime(0.7, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + t + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.16);
      });

      setTimeout(() => setIsPlayingDemo(false), 2000);
    } catch {
      // Audio context error or not supported
    }
  };

  return (
    <section id="videos" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#FFC93C]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14120F] text-[#FFC93C] border border-[#FFC93C] text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <Video className="w-3.5 h-3.5" />
              <span>COMMUNITY FOOTAGE // ROUTINE DROPS</span>
            </div>
            <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4]">
              Featured Videos & Routine Drops
            </h2>
            <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-1 max-w-xl">
              Recorded cypher battles, solo routine drops, and technical breakdown sessions.
            </p>
          </div>

          <div className="text-xs font-mono text-[#FFC93C]">
            YOUTUBE ARCHIVE // 4K STREET AUDIO
          </div>
        </div>

        {/* Video Thumbnail Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videosList.map((vid, idx) => (
            <div
              key={vid.id}
              id={`video-card-${vid.id}`}
              className="bg-[#181512] border-2 border-[#F4EFE4]/20 hover:border-[#FFC93C] transition-all p-4 flex flex-col justify-between group shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[6px_6px_0px_0px_#FFC93C]"
            >
              
              {/* Thumbnail Container with Play-Button Overlay */}
              <div 
                className="relative aspect-video bg-[#14120F] border border-[#FFC93C]/30 flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => setActiveVideo(vid)}
              >
                {vid.thumbnailUrl ? (
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 opacity-10 bg-taxi-checker" />
                )}

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#14120F] text-[#FFC93C] text-[11px] font-mono font-bold border border-[#FFC93C]/40 z-10">
                  {vid.duration}
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#E4402A] text-[#F4EFE4] text-[10px] font-mono font-bold uppercase tracking-wider z-10">
                  {vid.category}
                </div>

                {/* Big Center Play Button Overlay */}
                <div className="w-14 h-14 bg-[#FFC93C] text-[#14120F] rounded-full flex items-center justify-center border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#F4EFE4] group-hover:scale-110 group-hover:bg-[#F4EFE4] transition-all z-10">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>

                {/* Drop Label */}
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-[#F4EFE4]/40 z-10 bg-[#14120F]/80 px-1.5 py-0.5">
                  DROP #{idx + 1}
                </span>
              </div>

              {/* Video Info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#FFC93C]">
                  <span>{vid.venue}</span>
                  <span className="text-[#F4EFE4]/60">{vid.viewsEstimate}</span>
                </div>

                <h3 className="font-['Anton'] text-xl uppercase tracking-tight text-[#F4EFE4] group-hover:text-[#FFC93C] transition-colors leading-snug">
                  {vid.title}
                </h3>

                <p className="text-xs font-mono text-[#F4EFE4]/70">
                  Featuring: <span className="text-[#F4EFE4] font-medium">{vid.performer}</span>
                </p>
              </div>

              {/* Watch CTA Button */}
              <div className="mt-4 pt-3 border-t border-[#F4EFE4]/10">
                <button
                  type="button"
                  onClick={() => setActiveVideo(vid)}
                  className="w-full py-2 bg-[#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] text-[#F4EFE4] text-xs font-mono font-bold uppercase tracking-wider border border-[#F4EFE4]/30 hover:border-[#14120F] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open Video Player</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="bg-[#14120F] text-[#F4EFE4] border-3 border-[#FFC93C] p-6 max-w-2xl w-full shadow-[8px_8px_0px_0px_#E4402A] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 p-1.5 bg-[#FFC93C] text-[#14120F] hover:bg-[#E4402A] hover:text-[#F4EFE4] transition-colors border border-[#14120F] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-[#FFC93C] font-bold uppercase mb-2">
              <Flame className="w-4 h-4 text-[#E4402A]" />
              <span>{activeVideo.category} // ARCHIVE PLAYER</span>
            </div>

            <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4] mb-4 pr-8">
              {activeVideo.title}
            </h3>

            {/* Video Stage Frame */}
            <div className="aspect-video bg-[#000] border-2 border-[#FFC93C]/40 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden mb-5">
              {activeVideo.videoUrl && activeVideo.videoUrl.includes('youtube') ? (
                <iframe
                  src={activeVideo.videoUrl.replace('watch?v=', 'embed/')}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="space-y-3 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-[#FFC93C] text-[#14120F] flex items-center justify-center mx-auto shadow-md">
                    <Play className="w-7 h-7 fill-current translate-x-0.5" />
                  </div>
                  <div>
                    <p className="font-['Anton'] text-lg text-[#F4EFE4] uppercase">
                      Live Community Acoustic Routine
                    </p>
                    <p className="text-xs font-mono text-[#F4EFE4]/60 mt-1">
                      Performer: {activeVideo.performer} • Venue: {activeVideo.venue}
                    </p>
                  </div>
                </div>
              )}

              {/* Sound sample test button inside player */}
              <button
                type="button"
                onClick={toggleSoundRoutine}
                className="mt-3 px-4 py-2 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#F4EFE4] transition-all flex items-center gap-2 z-10 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingDemo ? 'Playing Acoustic Beat...' : 'Hear 4-Count Vocal Beat'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#F4EFE4]/70 border-t border-[#F4EFE4]/15 pt-3">
              <span>Location: {activeVideo.venue}</span>
              <span>Length: {activeVideo.duration}</span>
              <span className="text-[#FFC93C]">{activeVideo.performer}</span>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
