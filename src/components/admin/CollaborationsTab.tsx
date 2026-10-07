import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  ArrowUpDown, 
  Building2, 
  X, 
  Loader2, 
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Tag
} from 'lucide-react';
import { CollaborationItem } from '../../types';
import { 
  saveCollaboration, 
  deleteCollaboration, 
  toggleCollaborationVisibility,
  updateCollaborationOrder 
} from '../../lib/supabase';

interface CollaborationsTabProps {
  items: CollaborationItem[];
  onRefresh: () => void;
}

export function CollaborationsTab({ items, onRefresh }: CollaborationsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CollaborationItem | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<CollaborationItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [description, setDescription] = useState('');
  const [collaborationType, setCollaborationType] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setShortCode('');
    setDescription('');
    setCollaborationType('Acoustic Partner');
    setLogoUrl('');
    setWebsiteUrl('');
    // Auto-compute next display order
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order || 0)) + 1 : 1;
    setDisplayOrder(nextOrder);
    setIsVisible(true);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (item: CollaborationItem) => {
    setEditingItem(item);
    setName(item.name || '');
    setShortCode(item.short_code || '');
    setDescription(item.description || '');
    setCollaborationType(item.collaboration_type || '');
    setLogoUrl(item.logo_url || '');
    setWebsiteUrl(item.website_url || '');
    setDisplayOrder(item.display_order ?? 0);
    setIsVisible(item.is_visible);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please provide a collaboration name.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const payload: Partial<CollaborationItem> = {
      id: editingItem?.id,
      name: name.trim(),
      short_code: shortCode.trim() || null,
      description: description.trim() || null,
      collaboration_type: collaborationType.trim() || null,
      logo_url: logoUrl.trim() || null,
      website_url: websiteUrl.trim() || null,
      display_order: Number(displayOrder) || 0,
      is_visible: isVisible,
    };

    const res = await saveCollaboration(payload);
    setSaving(false);

    if (res.success) {
      setModalOpen(false);
      setSuccessToast(
        editingItem
          ? 'Collaboration updated successfully in Supabase!'
          : 'New collaboration created in Supabase!'
      );
      setTimeout(() => setSuccessToast(null), 3500);
      onRefresh();
    } else {
      setErrorMessage(
        res.error || 'Failed to save collaboration to Supabase. Check if public.collaborations exists.'
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteModalItem) return;
    setDeleting(true);

    const res = await deleteCollaboration(deleteModalItem.id);
    setDeleting(false);

    if (res.success) {
      setDeleteModalItem(null);
      setSuccessToast('Collaboration removed from Supabase.');
      setTimeout(() => setSuccessToast(null), 3500);
      onRefresh();
    } else {
      alert(res.error || 'Failed to delete collaboration from Supabase.');
    }
  };

  const handleToggleVisibility = async (item: CollaborationItem) => {
    setTogglingId(item.id);
    const newVisibility = !item.is_visible;
    const res = await toggleCollaborationVisibility(item.id, newVisibility);
    setTogglingId(null);

    if (res.success) {
      setSuccessToast(
        newVisibility
          ? `"${item.name}" is now visible to public visitors.`
          : `"${item.name}" is now hidden from public view.`
      );
      setTimeout(() => setSuccessToast(null), 3000);
      onRefresh();
    } else {
      alert(res.error || 'Failed to toggle visibility in Supabase.');
    }
  };

  const handleQuickOrderChange = async (item: CollaborationItem, delta: number) => {
    const newOrder = Math.max(0, (item.display_order || 0) + delta);
    const res = await updateCollaborationOrder(item.id, newOrder);
    if (res.success) {
      onRefresh();
    }
  };

  const filteredItems = items
    .filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.short_code && item.short_code.toLowerCase().includes(q)) ||
        (item.collaboration_type && item.collaboration_type.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const copySqlMigration = () => {
    const sql = `-- Create public.collaborations table
CREATE TABLE IF NOT EXISTS public.collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_code TEXT,
    description TEXT,
    collaboration_type TEXT,
    logo_url TEXT,
    website_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger function
CREATE OR REPLACE FUNCTION public.handle_collaborations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_collaborations_updated_at ON public.collaborations;
CREATE TRIGGER trigger_set_collaborations_updated_at
    BEFORE UPDATE ON public.collaborations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_collaborations_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collaborations_display_order ON public.collaborations(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_collaborations_is_visible ON public.collaborations(is_visible);

-- Enable RLS
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.collaborations TO authenticated, anon;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public select visible collaborations" ON public.collaborations;
CREATE POLICY "Allow public select visible collaborations" ON public.collaborations
    FOR SELECT TO public
    USING (is_visible = true OR (auth.role() = 'authenticated' AND public.is_admin()));

DROP POLICY IF EXISTS "Allow admin insert collaborations" ON public.collaborations;
CREATE POLICY "Allow admin insert collaborations" ON public.collaborations
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin update collaborations" ON public.collaborations;
CREATE POLICY "Allow admin update collaborations" ON public.collaborations
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admin delete collaborations" ON public.collaborations;
CREATE POLICY "Allow admin delete collaborations" ON public.collaborations
    FOR DELETE TO authenticated
    USING (public.is_admin());`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FFC93C] text-[#14120F] px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider border-2 border-[#14120F] shadow-[4px_4px_0px_0px_#14120F] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#14120F]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* SQL Migration Helper Banner */}
      <div className="p-4 bg-[#1A1713] border border-[#FFC93C]/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-start sm:items-center gap-2.5">
          <Building2 className="w-4 h-4 text-[#FFC93C] shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <span className="text-[#FFC93C] font-bold uppercase">
              Supabase Backend: public.collaborations
            </span>
            <span className="text-[#F4EFE4]/60 block sm:inline sm:ml-2">
              RLS enabled &bull; public.is_admin() authorized &bull; Auto updated_at trigger
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={copySqlMigration}
          className="self-start md:self-auto px-3 py-1.5 bg-[#14120F] hover:bg-[#FFC93C] text-[#FFC93C] hover:text-[#14120F] border border-[#FFC93C]/40 transition-colors flex items-center gap-1.5 cursor-pointer font-bold shrink-0"
          title="Copy SQL migration to paste into Supabase SQL Editor"
        >
          {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Migration'}</span>
        </button>
      </div>

      {/* Controls Bar: Search & Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A1713] p-4 border border-[#F4EFE4]/15">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#F4EFE4]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search collaborations, types, short codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14120F] border border-[#F4EFE4]/20 pl-9 pr-3 py-2 text-xs font-mono text-[#F4EFE4] placeholder-[#F4EFE4]/40 focus:outline-none focus:border-[#FFC93C]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-xs text-[#F4EFE4]/60">
            Total: <span className="text-[#FFC93C] font-bold">{items.length}</span> (
            <span className="text-emerald-400 font-bold">{items.filter((i) => i.is_visible).length} visible</span>)
          </div>

          <button
            type="button"
            id="admin-add-collab-btn"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono font-bold text-xs uppercase tracking-wider border border-[#14120F] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#14120F] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Collaboration</span>
          </button>
        </div>
      </div>

      {/* Grid of Collaborations */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#1A1713] border border-dashed border-[#F4EFE4]/20 font-mono text-xs text-[#F4EFE4]/60 space-y-3">
          <Building2 className="w-10 h-10 text-[#FFC93C]/40 mx-auto" />
          <div className="text-sm font-bold text-[#F4EFE4]">No Collaborations Found</div>
          <div>Create a new entry above or run the SQL migration in your Supabase dashboard.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const shortCode = (item.short_code || item.name.substring(0, 2)).toUpperCase();
            return (
              <div
                key={item.id}
                id={`admin-collab-card-${item.id}`}
                className={`bg-[#1A1713] border-2 p-5 flex flex-col justify-between transition-all ${
                  item.is_visible
                    ? 'border-[#F4EFE4]/20 hover:border-[#FFC93C]'
                    : 'border-red-950/60 bg-[#15110E] opacity-75'
                }`}
              >
                <div>
                  {/* Top Bar: Order, Type, Visibility Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-[#14120F] text-[#FFC93C] border border-[#FFC93C]/40 text-[10px] font-mono font-bold">
                        ORDER #{item.display_order}
                      </span>
                      {item.collaboration_type && (
                        <span className="px-2 py-0.5 bg-[#FFC93C]/10 text-[#FFC93C] text-[10px] font-mono uppercase font-bold truncate max-w-[120px]">
                          {item.collaboration_type}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item)}
                      disabled={togglingId === item.id}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1 transition-all cursor-pointer ${
                        item.is_visible
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                          : 'bg-red-950 text-red-300 border-red-500/40 hover:bg-red-900'
                      }`}
                      title={item.is_visible ? 'Click to hide from public site' : 'Click to show on public site'}
                    >
                      {togglingId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : item.is_visible ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Logo + Name Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Logo Box or Short Code Fallback */}
                    {item.logo_url && item.logo_url.trim() ? (
                      <div className="w-12 h-12 bg-black border border-[#F4EFE4]/30 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img
                          src={item.logo_url}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all"
                          onError={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.className = "w-12 h-12 bg-[#14120F] border border-[#F4EFE4]/30 flex items-center justify-center font-['Anton'] text-lg text-[#FFC93C] shrink-0";
                              parent.innerText = shortCode;
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-[#14120F] border border-[#F4EFE4]/30 flex items-center justify-center font-['Anton'] text-lg text-[#FFC93C] shrink-0">
                        {shortCode}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-['Anton'] text-xl uppercase tracking-tight text-[#F4EFE4] leading-tight truncate">
                        {item.name}
                      </h3>
                      {item.short_code && (
                        <span className="text-[10px] font-mono text-[#F4EFE4]/50">
                          Code: {item.short_code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-[#F4EFE4]/70 font-sans mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Website URL Link */}
                  {item.website_url && (
                    <div className="mb-3">
                      <a
                        href={item.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#FFC93C] hover:underline truncate max-w-full"
                      >
                        <Globe className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.website_url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-3 border-t border-[#F4EFE4]/10 flex items-center justify-between gap-2">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-[10px] text-[#F4EFE4]/40 uppercase mr-1">Order:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickOrderChange(item, -1)}
                      className="px-2 py-0.5 bg-[#14120F] text-[#F4EFE4]/70 hover:text-[#FFC93C] border border-[#F4EFE4]/20 hover:border-[#FFC93C] cursor-pointer"
                      title="Decrease order index"
                    >
                      -
                    </button>
                    <span className="px-2 text-[#FFC93C] font-bold">{item.display_order}</span>
                    <button
                      type="button"
                      onClick={() => handleQuickOrderChange(item, 1)}
                      className="px-2 py-0.5 bg-[#14120F] text-[#F4EFE4]/70 hover:text-[#FFC93C] border border-[#F4EFE4]/20 hover:border-[#FFC93C] cursor-pointer"
                      title="Increase order index"
                    >
                      +
                    </button>
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 bg-[#14120F] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#F4EFE4]/20 transition-colors cursor-pointer"
                      title="Edit collaboration details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModalItem(item)}
                      className="p-1.5 bg-[#14120F] hover:bg-[#E4402A] text-[#F4EFE4] hover:text-white border border-[#F4EFE4]/20 transition-colors cursor-pointer"
                      title="Delete collaboration"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#14120F]/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#1A1713] border-2 border-[#FFC93C] max-w-xl w-full p-6 shadow-[8px_8px_0px_0px_#14120F] relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#F4EFE4]/60 hover:text-[#FFC93C] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#FFC93C] font-mono text-xs uppercase tracking-widest mb-1">
              <Building2 className="w-4 h-4" />
              <span>{editingItem ? 'EDIT COLLABORATION' : 'NEW COLLABORATION'}</span>
            </div>
            <h2 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#F4EFE4] mb-4">
              {editingItem ? `Edit: ${editingItem.name}` : 'Add Community Partner / Stage'}
            </h2>

            {errorMessage && (
              <div className="p-3 mb-4 bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              {/* Collaboration Name */}
              <div>
                <label className="block text-[#FFC93C] uppercase font-bold mb-1">
                  Partner / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bandra Street Sound"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#14120F] border border-[#F4EFE4]/20 p-2.5 text-[#F4EFE4] focus:outline-none focus:border-[#FFC93C]"
                />
              </div>

              {/* Short Code & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#FFC93C] uppercase font-bold mb-1">
                    Short Code (Fallback initials)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. BS"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#14120F] border border-[#F4EFE4]/20 p-2.5 text-[#F4EFE4] focus:outline-none focus:border-[#FFC93C]"
                  />
                  <span className="text-[10px] text-[#F4EFE4]/40 mt-0.5 block">
                    Displayed inside box if logo is absent
                  </span>
                </div>

                <div>
                  <label className="block text-[#FFC93C] uppercase font-bold mb-1">
                    Collaboration Type / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acoustic Partner"
                    value={collaborationType}
                    onChange={(e) => setCollaborationType(e.target.value)}
                    className="w-full bg-[#14120F] border border-[#F4EFE4]/20 p-2.5 text-[#F4EFE4] focus:outline-none focus:border-[#FFC93C]"
                  />
                </div>
              </div>

              {/* Quick Type Selection Pills */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {['Acoustic Partner', 'Workshop Venue', 'Stage Partner', 'Youth Circuit', 'Jam Supporter', 'Festival Stage'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCollaborationType(t)}
                    className="px-2 py-0.5 bg-[#14120F] hover:bg-[#FFC93C] text-[#F4EFE4]/70 hover:text-[#14120F] text-[10px] border border-[#F4EFE4]/15 cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#FFC93C] uppercase font-bold mb-1">
                  Description / Affiliation Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Acoustic Partner in Bandra West promenade sessions"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#14120F] border border-[#F4EFE4]/20 p-2.5 text-[#F4EFE4] focus:outline-none focus:border-[#FFC93C]"
                />
              </div>

              {/* Logo URL (Standard TEXT URL field) */}
              <div>
                <label className="block text-[#FFC93C] uppercase font-bold mb-1">
                  Logo URL (Text URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-[#14120F] border border-[#F4EFE4]/20 p-2.5 text-[#F4EFE4] focus:outline-none focus:border-[#FFC93C]"
                />
                <span className="text-[10px] text-[#F4EFE4]/50 mt-1 block">
                  Keep empty to use the 10x10 monochrome short code box visual fallback.
                </span>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-[#FFC93C] uppercase font-bold mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://bandrastreet.in"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-[#14120F] border border-[#F4EFE4]/20 p-2.5 text-[#F4EFE4] focus:outline-none focus:border-[#FFC93C]"
                />
              </div>

              {/* Display Order & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F4EFE4]/10">
                <div>
                  <label className="block text-[#FFC93C] uppercase font-bold mb-1">
                    Display Order (ASC)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#14120F] border border-[#F4EFE4]/20 p-2.5 text-[#F4EFE4] focus:outline-none focus:border-[#FFC93C]"
                  />
                  <span className="text-[10px] text-[#F4EFE4]/40 mt-0.5 block">
                    Lower number shows first
                  </span>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="block text-[#FFC93C] uppercase font-bold mb-2">
                    Public Visibility
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="w-4 h-4 accent-[#FFC93C]"
                    />
                    <span className="text-xs text-[#F4EFE4]">
                      {isVisible ? 'Visible on Public Website' : 'Hidden from Public Website'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-[#F4EFE4]/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#14120F] text-[#F4EFE4]/70 hover:text-[#F4EFE4] border border-[#F4EFE4]/20 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#14120F] cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{editingItem ? 'Save Changes' : 'Create Collaboration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#14120F]/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#1A1713] border-2 border-[#E4402A] max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#14120F] space-y-4 font-mono">
            <div className="flex items-center gap-2 text-[#E4402A] text-xs uppercase font-bold">
              <AlertTriangle className="w-5 h-5 text-[#E4402A]" />
              <span>Confirm Deletion</span>
            </div>

            <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#F4EFE4]">
              Delete &quot;{deleteModalItem.name}&quot;?
            </h3>

            <p className="text-xs text-[#F4EFE4]/70 font-sans leading-relaxed">
              This will permanently delete this collaboration record from Supabase table <code className="text-[#FFC93C]">public.collaborations</code>.
            </p>

            <div className="pt-3 border-t border-[#F4EFE4]/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 bg-[#14120F] text-[#F4EFE4]/70 hover:text-[#F4EFE4] border border-[#F4EFE4]/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-[#E4402A] hover:bg-red-700 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#14120F] cursor-pointer disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
