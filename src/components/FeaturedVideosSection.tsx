import React, { useState, useEffect } from 'react';
import { VideoItem } from '../types';
import { Play, Video, X, Flame, ExternalLink, Link2, Copy, Check } from 'lucide-react';
import { fetchVideos } from '../lib/supabase';
import { getCloudinaryVideoThumbnailUrl } from '../lib/cloudinary';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations/MotionComponents';

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
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null;

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
        setVideosList(items);
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
        <ScrollReveal direction="up" delay={0.05} className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
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
        </ScrollReveal>

        {/* Video Thumbnail Row */}
        {videosList.length === 0 ? (
          <div className="grid grid-cols-1 gap-8">
            <div className="col-span-full py-16 text-center border-2 border-dashed border-[#FFC93C]/30 bg-[#181512] p-8">
              <Video className="w-10 h-10 text-[#FFC93C]/60 mx-auto mb-3" />
              <h3 className="font-['Anton'] text-xl text-[#F4EFE4] tracking-wide uppercase">Routine Drops Archive</h3>
              <p className="font-mono text-xs text-[#F4EFE4]/60 mt-1 max-w-md mx-auto">
                Video drops added by the community will appear here.
              </p>
            </div>
          </div>
        ) : (
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videosList.map((vid, idx) => {
              const displayCategory = vid.category?.replace(/solo/gi, '').trim();

              return (
                <StaggerItem
                  key={vid.id}
                  direction="up"
                  className="h-full flex flex-col"
                >
                  <div
                    id={`video-card-${vid.id}`}
                    className="relative overflow-hidden bg-[#181512] border-2 border-[#F4EFE4]/20 hover:border-[#FFC93C] transition-all min-h-[420px] sm:min-h-[460px] flex flex-col justify-between group shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[6px_6px_0px_0px_#FFC93C] h-full"
                  >
                    {/* Full-bleed Thumbnail Image using 100% of the card space with auto Cloudinary transformations (w: 640, f: auto, q: auto) */}
                    {vid.thumbnailUrl && !vid.thumbnailUrl.startsWith('data:') && !vid.thumbnailUrl.startsWith('blob:') ? (
                      <img
                        src={getCloudinaryVideoThumbnailUrl(vid.thumbnailUrl, { width: 640, format: 'auto', quality: 'auto' })}
                        alt={vid.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#1A1713] flex flex-col items-center justify-center text-[#FFC93C]/30">
                        <Video className="w-16 h-16 mb-2" />
                        <span className="font-mono text-xs uppercase tracking-widest text-[#F4EFE4]/40">Community Video Drop</span>
                      </div>
                    )}

                    {/* Dark Gradient Overlays for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14120F] via-[#14120F]/70 to-[#14120F]/40 pointer-events-none" />
                    <div className="absolute inset-0 bg-[#14120F]/20 group-hover:bg-transparent transition-colors pointer-events-none" />

                    {/* Top Bar Header */}
                    <div className="relative z-10 p-4 sm:p-5 flex items-start justify-between gap-2">
                      {/* Category Badge */}
                      {displayCategory && (
                        <div className="px-2.5 py-1 bg-[#E4402A] text-[#F4EFE4] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#14120F] shadow-[2px_2px_0px_0px_#14120F]">
                          {displayCategory}
                        </div>
                      )}

                      {/* Drop # & Duration Indicator */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFC93C] bg-[#14120F]/90 border border-[#FFC93C]/50 backdrop-blur-xs">
                          DROP #{idx + 1}
                        </span>
                        {vid.duration && (
                          <span className="px-2 py-0.5 text-[10px] font-mono text-[#F4EFE4] bg-[#14120F]/90 border border-[#F4EFE4]/30 backdrop-blur-xs">
                            {vid.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Center Play Button Overlay */}
                    <div 
                      onClick={() => setActiveVideo(vid)}
                      className="relative z-10 self-center my-auto w-16 h-16 bg-[#FFC93C] text-[#14120F] rounded-full flex items-center justify-center border-2 border-[#14120F] shadow-[4px_4px_0px_0px_#F4EFE4] group-hover:scale-115 group-hover:bg-[#F4EFE4] transition-all cursor-pointer"
                      title="Play Video"
                      aria-label={`Play ${vid.title}`}
                    >
                      <Play className="w-7 h-7 fill-current translate-x-0.5" />
                    </div>

                    {/* Bottom Info & Play CTA */}
                    <div className="relative z-10 p-4 sm:p-5 pt-0">
                      <div className="flex items-center justify-between text-xs font-mono text-[#FFC93C] mb-1 drop-shadow-sm">
                        <span className="truncate pr-2">{vid.venue}</span>
                        <span className="text-[#F4EFE4]/80 shrink-0">{vid.viewsEstimate}</span>
                      </div>

                      <h3 
                        onClick={() => setActiveVideo(vid)}
                        className="font-['Anton'] text-xl sm:text-2xl uppercase tracking-tight text-[#F4EFE4] group-hover:text-[#FFC93C] transition-colors leading-snug cursor-pointer drop-shadow-md"
                      >
                        {vid.title}
                      </h3>

                      <p className="text-xs font-mono text-[#F4EFE4]/90 mt-1 drop-shadow-sm">
                        Featuring: <span className="text-[#FFC93C] font-semibold">{vid.performer}</span>
                      </p>

                      {/* Single Full-Width Play Button (No arrow button) */}
                      <div className="mt-4 pt-3 border-t border-[#F4EFE4]/20">
                        <button
                          type="button"
                          onClick={() => setActiveVideo(vid)}
                          className="w-full py-2.5 bg-[#FFC93C] hover:bg-[#F4EFE4] text-[#14120F] text-xs font-mono font-bold uppercase tracking-wider border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play Video</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}

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
                  poster={activeVideo.thumbnailUrl && !activeVideo.thumbnailUrl.startsWith('data:') && !activeVideo.thumbnailUrl.startsWith('blob:') ? getCloudinaryVideoThumbnailUrl(activeVideo.thumbnailUrl, { width: 1280, format: 'auto', quality: 'auto' }) : undefined}
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
