import React, { useState, useEffect } from 'react';
import {
  GalleryItem,
  VideoItem,
  CommunityMember,
} from '../types';
import {
  fetchGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  fetchVideos,
  saveVideoItem,
  deleteVideoItem,
  fetchCommunityMembers,
  saveCommunityMember,
  deleteCommunityMember,
  fetchRsvps,
  deleteRsvp,
  fetchContactDispatches,
  deleteContactDispatch,
  isSupabaseConfigured,
  checkAllSupabaseTables,
  seedAllToSupabase,
  getSupabaseProjectRef,
  getSupabaseUrl,
  TableStatus,
  RsvpRecord,
  ContactDispatchRecord,
} from '../lib/supabase';
import { SUPABASE_SCHEMA_SQL } from '../data/supabaseSql';
import {
  Image as ImageIcon,
  Video,
  Mic,
  Users,
  Plus,
  Trash2,
  Database,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Search,
  Upload,
  Play,
  MapPin,
  Tag,
  FileText,
  RefreshCw,
  X,
  Copy,
  Check,
  Code,
  Sparkles,
  Layers,
} from 'lucide-react';

interface AdminPortalProps {
  onBackToSite: () => void;
  onDataChanged?: () => void;
}

type AdminTab = 'gallery' | 'videos' | 'members' | 'inquiries' | 'database';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToSite, onDataChanged }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('gallery');

  // Data Collections
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [members, setMembers] = useState<(CommunityMember & { photoUrl: string })[]>([]);
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [dispatches, setDispatches] = useState<ContactDispatchRecord[]>([]);
  
  // Database Health Checks
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [checkingTables, setCheckingTables] = useState(false);
  const [seedingDb, setSeedingDb] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [seedReport, setSeedReport] = useState<string | null>(null);

  // Loading & State
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Adding
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for new items
  const [newGallery, setNewGallery] = useState<{
    title: string;
    caption: string;
    location: string;
    dateStr: string;
    aspect: 'square' | 'tall' | 'wide';
    photoUrl: string;
  }>({
    title: '',
    caption: '',
    location: 'Bandra Carter Road',
    dateStr: 'Session #' + Math.floor(Math.random() * 50 + 40),
    aspect: 'square',
    photoUrl: '',
  });

  const [newVideo, setNewVideo] = useState<{
    title: string;
    performer: string;
    venue: string;
    duration: string;
    category: string;
    viewsEstimate: string;
    videoUrl: string;
    thumbnailUrl: string;
  }>({
    title: '',
    performer: 'MHB Collective',
    venue: 'Bandra West, Mumbai',
    duration: '03:45',
    category: 'Street Cypher',
    viewsEstimate: 'Drop #' + Math.floor(Math.random() * 30 + 10),
    videoUrl: '',
    thumbnailUrl: '',
  });

  const [newMember, setNewMember] = useState<{
    name: string;
    handle: string;
    specialty: string;
    area: string;
    experience: string;
    voiceNoteTitle: string;
    voiceNoteDuration: string;
    soundType: CommunityMember['soundType'];
    photoUrl: string;
  }>({
    name: '',
    handle: '',
    specialty: 'Inward Bass & Vocal Sub Drops',
    area: 'Bandra West',
    experience: 'Active Cypher Member',
    voiceNoteTitle: '16-Bar Street Routine',
    voiceNoteDuration: '0:16',
    soundType: 'bass-growl',
    photoUrl: '',
  });

  // Load all sections data
  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [gal, vids, mems, rsvpList, dispList] = await Promise.all([
        fetchGalleryItems(),
        fetchVideos(),
        fetchCommunityMembers(),
        fetchRsvps(),
        fetchContactDispatches(),
      ]);
      setGalleryItems(gal);
      setVideos(vids);
      setMembers(mems);
      setRsvps(rsvpList);
      setDispatches(dispList);
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshTableHealth = async () => {
    setCheckingTables(true);
    try {
      const res = await checkAllSupabaseTables();
      setTableStatuses(res.tables);
    } catch {
      // ignore
    } finally {
      setCheckingTables(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    refreshTableHealth();
  }, []);

  const notifyAction = (msg: string) => {
    setActionNotice(msg);
    if (onDataChanged) onDataChanged();
    setTimeout(() => setActionNotice(null), 5000);
  };

  // --- CRUD: Gallery ---
  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.title.trim()) return;

    const res = await saveGalleryItem({
      title: newGallery.title,
      caption: newGallery.caption || 'Live street moment during weekend cypher',
      location: newGallery.location,
      dateStr: newGallery.dateStr,
      aspect: newGallery.aspect,
      photoUrl: newGallery.photoUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    });

    if (res.success) {
      setShowAddModal(false);
      setNewGallery({
        title: '',
        caption: '',
        location: 'Bandra Carter Road',
        dateStr: 'Session #' + Math.floor(Math.random() * 50 + 40),
        aspect: 'square',
        photoUrl: '',
      });
      await refreshAllData();
      await refreshTableHealth();
      notifyAction(res.source === 'supabase' ? 'Photo added directly to Supabase gallery table!' : 'Photo saved to showcase!');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    await deleteGalleryItem(id);
    setDeleteConfirmId(null);
    await refreshAllData();
    notifyAction('Gallery item deleted from database.');
  };

  // --- CRUD: Videos ---
  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title.trim()) return;

    const res = await saveVideoItem({
      title: newVideo.title,
      performer: newVideo.performer,
      venue: newVideo.venue,
      duration: newVideo.duration,
      category: newVideo.category,
      viewsEstimate: newVideo.viewsEstimate,
      videoUrl: newVideo.videoUrl,
      thumbnailUrl: newVideo.thumbnailUrl,
    });

    if (res.success) {
      setShowAddModal(false);
      setNewVideo({
        title: '',
        performer: 'MHB Collective',
        venue: 'Bandra West, Mumbai',
        duration: '03:45',
        category: 'Street Cypher',
        viewsEstimate: 'Drop #' + Math.floor(Math.random() * 30 + 10),
        videoUrl: '',
        thumbnailUrl: '',
      });
      await refreshAllData();
      await refreshTableHealth();
      notifyAction(res.source === 'supabase' ? 'Video routine drop added directly to Supabase videos table!' : 'Video added to showcase!');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    await deleteVideoItem(id);
    setDeleteConfirmId(null);
    await refreshAllData();
    notifyAction('Video routine deleted from database.');
  };

  // --- CRUD: Members ---
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    const res = await saveCommunityMember({
      name: newMember.name,
      handle: newMember.handle.startsWith('@') ? newMember.handle : `@${newMember.handle || newMember.name.toLowerCase().replace(/\s+/g, '_')}`,
      specialty: newMember.specialty,
      area: newMember.area,
      experience: newMember.experience,
      voiceNoteTitle: newMember.voiceNoteTitle,
      voiceNoteDuration: newMember.voiceNoteDuration,
      soundType: newMember.soundType,
      photoUrl: newMember.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      avatarInitials: newMember.name.slice(0, 2).toUpperCase(),
      accentBg: '#FFC93C',
    });

    if (res.success) {
      setShowAddModal(false);
      setNewMember({
        name: '',
        handle: '',
        specialty: 'Inward Bass & Vocal Sub Drops',
        area: 'Bandra West',
        experience: 'Active Cypher Member',
        voiceNoteTitle: '16-Bar Street Routine',
        voiceNoteDuration: '0:16',
        soundType: 'bass-growl',
        photoUrl: '',
      });
      await refreshAllData();
      await refreshTableHealth();
      notifyAction(res.source === 'supabase' ? 'Beatboxer added directly to Supabase members table!' : 'Beatboxer added to roster!');
    }
  };

  const handleDeleteMember = async (id: string) => {
    await deleteCommunityMember(id);
    setDeleteConfirmId(null);
    await refreshAllData();
    notifyAction('Community member deleted from database.');
  };

  // --- CRUD: RSVPs & Dispatches ---
  const handleDeleteRsvp = async (id: string) => {
    await deleteRsvp(id);
    await refreshAllData();
    notifyAction('RSVP record deleted.');
  };

  const handleDeleteDispatch = async (id: string) => {
    await deleteContactDispatch(id);
    await refreshAllData();
    notifyAction('Contact dispatch deleted.');
  };

  // --- Database Operations ---
  const handleSeedDatabase = async () => {
    setSeedingDb(true);
    setSeedReport(null);
    try {
      const res = await seedAllToSupabase();
      if (res.success) {
        setSeedReport(`Successfully seeded to Supabase: ${res.membersSeeded} members, ${res.gallerySeeded} gallery photos, and ${res.videosSeeded} videos.`);
        notifyAction('Supabase database populated with MHB community data!');
      } else {
        setSeedReport(`Seeding finished with notices: ${res.errors.join(' | ')}`);
        notifyAction('Seeding notice: ' + (res.errors[0] || 'Check table creation'));
      }
      await refreshAllData();
      await refreshTableHealth();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSeedReport(`Error seeding: ${msg}`);
    } finally {
      setSeedingDb(false);
    }
  };

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
      notifyAction('SQL schema copied to clipboard! Paste it into Supabase SQL editor.');
    }
  };

  // Local file upload preview helper
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'gallery' | 'video' | 'member') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (target === 'gallery') setNewGallery((p) => ({ ...p, photoUrl: result }));
        if (target === 'video') setNewVideo((p) => ({ ...p, thumbnailUrl: result }));
        if (target === 'member') setNewMember((p) => ({ ...p, photoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Search filtering
  const filteredGallery = galleryItems.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.performer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dbConfigured = isSupabaseConfigured();
  const projectRef = getSupabaseProjectRef();
  const sqlEditorUrl = projectRef 
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new` 
    : 'https://supabase.com/dashboard/project/_/sql';
  const allTablesReady = tableStatuses.length > 0 && tableStatuses.every((t) => t.exists);

  return (
    <div className="min-h-screen bg-[#14120F] text-[#F4EFE4] font-sans selection:bg-[#FFC93C] selection:text-[#14120F]">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#171410] border-b-2 border-[#FFC93C]/40 px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="px-3 py-1.5 bg-[#1E1B16] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#FFC93C]/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Public Site</span>
            </button>

            <div className="h-6 w-px bg-[#FFC93C]/30 mx-1 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Anton'] text-xl uppercase tracking-wider text-[#FFC93C]">
                  MHB STUDIO BACKEND
                </span>
                <span className="px-2 py-0.5 bg-[#E4402A] text-[#F4EFE4] text-[10px] font-mono font-bold uppercase tracking-widest">
                  ADMIN
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#F4EFE4]/60">
                Mumbai Beatbox Hub • Media & Supabase Data Center
              </span>
            </div>
          </div>

          {/* Database Connection Status Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1 text-xs font-mono flex items-center gap-2 border transition-all cursor-pointer ${
                allTablesReady
                  ? 'bg-[#1E2E1E] text-[#68D391] border-[#38A169]/60 hover:bg-[#253a25]'
                  : dbConfigured 
                    ? 'bg-[#2A2314] text-[#FFC93C] border-[#FFC93C]/50 hover:bg-[#382f1b]'
                    : 'bg-[#2A1A1A] text-[#FC8181] border-[#E53E3E]/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {allTablesReady
                  ? 'Supabase 5/5 Tables Synced'
                  : dbConfigured
                    ? 'Supabase Ready (Tables Check)'
                    : 'Supabase Offline'}
              </span>
            </button>

            <button
              onClick={() => {
                refreshAllData();
                refreshTableHealth();
              }}
              title="Refresh all records and tables"
              className="p-2 bg-[#1E1B16] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#FFC93C]/30 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading || checkingTables ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        
        {/* Action notification toast */}
        {actionNotice && (
          <div className="p-3 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between border-2 border-[#14120F] shadow-[4px_4px_0px_0px_#F4EFE4] animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14120F]" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="p-1 hover:bg-[#14120F] hover:text-[#FFC93C] cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Section Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#FFC93C]/30 pb-4">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Gallery Tab */}
            <button
              id="admin-tab-gallery"
              onClick={() => { setActiveTab('gallery'); setSearchQuery(''); }}
              className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#FFC93C] text-[#14120F] border-[#FFC93C] shadow-[3px_3px_0px_0px_#F4EFE4]'
                  : 'bg-[#1A1713] text-[#F4EFE4]/70 border-[#FFC93C]/20 hover:border-[#FFC93C]/60 hover:text-[#F4EFE4]'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Gallery Media</span>
              <span className="px-1.5 py-0.2 bg-[#14120F]/20 rounded text-[10px]">
                {galleryItems.length}
              </span>
            </button>

            {/* Videos Tab */}
            <button
              id="admin-tab-videos"
              onClick={() => { setActiveTab('videos'); setSearchQuery(''); }}
              className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 transition-all cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-[#FFC93C] text-[#14120F] border-[#FFC93C] shadow-[3px_3px_0px_0px_#F4EFE4]'
                  : 'bg-[#1A1713] text-[#F4EFE4]/70 border-[#FFC93C]/20 hover:border-[#FFC93C]/60 hover:text-[#F4EFE4]'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Featured Videos</span>
              <span className="px-1.5 py-0.2 bg-[#14120F]/20 rounded text-[10px]">
                {videos.length}
              </span>
            </button>

            {/* Members Tab */}
            <button
              id="admin-tab-members"
              onClick={() => { setActiveTab('members'); setSearchQuery(''); }}
              className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 transition-all cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-[#FFC93C] text-[#14120F] border-[#FFC93C] shadow-[3px_3px_0px_0px_#F4EFE4]'
                  : 'bg-[#1A1713] text-[#F4EFE4]/70 border-[#FFC93C]/20 hover:border-[#FFC93C]/60 hover:text-[#F4EFE4]'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Community Members</span>
              <span className="px-1.5 py-0.2 bg-[#14120F]/20 rounded text-[10px]">
                {members.length}
              </span>
            </button>

            {/* RSVPs & Dispatches Tab */}
            <button
              id="admin-tab-inquiries"
              onClick={() => { setActiveTab('inquiries'); setSearchQuery(''); }}
              className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 transition-all cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-[#FFC93C] text-[#14120F] border-[#FFC93C] shadow-[3px_3px_0px_0px_#F4EFE4]'
                  : 'bg-[#1A1713] text-[#F4EFE4]/70 border-[#FFC93C]/20 hover:border-[#FFC93C]/60 hover:text-[#F4EFE4]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>RSVPs & Messages</span>
              <span className="px-1.5 py-0.2 bg-[#14120F]/20 rounded text-[10px]">
                {rsvps.length + dispatches.length}
              </span>
            </button>

            {/* Supabase Database & Tables Tab */}
            <button
              id="admin-tab-database"
              onClick={() => { setActiveTab('database'); setSearchQuery(''); }}
              className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 transition-all cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-[#FFC93C] text-[#14120F] border-[#FFC93C] shadow-[3px_3px_0px_0px_#F4EFE4]'
                  : 'bg-[#1A1713] text-[#F4EFE4]/70 border-[#FFC93C]/20 hover:border-[#FFC93C]/60 hover:text-[#F4EFE4]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Supabase DB & Tables</span>
              <span className={`w-2 h-2 rounded-full ${allTablesReady ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
            </button>

          </div>

          {/* Action: Add Media to Current Section */}
          {activeTab !== 'inquiries' && activeTab !== 'database' && (
            <button
              id="admin-add-media-button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-[#E4402A] hover:bg-[#c9321e] text-[#F4EFE4] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#FFC93C] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === 'gallery' && 'Add Cypher Photo'}
                {activeTab === 'videos' && 'Add Video Routine'}
                {activeTab === 'members' && 'Add Beatboxer Member'}
              </span>
            </button>
          )}

        </div>

        {/* Search Bar and Section Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1A1713] border border-[#FFC93C]/20 p-4">
          <div>
            <h2 className="font-['Anton'] text-2xl uppercase tracking-wide text-[#F4EFE4]">
              {activeTab === 'gallery' && 'Manage Cypher Gallery Media'}
              {activeTab === 'videos' && 'Manage Featured Videos & Routine Drops'}
              {activeTab === 'members' && 'Manage Community Members & Voice Notes'}
              {activeTab === 'inquiries' && 'Incoming RSVPs & WhatsApp Community Dispatches'}
              {activeTab === 'database' && 'Supabase Database Schema & Direct Table Control'}
            </h2>
            <p className="text-xs font-mono text-[#F4EFE4]/60 mt-0.5">
              {activeTab === 'gallery' && 'Photos displayed in the Cypher Visual Gallery. Adds and deletes sync directly with Supabase.'}
              {activeTab === 'videos' && 'Video items featured on the public routines feed. Direct YouTube URLs and routine footage.'}
              {activeTab === 'members' && 'Beatboxer roster with voice note sound profiles. Add new artists or modify routines.'}
              {activeTab === 'inquiries' && 'Live attendees registered via the modal and direct community connection requests.'}
              {activeTab === 'database' && 'Verify tables, copy SQL schema directly, and seed the complete MHB community dataset.'}
            </p>
          </div>

          {activeTab !== 'inquiries' && activeTab !== 'database' && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#F4EFE4]/40" />
              <input
                type="text"
                placeholder={`Search in ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#14120F] border border-[#FFC93C]/30 text-xs font-mono text-[#F4EFE4] placeholder-[#F4EFE4]/40 focus:outline-none focus:border-[#FFC93C]"
              />
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: GALLERY MANAGEMENT                                     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#181512] border-2 border-[#FFC93C]/20 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="aspect-video bg-[#14120F] border border-[#FFC93C]/30 overflow-hidden relative">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs font-mono text-[#FFC93C]">
                        No Image URL
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#14120F]/90 text-[#FFC93C] text-[10px] font-mono">
                      {item.dateStr}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-['Anton'] text-lg uppercase tracking-wide text-[#F4EFE4]">
                      {item.title}
                    </h3>
                    <p className="text-xs font-mono text-[#FFC93C] flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </p>
                    <p className="text-xs font-sans text-[#F4EFE4]/70 mt-1 line-clamp-2">
                      {item.caption}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#FFC93C]/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#F4EFE4]/50">
                      ID: {item.id}
                    </span>
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="px-2.5 py-1 bg-[#2A1A1A] hover:bg-[#E4402A] text-[#F4EFE4] text-xs font-mono font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: VIDEOS MANAGEMENT                                      */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((vid) => (
                <div
                  key={vid.id}
                  className="bg-[#181512] border-2 border-[#FFC93C]/20 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="aspect-video bg-[#14120F] border border-[#FFC93C]/30 relative flex items-center justify-center overflow-hidden">
                    {vid.thumbnailUrl ? (
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-[#FFC93C]">
                        <Play className="w-8 h-8" />
                        <span className="text-[11px] font-mono">{vid.category}</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-[#14120F] text-[#FFC93C] text-[10px] font-mono">
                      {vid.duration}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase bg-[#E4402A] text-[#F4EFE4] px-1.5 py-0.5">
                      {vid.category}
                    </span>
                    <h3 className="font-['Anton'] text-lg uppercase tracking-wide text-[#F4EFE4] mt-2">
                      {vid.title}
                    </h3>
                    <p className="text-xs font-mono text-[#FFC93C] mt-0.5">
                      Performer: {vid.performer}
                    </p>
                    <p className="text-xs font-mono text-[#F4EFE4]/60">
                      Venue: {vid.venue}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#FFC93C]/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#F4EFE4]/50">
                      ID: {vid.id}
                    </span>
                    <button
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="px-2.5 py-1 bg-[#2A1A1A] hover:bg-[#E4402A] text-[#F4EFE4] text-xs font-mono font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: MEMBERS MANAGEMENT                                     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#181512] border-2 border-[#FFC93C]/20 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#FFC93C] text-[#14120F] font-['Anton'] text-xl flex items-center justify-center flex-shrink-0 border border-[#14120F]">
                      {m.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-['Anton'] text-base uppercase text-[#F4EFE4] truncate">
                        {m.name}
                      </h3>
                      <p className="text-xs font-mono text-[#FFC93C]">{m.handle}</p>
                      <p className="text-xs font-mono text-[#F4EFE4]/70 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {m.area}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#14120F] p-2.5 border border-[#FFC93C]/10 text-xs font-mono space-y-1">
                    <div><strong className="text-[#FFC93C]">Specialty:</strong> {m.specialty}</div>
                    <div><strong className="text-[#FFC93C]">Voice Note:</strong> {m.voiceNoteTitle} ({m.voiceNoteDuration})</div>
                    <div><strong className="text-[#FFC93C]">Exp:</strong> {m.experience}</div>
                  </div>

                  <div className="pt-2 border-t border-[#FFC93C]/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#F4EFE4]/50">
                      ID: {m.id}
                    </span>
                    <button
                      onClick={() => handleDeleteMember(m.id)}
                      className="px-2.5 py-1 bg-[#2A1A1A] hover:bg-[#E4402A] text-[#F4EFE4] text-xs font-mono font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: RSVPS & CONTACT DISPATCHES                             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'inquiries' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* RSVPs */}
            <div className="bg-[#1A1713] border-2 border-[#FFC93C]/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#FFC93C]/20 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FFC93C]" />
                  <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4]">
                    Cypher RSVPs ({rsvps.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#FFC93C]">Live from Supabase `rsvps`</span>
              </div>

              {rsvps.length === 0 ? (
                <p className="text-xs font-mono text-[#F4EFE4]/50 py-6 text-center">
                  No RSVP registrations recorded yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {rsvps.map((r, i) => (
                    <div key={r.id || i} className="p-3 bg-[#14120F] border border-[#FFC93C]/20 flex items-start justify-between">
                      <div>
                        <div className="font-mono text-sm font-bold text-[#F4EFE4]">{r.attendeeName}</div>
                        <div className="text-xs font-mono text-[#FFC93C]">WA: {r.whatsapp}</div>
                        <div className="text-[11px] font-mono text-[#F4EFE4]/70 mt-1">
                          Event: {r.eventName} • Skill: {r.skillLevel}
                        </div>
                      </div>
                      <button
                        onClick={() => r.id && handleDeleteRsvp(r.id)}
                        className="p-1 text-[#E4402A] hover:text-red-400 cursor-pointer"
                        title="Delete RSVP"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Dispatches */}
            <div className="bg-[#1A1713] border-2 border-[#FFC93C]/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#FFC93C]/20 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FFC93C]" />
                  <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4]">
                    Community Dispatches ({dispatches.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#FFC93C]">Live from Supabase `contact_dispatches`</span>
              </div>

              {dispatches.length === 0 ? (
                <p className="text-xs font-mono text-[#F4EFE4]/50 py-6 text-center">
                  No direct community messages recorded yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {dispatches.map((d, i) => (
                    <div key={d.id || i} className="p-3 bg-[#14120F] border border-[#FFC93C]/20 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-mono text-sm font-bold text-[#F4EFE4]">{d.name}</div>
                          <div className="text-xs font-mono text-[#FFC93C]">Contact: {d.contact}</div>
                        </div>
                        <button
                          onClick={() => d.id && handleDeleteDispatch(d.id)}
                          className="p-1 text-[#E4402A] hover:text-red-400 cursor-pointer"
                          title="Delete dispatch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs font-mono text-[#F4EFE4]/60">
                        Area: {d.area} • Exp: {d.experience}
                      </div>
                      <p className="text-xs font-sans bg-[#1E1B16] p-2 border border-[#FFC93C]/10 text-[#F4EFE4]/80">
                        "{d.message}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: SUPABASE DATABASE & TABLES                             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            
            {/* Top Supabase Status Card */}
            <div className="bg-[#1A1713] border-2 border-[#FFC93C] p-6 shadow-[4px_4px_0px_0px_#14120F]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#FFC93C]/20">
                <div>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#FFC93C]" />
                    <h3 className="font-['Anton'] text-2xl uppercase tracking-wide text-[#F4EFE4]">
                      Supabase Project Connection
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-[#F4EFE4]/70 mt-1">
                    Project URL: <span className="text-[#FFC93C]">{getSupabaseUrl() || 'Not Configured'}</span>
                  </p>
                  <p className="text-xs font-mono text-[#F4EFE4]/70">
                    Project Ref: <span className="text-[#FFC93C]">{projectRef || 'None'}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={sqlEditorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#FFC93C] hover:bg-[#ffcf56] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-[#14120F] shadow-[2px_2px_0px_0px_#F4EFE4] transition-all cursor-pointer"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={refreshTableHealth}
                    className="px-3 py-2 bg-[#1E1B16] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] font-mono text-xs uppercase flex items-center gap-1.5 border border-[#FFC93C]/40 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingTables ? 'animate-spin' : ''}`} />
                    <span>Re-Check Tables</span>
                  </button>
                </div>
              </div>

              {/* Seed report notice */}
              {seedReport && (
                <div className="mt-4 p-3 bg-[#1E2E1E] text-[#68D391] border border-[#38A169]/50 font-mono text-xs">
                  {seedReport}
                </div>
              )}

              {/* Action Buttons: Seed and Copy SQL */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleSeedDatabase}
                  disabled={seedingDb}
                  className="px-5 py-2.5 bg-[#E4402A] hover:bg-[#c9321e] text-[#F4EFE4] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#FFC93C] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{seedingDb ? 'Seeding to Supabase...' : 'Seed Default MHB Data to Supabase'}</span>
                </button>

                <button
                  onClick={handleCopySql}
                  className="px-4 py-2.5 bg-[#1E1B16] hover:bg-[#2A241B] text-[#FFC93C] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-[#FFC93C]/40 transition-all cursor-pointer"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Schema to Clipboard'}</span>
                </button>
              </div>
            </div>

            {/* Table Status Cards Grid */}
            <div className="space-y-3">
              <h4 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FFC93C]" />
                <span>Supabase Tables Health (5 Required Tables)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'members', desc: 'Beatboxers, handles, vocal specialties, audio notes' },
                  { name: 'gallery', desc: 'Cypher photo archive with timestamps and locations' },
                  { name: 'videos', desc: 'Featured YouTube routine drops & battle footage' },
                  { name: 'rsvps', desc: 'Cypher attendance registrations & WhatsApp logs' },
                  { name: 'contact_dispatches', desc: 'Direct street contact inquiries & collaboration notes' },
                ].map((tInfo) => {
                  const status = tableStatuses.find((s) => s.table === tInfo.name);
                  const isReady = status?.exists;

                  return (
                    <div
                      key={tInfo.name}
                      className={`p-4 border-2 flex flex-col justify-between ${
                        isReady
                          ? 'bg-[#181E17] border-[#38A169]/50 text-[#F4EFE4]'
                          : 'bg-[#1F1B15] border-[#FFC93C]/40 text-[#F4EFE4]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-bold text-[#FFC93C]">
                            public.{tInfo.name}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                            isReady
                              ? 'bg-[#38A169] text-[#14120F]'
                              : 'bg-[#FFC93C] text-[#14120F]'
                          }`}>
                            {isReady ? 'Active & Ready' : 'Pending SQL'}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#F4EFE4]/70">
                          {tInfo.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F4EFE4]/10 text-[11px] font-mono">
                        {isReady ? (
                          <span className="text-[#68D391] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Synced directly to Supabase</span>
                          </span>
                        ) : (
                          <span className="text-[#FFC93C] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Run SQL in dashboard to create</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick 2-Step SQL Instructions & Preview */}
            <div className="bg-[#1A1713] border-2 border-[#FFC93C]/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#FFC93C]" />
                  <h4 className="font-['Anton'] text-lg uppercase tracking-wide text-[#F4EFE4]">
                    Supabase SQL Schema Script
                  </h4>
                </div>
                <button
                  onClick={handleCopySql}
                  className="text-xs font-mono text-[#FFC93C] hover:underline uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <p className="text-xs font-mono text-[#F4EFE4]/70">
                To create all 5 tables in 10 seconds: click <strong>Open Supabase SQL Editor</strong>, paste this schema, and click <strong>RUN</strong>. Once created, return here and click <strong>Seed Default MHB Data</strong>.
              </p>

              <pre className="p-4 bg-[#14120F] border border-[#FFC93C]/30 text-[11px] font-mono text-[#FFC93C]/90 max-h-64 overflow-y-auto overflow-x-auto whitespace-pre">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>

          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* ADD MEDIA MODAL                                               */}
      {/* ------------------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#1A1713] text-[#F4EFE4] border-4 border-[#FFC93C] p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#14120F] relative my-8">
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-[#14120F] text-[#F4EFE4] hover:bg-[#E4402A] transition-colors border border-[#FFC93C]/40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="mb-5">
              <div className="text-xs font-mono text-[#FFC93C] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>DYNAMIC SUPABASE DISPATCH</span>
              </div>
              <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4]">
                {activeTab === 'gallery' && 'Add New Cypher Photo'}
                {activeTab === 'videos' && 'Add New Video Routine'}
                {activeTab === 'members' && 'Add Beatboxer to Roster'}
              </h3>
            </div>

            {/* FORM: GALLERY */}
            {activeTab === 'gallery' && (
              <form onSubmit={handleCreateGallery} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bandra Promenade Sunset Circle"
                    value={newGallery.title}
                    onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                    className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2.5 text-xs font-mono text-[#F4EFE4] focus:outline-none focus:border-[#FFC93C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                    Caption / Story
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the battle or exchange..."
                    value={newGallery.caption}
                    onChange={(e) => setNewGallery({ ...newGallery, caption: e.target.value })}
                    className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2.5 text-xs font-mono text-[#F4EFE4] focus:outline-none focus:border-[#FFC93C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newGallery.location}
                      onChange={(e) => setNewGallery({ ...newGallery, location: e.target.value })}
                      className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2 text-xs font-mono text-[#F4EFE4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                      Session Date / Tag
                    </label>
                    <input
                      type="text"
                      value={newGallery.dateStr}
                      onChange={(e) => setNewGallery({ ...newGallery, dateStr: e.target.value })}
                      className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2 text-xs font-mono text-[#F4EFE4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                    Image URL or Local Upload
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newGallery.photoUrl}
                    onChange={(e) => setNewGallery({ ...newGallery, photoUrl: e.target.value })}
                    className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2.5 text-xs font-mono text-[#F4EFE4] mb-2"
                  />
                  <label className="flex items-center justify-center gap-2 py-2 bg-[#1E1B16] hover:bg-[#2A241B] text-[#FFC93C] font-mono text-xs border border-[#FFC93C]/30 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, 'gallery')}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFC93C] hover:bg-[#ffcf56] text-[#14120F] font-mono text-xs font-bold uppercase tracking-widest border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#F4EFE4] transition-all cursor-pointer mt-2"
                >
                  Save Photo to Supabase
                </button>
              </form>
            )}

            {/* FORM: VIDEOS */}
            {activeTab === 'videos' && (
              <form onSubmit={handleCreateVideo} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                    Video Routine Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7-to-Smoke Final Battle"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2.5 text-xs font-mono text-[#F4EFE4]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                      Performer(s)
                    </label>
                    <input
                      type="text"
                      value={newVideo.performer}
                      onChange={(e) => setNewVideo({ ...newVideo, performer: e.target.value })}
                      className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2 text-xs font-mono text-[#F4EFE4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                      Venue
                    </label>
                    <input
                      type="text"
                      value={newVideo.venue}
                      onChange={(e) => setNewVideo({ ...newVideo, venue: e.target.value })}
                      className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2 text-xs font-mono text-[#F4EFE4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newVideo.duration}
                      onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                      className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2 text-xs font-mono text-[#F4EFE4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                      Category
                    </label>
                    <select
                      value={newVideo.category}
                      onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                      className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2 text-xs font-mono text-[#F4EFE4]"
                    >
                      <option value="Street Cypher">Street Cypher</option>
                      <option value="Battle Stage">Battle Stage</option>
                      <option value="Acoustic Jam">Acoustic Jam</option>
                      <option value="Tutorial / Breakdown">Tutorial / Breakdown</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                    YouTube URL (Embed or Watch URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newVideo.videoUrl}
                    onChange={(e) => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                    className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2.5 text-xs font-mono text-[#F4EFE4] mb-2"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFC93C] hover:bg-[#ffcf56] text-[#14120F] font-mono text-xs font-bold uppercase tracking-widest border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#F4EFE4] transition-all cursor-pointer mt-2"
                >
                  Save Video to Supabase
                </button>
              </form>
            )}

            {/* FORM: MEMBERS */}
            {activeTab === 'members' && (
              <form onSubmit={handleCreateMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                    Full Name & Stage Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder='e.g. Vikram "SpitFire" Desai'
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2.5 text-xs font-mono text-[#F4EFE4]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                      Handle
                    </label>
                    <input
                      type="text"
                      placeholder="@spitfire_bx"
                      value={newMember.handle}
                      onChange={(e) => setNewMember({ ...newMember, handle: e.target.value })}
                      className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2 text-xs font-mono text-[#F4EFE4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                      Mumbai Suburb / Area
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dadar"
                      value={newMember.area}
                      onChange={(e) => setNewMember({ ...newMember, area: e.target.value })}
                      className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2 text-xs font-mono text-[#F4EFE4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                    Vocal Specialty / Sound Style
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inward Bass, Vocal Scratch, Click Rolls"
                    value={newMember.specialty}
                    onChange={(e) => setNewMember({ ...newMember, specialty: e.target.value })}
                    className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2.5 text-xs font-mono text-[#F4EFE4]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                      Audio Sound Category
                    </label>
                    <select
                      value={newMember.soundType}
                      onChange={(e) => setNewMember({ ...newMember, soundType: e.target.value as CommunityMember['soundType'] })}
                      className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2 text-xs font-mono text-[#F4EFE4]"
                    >
                      <option value="bass-growl">Bass Growl & Sub Drops</option>
                      <option value="liproll">Liproll & Click Rolls</option>
                      <option value="scratch-beat">Scratch Beat & Polyphony</option>
                      <option value="fast-tech">Fast Tech & Double-Tonguing</option>
                      <option value="sub-bass">Sub-Bass & Trap 808s</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                      Voice Note Title
                    </label>
                    <input
                      type="text"
                      value={newMember.voiceNoteTitle}
                      onChange={(e) => setNewMember({ ...newMember, voiceNoteTitle: e.target.value })}
                      className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2 text-xs font-mono text-[#F4EFE4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#FFC93C] mb-1">
                    Photo URL or Upload
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newMember.photoUrl}
                    onChange={(e) => setNewMember({ ...newMember, photoUrl: e.target.value })}
                    className="w-full bg-[#14120F] border border-[#FFC93C]/40 p-2.5 text-xs font-mono text-[#F4EFE4] mb-2"
                  />
                  <label className="flex items-center justify-center gap-2 py-2 bg-[#1E1B16] hover:bg-[#2A241B] text-[#FFC93C] font-mono text-xs border border-[#FFC93C]/30 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Beatboxer Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, 'member')}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFC93C] hover:bg-[#ffcf56] text-[#14120F] font-mono text-xs font-bold uppercase tracking-widest border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#F4EFE4] transition-all cursor-pointer mt-2"
                >
                  Save Member to Supabase
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
