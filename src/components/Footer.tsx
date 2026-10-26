import React from 'react';
import { Instagram, MessageCircle, Youtube, ArrowUp, Phone, Headphones } from 'lucide-react';
import { COMMUNITY_CONTACT } from '../data/communityData';
import { ScrollReveal } from './animations/MotionComponents';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#14120F] text-[#F4EFE4] border-t-4 border-[#E4402A] pt-14 pb-12 relative">
      
      {/* Top Kaali-Peeli Taxi Roof Pattern Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-taxi-pattern opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <ScrollReveal direction="up" delay={0.05} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-12 border-b border-[#F4EFE4]/15">
          
          {/* Brand Mark & Tagline */}
          <div className="sm:col-span-2 lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              {/* Official MBH Logo with Subtle Pulse Glow */}
              <div className="relative flex items-center justify-center shrink-0">
                {/* Soft ambient pulse glow */}
                <div className="absolute inset-0 bg-[#E4402A]/15 rounded-full blur-md animate-pulse pointer-events-none" />

                <img
                  src="/assets/aistudio/MBH_LOGO_NORMAL_02411e7a.png"
                  alt="Mumbai Beatbox Hub Logo"
                  className="relative z-10 h-12 sm:h-14 w-auto max-w-[110px] sm:max-w-[130px] object-contain animate-logo-pulse-glow"
                />
              </div>
              <span className="font-['Anton'] text-2xl uppercase tracking-wider text-white">
                Mumbai Beatbox Hub
              </span>
            </div>

            <p className="font-['Anton'] text-lg text-white uppercase tracking-wide">
              &ldquo;One mic. One breath. A city of rhythm.&rdquo;
            </p>

            <p className="text-xs sm:text-sm font-sans text-white/70 max-w-md leading-relaxed">
              Mumbai&apos;s grassroots home for vocal percussionists, beatboxers, and mouth drummers. Built by the streets, fueled by human breath.
            </p>
          </div>

          {/* Navigation Quick Links */}
          <div className="lg:col-span-3 space-y-3 font-mono text-xs">
            <span className="text-white font-bold uppercase tracking-wider block">
              QUICK INDEX
            </span>
            <ul className="space-y-2 text-white/75">
              <li><a href="#home" className="hover:text-white transition-colors">Home & Frequency</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Who We Are</a></li>
              <li><a href="#events" className="hover:text-white transition-colors">Upcoming Cyphers</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Visual Archive</a></li>
              <li><a href="#videos" className="hover:text-white transition-colors">Routine Drops</a></li>
              <li><a href="#members" className="hover:text-white transition-colors">Community Members</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact & Join</a></li>
            </ul>
          </div>

          {/* Social Links & Location */}
          <div className="md:col-span-3 space-y-4 font-mono text-xs">
            <span className="text-white font-bold uppercase tracking-wider block">
              CONNECT WITH MBH
            </span>

            <div className="flex flex-col gap-2">
              <a
                href={COMMUNITY_CONTACT.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-7 h-7 bg-[#181512] border border-[#FFC93C]/40 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-[#FFC93C]" />
                </div>
                <span>WhatsApp Group</span>
              </a>

              <a
                href={COMMUNITY_CONTACT.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-7 h-7 bg-[#181512] border border-[#5865F2]/40 flex items-center justify-center shrink-0">
                  <Headphones className="w-3.5 h-3.5 text-[#5865F2]" />
                </div>
                <span>Discord Community</span>
              </a>

              <a
                href={COMMUNITY_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-7 h-7 bg-[#181512] border border-[#E4402A]/40 flex items-center justify-center shrink-0">
                  <Instagram className="w-3.5 h-3.5 text-[#E4402A]" />
                </div>
                <span>@mumbai.beatbox.hub</span>
              </a>

              <a
                href={COMMUNITY_CONTACT.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-7 h-7 bg-[#181512] border border-[#E4402A]/40 flex items-center justify-center shrink-0">
                  <Youtube className="w-3.5 h-3.5 text-[#E4402A]" />
                </div>
                <span>Mumbai Beatbox Hub</span>
              </a>

              <div className="pt-1 border-t border-[#F4EFE4]/10 space-y-1.5">
                <div className="text-[10px] text-white/80 uppercase font-bold tracking-wider">Helplines // Call or WA</div>
                {COMMUNITY_CONTACT.phoneNumbers.map((p, idx) => (
                  <a
                    key={idx}
                    href={p.tel}
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                  >
                    <div className="w-6 h-6 bg-[#181512] border border-[#FFC93C]/40 flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5 text-[#FFC93C]" />
                    </div>
                    <span className="font-bold text-white">{p.number}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[11px] text-white/50">
              Carter Road · Bandstand · Shivaji Park · Marine Drive
            </div>
          </div>

        </ScrollReveal>

        {/* Bottom Bar: Copyright, Developed By Crabstack & Back to Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/70">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-center sm:text-left">
            <span>© 2026 Mumbai Beatbox Hub (MBH). All rights reserved.</span>
            <span className="hidden sm:inline text-white/30">·</span>
            <span className="text-white/80">
              Developed by <strong className="text-white font-semibold tracking-wide">CRABSTACK</strong>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-white/60">KAALI-PEELI RHYTHM // MUMBAI</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="min-h-[44px] px-3 py-2 inline-flex items-center gap-1.5 text-white hover:text-[#FFC93C] transition-colors cursor-pointer border border-transparent hover:border-[#FFC93C]/40 bg-[#181512] sm:bg-transparent"
              aria-label="Back to top of page"
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
