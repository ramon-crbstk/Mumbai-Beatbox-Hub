import React, { useState, useEffect } from 'react';
import { FEATURED_VIDEOS } from '../data/communityData';
import { VideoItem } from '../types';
import { Play, Video, X, Flame, ExternalLink, Link2, Copy, Check } from 'lucide-react';
import { fetchVideos } from '../lib/supabase';

interface FeaturedVideosSectionProps {
  refreshTrigger?: number;
}

// Helper to extract embeddable video URL or direct video stream
function parseVideoSource(rawUrl?: string): {
  type: 'youtube' | 'vimeo' | 'direct';
  embedUrl: string;
  originalUrl: string;
} | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // YouTube formats: watch?v=, youtu.be/, embed/, shorts/, live/
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      originalUrl: trimmed,
    };
  }

  // Vimeo formats: vimeo.com/123456
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`,
      originalUrl: trimmed,
    };
  }

  // Direct video file (mp4, webm, mov, ogg, m4v) or data URL / blob / web link
  return {
    type: 'direct',
    embedUrl: trimmed,
    originalUrl: trimmed,
  };
}

export const FeaturedVideosSection: React.FC<FeaturedVideosSectionProps> = ({ refreshTrigger = 0 }) => {
  const [videosList, setVideosList] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadVideos() {
      const items = await fetchVideos();
      if (active) {
        setVideosList(items.length > 0 ? items : FEATURED_VIDEOS);
      }
    }
    loadVideos();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const parsedActiveVideo = activeVideo ? parseVideoSource(activeVideo.videoUrl) : null;

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
              Recorded cypher battles, routine drops, and technical breakdown sessions.
            </p>
          </div>

          <div className="text-xs font-mono text-[#FFC93C]">
            COMMUNITY STREAM // STREET FOOTAGE
          </div>
        </div>

        {/* Video Thumbnail Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videosList.length === 0 ? (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-[#FFC93C]/30 bg-[#181512] p-8">
              <Video className="w-10 h-10 text-[#FFC93C]/60 mx-auto mb-3" />
              <h3 className="font-['Anton'] text-xl text-[#F4EFE4] tracking-wide uppercase">Routine Drops Archive</h3>
              <p className="font-mono text-xs text-[#F4EFE4]/60 mt-1 max-w-md mx-auto">
                Video drops added by the community will appear here.
              </p>
            </div>
          ) : (
            videosList.map((vid, idx) => {
              const displayCategory = vid.category?.replace(/solo/gi, '').trim();

              return (
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
                    <div className="absolute inset-0 bg-[#1A1713] flex items-center justify-center">
                      <Video className="w-12 h-12 text-[#FFC93C]/30" />
                    </div>
                  )}

                  {/* Category Badge (without solo text) */}
                  {displayCategory && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#E4402A] text-[#F4EFE4] text-[10px] font-mono font-bold uppercase tracking-wider z-10">
                      {displayCategory}
                    </div>
                  )}

                  {/* Big Center Play Button Overlay */}
                  <div className="w-14 h-14 bg-[#FFC93C] text-[#14120F] rounded-full flex items-center justify-center border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#F4EFE4] group-hover:scale-110 group-hover:bg-[#F4EFE4] transition-all z-10">
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </div>

                  {/* Drop Label */}
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono text-[#F4EFE4]/60 z-10 bg-[#14120F]/90 px-1.5 py-0.5">
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

                  {/* Video Link Display on Card */}
                  {vid.videoUrl && (
                    <div className="pt-2">
                      <a
                        href={vid.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#FFC93C] hover:underline hover:text-[#ffe082] transition-colors break-all"
                      >
                        <Link2 className="w-3.5 h-3.5 shrink-0 text-[#FFC93C]" />
                        <span className="truncate max-w-[240px] sm:max-w-[280px]">
                          {vid.videoUrl}
                        </span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Watch CTA Button */}
                <div className="mt-4 pt-3 border-t border-[#F4EFE4]/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveVideo(vid)}
                    className="flex-1 py-2 bg-[#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] text-[#F4EFE4] text-xs font-mono font-bold uppercase tracking-wider border border-[#F4EFE4]/30 hover:border-[#14120F] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Video</span>
                  </button>

                  {vid.videoUrl && (
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2 bg-[#1A1713] hover:bg-[#FFC93C] text-[#FFC93C] hover:text-[#14120F] border border-[#FFC93C]/40 transition-colors"
                      title="Open video URL in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

              </div>
            );
          }))}
        </div>

      </div>

      {/* Video Player Modal: Plays directly from the video URL */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xs p-3 sm:p-6"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="bg-[#14120F] text-[#F4EFE4] border-3 border-[#FFC93C] p-4 sm:p-6 max-w-3xl w-full shadow-[8px_8px_0px_0px_#E4402A] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 p-1.5 bg-[#FFC93C] text-[#14120F] hover:bg-[#E4402A] hover:text-[#F4EFE4] transition-colors border border-[#14120F] cursor-pointer z-20"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-[#FFC93C] font-bold uppercase mb-2">
              <Flame className="w-4 h-4 text-[#E4402A]" />
              <span>{activeVideo.category} // VIDEO STREAM</span>
            </div>

            <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4] mb-3 pr-10">
              {activeVideo.title}
            </h3>

            {/* Video Stage Frame: Plays video from URL */}
            <div className="aspect-video bg-[#000] border-2 border-[#FFC93C]/40 flex items-center justify-center relative overflow-hidden mb-4">
              {parsedActiveVideo?.type === 'youtube' || parsedActiveVideo?.type === 'vimeo' ? (
                <iframe
                  src={parsedActiveVideo.embedUrl}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : parsedActiveVideo?.type === 'direct' && parsedActiveVideo.embedUrl ? (
                <video
                  src={parsedActiveVideo.embedUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support HTML video playback.
                </video>
              ) : (
                <div className="p-6 text-center font-mono text-xs text-[#F4EFE4]/70 space-y-2">
                  <Video className="w-10 h-10 text-[#FFC93C] mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-bold text-[#F4EFE4]">No video URL configured yet for this item.</p>
                  <p className="text-[11px] text-[#F4EFE4]/50">
                    Add a YouTube link or direct video URL in the Admin Panel &gt; Videos tab.
                  </p>
                </div>
              )}
            </div>

            {/* Prominent Video Link Display */}
            {activeVideo.videoUrl && (
              <div className="mb-4 p-3 bg-[#1A1713] border border-[#FFC93C]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Link2 className="w-4 h-4 text-[#FFC93C] shrink-0" />
                  <span className="text-[#F4EFE4]/60 shrink-0">Video Link:</span>
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFC93C] hover:underline truncate font-medium"
                    title={activeVideo.videoUrl}
                  >
                    {activeVideo.videoUrl}
                  </a>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyLink(activeVideo.videoUrl || '')}
                    className="px-2.5 py-1 bg-[#14120F] text-[#F4EFE4] hover:text-[#FFC93C] border border-[#F4EFE4]/30 text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#FFC93C] text-[#14120F] hover:bg-[#F4EFE4] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Video Metadata Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#F4EFE4]/70 border-t border-[#F4EFE4]/15 pt-3">
              <span>Location: <strong className="text-[#F4EFE4]">{activeVideo.venue}</strong></span>
              <span>Performer: <strong className="text-[#FFC93C]">{activeVideo.performer}</strong></span>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
