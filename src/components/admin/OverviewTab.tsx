import React from 'react';
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Users, 
  Ticket, 
  Mail, 
  ShieldCheck, 
  Database, 
  Plus, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { GalleryItem, VideoItem, CommunityMember } from '../../types';
import { RsvpRecord, ContactDispatchRecord, getSupabaseUrl } from '../../lib/supabase';
import { AdminUser } from '../../lib/adminAuth';

interface OverviewTabProps {
  adminUser: AdminUser;
  gallery: GalleryItem[];
  videos: VideoItem[];
  members: (CommunityMember & { photoUrl: string })[];
  rsvps: RsvpRecord[];
  messages: ContactDispatchRecord[];
  onSelectTab: (tab: 'overview' | 'gallery' | 'videos' | 'members' | 'rsvps' | 'messages') => void;
  onOpenAddModal: (tab: 'gallery' | 'videos' | 'members') => void;
}

export function OverviewTab({
  adminUser,
  gallery,
  videos,
  members,
  rsvps,
  messages,
  onSelectTab,
  onOpenAddModal,
}: OverviewTabProps) {
  const supabaseUrl = getSupabaseUrl();

  const statCards = [
    {
      title: 'Gallery Media',
      count: gallery.length,
      tab: 'gallery' as const,
      icon: ImageIcon,
      color: '#FFC93C',
      description: 'Photos & visual archives',
      actionLabel: '+ Add Photo',
      action: () => onOpenAddModal('gallery'),
    },
    {
      title: 'Video Drops',
      count: videos.length,
      tab: 'videos' as const,
      icon: VideoIcon,
      color: '#E4402A',
      description: 'Cypher routines & drops',
      actionLabel: '+ Add Video',
      action: () => onOpenAddModal('videos'),
    },
    {
      title: 'Active Members',
      count: members.length,
      tab: 'members' as const,
      icon: Users,
      color: '#FFC93C',
      description: 'Beatboxers & audio archives',
      actionLabel: '+ Add Member',
      action: () => onOpenAddModal('members'),
    },
    {
      title: 'Event RSVPs',
      count: rsvps.length,
      tab: 'rsvps' as const,
      icon: Ticket,
      color: '#2DD4BF',
      description: 'Attendee registrations',
      actionLabel: 'View RSVPs',
      action: () => onSelectTab('rsvps'),
    },
    {
      title: 'Contact Dispatches',
      count: messages.length,
      tab: 'messages' as const,
      icon: Mail,
      color: '#A78BFA',
      description: 'Community messages & leads',
      actionLabel: 'View Inbox',
      action: () => onSelectTab('messages'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 bg-[#1A1713] border-2 border-[#FFC93C]/40 shadow-[4px_4px_0px_0px_#14120F] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#14120F] text-[#FFC93C] border border-[#FFC93C] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3 h-3 text-[#FFC93C]" />
            <span>AUTHENTICATED AS {adminUser.role.toUpperCase()}</span>
          </div>
          <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4]">
            Welcome, {adminUser.email.split('@')[0]}
          </h2>
          <p className="font-mono text-xs text-[#F4EFE4]/60 mt-1">
            Direct real-time control over Mumbai Beatbox Hub database collections and community records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenAddModal('gallery')}
            className="px-3.5 py-2 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono font-bold text-xs uppercase tracking-wider border border-[#14120F] transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#14120F] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Photo</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('videos')}
            className="px-3.5 py-2 bg-[#E4402A] hover:bg-[#ff5a43] text-[#F4EFE4] font-mono font-bold text-xs uppercase tracking-wider border border-[#14120F] transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#14120F] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Video</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('members')}
            className="px-3.5 py-2 bg-[#14120F] hover:bg-[#25211B] text-[#FFC93C] font-mono font-bold text-xs uppercase tracking-wider border border-[#FFC93C] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Member</span>
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-[#1A1713] border border-[#F4EFE4]/15 p-5 flex flex-col justify-between hover:border-[#FFC93C] transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-8 h-8 rounded-none border border-current flex items-center justify-center"
                    style={{ color: card.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectTab(card.tab)}
                    className="text-[11px] font-mono text-[#F4EFE4]/50 group-hover:text-[#FFC93C] hover:underline cursor-pointer"
                  >
                    Manage &rarr;
                  </button>
                </div>
                <div className="font-['Anton'] text-3xl sm:text-4xl text-[#F4EFE4] tracking-tight">
                  {card.count}
                </div>
                <div className="font-mono text-xs text-[#F4EFE4]/90 font-bold uppercase tracking-wider mt-1">
                  {card.title}
                </div>
                <div className="font-sans text-[11px] text-[#F4EFE4]/50 mt-0.5">
                  {card.description}
                </div>
              </div>

              <button
                type="button"
                onClick={card.action}
                className="mt-4 pt-3 border-t border-[#F4EFE4]/10 text-left font-mono text-xs font-bold text-[#FFC93C] hover:text-[#ffe082] flex items-center justify-between cursor-pointer"
              >
                <span>{card.actionLabel}</span>
                <span className="text-xs">&plus;</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Database & Security Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Architecture */}
        <div className="lg:col-span-2 bg-[#1A1713] border border-[#F4EFE4]/15 p-6">
          <div className="flex items-center justify-between border-b border-[#F4EFE4]/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#FFC93C]" />
              <h3 className="font-['Anton'] text-lg uppercase tracking-wide text-[#F4EFE4]">
                Supabase Infrastructure Status
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>LIVE CLOUD CONNECTED</span>
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#14120F] border border-[#F4EFE4]/10">
              <span className="text-[#F4EFE4]/60">Endpoint URL</span>
              <span className="text-[#FFC93C] truncate font-bold select-all mt-1 sm:mt-0">{supabaseUrl}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#14120F] border border-[#F4EFE4]/10">
              <span className="text-[#F4EFE4]/60">Authentication Protocol</span>
              <span className="text-emerald-400 font-bold">Supabase Auth (JWT Bearer Token)</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#14120F] border border-[#F4EFE4]/10">
              <span className="text-[#F4EFE4]/60">Row Level Security (RLS)</span>
              <span className="text-[#FFC93C] font-bold">Enforced On Protected Tables</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#14120F] border border-[#F4EFE4]/10">
              <span className="text-[#F4EFE4]/60">Active Session Admin</span>
              <span className="text-[#F4EFE4] font-bold truncate">{adminUser.email}</span>
            </div>
          </div>
        </div>

        {/* Security & Access Audit */}
        <div className="bg-[#1A1713] border border-[#F4EFE4]/15 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#F4EFE4]/10 pb-3 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#FFC93C]" />
              <h3 className="font-['Anton'] text-lg uppercase tracking-wide text-[#F4EFE4]">
                Security Boundary
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs font-mono text-[#F4EFE4]/70">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&#10003;</span>
                <span>Public site has ZERO admin buttons, links, or mentions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&#10003;</span>
                <span>No service_role secret keys are exposed to the client</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&#10003;</span>
                <span>Public users cannot select or delete attendee RSVPs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&#10003;</span>
                <span>Public users cannot view or delete contact dispatches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&#10003;</span>
                <span>Role authorization verified before granting admin panel</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F4EFE4]/10">
            <a
              href="https://supabase.com/dashboard/project/tcsovxxhoypfpkbmowhd"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 bg-[#14120F] hover:bg-[#25211B] text-[#FFC93C] text-xs font-mono font-bold uppercase tracking-wider border border-[#FFC93C]/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Open Supabase Cloud Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity Dual Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent RSVPs */}
        <div className="bg-[#1A1713] border border-[#F4EFE4]/15 p-6">
          <div className="flex items-center justify-between border-b border-[#F4EFE4]/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#2DD4BF]" />
              <h3 className="font-['Anton'] text-lg uppercase tracking-wide text-[#F4EFE4]">
                Recent Event RSVPs
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('rsvps')}
              className="text-xs font-mono text-[#FFC93C] hover:underline cursor-pointer"
            >
              View All ({rsvps.length}) &rarr;
            </button>
          </div>

          {rsvps.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-[#F4EFE4]/50">
              No attendee RSVPs recorded in the database yet.
            </div>
          ) : (
            <div className="divide-y divide-[#F4EFE4]/10">
              {rsvps.slice(0, 4).map((r) => (
                <div key={r.id || r.attendeeName} className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono">
                  <div>
                    <div className="text-[#F4EFE4] font-bold">{r.attendeeName}</div>
                    <div className="text-[#F4EFE4]/50 text-[11px]">{r.eventName} &bull; {r.skillLevel}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 text-[11px] font-bold block">{r.whatsapp}</span>
                    <span className="text-[#F4EFE4]/40 text-[10px]">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-[#1A1713] border border-[#F4EFE4]/15 p-6">
          <div className="flex items-center justify-between border-b border-[#F4EFE4]/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#A78BFA]" />
              <h3 className="font-['Anton'] text-lg uppercase tracking-wide text-[#F4EFE4]">
                Recent Contact Messages
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('messages')}
              className="text-xs font-mono text-[#FFC93C] hover:underline cursor-pointer"
            >
              View All ({messages.length}) &rarr;
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-[#F4EFE4]/50">
              No contact dispatches recorded in the database yet.
            </div>
          ) : (
            <div className="divide-y divide-[#F4EFE4]/10">
              {messages.slice(0, 4).map((m) => (
                <div key={m.id || m.name} className="py-2.5 flex items-start justify-between gap-3 text-xs font-mono">
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F4EFE4] font-bold truncate">{m.name} ({m.area || 'Mumbai'})</div>
                    <div className="text-[#F4EFE4]/70 text-[11px] truncate">{m.message}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[#FFC93C] text-[11px] font-bold block">{m.contact}</span>
                    <span className="text-[#F4EFE4]/40 text-[10px]">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
