import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Users, 
  Ticket, 
  Mail, 
  LogOut, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Database,
  Menu,
  X,
  AlertCircle,
  Radio,
  Calendar,
  BookOpen,
  Clock
} from 'lucide-react';
import { AdminUser, signOutAdmin } from '../../lib/adminAuth';
import { 
  fetchGalleryItems, 
  fetchVideos as fetchVideoItems, 
  fetchCommunityMembers, 
  fetchRsvps, 
  fetchContactDispatches,
  fetchUpcomingEvents,
  getLocalEvents,
  setAdminAuthenticated,
  RsvpRecord,
  ContactDispatchRecord
} from '../../lib/supabase';
import { GalleryItem, VideoItem, CommunityMember, EventItem } from '../../types';

import { OverviewTab } from './OverviewTab';
import { EventsTab } from './EventsTab';
import { GalleryTab } from './GalleryTab';
import { VideosTab } from './VideosTab';
import { MembersTab } from './MembersTab';
import { RsvpsTab } from './RsvpsTab';
import { MessagesTab } from './MessagesTab';
import { SessionDiagnosisBanner } from './SessionDiagnosisBanner';

type AdminTab = 'overview' | 'events' | 'gallery' | 'videos' | 'members' | 'rsvps' | 'messages' | 'security';

interface AdminDashboardProps {
  adminUser: AdminUser;
  onLogout: () => void;
  onGoHome: () => void;
}

