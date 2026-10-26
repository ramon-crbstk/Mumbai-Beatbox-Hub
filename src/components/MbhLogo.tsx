import React from 'react';

interface MbhLogoProps {
  variant?: 'full' | 'mark' | 'badge' | 'compact';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverted?: boolean;
}

/**
 * Official Mumbai Beatbox Hub (MBH) Logo
 * Incorporates the dynamic 3-tier vocal soundwave / frequency lightning mark
 * and high-contrast display typography from the official MBH identity.
 */
export const MbhSoundwaveIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 120 70"
    fill="currentColor"
    className={className}
    aria-label="MBH Soundwave Frequency Mark"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Top Frequency Wave */}
    <path
      d="M10 38 L30 30 L45 15 L62 26 L95 10 L75 22 L55 35 L38 24 Z"
      fill="currentColor"
    />
    {/* Center Frequency Wave */}
    <path
      d="M4 42 L25 40 L45 28 L64 36 L108 26 L80 37 L58 45 L35 37 Z"
      fill="currentColor"
    />
    {/* Bottom Frequency Wave */}
    <path
      d="M12 48 L28 49 L46 39 L66 48 L98 42 L72 58 L52 46 L30 55 Z"
      fill="currentColor"
    />
  </svg>
);

export const MbhLogo: React.FC<MbhLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  inverted = false,
}) => {
  const textColor = inverted ? 'text-[#14120F]' : 'text-white';
  const accentColor = inverted ? 'text-[#14120F]' : 'text-[#FFC93C]';

  if (variant === 'mark') {
    const sizeClasses = {
      sm: 'h-5 max-w-[50px]',
      md: 'h-8 max-w-[80px]',
      lg: 'h-12 max-w-[120px]',
      xl: 'h-16 max-w-[160px]',
    }[size];

    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src="/assets/aistudio/MBH_LOGO_NORMAL_02411e7a.png"
          alt="MBH Logo Mark"
          className={`${sizeClasses} w-auto object-contain drop-shadow-[0_2px_8px_rgba(228,64,42,0.4)]`}
        />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`relative inline-flex items-center justify-center bg-[#FFC93C] text-[#14120F] border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#E4402A] px-2.5 py-1.5 gap-2 font-bold ${className}`}
      >
        <img
          src="/assets/aistudio/MBH_LOGO_NORMAL_02411e7a.png"
          alt="MBH Logo"
          className="h-6 w-auto max-w-[45px] object-contain"
        />
        <span className="font-['Anton'] text-lg tracking-wider leading-none">MBH</span>
        <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-[#E4402A] rounded-full ring-2 ring-[#14120F]" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <img
          src="/assets/aistudio/MBH_LOGO_NORMAL_02411e7a.png"
          alt="MBH Logo"
          className="h-6 w-auto max-w-[50px] object-contain drop-shadow-[0_2px_6px_rgba(228,64,42,0.4)]"
        />
        <div className="flex flex-col leading-none">
          <span className="font-mono text-[9px] tracking-[0.25em] text-white/80 uppercase font-bold">
            MUMBAI
          </span>
          <span className={`font-['Anton'] text-lg tracking-wide uppercase ${textColor}`}>
            BEATBOX <span className="text-white">HUB</span>
          </span>
        </div>
      </div>
    );
  }

  // Default 'full' variant reflecting the official banner branding
  const fontSizes = {
    sm: {
      sub: 'text-[9px] tracking-[0.25em]',
      main: 'text-lg tracking-wider',
      hub: 'text-[11px] tracking-widest',
      icon: 'h-6 max-w-[50px]',
    },
    md: {
      sub: 'text-[11px] tracking-[0.3em]',
      main: 'text-2xl sm:text-3xl tracking-wider',
      hub: 'text-xs sm:text-sm tracking-widest',
      icon: 'h-8 sm:h-9 max-w-[75px]',
    },
    lg: {
      sub: 'text-xs sm:text-sm tracking-[0.35em]',
      main: 'text-4xl sm:text-5xl tracking-wide',
      hub: 'text-sm sm:text-base tracking-widest',
      icon: 'h-12 sm:h-14 max-w-[110px]',
    },
    xl: {
      sub: 'text-sm sm:text-base tracking-[0.4em]',
      main: 'text-5xl sm:text-6xl md:text-7xl tracking-wide',
      hub: 'text-base sm:text-lg tracking-widest',
      icon: 'h-16 sm:h-20 max-w-[150px]',
    },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 sm:gap-4 ${className}`}>
      <img
        src="/assets/aistudio/MBH_LOGO_NORMAL_02411e7a.png"
        alt="MBH Logo"
        className={`${fontSizes.icon} w-auto object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(228,64,42,0.4)]`}
      />
      <div className="flex flex-col leading-none">
        <span className={`font-mono ${fontSizes.sub} text-white/80 uppercase font-bold`}>
          MUMBAI
        </span>
        <div className="flex items-baseline gap-2">
          <span className={`font-serif font-black ${fontSizes.main} uppercase ${textColor}`}>
            BEATBOX
          </span>
          <span className={`font-mono font-bold ${fontSizes.hub} text-white uppercase`}>
            HUB
          </span>
        </div>
      </div>
    </div>
  );
};
