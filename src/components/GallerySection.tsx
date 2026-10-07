import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GalleryItem } from '../types';
import { 
  X, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Camera, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { fetchGalleryItems } from '../lib/supabase';
import { COMMUNITY_CONTACT } from '../data/communityData';
import { ScrollReveal } from './animations/MotionComponents';

interface GallerySectionProps {
  refreshTrigger?: number;
}

// Exactly 6 images per page: swipe right to view additional photos
const MAX_PER_VIEW = 6;

export const GallerySection: React.FC<GallerySectionProps> = ({ refreshTrigger = 0 }) => {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Fetch only authentic photos from Supabase (strictly exclude mock/fake images)
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
          setGalleryList(realItems);
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

  // Chunk items into pages of exactly max 6 images
  const pages = useMemo(() => {
    const chunks: GalleryItem[][] = [];
    for (let i = 0; i < galleryList.length; i += MAX_PER_VIEW) {
      chunks.push(galleryList.slice(i, i + MAX_PER_VIEW));
    }
    return chunks;
  }, [galleryList]);

  const totalPages = pages.length || 1;

  // Reset page when list length changes
  useEffect(() => {
    setCurrentPage(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [galleryList.length]);

  // Handle manual scroll / touch swipe sync
  const handleContainerScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth > 0) {
      const pageIndex = Math.round(scrollLeft / clientWidth);
      if (pageIndex !== currentPage && pageIndex >= 0 && pageIndex < totalPages) {
        setCurrentPage(pageIndex);
      }
    }
  };

  const scrollToPage = (pageIndex: number) => {
    const target = Math.max(0, Math.min(pageIndex, totalPages - 1));
    setCurrentPage(target);
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: target * width,
        behavior: 'smooth',
      });
    }
  };

  const handlePrevPage = () => {
    scrollToPage(currentPage - 1);
  };

  const handleNextPage = () => {
    scrollToPage(currentPage + 1);
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
    <section id="gallery" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#FFC93C]/20 relative overflow-hidden">
      
      {/* Background Subtle Atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#FFC93C]/5 via-transparent to-transparent pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0.05} className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-widest mb-3 border border-[#14120F] shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                <span>PHOTO WALL // ARCHIVE</span>
              </div>
              <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4EFE4] leading-none">
                The Cypher Photo Wall
              </h2>
              <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-2 max-w-2xl leading-relaxed">
                Authentic visual moments from Carter Road, Shivaji Park, Bandstand & street sessions.
              </p>
            </div>

            {/* Navigation Controls: Active if photos are more than 6 */}
            {totalPages > 1 && (
              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline-flex text-xs font-mono text-[#FFC93C] items-center gap-1.5 mr-1 font-semibold">
                  <span>Swipe right for more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    aria-label="Previous photos"
                    className={`p-2 border transition-all cursor-pointer ${
                      currentPage === 0
                        ? 'bg-[#181512]/50 text-[#F4EFE4]/30 border-[#F4EFE4]/10 cursor-not-allowed'
                        : 'bg-[#181512] text-[#FFC93C] border-[#FFC93C]/40 hover:bg-[#FFC93C] hover:text-[#14120F]'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono text-[#F4EFE4]/80 px-2.5 py-1 bg-[#181512] border border-[#F4EFE4]/20 font-bold">
                    {currentPage + 1} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                    aria-label="Next photos"
                    className={`p-2 border transition-all cursor-pointer ${
                      currentPage >= totalPages - 1
                        ? 'bg-[#181512]/50 text-[#F4EFE4]/30 border-[#F4EFE4]/10 cursor-not-allowed'
                        : 'bg-[#181512] text-[#FFC93C] border-[#FFC93C]/40 hover:bg-[#FFC93C] hover:text-[#14120F]'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center border-2 border-dashed border-[#FFC93C]/30 bg-[#181512] p-8">
            <div className="w-10 h-10 border-2 border-[#FFC93C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs uppercase text-[#F4EFE4]/70">Checking Cypher Archive...</p>
          </div>
        ) : galleryList.length === 0 ? (
          /* Empty State (No fake/mock data) */
          <div className="py-16 md:py-20 text-center border-2 border-dashed border-[#FFC93C]/30 bg-[#181512] p-8 max-w-2xl mx-auto shadow-[4px_4px_0px_0px_#14120F]">
            <div className="w-16 h-16 rounded-full bg-[#FFC93C]/10 border border-[#FFC93C]/30 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-[#FFC93C]" />
            </div>
            
            <h3 className="font-['Anton'] text-2xl sm:text-3xl text-[#F4EFE4] tracking-wide uppercase">
              No Gallery Photos Uploaded Yet
            </h3>
            <p className="font-mono text-xs sm:text-sm text-[#F4EFE4]/70 mt-2 max-w-md mx-auto leading-relaxed">
              Authentic cypher moments and battle frames uploaded through the Admin Studio will appear here on the photo wall.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/mbh-admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_#14120F] hover:bg-[#F4EFE4] transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upload First Photo (Admin)</span>
              </a>
              <a
                href={COMMUNITY_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#181512] text-[#F4EFE4] border border-[#F4EFE4]/20 font-mono text-xs font-bold uppercase tracking-wider hover:border-[#FFC93C] transition-all"
              >
                <span>Check Instagram Highlights</span>
              </a>
            </div>
          </div>
        ) : (
          /* =========================================================================
             PHOTO WALL CONTAINER (Max 6 Images per Page, Swipe Right / Scroll)
             ========================================================================= */
          <div className="relative group/gallery">
            
            {/* Mobile / Touch Swipe Right Indicator Cue */}
            {totalPages > 1 && currentPage < totalPages - 1 && (
              <div 
                onClick={handleNextPage}
                className="sm:hidden flex items-center justify-between px-4 py-2.5 bg-[#181512] border-2 border-[#FFC93C] text-[#FFC93C] font-mono text-xs mb-4 cursor-pointer active:bg-[#FFC93C] active:text-[#14120F] transition-colors shadow-[2px_2px_0px_0px_#14120F]"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Swipe right to view other images ({galleryList.length} photos)</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-[#F4EFE4]">
                  <span>Page {currentPage + 2}</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            )}

            {/* Left Scroll Floating Arrow (Desktop) */}
            {totalPages > 1 && currentPage > 0 && (
              <button
                type="button"
                onClick={handlePrevPage}
                aria-label="Previous photos"
                className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-30 p-3 bg-[#181512] text-[#FFC93C] border-2 border-[#FFC93C] shadow-[4px_4px_0px_0px_#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Right Scroll Floating Arrow (Desktop) */}
            {totalPages > 1 && currentPage < totalPages - 1 && (
              <button
                type="button"
                onClick={handleNextPage}
                aria-label="Next photos"
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-30 p-3 bg-[#181512] text-[#FFC93C] border-2 border-[#FFC93C] shadow-[4px_4px_0px_0px_#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Horizontal Swipeable Track (Smooth Touch & Snap Scroll) */}
            <div
              ref={scrollContainerRef}
              onScroll={handleContainerScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {pages.map((pageItems, pageIdx) => {
                const pageOffset = pageIdx * MAX_PER_VIEW;

                return (
                  <div
                    key={`page-${pageIdx}`}
                    className="w-full shrink-0 snap-start px-0.5 sm:px-1"
                  >
                    {/* Uniform, Symmetric Wall Grid: Every card & frame shares identical height & baseline */}
                    <div className={`grid gap-6 items-stretch ${
                      pageItems.length === 1
                        ? 'grid-cols-1 max-w-xl mx-auto'
                        : pageItems.length === 2
                        ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                      {pageItems.map((item, localIdx) => {
                        const globalIdx = pageOffset + localIdx;

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedIdx(globalIdx)}
                            className="group bg-[#181512] border-2 border-[#14120F] hover:border-[#FFC93C] p-3.5 sm:p-4 shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[6px_6px_0px_0px_#FFC93C] transition-all duration-300 cursor-pointer flex flex-col justify-between h-full"
                          >
                            {/* Unified Photo Canvas: Uniform 4:3 frame so landscape & portrait never mismatch or cause misalignment */}
                            <div className="relative w-full aspect-[4/3] bg-[#0B0907] overflow-hidden flex items-center justify-center border border-[#F4EFE4]/10 select-none">
                              {/* Ambient soft backdrop */}
                              <img
                                src={item.photoUrl}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-110 pointer-events-none select-none"
                              />

                              {/* 100% visible, razor-sharp photo without any cropping */}
                              <img
                                src={item.photoUrl}
                                alt={item.title}
                                loading="lazy"
                                className="relative z-10 max-h-full max-w-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-300"
                              />

                              {/* Frame Index Badge */}
                              <div className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 bg-[#14120F]/90 text-[#FFC93C] font-mono text-[10px] font-bold uppercase border border-[#FFC93C]/40 backdrop-blur-xs">
                                #{String(globalIdx + 1).padStart(2, '0')}
                              </div>

                              {/* Top Date / Session Stamp */}
                              {item.dateStr && (
                                <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 bg-[#14120F]/90 text-[#F4EFE4] font-mono text-[10px] font-bold uppercase border border-[#F4EFE4]/30 backdrop-blur-xs">
                                  {item.dateStr}
                                </div>
                              )}

                              {/* Expand Hover Badge */}
                              <div className="absolute bottom-2.5 right-2.5 z-20 px-2 py-0.5 bg-[#14120F]/90 text-[#FFC93C] font-mono text-[10px] uppercase font-bold border border-[#FFC93C]/40 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="w-3 h-3" />
                                <span>Expand</span>
                              </div>
                            </div>

                            {/* Aligned Card Information Strip */}
                            <div className="mt-3.5 pt-3 border-t border-[#F4EFE4]/10 flex flex-col justify-between flex-1">
                              <div>
                                {/* Location & Tag Line */}
                                <div className="flex items-center justify-between text-xs font-mono text-[#FFC93C] mb-1.5">
                                  <span className="flex items-center gap-1.5 truncate">
                                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#E4402A]" />
                                    <span className="truncate">{item.location}</span>
                                  </span>
                                  <span className="text-[10px] text-[#F4EFE4]/50 uppercase tracking-wider shrink-0">
                                    CYPHER WALL
                                  </span>
                                </div>

                                {/* Title with fixed height baseline so 1-line and 2-line titles align identically */}
                                <h4 
                                  className="font-['Anton'] text-xl sm:text-2xl uppercase tracking-tight text-[#F4EFE4] group-hover:text-[#FFC93C] transition-colors leading-tight line-clamp-2 min-h-[3.25rem]" 
                                  title={item.title}
                                >
                                  {item.title}
                                </h4>

                                {/* Caption preview */}
                                {item.caption && (
                                  <p className="text-xs font-mono text-[#F4EFE4]/70 line-clamp-2 mt-2 leading-relaxed">
                                    {item.caption.replace(/\*\*/g, '')}
                                  </p>
                                )}
                              </div>

                              {/* Clean Bottom Action Row */}
                              <div className="mt-4 pt-3 border-t border-[#F4EFE4]/10 flex items-center justify-between text-[11px] font-mono">
                                <span className="text-[#F4EFE4]/50">FRAME #{globalIdx + 1} OF {galleryList.length}</span>
                                <span className="text-[#FFC93C] font-semibold flex items-center gap-1 group-hover:underline">
                                  <span>View Full Photo</span>
                                  <Maximize2 className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Pagination & Navigation Controls (Visible if pictures > 6) */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#F4EFE4]/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#F4EFE4]/50 uppercase">Page:</span>
                  <div className="flex items-center gap-1.5">
                    {pages.map((_, pIdx) => (
                      <button
                        key={`page-btn-${pIdx}`}
                        type="button"
                        onClick={() => scrollToPage(pIdx)}
                        className={`w-7 h-7 text-xs font-mono font-bold transition-all border cursor-pointer ${
                          currentPage === pIdx
                            ? 'bg-[#FFC93C] text-[#14120F] border-[#FFC93C] shadow-[2px_2px_0px_0px_#14120F]'
                            : 'bg-[#181512] text-[#F4EFE4]/70 border-[#F4EFE4]/20 hover:border-[#FFC93C] hover:text-[#F4EFE4]'
                        }`}
                      >
                        {pIdx + 1}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono text-[#F4EFE4]/50 ml-2">
                    ({galleryList.length} total photos)
                  </span>
                </div>

                {/* Left/Right Navigation Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 border font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                      currentPage === 0
                        ? 'opacity-40 border-[#F4EFE4]/10 text-[#F4EFE4]/40 cursor-not-allowed'
                        : 'bg-[#181512] border-[#FFC93C]/40 text-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] shadow-[2px_2px_0px_0px_#14120F]'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Scroll Left</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 border font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                      currentPage >= totalPages - 1
                        ? 'opacity-40 border-[#F4EFE4]/10 text-[#F4EFE4]/40 cursor-not-allowed'
                        : 'bg-[#181512] border-[#FFC93C]/40 text-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] shadow-[2px_2px_0px_0px_#14120F]'
                    }`}
                  >
                    <span>Swipe Right</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
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
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 bg-[#181512] border border-[#FFC93C]/40 text-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Left Navigation */}
          {galleryList.length > 1 && (
            <button
              type="button"
              onClick={handleLightboxPrev}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 min-w-[40px] min-h-[40px] flex items-center justify-center p-2 sm:p-3 bg-[#181512]/90 border border-[#FFC93C]/40 text-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] transition-all cursor-pointer"
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
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 min-w-[40px] min-h-[40px] flex items-center justify-center p-2 sm:p-3 bg-[#181512]/90 border border-[#FFC93C]/40 text-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Lightbox Content Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-[#181512] border-2 border-[#FFC93C] shadow-[4px_4px_0px_0px_#14120F] sm:shadow-[8px_8px_0px_0px_#14120F] overflow-hidden max-h-[88vh] flex flex-col md:flex-row"
          >
            {/* Image Preview Container */}
            <div className="relative md:w-3/5 bg-black flex items-center justify-center min-h-[200px] sm:min-h-[300px] md:min-h-[480px] p-2 shrink-0">
              <img
                src={selectedItem.photoUrl}
                alt={selectedItem.title}
                className="max-h-[40vh] md:max-h-[75vh] w-full object-contain"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-[#14120F]/90 text-[#FFC93C] font-mono text-[10px] uppercase font-bold border border-[#FFC93C]/40">
                Frame {selectedIdx !== null ? selectedIdx + 1 : 1} of {galleryList.length}
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="p-4 sm:p-6 md:w-2/5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#FFC93C]/20 bg-[#181512] overflow-y-auto">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFC93C]/10 border border-[#FFC93C]/30 text-[#FFC93C] font-mono text-xs mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedItem.location || 'Mumbai Cypher'}</span>
                </div>

                <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4] leading-tight mb-2">
                  {selectedItem.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#F4EFE4]/80 font-sans leading-relaxed mb-4 whitespace-pre-line">
                  {selectedItem.caption || 'Acoustic cypher capture from the Mumbai Beatbox Hub community archives.'}
                </p>

                {selectedItem.dateStr && (
                  <div className="text-xs font-mono text-[#F4EFE4]/60 border-t border-[#F4EFE4]/10 pt-3">
                    <span className="text-[#FFC93C]">Session / Tag:</span> {selectedItem.dateStr}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#F4EFE4]/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#F4EFE4]/50">
                  USE ← → ARROWS TO BROWSE
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIdx(null)}
                  className="px-3 py-1.5 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#F4EFE4] transition-colors cursor-pointer"
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
