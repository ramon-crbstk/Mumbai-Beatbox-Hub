import React from 'react';
import { MbhLogo } from './MbhLogo';
import { Radio, MapPin } from 'lucide-react';

interface MbhSkylineBannerProps {
  onJoinClick?: () => void;
  className?: string;
}

export const MbhSkylineBanner: React.FC<MbhSkylineBannerProps> = ({
  onJoinClick,
  className = '',
}) => {
  return (
    <div
      className={`relative w-full overflow-hidden bg-[#0A0908] border-y-2 border-[#FFC93C]/40 ${className}`}
    >
      {/* Background Banner Image: Skyline with Gateway of India and Sea Link */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/mumbai_skyline_banner.jpg"
          alt="Mumbai Beatbox Hub Skyline - Gateway of India to Bandra Worli Sea Link"
          className="w-full h-full object-cover object-center opacity-40 mix-blend-screen scale-105 transition-transform duration-1000"
          onError={(e) => {
            // Fallback gradient if file loading fails
            (e.target as HTMLElement).style.opacity = '0';
          }}
        />
        {/* Subtle Crimson Vignette & Backlights corresponding to the official banner */}
        <div className="absolute inset-0 bg-radial-[circle_at_15%_50%] from-[#8B1E1E]/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-radial-[circle_at_85%_50%] from-[#8B1E1E]/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14120F] via-transparent to-[#14120F]/90 pointer-events-none" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `radial-gradient(#FFC93C 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20 flex flex-col items-center text-center">
        {/* Top Landmark Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-5 font-mono text-[11px] uppercase tracking-widest text-[#F4EFE4]/70">
          <span className="flex items-center gap-1.5 text-[#E4402A]">
            <MapPin className="w-3.5 h-3.5" />
            Gateway of India
          </span>
          <span className="text-[#FFC93C] hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1.5 text-[#FFC93C]">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Mumbai Acoustic Pulse
          </span>
          <span className="text-[#FFC93C] hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1.5 text-[#E4402A]">
            <MapPin className="w-3.5 h-3.5" />
            Bandra-Worli Sea Link
          </span>
        </div>

        {/* Centerpiece MBH Identity Emblem */}
        <div className="p-4 sm:p-6 bg-[#14120F]/80 backdrop-blur-sm border border-[#F4EFE4]/15 shadow-[6px_6px_0px_0px_#14120F] mb-6 max-w-2xl">
          <MbhLogo size="lg" className="justify-center" />
        </div>

        {/* Narrative Tagline */}
        <p className="max-w-2xl text-sm sm:text-base text-[#F4EFE4]/80 font-sans leading-relaxed mb-6">
          Echoing across the Arabian Sea coastline — from South Bombay arches to Bandra promenades. 
          The official grassroots collective uniting Mumbai&apos;s vocal percussionists.
        </p>

        {/* Direct Action */}
        {onJoinClick && (
          <button
            type="button"
            onClick={onJoinClick}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FFC93C] text-[#14120F] font-mono font-bold text-xs sm:text-sm uppercase tracking-widest border-2 border-[#14120F] shadow-[4px_4px_0px_0px_#E4402A] hover:bg-[#F4EFE4] hover:shadow-[2px_2px_0px_0px_#E4402A] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Enter the Cypher Circle</span>
            <span className="text-base leading-none">&rarr;</span>
          </button>
        )}
      </div>
    </div>
  );
};
