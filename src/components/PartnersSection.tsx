import React, { useState, useEffect } from 'react';
import { CollaborationItem } from '../types';
import { fetchCollaborations, DEFAULT_COLLABORATIONS } from '../lib/supabase';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations/MotionComponents';

export const PartnersSection: React.FC = () => {
  const [collaborations, setCollaborations] = useState<CollaborationItem[]>(() =>
    DEFAULT_COLLABORATIONS.filter((c) => c.is_visible)
  );

  useEffect(() => {
    let isMounted = true;
    fetchCollaborations(false)
      .then((items) => {
        if (isMounted && items && items.length > 0) {
          setCollaborations(items);
        }
      })
      .catch((err) => {
        console.warn('Failed to load collaborations from Supabase:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-12 bg-[#181512] border-b-2 border-[#FFC93C]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0.05} className="text-center mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-[#F4EFE4]/60 font-semibold">
            COLLABORATED WITH // COMMUNITY ROSTER
          </span>
        </ScrollReveal>

        {/* Muted Grayscale Logo Strip Placeholder Boxes */}
        <StaggerContainer staggerDelay={0.07} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {collaborations.map((partner) => {
            const shortCode = (partner.short_code || partner.name.substring(0, 2)).toUpperCase();
            const role = partner.collaboration_type || partner.description || 'Community Partner';

            const cardContent = (
              <div
                className="bg-[#14120F] border border-[#F4EFE4]/15 hover:border-[#FFC93C]/60 p-4 sm:p-5 flex flex-col items-center justify-center text-center group transition-colors h-full"
              >
                {/* Monochromatic Box Logo Placeholder or Custom Logo URL */}
                {partner.logo_url && partner.logo_url.trim() ? (
                  <div className="w-10 h-10 border border-[#F4EFE4]/30 flex items-center justify-center mb-2 overflow-hidden bg-black/40 group-hover:border-[#FFC93C] transition-colors p-1">
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
                      onError={(e) => {
                        // Fallback to text initials if image fails to load
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.className = "w-10 h-10 border border-[#F4EFE4]/30 flex items-center justify-center font-['Anton'] text-lg text-[#F4EFE4]/50 group-hover:text-[#FFC93C] group-hover:border-[#FFC93C] transition-colors mb-2";
                          parent.innerText = shortCode;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 border border-[#F4EFE4]/30 flex items-center justify-center font-['Anton'] text-lg text-[#F4EFE4]/50 group-hover:text-[#FFC93C] group-hover:border-[#FFC93C] transition-colors mb-2">
                    {shortCode}
                  </div>
                )}

                <span className="font-['Anton'] text-sm tracking-wider uppercase text-[#F4EFE4]/70 group-hover:text-[#F4EFE4] transition-colors line-clamp-1">
                  {partner.name}
                </span>

                <span className="text-[10px] font-mono text-[#F4EFE4]/40 uppercase mt-1 line-clamp-1">
                  {role}
                </span>
              </div>
            );

            return (
              <StaggerItem
                key={partner.id}
                direction="up"
                className="h-full flex flex-col"
              >
                {partner.website_url && partner.website_url.trim() ? (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-full flex flex-col focus:outline-none focus:ring-1 focus:ring-[#FFC93C]"
                    title={`Visit ${partner.name}`}
                  >
                    {cardContent}
                  </a>
                ) : (
                  cardContent
                )}
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Supporting Line */}
        <ScrollReveal direction="up" delay={0.1} className="text-center mt-6 text-[11px] font-mono text-[#F4EFE4]/40">
          Partner logos, college festival stages, and acoustic venue affiliations can be slotted here.
        </ScrollReveal>

      </div>
    </section>
  );
};
