import React, { useState, useEffect } from 'react';
import { VideoItem } from '../types';
import { Play, Video, X, Flame, ExternalLink, Link2, Copy, Check, Clock, MapPin, User } from 'lucide-react';
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

// Helper to get crisp, uncropped thumbnail with YouTube fallback
function resolveVideoThumbnail(vid: VideoItem): string {
  if (vid.thumbnailUrl && !vid.thumbnailUrl.startsWith('data:') && !vid.thumbnailUrl.startsWith('blob:')) {
    return getCloudinaryVideoThumbnailUrl(vid.thumbnailUrl, {
      width: 800,
      crop: 'limit',
      quality: 'auto',
      format: 'auto',
    });
  }

  // Fallback to high quality YouTube thumbnail if YouTube video
  if (vid.videoUrl) {
    const ytMatch = vid.videoUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
  }

  return '';
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

        {/* Video Cards Grid */}
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
          <StaggerContainer
            staggerDelay={0.1}
            className={`grid grid-cols-1 gap-8 ${
              videosList.length === 1
                ? 'max-w-xl mx-auto'
                : videosList.length === 2
                ? 'md:grid-cols-2 max-w-5xl mx-auto'
                : 'md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {videosList.map((vid, idx) => {
              const displayCategory = vid.category?.replace(/solo/gi, '').trim() || vid.category;
              const thumbUrl = resolveVideoThumbnail(vid);

              return (
                <StaggerItem
                  key={vid.id}
                  direction="up"
                  className="h-full flex flex-col"
                >
                  <div
                    id={`video-card-${vid.id}`}
                    className="relative bg-[#181512] border-2 border-[#F4EFE4]/20 hover:border-[#FFC93C] transition-all flex flex-col justify-between group shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[6px_6px_0px_0px_#FFC93C] h-full overflow-hidden"
                  >
                    {/* Dedicated 16:9 Cinema Video Frame Window */}
                    <div
                      onClick={() => setActiveVideo(vid)}
                      className="relative w-full aspect-video bg-[#0B0907] border-b-2 border-[#F4EFE4]/15 overflow-hidden cursor-pointer flex items-center justify-center select-none"
                    >
                      {thumbUrl ? (
                        <>
                          {/* Ambient soft blurred backdrop to seamlessly frame non-standard aspect ratios */}
                          <img
                            src={thumbUrl}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 pointer-events-none"
                          />
                          {/* Foreground high-clarity thumbnail: 100% visible, zero cropping */}
                          <img
                            src={thumbUrl}
                            alt={vid.title}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                            className="relative z-10 w-full h-full object-contain sm:object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </>
                      ) : (
                        <div className="relative z-10 flex flex-col items-center justify-center text-[#FFC93C]/40 p-6">
                          <Video className="w-12 h-12 mb-2" />
                          <span className="font-mono text-xs uppercase tracking-widest text-[#F4EFE4]/50">Community Video Drop</span>
                        </div>
                      )}

                      {/* Subtle hover vignette (No dark permanent mask covering the thumbnail) */}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors z-10 pointer-events-none" />

                      {/* Top Bar Badges */}
                      {displayCategory && (
                        <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                          <span className="px-2.5 py-0.5 bg-[#E4402A] text-[#F4EFE4] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#14120F] shadow-[2px_2px_0px_0px_#14120F]">
                            {displayCategory}
                          </span>
                        </div>
                      )}

                      {/* Prominent High-Contrast Play Button in Center */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFC93C] text-[#14120F] flex items-center justify-center border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#F4EFE4,0_4px_20px_rgba(0,0,0,0.6)] group-hover:scale-115 group-hover:bg-[#F4EFE4] transition-all"
                          title="Play Video"
                          aria-label={`Play ${vid.title}`}
                        >
                          <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current translate-x-0.5" />
                        </div>
                      </div>

                      {/* Duration Tag in Bottom-Right Corner */}
                      {vid.duration && (
                        <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-none">
                          <span className="px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold text-[#F4EFE4] bg-black/85 border border-white/20 backdrop-blur-xs flex items-center gap-1 shadow-sm">
                            <Clock className="w-3 h-3 text-[#FFC93C]" />
                            {vid.duration}
                          </span>
                        </div>
                      )}

                      {/* Neo-brutalist interactive scrub bar line */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#14120F] z-20">
                        <div className="h-full bg-[#FFC93C] w-0 group-hover:w-full transition-all duration-500 ease-out" />
                      </div>
                    </div>

                    {/* Dedicated Card Body Below the Video Frame */}
                    <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4 bg-[#181512]">
                      <div className="space-y-2">
                        {/* Venue & Community Views Line */}
                        <div className="flex items-center justify-between text-xs font-mono text-[#FFC93C] gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-[#E4402A] shrink-0" />
                            <span className="truncate">{vid.venue}</span>
                          </div>
                          <span className="text-[#F4EFE4]/60 text-[11px] shrink-0 font-medium">
                            {vid.viewsEstimate}
                          </span>
                        </div>

                        {/* Video Title */}
                        <h3
                          onClick={() => setActiveVideo(vid)}
                          className="font-['Anton'] text-xl sm:text-2xl uppercase tracking-tight text-[#F4EFE4] group-hover:text-[#FFC93C] transition-colors leading-snug cursor-pointer line-clamp-2"
                          title={vid.title}
                        >
                          {vid.title}
                        </h3>

                        {/* Performer Info */}
                        <p className="text-xs font-mono text-[#F4EFE4]/80 flex items-center gap-1.5 pt-0.5">
                          <User className="w-3.5 h-3.5 text-[#FFC93C] shrink-0" />
                          <span>
                            Featuring:{' '}
                            <strong className="text-[#FFC93C] font-semibold">{vid.performer}</strong>
                          </span>
                        </p>
                      </div>

                      {/* Play Action Footer */}
                      <div className="pt-3 border-t border-[#F4EFE4]/15 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveVideo(vid)}
                          className="flex-1 py-2.5 bg-[#FFC93C] hover:bg-[#F4EFE4] text-[#14120F] text-xs font-mono font-bold uppercase tracking-wider border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] hover:shadow-[4px_4px_0px_0px_#E4402A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play Video</span>
                        </button>

                        {vid.videoUrl && (
                          <a
                            href={vid.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-[#14120F] hover:bg-[#E4402A] text-[#F4EFE4] border-2 border-[#F4EFE4]/20 hover:border-[#E4402A] transition-colors cursor-pointer flex items-center justify-center"
                            title="Open video source link"
                            aria-label="Open source link in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
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
