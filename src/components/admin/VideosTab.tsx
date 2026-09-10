import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Video as VideoIcon, 
  Play, 
  MapPin, 
  User, 
  Clock, 
  ExternalLink,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { VideoItem } from '../../types';
import { saveVideoItem, deleteVideoItem } from '../../lib/supabase';
import { ImageUploader } from './ImageUploader';

interface VideosTabProps {
  items: VideoItem[];
  onRefresh: () => void;
}

export function VideosTab({ items, onRefresh }: VideosTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VideoItem | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<VideoItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [performer, setPerformer] = useState('');
  const [venue, setVenue] = useState('');
  const [duration, setDuration] = useState('03:30');
  const [category, setCategory] = useState('Street Cypher');
  const [viewsEstimate, setViewsEstimate] = useState('Community Drop');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setPerformer('');
    setVenue('Carter Road Promenade, Bandra');
    setDuration('03:45');
    setCategory('Street Cypher');
    setViewsEstimate('Community Drop');
    setVideoUrl('');
    setThumbnailUrl('');
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (item: VideoItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setPerformer(item.performer);
    setVenue(item.venue);
    setDuration(item.duration);
    setCategory(item.category);
    setViewsEstimate(item.viewsEstimate);
    setVideoUrl(item.videoUrl || '');
    setThumbnailUrl(item.thumbnailUrl || '');
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !performer.trim() || !venue.trim()) {
      setErrorMessage('Please fill in title, performer, and venue.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload = {
      id: editingItem?.id,
      title: title.trim(),
      performer: performer.trim(),
      venue: venue.trim(),
      duration: duration.trim() || '03:30',
      category: category.trim() || 'Street Cypher',
      viewsEstimate: viewsEstimate.trim() || 'Community Drop',
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    const res = await saveVideoItem(payload);
    setSaving(false);

    if (res.success) {
      setModalOpen(false);
      setSuccessToast(editingItem ? 'Video record updated in Supabase!' : 'New video drop created in Supabase!');
      setTimeout(() => setSuccessToast(null), 3500);
      onRefresh();
    } else {
      setErrorMessage(res.error || 'Failed to save video to Supabase.');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalItem) return;
    setDeleting(true);

    const res = await deleteVideoItem(deleteModalItem.id);
    setDeleting(false);

    if (res.success) {
      setDeleteModalItem(null);
      setSuccessToast('Video record removed from Supabase.');
      setTimeout(() => setSuccessToast(null), 3500);
      onRefresh();
    } else {
      alert(res.error || 'Failed to delete video.');
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.performer.toLowerCase().includes(q) ||
      item.venue.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
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
            placeholder="Search videos by title, artist, venue, category..."
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
            className="px-4 py-2 bg-[#E4402A] hover:bg-[#ff5a43] text-[#F4EFE4] font-mono font-bold text-xs uppercase tracking-wider border border-[#14120F] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#14120F] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* Video Table */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#1A1713] border border-dashed border-[#F4EFE4]/20 p-8">
          <VideoIcon className="w-10 h-10 text-[#E4402A]/60 mx-auto mb-3" />
          <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4]">No Video Drops Found</h3>
          <p className="font-mono text-xs text-[#F4EFE4]/60 mt-1 max-w-sm mx-auto">
            {items.length === 0
              ? 'The Supabase videos table is currently empty. Click "Add Video" to upload your first community routine.'
              : 'No videos match your search filter.'}
          </p>
          {items.length === 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-[#E4402A] text-white font-mono font-bold text-xs uppercase cursor-pointer"
            >
              + Create First Video Record
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#1A1713] border border-[#F4EFE4]/15 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#14120F] border-b border-[#F4EFE4]/15 text-[#FFC93C] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5 w-16">Thumbnail</th>
                <th className="p-3.5">Title & Performer</th>
                <th className="p-3.5">Venue & Category</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Views / Tag</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE4]/10 text-[#F4EFE4]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#14120F]/60 transition-colors">
                  <td className="p-3.5">
                    <div 
                      onClick={() => setPreviewVideo(item)}
                      className="w-16 h-10 bg-[#14120F] border border-[#F4EFE4]/20 overflow-hidden relative cursor-pointer group flex items-center justify-center"
                    >
                      {item.thumbnailUrl ? (
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <VideoIcon className="w-4 h-4 text-[#F4EFE4]/30" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3.5 h-3.5 fill-[#FFC93C] text-[#FFC93C]" />
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-[#F4EFE4] text-sm">{item.title}</div>
                    <div className="flex items-center gap-1.5 text-[#FFC93C] text-[11px] mt-0.5">
                      <User className="w-3 h-3" />
                      <span>{item.performer}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-[#F4EFE4]/80 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#E4402A]" />
                      <span>{item.venue}</span>
                    </div>
                    <span className="inline-block mt-1 px-1.5 py-0.2 bg-[#14120F] border border-[#F4EFE4]/20 text-[10px] uppercase text-[#F4EFE4]/70">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#F4EFE4]/70 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#F4EFE4]/40" />
                      <span>{item.duration}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-[#F4EFE4]/60 whitespace-nowrap text-[11px]">
                    {item.viewsEstimate}
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
          <div className="w-full max-w-xl bg-[#1A1713] border-2 border-[#E4402A] shadow-[8px_8px_0px_0px_#14120F] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F4EFE4]/15 pb-3 mb-4">
              <h3 className="font-['Anton'] text-2xl uppercase tracking-wide text-[#F4EFE4]">
                {editingItem ? 'Edit Routine Video' : 'Add New Routine Drop'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="text-[#F4EFE4]/60 hover:text-[#E4402A] cursor-pointer"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Liproll Symphony Round 1"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#E4402A] text-[#F4EFE4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Performer / Artist *</label>
                  <input
                    type="text"
                    required
                    value={performer}
                    onChange={(e) => setPerformer(e.target.value)}
                    placeholder="e.g. BassMonk & BeatK"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#E4402A] text-[#F4EFE4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Venue / Location *</label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Marine Drive Seaface"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#E4402A] text-[#F4EFE4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Duration (e.g. 03:30)</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="03:30"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#E4402A] text-[#F4EFE4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Street Cypher, Battle Routine, Masterclass"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#E4402A] text-[#F4EFE4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#F4EFE4]/80 uppercase mb-1">Views / Community Tag</label>
                  <input
                    type="text"
                    value={viewsEstimate}
                    onChange={(e) => setViewsEstimate(e.target.value)}
                    placeholder="e.g. 14.2K Views / Cypher Classic"
                    className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#E4402A] text-[#F4EFE4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#F4EFE4]/80 uppercase mb-1">Video Stream / Embed URL (video_url)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://commondatastorage.googleapis.com/... or YouTube embed"
                  className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#E4402A] text-[#F4EFE4] focus:outline-none"
                />
              </div>

              {/* Cloudinary Video Thumbnail Uploader (stores secure_url in videos.thumbnail_url) */}
              <ImageUploader
                label="Video Thumbnail (Upload or URL)"
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
                folder="mbh_media/videos"
                recommendedAspect="16:9 Landscape"
                placeholder="https://res.cloudinary.com/... or upload thumbnail"
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
                  className="px-5 py-2 bg-[#E4402A] hover:bg-[#ff5a43] text-white font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Video' : 'Save To Supabase'}</span>
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
                Confirm Video Deletion
              </h3>
            </div>

            <p className="text-xs text-[#F4EFE4]/80 leading-relaxed mb-4">
              Are you sure you want to permanently delete video:
              <strong className="block text-[#E4402A] text-sm mt-1">{deleteModalItem.title}</strong>
              by {deleteModalItem.performer}. This will remove the row from Supabase <code className="text-[#FFC93C]">videos</code> table.
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
                  <span>Delete Video</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div 
            className="w-full max-w-3xl bg-[#1A1713] border-2 border-[#FFC93C] p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F4EFE4]/15 font-mono text-xs">
              <div>
                <span className="text-[#FFC93C] font-bold block text-sm">{previewVideo.title}</span>
                <span className="text-[#F4EFE4]/70">{previewVideo.performer} &bull; {previewVideo.venue}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewVideo(null)}
                className="text-[#F4EFE4]/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center overflow-hidden border border-[#F4EFE4]/20">
              {previewVideo.videoUrl ? (
                <video 
                  controls 
                  autoPlay 
                  src={previewVideo.videoUrl} 
                  poster={previewVideo.thumbnailUrl}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center font-mono text-xs text-[#F4EFE4]/50">
                  <VideoIcon className="w-8 h-8 text-[#FFC93C]/40 mx-auto mb-2" />
                  No direct video stream URL configured for this record.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
