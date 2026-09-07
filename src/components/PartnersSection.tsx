import React from 'react';
import { PARTNER_LOGOS } from '../data/communityData';

export const PartnersSection: React.FC = () => {
  return (
    <section className="py-12 bg-[#181512] border-b-2 border-[#FFC93C]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-[#F4EFE4]/60 font-semibold">
            COLLABORATED WITH // COMMUNITY ROSTER
          </span>
        </div>

        {/* Muted Grayscale Logo Strip Placeholder Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {PARTNER_LOGOS.map((partner) => (
            <div
              key={partner.id}
              className="bg-[#14120F] border border-[#F4EFE4]/15 hover:border-[#FFC93C]/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center group transition-colors"
            >
              {/* Monochromatic Box Logo Placeholder */}
              <div className="w-10 h-10 border border-[#F4EFE4]/30 flex items-center justify-center font-['Anton'] text-lg text-[#F4EFE4]/50 group-hover:text-[#FFC93C] group-hover:border-[#FFC93C] transition-colors mb-2">
                {partner.name.substring(0, 2).toUpperCase()}
              </div>

              <span className="font-['Anton'] text-sm tracking-wider uppercase text-[#F4EFE4]/70 group-hover:text-[#F4EFE4] transition-colors">
                {partner.name}
              </span>

              <span className="text-[10px] font-mono text-[#F4EFE4]/40 uppercase mt-1">
                {partner.role}
              </span>
            </div>
          ))}
        </div>

        {/* Supporting Line */}
        <div className="text-center mt-6 text-[11px] font-mono text-[#F4EFE4]/40">
          Partner logos, college festival stages, and acoustic venue affiliations can be slotted here.
        </div>

      </div>
    </section>
  );
};
