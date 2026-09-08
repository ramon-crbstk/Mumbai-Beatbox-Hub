import React from 'react';
import { COMMUNITY_STATS } from '../data/communityData';
import { Sparkles, MapPin, Compass, ShieldCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-[#14120F] relative border-b-2 border-[#FFC93C]/20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Poster Flyer Style */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-widest border border-[#14120F] -rotate-1 mb-4 shadow-sm">
            <Compass className="w-3.5 h-3.5" />
            <span>Who We Are</span>
          </div>

          <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4EFE4] leading-[1.05]">
            Building Mumbai&apos;s beatbox scene, <br className="hidden sm:inline" />
            <span className="text-[#FFC93C] underline decoration-4 decoration-[#FFC93C]/60 underline-offset-8">
              one cypher at a time
            </span>
          </h2>
        </div>

        {/* 2-3 Short Paragraphs & Contextual Flyer Aside */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* Narrative Paragraphs */}
          <div className="lg:col-span-8 space-y-6 text-[#F4EFE4]/90 text-base sm:text-lg leading-relaxed font-sans">
            <p className="border-l-4 border-[#FFC93C] pl-5 py-1">
              What began as a handful of vocal percussionists trading beats on the breezy benches of{' '}
              <strong className="text-[#FFC93C] font-semibold">Carter Road</strong>, the seaside steps of{' '}
              <strong className="text-[#FFC93C] font-semibold">Bandstand</strong>, and Mumbai&apos;s iconic college festival corridors has grown into a vibrant, city-wide collective. No studios, no audio plugins, no instruments — strictly the human mouth, throat, and lungs pushing the boundaries of acoustic physics.
            </p>

            <p>
              Today, <strong className="text-[#F4EFE4]">Mumbai Beatbox Hub (MHB)</strong> is an open-door sanctuary for anyone fascinated by the art of vocal drumming. Whether you are picking up your very first &lsquo;B-T-K&rsquo; pattern or you are a battle-tested routine architect rehearsing inward bass combinations for national qualifiers, our cyphers are designed to be respectful, ego-free spaces.
            </p>

            <p className="text-sm sm:text-base text-[#F4EFE4]/75 font-mono">
              We gather across suburbs, exchange techniques in real-time, document local talent, and establish Mumbai as one of South Asia’s most formidable grassroots vocal percussion hubs.
            </p>
          </div>

          {/* Asymmetric Side Bulletin Box */}
          <div className="lg:col-span-4 bg-[#F4EFE4] text-[#14120F] p-6 border-2 border-[#14120F] shadow-[6px_6px_0px_0px_#FFC93C] rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between border-b border-[#14120F]/20 pb-3 mb-4">
              <span className="font-['Anton'] text-lg tracking-wider uppercase text-[#14120F]">
                MANIFESTO BULLETIN
              </span>
              <span className="text-[10px] font-mono uppercase bg-[#14120F] text-[#FFC93C] px-2 py-0.5 font-bold">
                EST. MUMBAI
              </span>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm font-mono text-[#14120F]/90">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#E4402A] text-base leading-none">✕</span>
                <span>Zero hardware required. Just bring your voice.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#E4402A] text-base leading-none">✕</span>
                <span>No audition gatekeeping or hierarchy in our circles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#14120F] text-base leading-none">✓</span>
                <span>Weekly peer-led technique coaching before every cypher.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#14120F] text-base leading-none">✓</span>
                <span>Connecting beatboxers from Churchgate to Kalyan.</span>
              </li>
            </ul>

            <div className="mt-5 pt-3 border-t border-[#14120F]/20 flex items-center justify-between text-[11px] font-mono text-[#14120F]/70">
              <span>LOCAL CODE: 400050</span>
              <span className="font-bold text-[#14120F]">KHALI HAATH, FULL SOUND</span>
            </div>
          </div>

        </div>

        {/* Stats Row (4 Stat Blocks) */}
        <div className="border-t-2 border-b-2 border-[#FFC93C]/40 py-8 bg-[#181512]/70">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#F4EFE4]/15">
            
            {COMMUNITY_STATS.map((stat, idx) => (
              <div 
                key={stat.label} 
                className={`pt-4 md:pt-0 ${idx > 0 ? 'md:pl-6' : ''} space-y-1`}
              >
                <div className="font-['Anton'] text-4xl sm:text-5xl md:text-6xl text-[#FFC93C] tracking-tight leading-none">
                  {stat.number}
                </div>
                <div className="font-['Anton'] text-lg sm:text-xl uppercase text-[#F4EFE4] tracking-wide pt-1">
                  {stat.label}
                </div>
                <p className="text-xs sm:text-sm font-mono text-[#F4EFE4]/60 leading-snug">
                  {stat.subtext}
                </p>
              </div>
            ))}

          </div>
        </div>

      </div>

    </section>
  );
};