export function AdminDashboard({ adminUser, onLogout, onGoHome }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Live Date & Time timer updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync admin authentication state immediately
  useEffect(() => {
    if (adminUser) {
      setAdminAuthenticated(true);
    }
  }, [adminUser]);

  // Data collections initialized with cached events for instant zero-flicker render
  const [events, setEvents] = useState<EventItem[]>(getLocalEvents);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [members, setMembers] = useState<(CommunityMember & { photoUrl: string })[]>([]);
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [messages, setMessages] = useState<ContactDispatchRecord[]>([]);

  // Load all Supabase tables concurrently
  const loadAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError(null);

    try {
      const [galRes, vidRes, memRes, rsvpRes, msgRes, evtRes] = await Promise.all([
        fetchGalleryItems(),
        fetchVideoItems(),
        fetchCommunityMembers(),
        fetchRsvps(),
        fetchContactDispatches(),
        fetchUpcomingEvents(),
      ]);

      if (galRes) setGallery(galRes);
      if (vidRes) setVideos(vidRes);
      if (memRes) setMembers(memRes);
      if (rsvpRes) setRsvps(rsvpRes);
      if (msgRes) setMessages(msgRes);
      if (evtRes) setEvents(evtRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLoadError(msg || 'Failed to sync with Supabase tables.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleLogout = async () => {
    await signOutAdmin();
    onLogout();
  };

  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard, count: null },
    { id: 'events' as const, label: 'Events & Cyphers', icon: Calendar, count: events.length },
    { id: 'gallery' as const, label: 'Gallery', icon: ImageIcon, count: gallery.length },
    { id: 'videos' as const, label: 'Videos', icon: VideoIcon, count: videos.length },
    { id: 'members' as const, label: 'Members', icon: Users, count: members.length },
    { id: 'rsvps' as const, label: 'RSVPs', icon: Ticket, count: rsvps.length },
    { id: 'messages' as const, label: 'Dispatches', icon: Mail, count: messages.length },
    { id: 'security' as const, label: 'Security & safe', icon: ShieldCheck, count: null },
  ];

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-[#14120F] text-[#F4EFE4] flex flex-col font-sans selection:bg-[#FFC93C] selection:text-[#14120F]">
      
      {/* Top Header Bar */}
      <header className="h-16 bg-[#1A1713] border-b border-[#F4EFE4]/15 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-[#F4EFE4]/70 hover:text-[#FFC93C] cursor-pointer"
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo / Portal Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#FFC93C] text-[#14120F] flex items-center justify-center font-['Anton'] text-lg font-bold border border-[#14120F]">
              MBH
            </div>
            <div>
              <div className="font-['Anton'] text-lg uppercase tracking-tight leading-none text-[#F4EFE4]">
                MBH Admin Portal
              </div>
              <div className="font-mono text-[10px] text-[#FFC93C] uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase &bull; Cloudinary Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live Date & Time Display on top right corner beside Sync Tables */}
          <div 
            id="admin-header-datetime"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#14120F] border border-[#FFC93C]/40 text-xs font-mono shadow-[2px_2px_0px_0px_#14120F]"
            title="Real-time System Clock"
          >
            <Clock className="w-3.5 h-3.5 text-[#FFC93C] shrink-0" />
            <span className="hidden sm:inline text-[#F4EFE4]/80">{formattedDate}</span>
            <span className="hidden sm:inline text-[#FFC93C]/50">•</span>
            <span className="text-[#FFC93C] font-bold tracking-wider">{formattedTime}</span>
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={() => loadAllData(true)}
            disabled={refreshing || loading}
            className="p-2 bg-[#14120F] hover:bg-[#25211B] text-[#F4EFE4]/70 border border-[#F4EFE4]/20 flex items-center gap-2 text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh All Database Tables"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FFC93C]' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Sync Tables'}</span>
          </button>

          {/* User Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#14120F] border border-[#F4EFE4]/15 font-mono text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFC93C]" />
            <span className="text-[#F4EFE4]/80 truncate max-w-[150px]">{adminUser.email}</span>
            <span className="px-1.5 py-0.2 bg-[#FFC93C]/20 text-[#FFC93C] border border-[#FFC93C]/40 text-[9px] uppercase font-bold">
              {adminUser.role}
            </span>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 bg-[#E4402A]/15 hover:bg-[#E4402A] text-[#E4402A] hover:text-white border border-[#E4402A]/40 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign out of Admin Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-16 left-0 z-20 w-64 bg-[#1A1713] border-r border-[#F4EFE4]/15 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Navigation Items */}
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono text-[#F4EFE4]/40 uppercase tracking-widest">
              MANAGEMENT MODULES
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 flex items-center justify-between font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FFC93C] text-[#14120F] font-bold shadow-[2px_2px_0px_0px_#14120F]'
                      : 'text-[#F4EFE4]/80 hover:bg-[#14120F] hover:text-[#FFC93C]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-none font-bold ${
                        isActive ? 'bg-[#14120F] text-[#FFC93C]' : 'bg-[#14120F] text-[#F4EFE4]/60 border border-[#F4EFE4]/10'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#F4EFE4]/10 space-y-3 font-mono text-xs">
            <div className="p-2.5 bg-[#14120F] border border-[#F4EFE4]/10 text-[11px] text-[#F4EFE4]/60">
              <div className="flex items-center gap-1.5 text-[#FFC93C] font-bold mb-0.5">
                <Database className="w-3 h-3" />
                <span>Supabase RLS Active</span>
              </div>
              Public read-protection verified on RSVPs and contact dispatches.
            </div>

            <button
              type="button"
              onClick={onGoHome}
              className="w-full py-2 bg-transparent hover:bg-[#14120F] text-[#F4EFE4]/70 hover:text-[#FFC93C] border border-[#F4EFE4]/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Error Message if fetch failed */}
          {loadError && (
            <div className="mb-6 p-4 bg-[#E4402A]/15 border border-[#E4402A] text-[#F4EFE4] text-xs font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#E4402A] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-[#E4402A] uppercase block mb-1">Database Sync Notice</span>
                {loadError}
                <button
                  type="button"
                  onClick={() => loadAllData(true)}
                  className="mt-2 block text-[#FFC93C] underline cursor-pointer"
                >
                  Click to retry Supabase connection
                </button>
              </div>
            </div>
          )}

          {/* Tab Header */}
          <div className="mb-6 border-b border-[#F4EFE4]/15 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-mono text-[#FFC93C] uppercase tracking-widest">
                MBH ADMIN &bull; {activeTab.toUpperCase()}
              </div>
              <h1 className="font-['Anton'] text-3xl uppercase tracking-tight text-[#F4EFE4] mt-0.5">
                {activeTab === 'overview' && 'System Overview & Activity'}
                {activeTab === 'events' && 'Upcoming Events & Cyphers'}
                {activeTab === 'gallery' && 'Gallery Media Management'}
                {activeTab === 'videos' && 'Featured Video Drops'}
                {activeTab === 'members' && 'Beatboxer Community Roster'}
                {activeTab === 'rsvps' && 'Event Attendee RSVPs'}
                {activeTab === 'messages' && 'Contact Inquiries & Dispatches'}
                {activeTab === 'security' && 'Security & Safe Diagnostics'}
              </h1>
            </div>

            <div className="text-xs font-mono text-[#F4EFE4]/50">
              Route: <span className="text-[#FFC93C]">/mbh-admin</span>
            </div>
          </div>

          {/* Active Tab View */}
          {loading ? (
            <div className="py-24 text-center font-mono text-xs text-[#F4EFE4]/60 space-y-3">
              <RefreshCw className="w-8 h-8 text-[#FFC93C] animate-spin mx-auto" />
              <div>Fetching collections from Supabase cloud...</div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  adminUser={adminUser}
                  gallery={gallery}
                  videos={videos}
                  members={members}
                  rsvps={rsvps}
                  messages={messages}
                  onSelectTab={(tab) => setActiveTab(tab)}
                  onOpenAddModal={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'events' && (
                <EventsTab
                  items={events}
                  onRefresh={() => loadAllData(true)}
                />
              )}

              {activeTab === 'gallery' && (
                <GalleryTab 
                  items={gallery} 
                  onRefresh={() => loadAllData(true)} 
                />
              )}

              {activeTab === 'videos' && (
                <VideosTab 
                  items={videos} 
                  onRefresh={() => loadAllData(true)} 
                />
              )}

              {activeTab === 'members' && (
                <MembersTab 
                  items={members} 
                  onRefresh={() => loadAllData(true)} 
                />
              )}

              {activeTab === 'rsvps' && (
                <RsvpsTab 
                  items={rsvps} 
                  onRefresh={() => loadAllData(true)} 
                />
              )}

              {activeTab === 'messages' && (
                <MessagesTab 
                  items={messages} 
                  onRefresh={() => loadAllData(true)} 
                />
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="p-4 bg-[#1A1713] border border-[#FFC93C]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2 text-[#FFC93C]">
                      <ShieldCheck className="w-4 h-4 text-[#FFC93C]" />
                      <span className="font-bold uppercase tracking-wider">Security & Safe Control Center</span>
                    </div>
                    <span className="text-[#F4EFE4]/60">
                      Evaluated live via client session & Postgres RLS
                    </span>
                  </div>

                  <SessionDiagnosisBanner />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
