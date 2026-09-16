import React, { useState, useEffect, useMemo } from 'react';
import { GalleryItem } from '../types';
import { 
  Image as ImageIcon, 
  X, 
  MapPin, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Camera, 
  Columns, 
  LayoutGrid, 
  Flame, 
  MessageCircle, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { fetchGalleryItems } from '../lib/supabase';
import { COMMUNITY_CONTACT } from '../data/communityData';
import { ScrollReveal } from './animations/MotionComponents';

interface GallerySectionProps {
  refreshTrigger?: number;
}

type FilterCategory = 'all' | 'cyphers' | 'battles' | 'sessions' | 'coast';
type ViewMode = 'masonry' | 'bento';

export const GallerySection: React.FC<GallerySectionProps> = ({ refreshTrigger = 0 }) => {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [visibleLimit, setVisibleLimit] = useState(16);

  useEffect(() => {
    let active = true;
    async function loadGallery() {
      const items = await fetchGalleryItems();
      if (active) {
        setGalleryList(items);
      }
    }
    loadGallery();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  // Filtering
  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return galleryList;
    return galleryList.filter((item) => {
      const text = `${item.title} ${item.caption} ${item.location}`.toLowerCase();
      if (activeFilter === 'cyphers') {
        return text.includes('cypher') || text.includes('circle') || text.includes('open');
      }
      if (activeFilter === 'battles') {
        return text.includes('battle') || text.includes('smoke') || text.includes('final') || text.includes('championship');
      }
      if (activeFilter === 'sessions') {
        return text.includes('clinic') || text.includes('workshop') || text.includes('drill') || text.includes('mic') || text.includes('tag');
      }
      if (activeFilter === 'coast') {
        return text.includes('carter') || text.includes('bandstand') || text.includes('bandra') || text.includes('marine drive') || text.includes('sea') || text.includes('beach');
      }
      return true;
    });
  }, [galleryList, activeFilter]);

  const displayedItems = filteredList.slice(0, visibleLimit);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIdx(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedIdx((prev) => (prev !== null ? (prev + 1) % displayedItems.length : null));
      } else if (e.key === 'ArrowLeft') {
        setSelectedIdx((prev) => (prev !== null ? (prev - 1 + displayedItems.length) % displayedItems.length : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, displayedItems.length]);

  const selectedItem = selectedIdx !== null ? displayedItems[selectedIdx] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + displayedItems.length) % displayedItems.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % displayedItems.length);
    }
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#FFC93C]/20 relative overflow-hidden">
      
      {/* Background Subtle Noise and Atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#FFC93C]/5 via-transparent to-transparent pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0.05} className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-widest mb-3 border border-[#14120F] -rotate-1 shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                <span>PHOTO WALL // STREET ARCHIVE</span>
              </div>
              <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4EFE4] leading-none">
                The Cypher Photo Wall
              </h2>
              <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-2 max-w-2xl leading-relaxed">
                Raw frames from Carter Road, Shivaji Park, Bandstand & station subways. Human breath, acoustics, and street crowds across Mumbai.
              </p>
            </div>

            {/* View Mode & Stats Bar */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-3 py-1.5 bg-[#181512] border border-[#FFC93C]/30 text-xs font-mono text-[#FFC93C] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{filteredList.length} PHOTOS ON WALL</span>
              </div>

              {/* View Toggle */}
              <div className="inline-flex p-1 bg-[#181512] border border-[#F4EFE4]/20">
                <button
                  type="button"
                  onClick={() => setViewMode('masonry')}
                  title="Masonry Wall View"
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'masonry'
                      ? 'bg-[#FFC93C] text-[#14120F]'
                      : 'text-[#F4EFE4]/70 hover:text-[#F4EFE4]'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Wall</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('bento')}
                  title="Bento Mosaic Grid"
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'bento'
                      ? 'bg-[#FFC93C] text-[#14120F]'
                      : 'text-[#F4EFE4]/70 hover:text-[#F4EFE4]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mosaic</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-2 pt-4 border-t border-[#F4EFE4]/10">
            <span className="text-xs font-mono text-[#F4EFE4]/50 mr-2 uppercase">Filter Wall:</span>
            {[
              { id: 'all', label: `All Wall Photos (${galleryList.length})` },
              { id: 'cyphers', label: 'Street Cyphers' },
              { id: 'battles', label: 'Battles & Stages' },
              { id: 'sessions', label: 'Acoustic Drills' },
              { id: 'coast', label: 'Bandra & Seaside' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as FilterCategory)}
                className={`px-3.5 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#E4402A] text-[#F4EFE4] border-[#E4402A] shadow-[2px_2px_0px_0px_#FFC93C]'
                    : 'bg-[#181512] text-[#F4EFE4]/70 border-[#F4EFE4]/20 hover:border-[#FFC93C] hover:text-[#F4EFE4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* The Wall Display */}
        {displayedItems.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[#FFC93C]/30 bg-[#181512] p-8">
            <ImageIcon className="w-12 h-12 text-[#FFC93C]/50 mx-auto mb-3" />
            <h3 className="font-['Anton'] text-2xl text-[#F4EFE4] tracking-wide uppercase">No Photos in this Filter</h3>
            <p className="font-mono text-xs text-[#F4EFE4]/60 mt-1 max-w-md mx-auto mb-4">
              Try clicking &quot;All Wall Photos&quot; to view the complete street archive.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="px-4 py-2 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider"
            >
              Reset Filter
            </button>
          </div>
        ) : viewMode === 'masonry' ? (
          /* =========================================================================
             1. MASONRY PHOTO WALL
             ========================================================================= */
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
            {displayedItems.map((item, idx) => {
              const photoSrc = item.photoUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80';
              
              // Varied height aspect ratios for organic wall feel
              const aspectClass = item.aspect === 'tall' 
                ? 'aspect-[3/4]' 
                : item.aspect === 'wide' 
                ? 'aspect-[16/10]' 
                : 'aspect-square';

              const tapeRotate = idx % 3 === 0 ? '-rotate-3' : idx % 2 === 0 ? 'rotate-2' : '-rotate-1';

              return (
                <div
                  key={item.id}
                  className="break-inside-avoid mb-4 group"
                  onClick={() => setSelectedIdx(idx)}
                >
                  <div className="relative bg-[#181512] border-2 border-[#14120F] p-2.5 shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[6px_6px_0px_0px_#FFC93C] hover:border-[#FFC93C] transition-all duration-300 cursor-pointer overflow-hidden group-hover:-translate-y-1">
                    
                    {/* Corner Paper Tape Accent */}
                    <div className={`absolute -top-1.5 left-6 w-10 h-3 bg-[#FFC93C]/80 ${tapeRotate} border border-[#14120F]/40 z-20 pointer-events-none shadow-xs`} />

                    {/* Image Frame */}
                    <div className={`relative w-full ${aspectClass} overflow-hidden bg-[#14120F]`}>
                      <img
                        src={photoSrc}
                        alt={item.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Top Stamp Tag */}
                      <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-[#14120F]/90 text-[#FFC93C] font-mono text-[9px] font-bold uppercase border border-[#FFC93C]/40 backdrop-blur-xs">
                        {item.dateStr || 'Cypher'}
                      </div>

                      {/* Hover Overlay Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14120F] via-[#14120F]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5 z-10">
                        
                        {/* Top Location Chip */}
                        <div className="flex items-center gap-1.5 self-start px-2 py-0.5 bg-[#14120F]/90 border border-[#F4EFE4]/30 text-[10px] font-mono text-[#F4EFE4]">
                          <MapPin className="w-3 h-3 text-[#FFC93C]" />
                          <span className="truncate max-w-[140px]">{item.location}</span>
                        </div>

                        {/* Bottom Title & Excerpt */}
                        <div>
                          <h4 className="font-['Anton'] text-lg uppercase tracking-tight text-[#F4EFE4] leading-tight mb-1">
                            {item.title}
                          </h4>
                          <p className="text-[11px] font-sans text-[#F4EFE4]/80 line-clamp-2 leading-snug mb-2">
                            {item.caption}
                          </p>
                          <div className="inline-flex items-center gap-1 text-[10px] font-mono text-[#FFC93C] font-bold uppercase">
                            <Maximize2 className="w-3 h-3" />
                            <span>Click to Expand</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Permanent Bottom Strip */}
                    <div className="mt-2 pt-1.5 border-t border-[#F4EFE4]/10 flex items-center justify-between text-[11px] font-mono text-[#F4EFE4]/70 px-0.5">
                      <span className="truncate max-w-[160px] text-[#F4EFE4] font-medium">{item.title}</span>
                      <span className="text-[10px] text-[#FFC93C] font-bold shrink-0">#{idx + 1}</span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================================
             2. BENTO MOSAIC GRID
             ========================================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[220px] sm:auto-rows-[240px] gap-4">
            {displayedItems.map((item, idx) => {
              const photoSrc = item.photoUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80';
              
              // Editorial Bento Spans
              const isHero = idx === 0 || idx === 7;
              const isWide = idx === 3 || idx === 10;
              const isTall = idx === 4 || idx === 11;

              const spanClass = isHero 
                ? 'sm:col-span-2 sm:row-span-2' 
                : isWide 
                ? 'sm:col-span-2 sm:row-span-1' 
                : isTall 
                ? 'sm:row-span-2 sm:col-span-1' 
                : 'col-span-1 row-span-1';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`group relative bg-[#181512] border-2 border-[#14120F] overflow-hidden shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[6px_6px_0px_0px_#FFC93C] hover:border-[#FFC93C] transition-all duration-300 cursor-pointer ${spanClass}`}
                >
                  <img
                    src={photoSrc}
                    alt={item.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Corner Badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#14120F]/90 text-[#FFC93C] font-mono text-[10px] uppercase font-bold border border-[#FFC93C]/40 z-10">
                    {item.dateStr}
                  </div>

                  {/* Gradient Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14120F] via-[#14120F]/40 to-transparent opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 z-10">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#FFC93C] mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.location}</span>
                    </div>
                    <h3 className="font-['Anton'] text-xl sm:text-2xl uppercase tracking-tight text-[#F4EFE4] leading-tight mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs font-sans text-[#F4EFE4]/80 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Trigger if there are more in list */}
        {filteredList.length > visibleLimit && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleLimit((prev) => prev + 8)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FFC93C] hover:bg-[#F4EFE4] text-[#14120F] border-2 border-[#14120F] font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[6px_6px_0px_0px_#FFC93C] transition-all cursor-pointer"
            >
              <span>Load More Photos on Wall ({filteredList.length - visibleLimit} Remaining)</span>
            </button>
          </div>
        )}

        {/* Community Dispatch / Contribute to the Wall Banner */}
        <ScrollReveal direction="up" delay={0.1} className="mt-14 p-6 sm:p-8 bg-[#181512] border-2 border-[#14120F] shadow-[6px_6px_0px_0px_#FFC93C] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#14120F] text-[#FFC93C] text-[11px] font-mono font-bold uppercase tracking-wider border border-[#FFC93C]/40">
              <Camera className="w-3.5 h-3.5" />
              <span>COMMUNITY PHOTOGRAPHERS & SHOOTERS</span>
            </div>
            <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4]">
              Captured a sick moment at our weekend cyphers?
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[#F4EFE4]/70 leading-relaxed">
              Drop your high-res photos and video stills in our WhatsApp group or tag <strong>@mumbai.beatbox.hub</strong> on Instagram. We paste fresh authentic community shots onto this wall every week.
            </p>
          </div>

          <a
            href={COMMUNITY_CONTACT.whatsappGroup}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono text-xs font-bold uppercase tracking-widest border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] transition-all shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Photos on WhatsApp</span>
          </a>
        </ScrollReveal>

      </div>

      {/* =========================================================================
         3. FULLSCREEN INTERACTIVE STREET LIGHTBOX MODAL
         ========================================================================= */}
      {selectedItem && selectedIdx !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-3 sm:p-6"
          onClick={() => setSelectedIdx(null)}
        >
          {/* Modal Container */}
          <div 
            className="bg-[#181512] text-[#F4EFE4] border-4 border-[#14120F] shadow-[10px_10px_0px_0px_#FFC93C] max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-[#14120F] border-b-2 border-[#FFC93C]/30 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 bg-[#FFC93C] text-[#14120F] font-bold uppercase">
                  WALL PHOTO #{selectedIdx + 1}
                </span>
                <span className="text-[#F4EFE4]/60 hidden sm:inline">
                  [{selectedIdx + 1} of {displayedItems.length}]
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#F4EFE4]/50 hidden sm:inline">
                  Use ← → keys to browse
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIdx(null)}
                  className="p-1.5 bg-[#181512] hover:bg-[#E4402A] text-[#F4EFE4] border border-[#F4EFE4]/30 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Center Image Viewport */}
            <div className="relative flex-1 bg-black/80 flex items-center justify-center overflow-hidden min-h-[300px] max-h-[58vh]">
              <img
                src={selectedItem.photoUrl || ''}
                alt={selectedItem.title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain"
              />

              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#14120F]/80 hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#FFC93C]/40 flex items-center justify-center transition-all cursor-pointer shadow-lg"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#14120F]/80 hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#FFC93C]/40 flex items-center justify-center transition-all cursor-pointer shadow-lg"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Metadata Drawer */}
            <div className="p-4 sm:p-6 bg-[#14120F] border-t-2 border-[#14120F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#FFC93C]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedItem.location}, Mumbai</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{selectedItem.dateStr}</span>
                  </span>
                </div>

                <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4] leading-tight">
                  {selectedItem.title}
                </h3>

                <p className="text-xs sm:text-sm font-sans text-[#F4EFE4]/80 leading-relaxed">
                  {selectedItem.caption}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIdx(null)}
                  className="px-5 py-2.5 bg-[#FFC93C] hover:bg-[#F4EFE4] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider border border-[#14120F] transition-colors cursor-pointer"
                >
                  Close Wall Viewer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
