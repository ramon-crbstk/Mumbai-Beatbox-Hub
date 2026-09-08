import React, { useState, useEffect } from 'react';
import { GALLERY_ITEMS } from '../data/communityData';
import { GalleryItem } from '../types';
import { Image as ImageIcon, Plus, Upload, X, MapPin, Tag } from 'lucide-react';
import { fetchGalleryItems } from '../lib/supabase';

interface GallerySectionProps {
  refreshTrigger?: number;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ refreshTrigger = 0 }) => {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    async function loadGallery() {
      const items = await fetchGalleryItems();
      if (active && items && items.length > 0) {
        setGalleryList(items);
      }
    }
    loadGallery();
    return () => {
      active = false;
    };
  }, [refreshTrigger]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhotos((prev) => ({ ...prev, [id]: url }));
    }
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#FFC93C]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-widest mb-3 border border-[#14120F] rotate-1 shadow-sm">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>PHOTO ARCHIVE // OPEN TILES</span>
            </div>
            <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4]">
              Cypher Visual Gallery
            </h2>
            <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-1 max-w-xl">
              Real scenes from Carter Road, Shivaji Park, and Bandstand. Street cyphers captured in raw sunlight.
            </p>
          </div>

          <div className="text-xs font-mono text-[#F4EFE4]/60">
            <span>{galleryList.length} ARCHIVED MOMENTS</span>
          </div>
        </div>

        {/* Asymmetric Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryList.map((item, idx) => {
            const uploadedSrc = customPhotos[item.id] || item.photoUrl;

            return (
              <div
                key={item.id}
                id={`gallery-tile-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className="group relative bg-[#181512] border-2 border-[#F4EFE4]/20 hover:border-[#FFC93C] p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[6px_6px_0px_0px_#FFC93C] hover:-translate-y-1"
              >
                {/* Paper Tape Corner Accent */}
                <div className="absolute -top-2 left-6 w-12 h-3.5 bg-[#FFC93C]/80 -rotate-3 border border-[#14120F]/30 pointer-events-none" />

                {/* Main Tile Frame / Image Area */}
                <div className="relative w-full aspect-[4/3] bg-[#14120F] border border-dashed border-[#F4EFE4]/30 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                  {uploadedSrc ? (
                    <img
                      src={uploadedSrc}
                      alt={item.caption || item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-none border-2 border-[#FFC93C] flex items-center justify-center bg-[#181512] group-hover:scale-105 transition-transform">
                        <Plus className="w-6 h-6 text-[#FFC93C]" />
                      </div>
                      <div>
                        <span className="font-['Anton'] text-lg text-[#F4EFE4] tracking-wide block uppercase group-hover:text-[#FFC93C] transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-mono text-[#F4EFE4]/50 block mt-1">
                          [Placeholder Frame #{idx + 1}]
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Corner Badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#14120F]/90 text-[#FFC93C] font-mono text-[10px] uppercase border border-[#FFC93C]/40">
                    {item.dateStr}
                  </div>
                </div>

                {/* Caption and Location */}
                <div className="mt-4 pt-3 border-t border-[#F4EFE4]/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-[#FFC93C]">
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </span>
                    <span className="text-[10px] text-[#F4EFE4]/50 uppercase flex-shrink-0">
                      Tile #{idx + 1}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-[#F4EFE4]/80 line-clamp-2">
                    {item.caption}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Interactive Tile Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-[#F4EFE4] text-[#14120F] border-4 border-[#14120F] p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#FFC93C] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1.5 bg-[#14120F] text-[#F4EFE4] hover:bg-[#E4402A] transition-colors border border-[#14120F] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-[#E4402A] font-bold uppercase mb-2">
              <Tag className="w-3.5 h-3.5" />
              <span>CYPHER PHOTO METADATA</span>
            </div>

            <h3 className="font-['Anton'] text-3xl uppercase tracking-tight text-[#14120F] mb-3">
              {selectedItem.title}
            </h3>

            {selectedItem.photoUrl && (
              <div className="mb-4 aspect-video overflow-hidden border-2 border-[#14120F]">
                <img
                  src={selectedItem.photoUrl}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-sm font-sans text-[#14120F]/80 mb-4">
              {selectedItem.caption}
            </p>

            <div className="bg-[#E5DFC8] p-3.5 border border-[#14120F]/30 font-mono text-xs space-y-1.5 mb-6 text-[#14120F]">
              <div><strong>Location:</strong> {selectedItem.location}, Mumbai</div>
              <div><strong>Session:</strong> {selectedItem.dateStr}</div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-center gap-2 w-full py-3 bg-[#14120F] text-[#FFC93C] font-mono text-xs font-bold uppercase tracking-wider border-2 border-[#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Swap / Test Local Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFileUpload(e, selectedItem.id);
                    setSelectedItem(null);
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-full py-2 bg-transparent text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider border border-[#14120F]/40 hover:bg-[#14120F]/10 transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
