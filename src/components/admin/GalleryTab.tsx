import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  ExternalLink,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { saveGalleryItem, deleteGalleryItem } from '../../lib/supabase';
import { ImageUploader } from './ImageUploader';

interface GalleryTabProps {
  items: GalleryItem[];
  onRefresh: () => void;
}

export function GalleryTab({ items, onRefresh }: GalleryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<GalleryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [aspect, setAspect] = useState<'square' | 'portrait' | 'landscape'>('square');
  const [photoUrl, setPhotoUrl] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setCaption('');
    setLocation('Bandra Amphitheatre, Mumbai');
    setDateStr('Recent Cypher Session');
    setAspect('square');
    setPhotoUrl('');
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCaption(item.caption);
    setLocation(item.location);
    setDateStr(item.dateStr);
    setAspect(item.aspect);
    setPhotoUrl(item.photoUrl || '');
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !caption.trim() || !location.trim()) {
      setErrorMessage('Please fill in the title, caption, and location.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      id: editingItem?.id,
      title: title.trim(),
      caption: caption.trim(),
      location: location.trim(),
      dateStr: dateStr.trim() || 'Cypher Session',
      aspect,
      photoUrl: photoUrl.trim(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    const res = await saveGalleryItem(payload);
    setSaving(false);

    if (res.success) {
      setModalOpen(false);
      setSuccessToast(editingItem ? 'Gallery item updated successfully!' : 'New gallery item created in Supabase!');
      setTimeout(() => setSuccessToast(null), 3500);
      onRefresh();
    } else {
      setErrorMessage(res.error || 'Failed to save gallery item to Supabase.');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalItem) return;
    setDeleting(true);

    const res = await deleteGalleryItem(deleteModalItem.id);
    setDeleting(false);

    if (res.success) {
      setDeleteModalItem(null);
      setSuccessToast('Gallery item removed from Supabase.');
      setTimeout(() => setSuccessToast(null), 3500);
      onRefresh();
    } else {
      alert(res.error || 'Failed to delete gallery item.');
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.caption.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.dateStr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 font-mono text-xs flex items-center justify-between">
          <span>{successToast}</span>
          <button type="button" onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1713] p-4 border border-[#F4EFE4]/15">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#F4EFE4]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gallery by title, caption, location..."
            className="w-full pl-9 pr-4 py-2 bg-[#14120F] border border-[#F4EFE4]/20 text-xs font-mono text-[#F4EFE4] placeholder-[#F4EFE4]/40 focus:border-[#FFC93C] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#F4EFE4]/60">
            {filteredItems.length} of {items.length} records
          </span>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono font-bold text-xs uppercase tracking-wider border border-[#14120F] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#14120F] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Photo</span>
          </button>
        </div>
      </div>

      {/* Gallery Table / Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#1A1713] border border-dashed border-[#F4EFE4]/20 p-8">
          <ImageIcon className="w-10 h-10 text-[#FFC93C]/50 mx-auto mb-3" />
          <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4]">No Gallery Records Found</h3>
          <p className="font-mono text-xs text-[#F4EFE4]/60 mt-1 max-w-sm mx-auto">
            {items.length === 0
              ? 'The Supabase gallery table is currently empty. Click "Add Photo" to publish your first record.'
              : 'No items match your search filter.'}
          </p>
          {items.length === 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-[#FFC93C] text-[#14120F] font-mono font-bold text-xs uppercase cursor-pointer"
            >
              + Create First Photo Record
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#1A1713] border border-[#F4EFE4]/15 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#14120F] border-b border-[#F4EFE4]/15 text-[#FFC93C] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5 w-16">Preview</th>
                <th className="p-3.5">Title & Caption</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Aspect</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE4]/10 text-[#F4EFE4]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#14120F]/60 transition-colors">
                  <td className="p-3.5">
                    <div className="w-12 h-12 bg-[#14120F] border border-[#F4EFE4]/20 overflow-hidden flex items-center justify-center">
                      {item.photoUrl ? (
                        <img 
                          src={item.photoUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-[#F4EFE4]/30" />
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-[#F4EFE4] text-sm">{item.title}</div>
                    <div className="text-[#F4EFE4]/60 line-clamp-1 text-[11px] mt-0.5">{item.caption}</div>
                  </td>
                  <td className="p-3.5 text-[#F4EFE4]/80 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#FFC93C]" />
                      <span>{item.location}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-[#F4EFE4]/70 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#F4EFE4]/40" />
                      <span>{item.dateStr}</span>
                    </div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[10px] uppercase text-[#FFC93C]">
                      {item.aspect}
                    </span>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1.5 bg-[#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] border border-[#F4EFE4]/20 transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteModalItem(item)}
                        className="p-1.5 bg-[#14120F] hover:bg-[#E4402A] hover:text-white border border-[#F4EFE4]/20 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#1A1713] border-2 border-[#FFC93C] shadow-[8px_8px_0px_0px_#14120F] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F4EFE4]/15 pb-3 mb-4">
              <h3 className="font-['Anton'] text-2xl uppercase tracking-wide text-[#F4EFE4]">
                {editingItem ? 'Edit Gallery Photo' : 'Add New Gallery Photo'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="text-[#F4EFE4]/60 hover:text-[#FFC93C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-[#E4402A]/15 border border-[#E4402A] text-[#F4EFE4] text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[#F4EFE4]/80 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bandra Cypher Circle"
                  className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#F4EFE4]/80 uppercase mb-1">Caption / Story *</label>
                <textarea
                  required
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Vocal percussionists battling in a tight acoustic circle..."
                  className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Carter Rd Promenade"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Date String (date_str)</label>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    placeholder="e.g. Monsoon Jam 2025"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#F4EFE4]/80 uppercase mb-1">Aspect Ratio</label>
                <select
                  value={aspect}
                  onChange={(e) => setAspect(e.target.value as 'square' | 'portrait' | 'landscape')}
                  className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none"
                >
                  <option value="square">Square (1:1)</option>
                  <option value="portrait">Portrait (3:4 / 4:5)</option>
                  <option value="landscape">Landscape (16:9 / 4:3)</option>
                </select>
              </div>

              {/* Cloudinary Image Uploader (stores secure_url in gallery.photo_url) */}
              <ImageUploader
                label="Gallery Photo Image (Upload or URL)"
                value={photoUrl}
                onChange={setPhotoUrl}
                folder="mbh_media/gallery"
                recommendedAspect={`Format: ${aspect.toUpperCase()}`}
                placeholder="https://res.cloudinary.com/... or upload image"
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4EFE4]/15">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-[#F4EFE4]/70 hover:text-white border border-[#F4EFE4]/20 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Photo' : 'Save To Supabase'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#1A1713] border-2 border-[#E4402A] shadow-[8px_8px_0px_0px_#14120F] p-6 font-mono">
            <div className="flex items-center gap-3 text-[#E4402A] mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4]">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-xs text-[#F4EFE4]/80 leading-relaxed mb-4">
              Are you sure you want to permanently delete gallery photo:
              <strong className="block text-[#FFC93C] text-sm mt-1">{deleteModalItem.title}</strong>
              This will remove the row from the Supabase <code className="text-[#FFC93C]">gallery</code> table immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4EFE4]/15 text-xs">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                disabled={deleting}
                className="px-4 py-2 text-[#F4EFE4]/70 hover:text-white border border-[#F4EFE4]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-[#E4402A] hover:bg-[#ff5a43] text-white font-bold uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Record</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
