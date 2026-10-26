import React, { useState, useEffect, useRef } from 'react';
import { GalleryItem } from '../types';
import { 
  X, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Camera, 
  Shuffle,
  Film,
  LayoutGrid,
  Columns,
  Eye,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { fetchGalleryItems } from '../lib/supabase';
import { COMMUNITY_CONTACT } from '../data/communityData';
import { ScrollReveal } from './animations/MotionComponents';

interface GallerySectionProps {
  refreshTrigger?: number;
}

type GalleryViewMode = 'contact' | 'filmstrip' | 'spotlight';

/**
 * Fisher-Yates array shuffling utility for randomizing photo wall sequence
 */
function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ refreshTrigger = 0 }) => {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<GalleryViewMode>('contact');
  const [spotlightIdx, setSpotlightIdx] = useState(0);

  const reelRef = useRef<HTMLDivElement>(null);

  // Fetch only authentic photos from Supabase (strictly exclude mock/fake images) and shuffle order
  useEffect(() => {
    let active = true;
    async function loadGallery() {
      setLoading(true);
      try {
        const items = await fetchGalleryItems();
        if (active) {
          const realItems = (items || []).filter(
            (item) => item.photoUrl && item.photoUrl.trim().length > 0 && !item.photoUrl.includes('unsplash.com')
          );
          // Always keep on shuffle
          const shuffled = shuffleArray(realItems);
          setGalleryList(shuffled);
          setSpotlightIdx(0);
        }
      } catch (err) {
        console.warn('Failed to load gallery items:', err);
        if (active) setGalleryList([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadGallery();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  // Interactive shuffle trigger
  const handleShuffle = () => {
    setIsShuffling(true);
    setSelectedIdx(null);
    setGalleryList((prev) => {
      const next = shuffleArray(prev);
      setSpotlightIdx(0);
      return next;
    });
    setTimeout(() => {
      setIsShuffling(false);
    }, 260);
  };

  // Filmstrip horizontal scrolling
  const scrollReel = (direction: 'left' | 'right') => {
    if (reelRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      reelRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Touch tracking to distinguish scrolling gesture from intentional tile click
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isScrollingGesture = useRef<boolean>(false);

  const handleCardTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      isScrollingGesture.current = false;
    }
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
      if (deltaY > 6 || deltaX > 6) {
        isScrollingGesture.current = true;
      }
    }
  };

  const handleCardClick = (idx: number) => {
    if (!isScrollingGesture.current) {
      setSelectedIdx(idx);
    }
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    if (selectedIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIdx(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedIdx((prev) => (prev !== null ? (prev + 1) % galleryList.length : null));
      } else if (e.key === 'ArrowLeft') {
        setSelectedIdx((prev) => (prev !== null ? (prev - 1 + galleryList.length) % galleryList.length : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, galleryList.length]);

  const selectedItem = selectedIdx !== null ? galleryList[selectedIdx] : null;
  const currentSpotlight = galleryList.length > 0 ? galleryList[spotlightIdx % galleryList.length] : null;

  const handleLightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + galleryList.length) % galleryList.length);
    }
  };

  const handleLightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % galleryList.length);
    }
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#E4402A]/20 relative overflow-x-clip">
      
      {/* Background Subtle Atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#E4402A]/5 via-transparent to-transparent pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0.05} className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-widest mb-3 border border-[#14120F] shadow-[2px_2px_0px_0px_#E4402A]">
                <Film className="w-3.5 h-3.5" />
                <span>CYPHER 35MM DARKROOM ARCHIVE</span>
              </div>
              <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-none">
                The Cypher Photo Archive
              </h2>
              <p className="text-sm sm:text-base text-white/75 font-mono mt-2 max-w-2xl leading-relaxed">
                Raw, uncut moments from Carter Road, Shivaji Park, Bandstand & underground battles. Choose your layout or click any frame to inspect in full resolution.
              </p>
            </div>

            {/* Header Controls: Layout Switcher & Shuffle Trigger */}
            {galleryList.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                {/* Layout Switcher */}
                <div className="bg-[#181512] border-2 border-[#14120F] p-1 flex items-center gap-1 shadow-[2px_2px_0px_0px_#E4402A]">
                  <button
                    type="button"
                    onClick={() => setViewMode('contact')}
                    title="Darkroom Contact Sheet"
                    className={`px-2.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'contact'
                        ? 'bg-[#FFC93C] text-[#14120F] shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Contact</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('filmstrip')}
                    title="Horizontal 35mm Film Reel"
                    className={`px-2.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'filmstrip'
                        ? 'bg-[#FFC93C] text-[#14120F] shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Reel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('spotlight')}
                    title="Spotlight Stage"
                    className={`px-2.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'spotlight'
                        ? 'bg-[#FFC93C] text-[#14120F] shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Spotlight</span>
                  </button>
                </div>

                {/* Shuffle Button */}
                <button
                  type="button"
                  id="gallery-shuffle-btn"
                  onClick={handleShuffle}
                  title="Reshuffle the photo order"
                  className="px-3.5 py-2 bg-[#FFC93C] hover:bg-white text-[#14120F] border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#E4402A] hover:shadow-[1px_1px_0px_0px_#E4402A] hover:translate-x-0.5 hover:translate-y-0.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer select-none"
                >
                  <Shuffle className={`w-3.5 h-3.5 transition-transform duration-300 ${isShuffling ? 'rotate-180 animate-spin' : ''}`} />
                  <span>Shuffle</span>
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center border-2 border-dashed border-[#E4402A]/30 bg-[#181512] p-8">
            <div className="w-10 h-10 border-2 border-[#E4402A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs uppercase text-[#F4EFE4]/70">Developing 35mm Negatives...</p>
          </div>
        ) : galleryList.length === 0 ? (
          /* Empty State */
          <div className="py-16 md:py-20 text-center border-2 border-dashed border-[#E4402A]/30 bg-[#181512] p-8 max-w-2xl mx-auto shadow-[4px_4px_0px_0px_#14120F]">
            <div className="w-16 h-16 rounded-full bg-[#E4402A]/10 border border-[#E4402A]/30 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-[#E4402A]" />
            </div>
            
            <h3 className="font-['Anton'] text-2xl sm:text-3xl text-[#F4EFE4] tracking-wide uppercase">
              Photo Archive Empty
            </h3>
            <p className="font-mono text-xs sm:text-sm text-[#F4EFE4]/70 mt-2 max-w-md mx-auto leading-relaxed">
              Authentic cypher moments and battle frames uploaded through the Admin Studio will appear here.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href={COMMUNITY_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-[2px_2px_0px_0px_#E4402A]"
              >
                <span>Check Instagram Highlights</span>
              </a>
            </div>
          </div>
        ) : (
          /* =========================================================================
             ACTIVE GALLERY VIEW
             ========================================================================= */
          <div className={`transition-all duration-300 ${isShuffling ? 'opacity-30 scale-[0.99]' : 'opacity-100 scale-100'}`}>
            
            {/* VIEW 1: CONTACT SHEET (35mm Analog Proof Sheet with Perforations & Amber Date Stamp) */}
            {viewMode === 'contact' && (
              <div 
                style={{ touchAction: 'pan-y' }}
                className={`grid gap-6 sm:gap-7 ${
                  galleryList.length === 1
                    ? 'grid-cols-1 max-w-2xl mx-auto'
                    : galleryList.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {galleryList.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    onTouchStart={handleCardTouchStart}
                    onTouchMove={handleCardTouchMove}
                    onClick={() => handleCardClick(idx)}
                    style={{ touchAction: 'pan-y' }}
                    className="group relative overflow-hidden bg-[#0A0908] border-2 border-[#1E1B17] hover:border-[#FFC93C] transition-all duration-300 shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[8px_8px_0px_0px_#E4402A] hover:-translate-y-1 cursor-pointer flex flex-col"
                  >
                    {/* 35mm Film Top Sprocket Bar */}
                    <div className="bg-[#050505] px-3 py-1.5 border-b border-white/10 flex items-center justify-between font-mono text-[9px] text-white/50 select-none">
                      <div className="flex items-center gap-1.5 tracking-tighter">
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-white/20 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-white/20 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-white/20 inline-block" />
                        <span className="text-[#FFC93C]/80 font-bold ml-1">MBH 400TX</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/60">EXP #{String(idx + 1).padStart(2, '0')}</span>
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-white/20 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-white/20 inline-block" />
                      </div>
                    </div>

                    {/* Photo Container */}
                    <div className="relative overflow-hidden bg-black aspect-[4/3] sm:aspect-[16/11]">
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        loading="lazy"
                        draggable={false}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] pointer-events-none select-none"
                      />

                      {/* Film Vignette & Lens Flare Glint on Hover */}
                      <div className="absolute inset-0 bg-radial from-transparent via-[#0A0908]/20 to-[#0A0908]/60 pointer-events-none" />
                      
                      {/* Analog Amber Camera Date Stamp (Bottom Right) */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs border border-[#FF9E00]/30 select-none pointer-events-none">
                        <span className="font-mono text-[11px] font-bold text-[#FF9E00] tracking-widest drop-shadow-[0_0_4px_rgba(255,158,0,0.8)]">
                          {item.dateStr || `'24 10 ${String((idx % 28) + 1).padStart(2, '0')}`}
                        </span>
                      </div>

                      {/* Hover Flash Inspect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14120F]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center">
                        <div className="px-3.5 py-1.5 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg border border-[#14120F] scale-95 group-hover:scale-100 transition-transform">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Exposure</span>
                        </div>
                      </div>
                    </div>

                    {/* 35mm Film Bottom Sprocket Bar */}
                    <div className="bg-[#050505] px-3 py-1 border-t border-b border-white/10 flex items-center justify-between font-mono text-[9px] text-white/40 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-white/20 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-white/20 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-white/20 inline-block" />
                        <span>MUMBAI BEATBOX ARCHIVE</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#E4402A] font-bold">35mm</span>
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-white/20 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-white/20 inline-block" />
                      </div>
                    </div>

                    {/* Card Narrative Plaque */}
                    <div className="p-4 bg-[#14120F] flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-white/70 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E4402A] shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>

                        <h3 className="font-['Anton'] text-xl uppercase tracking-tight text-white leading-tight line-clamp-1 group-hover:text-[#FFC93C] transition-colors">
                          {item.title}
                        </h3>

                        {item.caption && (
                          <p className="text-xs font-mono text-white/60 line-clamp-2 mt-1.5 leading-relaxed">
                            {item.caption.replace(/\*\*/g, '')}
                          </p>
                        )}
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-white/50">
                          PROOF {idx + 1} OF {galleryList.length}
                        </span>
                        <span className="text-[#FFC93C] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Inspect</span>
                          <Maximize2 className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 2: HORIZONTAL 35MM CONTINUOUS FILM REEL */}
            {viewMode === 'filmstrip' && (
              <div className="relative">
                {/* Reel Navigator Bar */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-white/75">
                    <span className="w-2 h-2 rounded-full bg-[#FFC93C] animate-pulse" />
                    <span>PANORAMIC 35MM STREET REEL // SWIPE OR USE CONTROLS</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollReel('left')}
                      aria-label="Scroll reel left"
                      className="p-2 bg-[#181512] hover:bg-[#FFC93C] text-white hover:text-[#14120F] border border-white/20 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollReel('right')}
                      aria-label="Scroll reel right"
                      className="p-2 bg-[#181512] hover:bg-[#FFC93C] text-white hover:text-[#14120F] border border-white/20 transition-all cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Continuous Negative Strip Container */}
                <div className="bg-[#050505] border-y-4 border-[#14120F] shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-4 overflow-hidden relative">
                  
                  {/* Top Continuous Perforations */}
                  <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10 select-none overflow-hidden font-mono text-[9px] text-white/40">
                    <div className="flex items-center gap-3">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <span key={i} className="w-2.5 h-3 rounded-[2px] bg-white/20 inline-block shrink-0" />
                      ))}
                    </div>
                    <span className="text-[#FFC93C] font-bold shrink-0 px-2">KODAK TRI-X 400 FILM // SAFETY NEGATIVE</span>
                    <div className="flex items-center gap-3">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <span key={i} className="w-2.5 h-3 rounded-[2px] bg-white/20 inline-block shrink-0" />
                      ))}
                    </div>
                  </div>

                  {/* Scrollable Frame Track */}
                  <div
                    ref={reelRef}
                    className="flex gap-6 overflow-x-auto py-5 px-4 sm:px-8 scroll-smooth no-scrollbar touch-scroll"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    {galleryList.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        onClick={() => setSelectedIdx(idx)}
                        style={{ scrollSnapAlign: 'start' }}
                        className="group relative flex-none w-[280px] sm:w-[360px] md:w-[420px] bg-[#100E0C] border-2 border-white/15 hover:border-[#FFC93C] shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[6px_6px_0px_0px_#E4402A] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                      >
                        {/* Film Frame Header */}
                        <div className="bg-[#181512] px-3 py-1 flex items-center justify-between font-mono text-[10px] text-white/60 border-b border-white/10">
                          <span className="text-[#FFC93C] font-bold">FRAME {String(idx + 1).padStart(2, '0')}</span>
                          <span>{item.dateStr || 'MUMBAI CYPHER'}</span>
                        </div>

                        {/* Image */}
                        <div className="relative aspect-[16/10] bg-black overflow-hidden">
                          <img
                            src={item.photoUrl}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                          {/* Amber Date Stamp */}
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 font-mono text-[10px] text-[#FF9E00] font-bold">
                            {item.dateStr || `'24 10 ${String((idx % 28) + 1).padStart(2, '0')}`}
                          </div>
                        </div>

                        {/* Caption & Location */}
                        <div className="p-3.5 bg-[#14120F] flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-mono text-white/70 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-[#E4402A] shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>
                            <h3 className="font-['Anton'] text-lg uppercase tracking-tight text-white line-clamp-1 group-hover:text-[#FFC93C] transition-colors">
                              {item.title}
                            </h3>
                          </div>

                          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
                            <span>CLICK TO ENLARGE</span>
                            <Maximize2 className="w-3.5 h-3.5 text-[#FFC93C]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Continuous Perforations */}
                  <div className="flex items-center justify-between px-4 pt-3 border-t border-white/10 select-none overflow-hidden font-mono text-[9px] text-white/40">
                    <div className="flex items-center gap-3">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <span key={i} className="w-2.5 h-3 rounded-[2px] bg-white/20 inline-block shrink-0" />
                      ))}
                    </div>
                    <span className="text-white/60 font-mono shrink-0 px-2">ISO 800 // EASTMAN STREET REEL // 24 FPS</span>
                    <div className="flex items-center gap-3">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <span key={i} className="w-2.5 h-3 rounded-[2px] bg-white/20 inline-block shrink-0" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: SPOTLIGHT STAGE (Featured Large Frame + Negative Thumbnail Strip) */}
            {viewMode === 'spotlight' && currentSpotlight && (
              <div className="space-y-6">
                
                {/* Hero Showcase Display */}
                <div className="bg-[#181512] border-2 border-[#14120F] shadow-[6px_6px_0px_0px_#E4402A] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                  
                  {/* Hero Image Viewport */}
                  <div 
                    onClick={() => setSelectedIdx(spotlightIdx)}
                    className="lg:col-span-8 bg-black relative min-h-[320px] sm:min-h-[460px] md:min-h-[540px] flex items-center justify-center cursor-pointer group overflow-hidden"
                  >
                    <img
                      src={currentSpotlight.photoUrl}
                      alt={currentSpotlight.title}
                      className="w-full h-full object-contain max-h-[600px] transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                    
                    {/* Top Floating Frame Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#14120F]/90 text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E4402A] animate-pulse" />
                      <span>SPOTLIGHT EXPOSURE #{String(spotlightIdx + 1).padStart(2, '0')}</span>
                    </div>

                    {/* Amber Date Stamp */}
                    <div className="absolute bottom-4 right-4 px-2.5 py-1 bg-black/70 font-mono text-xs font-bold text-[#FF9E00] tracking-widest border border-[#FF9E00]/40">
                      {currentSpotlight.dateStr || `'24 10 ${String((spotlightIdx % 28) + 1).padStart(2, '0')}`}
                    </div>

                    {/* Center Click Hint on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg border border-[#14120F]">
                        <Maximize2 className="w-4 h-4" />
                        <span>Inspect in Lightbox</span>
                      </span>
                    </div>
                  </div>

                  {/* Hero Information Sidebar */}
                  <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 bg-[#14120F]">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#181512] border border-[#FFC93C]/40 text-[#FFC93C] font-mono text-xs uppercase tracking-wider mb-4">
                        <MapPin className="w-3.5 h-3.5 text-[#E4402A]" />
                        <span>{currentSpotlight.location || 'Mumbai Cypher Arena'}</span>
                      </div>

                      <h3 className="font-['Anton'] text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-white leading-tight mb-3">
                        {currentSpotlight.title}
                      </h3>

                      <p className="text-sm text-white/80 font-sans leading-relaxed mb-6 whitespace-pre-line">
                        {currentSpotlight.caption || 'Authentic vocal percussion capture from Mumbai Beatbox Hub community cyphers.'}
                      </p>

                      {currentSpotlight.dateStr && (
                        <div className="p-3 bg-[#181512] border border-white/10 font-mono text-xs text-white/70 space-y-1 mb-6">
                          <div className="text-white/40 uppercase text-[10px]">Session Archive Tag</div>
                          <div className="text-white font-bold">{currentSpotlight.dateStr}</div>
                        </div>
                      )}
                    </div>

                    {/* Spotlight Controls */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSpotlightIdx((prev) => (prev - 1 + galleryList.length) % galleryList.length)}
                        className="px-3.5 py-2 bg-[#181512] hover:bg-[#FFC93C] text-white hover:text-[#14120F] border border-white/20 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedIdx(spotlightIdx)}
                        className="px-4 py-2 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-all cursor-pointer border border-[#14120F] shadow-[2px_2px_0px_0px_#E4402A]"
                      >
                        Full Size
                      </button>

                      <button
                        type="button"
                        onClick={() => setSpotlightIdx((prev) => (prev + 1) % galleryList.length)}
                        className="px-3.5 py-2 bg-[#181512] hover:bg-[#FFC93C] text-white hover:text-[#14120F] border border-white/20 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Film Strip Thumbnail Strip */}
                <div className="bg-[#181512] p-4 border border-white/10">
                  <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-3 px-1">
                    <span>SELECT NEGATIVE FRAME TO SPOTLIGHT</span>
                    <span>{galleryList.length} EXPOSURES AVAILABLE</span>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth no-scrollbar touch-scroll">
                    {galleryList.map((item, idx) => (
                      <button
                        key={`${item.id}-thumb-${idx}`}
                        type="button"
                        onClick={() => setSpotlightIdx(idx)}
                        className={`relative flex-none w-20 sm:w-24 aspect-[4/3] overflow-hidden border-2 transition-all cursor-pointer ${
                          spotlightIdx === idx
                            ? 'border-[#FFC93C] scale-105 shadow-[0_0_10px_rgba(255,201,60,0.5)]'
                            : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/60'
                        }`}
                      >
                        <img
                          src={item.photoUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1 bg-black/80 font-mono text-[8px] text-white font-bold">
                          #{idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Lightbox Modal (Full Resolution, Clear & Uncropped) */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedIdx(null)}
          className="fixed inset-0 z-50 bg-[#14120F]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setSelectedIdx(null)}
            aria-label="Close modal"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 bg-[#FFC93C] border border-[#14120F] text-[#14120F] hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Left Navigation */}
          {galleryList.length > 1 && (
            <button
              type="button"
              onClick={handleLightboxPrev}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 min-w-[40px] min-h-[40px] flex items-center justify-center p-2 sm:p-3 bg-[#181512]/90 border border-white/30 text-white hover:bg-[#FFC93C] hover:text-[#14120F] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Lightbox Right Navigation */}
          {galleryList.length > 1 && (
            <button
              type="button"
              onClick={handleLightboxNext}
              aria-label="Next photo"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 min-w-[40px] min-h-[40px] flex items-center justify-center p-2 sm:p-3 bg-[#181512]/90 border border-white/30 text-white hover:bg-[#FFC93C] hover:text-[#14120F] transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Lightbox Content Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-[#181512] border-2 border-[#E4402A] shadow-[4px_4px_0px_0px_#FFC93C] sm:shadow-[8px_8px_0px_0px_#FFC93C] overflow-hidden max-h-[88vh] flex flex-col md:flex-row"
          >
            {/* Image Preview Container */}
            <div className="relative md:w-3/5 bg-black flex items-center justify-center min-h-[200px] sm:min-h-[300px] md:min-h-[480px] p-2 shrink-0">
              <img
                src={selectedItem.photoUrl}
                alt={selectedItem.title}
                className="max-h-[40vh] md:max-h-[75vh] w-full object-contain"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-[#14120F]/90 text-white font-mono text-[10px] uppercase font-bold border border-white/30">
                Frame {selectedIdx !== null ? selectedIdx + 1 : 1} of {galleryList.length}
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="p-4 sm:p-6 md:w-2/5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#E4402A]/20 bg-[#181512] overflow-y-auto">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#14120F] border border-[#FFC93C]/40 text-white font-mono text-xs mb-3">
                  <MapPin className="w-3.5 h-3.5 text-[#E4402A]" />
                  <span>{selectedItem.location || 'Mumbai Cypher'}</span>
                </div>

                <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-white leading-tight mb-2">
                  {selectedItem.title}
                </h3>

                <p className="text-xs sm:text-sm text-white/80 font-sans leading-relaxed mb-4 whitespace-pre-line">
                  {selectedItem.caption || 'Acoustic cypher capture from the Mumbai Beatbox Hub community archives.'}
                </p>

                {selectedItem.dateStr && (
                  <div className="text-xs font-mono text-white/60 border-t border-white/10 pt-3">
                    <span className="text-white/90">Session / Tag:</span> {selectedItem.dateStr}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-white/50">
                  USE ← → ARROWS TO BROWSE
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIdx(null)}
                  className="px-3.5 py-1.5 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer border border-[#14120F]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
