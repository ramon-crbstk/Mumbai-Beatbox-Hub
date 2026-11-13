import React from 'react';
import { COMMUNITY_STATS } from '../data/communityData';
import { Sparkles, MapPin, Compass, ShieldCheck } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations/MotionComponents';

interface AboutSectionProps {
  headingTag?: 'h1' | 'h2';
}

export const AboutSection: React.FC<AboutSectionProps> = ({ headingTag = 'h2' }) => {
  const Heading = headingTag;

  return (
    <section id="about" className="py-16 md:py-24 bg-[#14120F] relative border-b-2 border-[#E4402A]/20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Poster Flyer Style */}
        <ScrollReveal direction="up" delay={0.05} className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-widest border border-[#14120F] -rotate-1 mb-4 shadow-[2px_2px_0px_0px_#E4402A]">
            <Compass className="w-3.5 h-3.5" />
            <span>Who We Are</span>
          </div>

          <Heading className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-[1.05]">
            Building Mumbai&apos;s beatbox culture, <br className="hidden sm:inline" />
            <span className="text-white underline decoration-4 decoration-[#FFC93C] underline-offset-8">
              one cypher at a time
            </span>
          </Heading>
        </ScrollReveal>

        {/* 2-3 Short Paragraphs & Contextual Flyer Aside */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* Narrative Paragraphs */}
          <ScrollReveal direction="right" delay={0.1} className="lg:col-span-8 space-y-6 text-white/90 text-base sm:text-lg leading-relaxed font-sans">
            <p className="border-l-4 border-[#FFC93C] pl-5 py-1">
              What began as a handful of vocal percussionists trading rhythms at a weekend beatbox cypher in Mumbai—on the benches of{' '}
              <strong className="text-white font-semibold">Carter Road</strong>, the seaside steps of{' '}
              <strong className="text-white font-semibold">Bandstand</strong>, and local college festivals—has grown into a city-wide beatbox music community shaping beatbox culture in India. No gear or plugins—just the mouth, throat, and lungs.
            </p>

            <p>
              Today, the <strong className="text-white">Mumbai Beatbox Hub (MBH)</strong> community welcomes everyone—whether you are figuring out where to learn beatboxing in Mumbai at beatbox workshops for beginners in Mumbai, or rehearsing inward bass routines for regional battles and national qualifiers.
            </p>

            <p className="text-sm sm:text-base text-white/75 font-mono">
              Through Mumbai Beatbox Hub workshops and regular beatbox meetups in the city, we help newcomers meet beatboxers in Mumbai in person while linking Mumbai beatbox culture with the broader beatboxing India movement.
            </p>
          </ScrollReveal>

          {/* Asymmetric Side Bulletin Box */}
          <ScrollReveal direction="left" delay={0.2} className="lg:col-span-4">
            <div className="bg-white text-[#14120F] p-5 sm:p-6 border-2 border-[#14120F] shadow-[4px_4px_0px_0px_#E4402A] sm:shadow-[6px_6px_0px_0px_#E4402A] rotate-0 sm:rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center justify-between border-b border-[#14120F]/20 pb-3 mb-4">
                <h3 className="font-['Anton'] text-lg tracking-wider uppercase text-[#14120F]">
                  MANIFESTO BULLETIN
                </h3>
                <span className="text-[10px] font-mono uppercase bg-[#14120F] text-[#FFC93C] px-2 py-0.5 font-bold">
                  EST. MUMBAI
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm font-mono text-[#14120F]">
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
          </ScrollReveal>

        </div>

        {/* Stats Row (4 Stat Blocks with Staggered Entrance) */}
        <div className="border-t-2 border-b-2 border-[#E4402A]/40 py-6 sm:py-8 bg-[#181512]/70">
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8 md:divide-x-2 md:divide-white/15">
            {COMMUNITY_STATS.map((stat, idx) => (
              <StaggerItem
                key={stat.label}
                direction="up"
                className={`space-y-1 ${idx > 0 ? 'md:pl-6' : ''}`}
              >
                <div className="font-['Anton'] text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none">
                  {stat.number}
                </div>
                <div className="font-['Anton'] text-base sm:text-xl uppercase text-white tracking-wide pt-1">
                  {stat.label}
                </div>
                <p className="text-xs sm:text-sm font-mono text-white/70 leading-snug">
                  {stat.subtext}
                </p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

      </div>

    </section>
  );
};
