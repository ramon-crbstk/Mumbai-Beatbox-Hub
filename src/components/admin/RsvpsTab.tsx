import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Ticket, 
  Phone, 
  Calendar, 
  Download, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { RsvpRecord, deleteRsvp } from '../../lib/supabase';

interface RsvpsTabProps {
  items: RsvpRecord[];
  onRefresh: () => void;
}

export function RsvpsTab({ items, onRefresh }: RsvpsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');
  const [deleteModalItem, setDeleteModalItem] = useState<RsvpRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleDelete = async () => {
    if (!deleteModalItem?.id) return;
    setDeleting(true);

    const ok = await deleteRsvp(deleteModalItem.id);
    setDeleting(false);

    if (ok) {
      setDeleteModalItem(null);
      setSuccessToast('RSVP record deleted from Supabase.');
      setTimeout(() => setSuccessToast(null), 3500);
      onRefresh();
    } else {
      alert('Failed to delete RSVP record. Please check Supabase permissions.');
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (items.length === 0) return;
    const headers = ['ID', 'Event Name', 'Attendee Name', 'WhatsApp', 'Skill Level', 'Created At'];
    const rows = items.map((r) => [
      `"${r.id || ''}"`,
      `"${r.eventName.replace(/"/g, '""')}"`,
      `"${r.attendeeName.replace(/"/g, '""')}"`,
      `"${r.whatsapp.replace(/"/g, '""')}"`,
      `"${r.skillLevel.replace(/"/g, '""')}"`,
      `"${r.createdAt || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MBH_RSVP_Submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique events for filter dropdown
  const uniqueEvents = Array.from(new Set(items.map((r) => r.eventName))).filter(Boolean);

  const filteredItems = items.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      r.attendeeName.toLowerCase().includes(q) ||
      r.whatsapp.toLowerCase().includes(q) ||
      r.eventName.toLowerCase().includes(q) ||
      r.skillLevel.toLowerCase().includes(q);

    const matchesEvent = selectedEventFilter === 'all' || r.eventName === selectedEventFilter;

    return matchesSearch && matchesEvent;
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1A1713] p-4 border border-[#F4EFE4]/15">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#F4EFE4]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by attendee name, WhatsApp, event..."
              className="w-full pl-9 pr-4 py-2 bg-[#14120F] border border-[#F4EFE4]/20 text-xs font-mono text-[#F4EFE4] placeholder-[#F4EFE4]/40 focus:border-[#2DD4BF] focus:outline-none"
            />
          </div>

          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 text-xs font-mono text-[#F4EFE4] focus:border-[#2DD4BF] focus:outline-none"
          >
            <option value="all">All Events ({items.length})</option>
            {uniqueEvents.map((evt) => (
              <option key={evt} value={evt}>{evt}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-[#14120F] hover:bg-[#25211B] text-[#F4EFE4]/70 border border-[#F4EFE4]/20 cursor-pointer"
            title="Refresh RSVPs"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#2DD4BF]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={items.length === 0}
            className="px-3.5 py-2 bg-[#14120F] hover:bg-[#25211B] text-[#2DD4BF] font-mono font-bold text-xs uppercase tracking-wider border border-[#2DD4BF]/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-3 bg-[#1A1713] border border-[#2DD4BF]/30 text-xs font-mono text-[#2DD4BF] flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          <strong>Confidential Attendee Data:</strong> This list contains phone numbers. Protected by Supabase Row Level Security. Public visitors cannot read or query this data.
        </span>
      </div>

      {/* RSVPs Table */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#1A1713] border border-dashed border-[#F4EFE4]/20 p-8">
          <Ticket className="w-10 h-10 text-[#2DD4BF]/60 mx-auto mb-3" />
          <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4]">No RSVP Submissions Found</h3>
          <p className="font-mono text-xs text-[#F4EFE4]/60 mt-1 max-w-sm mx-auto">
            {items.length === 0
              ? 'No event attendees have registered through the website RSVP form yet.'
              : 'No RSVP entries match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#1A1713] border border-[#F4EFE4]/15 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#14120F] border-b border-[#F4EFE4]/15 text-[#2DD4BF] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Attendee Name</th>
                <th className="p-3.5">WhatsApp Number</th>
                <th className="p-3.5">Event Name</th>
                <th className="p-3.5">Skill Level</th>
                <th className="p-3.5">Registered At</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE4]/10 text-[#F4EFE4]">
              {filteredItems.map((rsvp) => {
                // Clean phone number for WhatsApp link
                const cleanPhone = rsvp.whatsapp.replace(/\D/g, '');
                const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

                return (
                  <tr key={rsvp.id || rsvp.attendeeName} className="hover:bg-[#14120F]/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#F4EFE4] text-sm">{rsvp.attendeeName}</div>
                      <div className="text-[10px] text-[#F4EFE4]/40">ID: {rsvp.id || 'record'}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-bold text-emerald-400">{rsvp.whatsapp}</span>
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 bg-[#14120F] hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-emerald-300 text-[10px] transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-[#F4EFE4]/90">
                      <div className="font-bold text-xs">{rsvp.eventName}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        rsvp.skillLevel.toLowerCase().includes('pro') || rsvp.skillLevel.toLowerCase().includes('advanced')
                          ? 'bg-[#E4402A]/20 text-[#E4402A] border-[#E4402A]/40'
                          : rsvp.skillLevel.toLowerCase().includes('intermediate')
                          ? 'bg-[#FFC93C]/20 text-[#FFC93C] border-[#FFC93C]/40'
                          : 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/40'
                      }`}>
                        {rsvp.skillLevel}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#F4EFE4]/60 whitespace-nowrap text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#F4EFE4]/40" />
                        <span>{rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleString() : 'Recent'}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setDeleteModalItem(rsvp)}
                        className="p-1.5 bg-[#14120F] hover:bg-[#E4402A] hover:text-white border border-[#F4EFE4]/20 transition-colors cursor-pointer"
                        title="Delete RSVP Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#1A1713] border-2 border-[#E4402A] shadow-[8px_8px_0px_0px_#14120F] p-6 font-mono">
            <div className="flex items-center gap-3 text-[#E4402A] mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4]">
                Delete RSVP Registration
              </h3>
            </div>

            <p className="text-xs text-[#F4EFE4]/80 leading-relaxed mb-4">
              Are you sure you want to delete the RSVP record for:
              <strong className="block text-[#2DD4BF] text-sm mt-1">
                {deleteModalItem.attendeeName} ({deleteModalItem.whatsapp})
              </strong>
              registered for <em>{deleteModalItem.eventName}</em>. This cannot be undone.
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
                  <span>Delete RSVP</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
