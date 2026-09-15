import React from 'react';
import { ArrowRight, MessageSquare, Volume2, MessageCircle, Phone } from 'lucide-react';
import { COMMUNITY_CONTACT } from '../data/communityData';

interface MidPageCtaProps {
  onOpenContactModal: () => void;
}

export const MidPageCta: React.FC<MidPageCtaProps> = ({ onOpenContactModal }) => {
  return (
    <section className="py-14 sm:py-20 bg-[#FFC93C] text-[#14120F] relative overflow-hidden border-y-4 border-[#14120F]">
      
      {/* Kaali-peeli roof pattern bars top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-taxi-pattern opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-taxi-pattern opacity-60" />

      {/* Decorative watermark / stencil text */}
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-10 font-['Anton'] text-9xl tracking-tighter uppercase whitespace-nowrap">
        VOCAL BASS // 100%
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Left Text Block */}
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14120F] text-[#FFC93C] text-xs font-mono font-bold uppercase tracking-widest -rotate-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>COMMUNITY CALLOUT // NO AUDITIONS</span>
            </div>

            <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-[#14120F] leading-none">
              Want to spit some bass lines with us?
            </h2>

            <p className="text-base sm:text-lg font-sans text-[#14120F]/90 font-medium max-w-2xl leading-relaxed">
              All beatboxers, mouth drummers, and vocal artists in Mumbai are welcome. Whether you just learned how to kick or you&apos;ve got a 3-minute battle routine locked, our circles are ready for your sound.
            </p>
          </div>

          {/* Right Button Action */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              id="mid-cta-contact-button"
              onClick={onOpenContactModal}
              className="group inline-flex items-center justify-center gap-3 bg-[#14120F] text-[#F4EFE4] px-6 py-4 text-sm font-bold uppercase tracking-widest font-mono border-2 border-[#14120F] shadow-[5px_5px_0px_0px_#E4402A] hover:bg-[#F4EFE4] hover:text-[#14120F] hover:shadow-[2px_2px_0px_0px_#14120F] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-[#FFC93C] group-hover:text-[#14120F] transition-colors" />
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href={COMMUNITY_CONTACT.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#14120F] text-[#FFC93C] hover:bg-[#14120F]/90 px-5 py-4 text-sm font-bold uppercase tracking-widest font-mono border-2 border-[#14120F] shadow-[5px_5px_0px_0px_#14120F] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

    </section>
  );
};
