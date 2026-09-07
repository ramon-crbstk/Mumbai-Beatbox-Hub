import React from 'react';
import { PILLARS } from '../data/communityData';
import { Users, Mic, Trophy, ArrowUpRight } from 'lucide-react';

interface WhatWeDoSectionProps {
  onOpenJoinModal: (purpose?: string) => void;
}

export const WhatWeDoSection: React.FC<WhatWeDoSectionProps> = ({ onOpenJoinModal }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Users':
        return <Users className="w-6 h-6 text-[#14120F]" />;
      case 'Mic':
        return <Mic className="w-6 h-6 text-[#14120F]" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6 text-[#14120F]" />;
      default:
        return <Users className="w-6 h-6 text-[#14120F]" />;
    }
  };

  return (
    <section id="what-we-do" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#FFC93C]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-[#14120F] text-[#FFC93C] border border-[#FFC93C] text-xs font-mono font-bold uppercase tracking-widest mb-3">
              PILLARS OF THE SCENE
            </span>
            <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4]">
              What We Do
            </h2>
            <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-1 max-w-xl">
              From open seaside circles to tournament arenas — keeping Mumbai&apos;s vocal pulse alive.
            </p>
          </div>

          <div className="hidden md:block text-right">
            <span className="text-xs font-mono text-[#FFC93C] uppercase tracking-widest">
              Zero Amplification Required // 100% Vocal
            </span>
          </div>
        </div>

        {/* 3 Asymmetric Poster Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((card, idx) => {
            const rotations = ['rotate-[-1deg]', 'rotate-[0.5deg]', 'rotate-[-0.5deg]'];
            const rotationClass = rotations[idx % rotations.length];

            return (
              <div
                key={card.id}
                id={`card-${card.id}`}
                className={`relative bg-[#F4EFE4] text-[#14120F] border-2 border-[#14120F] p-6 sm:p-7 shadow-[6px_6px_0px_0px_#FFC93C] ${rotationClass} hover:rotate-0 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group`}
              >
                {/* Top Flyer Header & Stamp */}
                <div>
                  <div className="flex items-center justify-between border-b-2 border-[#14120F] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FFC93C] border-2 border-[#14120F] flex items-center justify-center shadow-[2px_2px_0px_0px_#14120F]">
                        {getIcon(card.iconName)}
                      </div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#14120F]">
                        PROGRAM {card.number}
                      </span>
                    </div>

                    <span className="font-['Anton'] text-2xl text-[#14120F]/40 group-hover:text-[#E4402A] transition-colors">
                      {card.number}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#14120F] mb-3 leading-tight">
                    {card.title}
                  </h3>

                  {/* Highlight tag */}
                  <div className="inline-block px-2.5 py-1 bg-[#14120F] text-[#FFC93C] text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
                    {card.highlight}
                  </div>

                  {/* Body Blurb */}
                  <p className="text-sm sm:text-base text-[#14120F]/85 leading-relaxed font-sans mb-6">
                    {card.blurb}
                  </p>
                </div>

                {/* Card Action / Footer */}
                <div className="pt-4 border-t border-[#14120F]/20 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onOpenJoinModal(card.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#14120F] group-hover:text-[#E4402A] transition-colors cursor-pointer"
                  >
                    <span>Connect & Participate</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  <span className="text-[11px] font-mono text-[#14120F]/50">
                    BOMBAY
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
