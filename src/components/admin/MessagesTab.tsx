import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Calendar, 
  Download, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  MessageSquare,
  X
} from 'lucide-react';
import { ContactDispatchRecord, deleteContactDispatch } from '../../lib/supabase';

interface MessagesTabProps {
  items: ContactDispatchRecord[];
  onRefresh: () => void;
}

export function MessagesTab({ items, onRefresh }: MessagesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMessage, setActiveMessage] = useState<ContactDispatchRecord | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<ContactDispatchRecord | null>(null);
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

    const ok = await deleteContactDispatch(deleteModalItem.id);
    setDeleting(false);

    if (ok) {
      if (activeMessage?.id === deleteModalItem.id) {
        setActiveMessage(null);
      }
      setDeleteModalItem(null);
      setSuccessToast('Message dispatch removed from Supabase.');
      setTimeout(() => setSuccessToast(null), 3500);
      onRefresh();
    } else {
      alert('Failed to delete message. Please check Supabase permissions.');
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (items.length === 0) return;
    const headers = ['ID', 'Name', 'Contact', 'Area', 'Experience', 'Message', 'Created At'];
    const rows = items.map((m) => [
      `"${m.id || ''}"`,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.contact.replace(/"/g, '""')}"`,
      `"${(m.area || '').replace(/"/g, '""')}"`,
      `"${(m.experience || '').replace(/"/g, '""')}"`,
      `"${m.message.replace(/"/g, '""')}"`,
      `"${m.createdAt || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MBH_Contact_Dispatches_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = items.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.contact.toLowerCase().includes(q) ||
      (m.area && m.area.toLowerCase().includes(q)) ||
      m.message.toLowerCase().includes(q) ||
      (m.experience && m.experience.toLowerCase().includes(q))
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
            placeholder="Search messages by name, contact, area, text..."
            className="w-full pl-9 pr-4 py-2 bg-[#14120F] border border-[#F4EFE4]/20 text-xs font-mono text-[#F4EFE4] placeholder-[#F4EFE4]/40 focus:border-[#A78BFA] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-[#14120F] hover:bg-[#25211B] text-[#F4EFE4]/70 border border-[#F4EFE4]/20 cursor-pointer"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#A78BFA]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={items.length === 0}
            className="px-3.5 py-2 bg-[#14120F] hover:bg-[#25211B] text-[#A78BFA] font-mono font-bold text-xs uppercase tracking-wider border border-[#A78BFA]/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-3 bg-[#1A1713] border border-[#A78BFA]/30 text-xs font-mono text-[#A78BFA] flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          <strong>Private Inquiries & Direct Dispatches:</strong> Protected by Supabase Row Level Security. Public visitors cannot query other users' contact forms.
        </span>
      </div>

      {/* Messages Table */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#1A1713] border border-dashed border-[#F4EFE4]/20 p-8">
          <Mail className="w-10 h-10 text-[#A78BFA]/60 mx-auto mb-3" />
          <h3 className="font-['Anton'] text-xl uppercase tracking-wide text-[#F4EFE4]">No Contact Dispatches Found</h3>
          <p className="font-mono text-xs text-[#F4EFE4]/60 mt-1 max-w-sm mx-auto">
            {items.length === 0
              ? 'No inquiries or messages have been submitted through the website contact form yet.'
              : 'No messages match your search filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#1A1713] border border-[#F4EFE4]/15 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#14120F] border-b border-[#F4EFE4]/15 text-[#A78BFA] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Sender</th>
                <th className="p-3.5">Contact Method</th>
                <th className="p-3.5">Area & Experience</th>
                <th className="p-3.5">Message Excerpt</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE4]/10 text-[#F4EFE4]">
              {filteredItems.map((msg) => {
                const cleanPhone = msg.contact.replace(/\D/g, '');
                const waUrl = cleanPhone.length >= 10 ? `https://wa.me/${cleanPhone}` : null;
                const isEmail = msg.contact.includes('@');

                return (
                  <tr 
                    key={msg.id || msg.name} 
                    className="hover:bg-[#14120F]/60 transition-colors cursor-pointer"
                    onClick={() => setActiveMessage(msg)}
                  >
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-[#F4EFE4] text-sm">{msg.name}</div>
                      <div className="text-[10px] text-[#F4EFE4]/40">ID: {msg.id || 'msg'}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#FFC93C]">{msg.contact}</span>
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
                        {isEmail && (
                          <a
                            href={`mailto:${msg.contact}`}
                            className="p-1 bg-[#14120F] hover:bg-[#A78BFA] hover:text-[#14120F] border border-[#A78BFA]/30 text-[#A78BFA] text-[10px] transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-[#F4EFE4]/80">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#FFC93C]" />
                        <span>{msg.area || 'Mumbai General'}</span>
                      </div>
                      <div className="text-[11px] text-[#F4EFE4]/50 mt-0.5">
                        {msg.experience || 'Not specified'}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="line-clamp-2 text-xs text-[#F4EFE4]/90 font-sans">
                        {msg.message}
                      </p>
                    </td>
                    <td className="p-3.5 text-[#F4EFE4]/60 whitespace-nowrap text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#F4EFE4]/40" />
                        <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveMessage(msg)}
                          className="p-1.5 bg-[#14120F] hover:bg-[#A78BFA] hover:text-[#14120F] border border-[#F4EFE4]/20 transition-colors cursor-pointer"
                          title="Read Full Message"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModalItem(msg)}
                          className="p-1.5 bg-[#14120F] hover:bg-[#E4402A] hover:text-white border border-[#F4EFE4]/20 transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Message Detail View Modal */}
      {activeMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setActiveMessage(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#1A1713] border-2 border-[#A78BFA] shadow-[8px_8px_0px_0px_#14120F] p-6 font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F4EFE4]/15 pb-3 mb-4">
              <div className="flex items-center gap-2 text-[#A78BFA]">
                <Mail className="w-5 h-5" />
                <h3 className="font-['Anton'] text-2xl uppercase tracking-wide text-[#F4EFE4]">
                  Dispatch Details
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveMessage(null)}
                className="text-[#F4EFE4]/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
                <span className="text-[#A78BFA] block text-[10px] uppercase font-bold">From</span>
                <span className="text-base text-[#F4EFE4] font-bold">{activeMessage.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
                  <span className="text-[#A78BFA] block text-[10px] uppercase font-bold">Contact</span>
                  <span className="text-sm text-[#FFC93C] font-bold break-all">{activeMessage.contact}</span>
                </div>
                <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
                  <span className="text-[#A78BFA] block text-[10px] uppercase font-bold">Area</span>
                  <span className="text-sm text-[#F4EFE4]">{activeMessage.area || 'Mumbai'}</span>
                </div>
              </div>

              <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
                <span className="text-[#A78BFA] block text-[10px] uppercase font-bold">Beatboxing Experience</span>
                <span className="text-sm text-[#F4EFE4]">{activeMessage.experience || 'None noted'}</span>
              </div>

              <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/15">
                <span className="text-[#A78BFA] block text-[10px] uppercase font-bold mb-1">Message Content</span>
                <p className="text-xs text-[#F4EFE4] font-sans whitespace-pre-wrap leading-relaxed">
                  {activeMessage.message}
                </p>
              </div>

              <div className="text-[11px] text-[#F4EFE4]/50">
                Submitted on: {activeMessage.createdAt ? new Date(activeMessage.createdAt).toLocaleString() : 'Recent session'}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-[#F4EFE4]/15 text-xs">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalItem(activeMessage);
                }}
                className="px-3.5 py-2 bg-[#14120F] hover:bg-[#E4402A] text-white border border-[#F4EFE4]/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                className="px-4 py-2 bg-[#A78BFA] hover:bg-[#c4b5fd] text-[#14120F] font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Window
              </button>
            </div>
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
                Delete Contact Message
              </h3>
            </div>

            <p className="text-xs text-[#F4EFE4]/80 leading-relaxed mb-4">
              Are you sure you want to permanently delete the dispatch from:
              <strong className="block text-[#A78BFA] text-sm mt-1">
                {deleteModalItem.name} ({deleteModalItem.contact})
              </strong>
              This will remove the record from the Supabase <code className="text-[#FFC93C]">contact_dispatches</code> table.
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
                  <span>Delete Message</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
