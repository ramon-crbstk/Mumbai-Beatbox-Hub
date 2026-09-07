import React from 'react';
import { Instagram, MessageCircle, Youtube, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#14120F] text-[#F4EFE4] border-t-4 border-[#FFC93C] pt-14 pb-12 relative">
      
      {/* Top Kaali-Peeli Taxi Roof Pattern Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-taxi-pattern opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#F4EFE4]/15">
          
          {/* Brand Mark & Tagline */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              {/* MBX Mark */}
              <div className="w-10 h-10 bg-[#FFC93C] text-[#14120F] flex items-center justify-center font-['Anton'] text-xl font-bold border border-[#14120F] shadow-[2px_2px_0px_0px_#F4EFE4]">
                MBX
              </div>
              <span className="font-['Anton'] text-2xl uppercase tracking-wider text-[#F4EFE4]">
                Mumbai Beatbox Hub
              </span>
            </div>

            <p className="font-['Anton'] text-lg text-[#FFC93C] uppercase tracking-wide">
              &ldquo;One mic. One breath. A city of rhythm.&rdquo;
            </p>

            <p className="text-xs sm:text-sm font-sans text-[#F4EFE4]/70 max-w-md leading-relaxed">
              Mumbai&apos;s grassroots home for vocal percussionists, beatboxers, and mouth drummers. Built by the streets, fueled by human breath.
            </p>
          </div>

          {/* Navigation Quick Links */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <span className="text-[#FFC93C] font-bold uppercase tracking-wider block">
              QUICK INDEX
            </span>
            <ul className="space-y-2 text-[#F4EFE4]/80">
              <li><a href="#home" className="hover:text-[#FFC93C] transition-colors">Home & Frequency</a></li>
              <li><a href="#about" className="hover:text-[#FFC93C] transition-colors">Who We Are</a></li>
              <li><a href="#events" className="hover:text-[#FFC93C] transition-colors">Upcoming Cyphers</a></li>
              <li><a href="#gallery" className="hover:text-[#FFC93C] transition-colors">Visual Archive</a></li>
              <li><a href="#videos" className="hover:text-[#FFC93C] transition-colors">Routine Drops</a></li>
              <li><a href="#blog" className="hover:text-[#FFC93C] transition-colors">Hub Journal</a></li>
              <li><a href="#contact" className="hover:text-[#FFC93C] transition-colors">Contact & Join</a></li>
            </ul>
          </div>

          {/* Social Links & Location */}
          <div className="md:col-span-3 space-y-4 font-mono text-xs">
            <span className="text-[#FFC93C] font-bold uppercase tracking-wider block">
              CONNECT WITH MBX
            </span>

            <div className="flex flex-col gap-2.5">
              <a
                href="https://chat.whatsapp.com/placeholder-mumbai-beatbox"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#F4EFE4]/80 hover:text-[#FFC93C] transition-colors"
              >
                <div className="w-7 h-7 bg-[#181512] border border-[#FFC93C]/40 flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-[#FFC93C]" />
                </div>
                <span>WhatsApp Community</span>
              </a>

              <a
                href="https://instagram.com/mumbaibeatboxhub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#F4EFE4]/80 hover:text-[#FFC93C] transition-colors"
              >
                <div className="w-7 h-7 bg-[#181512] border border-[#FFC93C]/40 flex items-center justify-center">
                  <Instagram className="w-3.5 h-3.5 text-[#E4402A]" />
                </div>
                <span>Instagram (@mumbaibeatboxhub)</span>
              </a>

              <a
                href="https://youtube.com/@mumbaibeatboxhub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#F4EFE4]/80 hover:text-[#FFC93C] transition-colors"
              >
                <div className="w-7 h-7 bg-[#181512] border border-[#FFC93C]/40 flex items-center justify-center">
                  <Youtube className="w-3.5 h-3.5 text-[#E4402A]" />
                </div>
                <span>YouTube Channel</span>
              </a>
            </div>

            <div className="pt-2 text-[11px] text-[#F4EFE4]/50">
              Carter Road · Bandstand · Shivaji Park · Marine Drive
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#F4EFE4]/60">
          <div>
            © 2026 Mumbai Beatbox Hub. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[#FFC93C]">KAALI-PEELI RHYTHM // MUMBAI</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#F4EFE4] hover:text-[#FFC93C] transition-colors cursor-pointer"
            >
              <span>TOP</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
