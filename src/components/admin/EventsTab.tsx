import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Flame, 
  Check, 
  X, 
  AlertCircle,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { EventItem, RegistrationStatus } from '../../types';
import { 
  saveUpcomingEvent, 
  deleteUpcomingEvent, 
  updateEventRegistrationStatus, 
  formatEventDate, 
  toIsoDate 
} from '../../lib/supabase';

interface EventsTabProps {
  items: EventItem[];
  onRefresh: () => void;
}

export function EventsTab({ items, onRefresh }: EventsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [date, setDate] = useState(''); // ISO YYYY-MM-DD
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [area, setArea] = useState('');
  const [blurb, setBlurb] = useState('');
  const [entry, setEntry] = useState('Free Entry / Open to all');
  const [maxPeople, setMaxPeople] = useState<string>(''); // string for empty vs number
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>('open');
  const [isBattleOrLive, setIsBattleOrLive] = useState(false);

  const resetForm = () => {
    setName('');
    setDate('');
    setTime('');
    setVenue('');
    setArea('');
    setBlurb('');
    setEntry('Free Entry / Open to all');
    setMaxPeople('');
    setRegistrationStatus('open');
    setIsBattleOrLive(false);
    setEditingItem(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    // Default date to upcoming Saturday if empty
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const nextSat = new Date(now.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
    setDate(nextSat.toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: EventItem) => {
    setEditingItem(item);
    setName(item.title || item.name);
    setDate(toIsoDate(item.date));
    setTime(item.time || '5:30 PM – 8:00 PM IST');
    setVenue(item.venue);
    setArea(item.location || item.area);
    setBlurb(item.description || item.blurb);
    setEntry(item.entry || 'Free Entry / Open to all');
    setMaxPeople(item.maxPeople !== null && item.maxPeople !== undefined ? String(item.maxPeople) : '');
    setRegistrationStatus((item.registrationStatus || item.registration_status || 'open') as RegistrationStatus);
    setIsBattleOrLive(Boolean(item.isBattleOrLive));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date.trim() || !venue.trim()) {
      setNotification({ type: 'error', message: 'Event Name, Date, and Venue are required.' });
      return;
    }

    setSaving(true);
    setNotification(null);

    const parsedMaxPeople = maxPeople.trim() === '' ? null : Math.max(1, parseInt(maxPeople, 10));

    const payload: Omit<EventItem, 'id'> & { id?: string } = {
      title: name.trim(),
      name: name.trim(),
      eventType: isBattleOrLive ? 'battle' : 'cypher',
      event_type: isBattleOrLive ? 'battle' : 'cypher',
      date: date.trim(), // YYYY-MM-DD
      time: time.trim() || '5:30 PM – 8:00 PM IST',
      venue: venue.trim(),
      location: area.trim() || 'Mumbai',
      area: area.trim() || 'Mumbai',
      description: blurb.trim() || 'Open acoustic circle and vocal percussion cypher session.',
      blurb: blurb.trim() || 'Open acoustic circle and vocal percussion cypher session.',
      entry: entry.trim() || 'Free Entry / Open to all',
      maxPeople: parsedMaxPeople,
      max_people: parsedMaxPeople,
      registrationStatus,
      registration_status: registrationStatus,
      isPublished: true,
      is_published: true,
      isBattleOrLive,
      id: editingItem ? editingItem.id : undefined,
    };

    const res = await saveUpcomingEvent(payload);
    setSaving(false);

    if (res.success) {
      setNotification({
        type: 'success',
        message: editingItem
          ? 'Event updated successfully!'
          : 'New upcoming event added to calendar!',
      });
      setModalOpen(false);
      resetForm();
      onRefresh();
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Failed to save event. Please check Supabase session.',
      });
    }
  };

  const handleQuickStatusChange = async (eventId: string, newStatus: RegistrationStatus) => {
    setUpdatingStatusId(eventId);
    const ok = await updateEventRegistrationStatus(eventId, newStatus);
    setUpdatingStatusId(null);
    if (ok) {
      setNotification({
        type: 'success',
        message: `Registration status changed to "${newStatus.toUpperCase()}".`,
      });
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const res = await deleteUpcomingEvent(id);
    setDeleting(null);
    setDeleteConfirmId(null);

    if (res.success) {
      setNotification({ type: 'success', message: 'Event removed from schedule.' });
      onRefresh();
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to delete event.' });
    }
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Registration Open
          </span>
        );
      case 'full':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Slots Full
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-950/60 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Ban className="w-3 h-3 text-red-400" />
            Registration Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1713] p-6 border border-[#F4EFE4]/15">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>CALENDAR & CYPHER SCHEDULE</span>
          </div>
          <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4]">
            Upcoming Events & Cyphers
          </h2>
          <p className="text-sm font-mono text-[#F4EFE4]/70 mt-1">
            Manage public cypher dates, maximum attendee capacities, and live RSVP registration statuses.
          </p>
        </div>

        <button
          type="button"
          id="add-event-btn"
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 border flex items-center justify-between font-mono text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/40 border-red-500/50 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-current hover:opacity-75 cursor-pointer p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Events List / Grid */}
      {items.length === 0 ? (
        <div className="bg-[#1A1713] border border-dashed border-[#F4EFE4]/20 p-12 text-center">
          <Calendar className="w-12 h-12 text-[#F4EFE4]/30 mx-auto mb-4" />
          <h3 className="font-['Anton'] text-xl uppercase text-[#F4EFE4] mb-1">
            No Events Scheduled
          </h3>
          <p className="text-xs font-mono text-[#F4EFE4]/60 max-w-sm mx-auto mb-6">
            There are currently no upcoming cyphers or jam sessions listed. Add your first event to display it on the public site.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.map((event, idx) => {
            const status = (event.registrationStatus || event.registration_status || 'open') as RegistrationStatus;
            const maxCap = event.maxPeople !== undefined ? event.maxPeople : event.max_people;
            const rsvpCount = event.rsvpCount || 0;
            const isFull = maxCap !== null && maxCap !== undefined && rsvpCount >= maxCap;

            return (
              <div
                key={event.id}
                id={`admin-event-card-${event.id}`}
                className="bg-[#1A1713] border-2 border-[#F4EFE4]/20 p-6 flex flex-col justify-between relative group hover:border-[#FFC93C]/50 transition-colors"
              >
                <div>
                  {/* Flyer Top Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4EFE4]/15 pb-3 mb-4">
                    <div className="flex items-center gap-2 font-mono text-xs text-[#FFC93C]">
                      <span className="w-2 h-2 bg-[#FFC93C]" />
                      <span className="font-bold">EVENT #{idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {event.isBattleOrLive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E4402A] text-[#F4EFE4] text-[10px] font-mono font-bold uppercase tracking-wider">
                          <Flame className="w-3 h-3" />
                          Battle & Jam
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#14120F] text-[#FFC93C] border border-[#FFC93C]/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                          Open Cypher
                        </span>
                      )}

                      {getStatusBadge(status)}
                    </div>
                  </div>

                  {/* Event Name */}
                  <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#F4EFE4] mb-3 leading-snug">
                    {event.title || event.name}
                  </h3>

                  {/* Event Meta Details */}
                  <div className="space-y-2 mb-4 text-xs font-mono text-[#F4EFE4]/80 bg-[#14120F] p-3.5 border border-[#F4EFE4]/10">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#E4402A] shrink-0" />
                      <span className="font-bold text-[#F4EFE4]">
                        {formatEventDate(event.date)}
                      </span>
                      <span className="text-[10px] text-[#F4EFE4]/40 font-sans ml-1">
                        ({event.date})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#FFC93C] shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#FFC93C] shrink-0" />
                      <span>
                        {event.venue} — <strong className="text-[#FFC93C]">{event.location || event.area}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Capacity & Live RSVP Slot Tracking */}
                  <div className="p-3.5 bg-[#14120F] border border-[#F4EFE4]/15 mb-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-[#F4EFE4]">
                        <Users className="w-3.5 h-3.5 text-[#FFC93C]" />
                        <span className="font-bold">Capacity & RSVPs:</span>
                      </div>

                      <span className={`font-mono text-xs font-bold ${isFull ? 'text-amber-400' : 'text-[#FFC93C]'}`}>
                        {maxCap !== null && maxCap !== undefined
                          ? `${rsvpCount} / ${maxCap} RSVPs`
                          : `${rsvpCount} RSVPs (No limit)`}
                      </span>
                    </div>

                    {/* Progress bar if maxPeople set */}
                    {maxCap !== null && maxCap !== undefined && (
                      <div className="w-full bg-[#25211B] h-2 rounded-full overflow-hidden mb-3">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            rsvpCount >= maxCap ? 'bg-amber-400' : 'bg-[#FFC93C]'
                          }`}
                          style={{ width: `${Math.min(100, (rsvpCount / maxCap) * 100)}%` }}
                        />
                      </div>
                    )}

                    {/* Quick Registration Status Switcher */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F4EFE4]/10">
                      <span className="text-[11px] font-mono text-[#F4EFE4]/60">
                        Quick Status:
                      </span>

                      <div className="flex items-center gap-1">
                        {(['open', 'full', 'closed'] as RegistrationStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={updatingStatusId === event.id}
                            onClick={() => handleQuickStatusChange(event.id, st)}
                            className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                              status === st
                                ? st === 'open'
                                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                                  : st === 'full'
                                  ? 'bg-amber-600 text-white border-amber-500 font-bold'
                                  : 'bg-red-600 text-white border-red-500 font-bold'
                                : 'bg-[#14120F] text-[#F4EFE4]/60 border-[#F4EFE4]/15 hover:text-[#F4EFE4]'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Blurb */}
                  <p className="text-xs text-[#F4EFE4]/70 line-clamp-2 mb-4 leading-relaxed">
                    {event.description || event.blurb}
                  </p>

                  {/* Entry Badge */}
                  <div className="text-[11px] font-mono text-[#F4EFE4]/60 mb-4">
                    Entry: <span className="text-[#F4EFE4] font-bold">{event.entry}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-[#F4EFE4]/10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(event)}
                    className="px-3 py-1.5 bg-[#14120F] hover:bg-[#25211B] text-[#F4EFE4] border border-[#F4EFE4]/20 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#FFC93C]" />
                    <span>Edit</span>
                  </button>

                  {deleteConfirmId === event.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-red-400">Confirm?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(event.id)}
                        disabled={deleting === event.id}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        {deleting === event.id ? '...' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 bg-[#14120F] text-[#F4EFE4]/70 text-xs font-mono cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(event.id)}
                      className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-200 border border-red-500/30 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            id="event-modal-content"
            className="bg-[#1A1713] text-[#F4EFE4] border-2 border-[#FFC93C] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[10px_10px_0px_0px_#FFC93C]"
          >
            <div className="flex items-center justify-between border-b border-[#F4EFE4]/15 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFC93C]" />
                <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#F4EFE4]">
                  {editingItem ? 'Edit Upcoming Event' : 'Add Upcoming Event & Cypher'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 text-[#F4EFE4]/60 hover:text-[#F4EFE4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Bandra Carter Road Cypher #49"
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                />
              </div>

              {/* Date Picker & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Date (Calendar Picker) *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-mono text-sm focus:border-[#FFC93C] focus:outline-none [color-scheme:dark]"
                  />
                  <span className="block text-[10px] font-mono text-[#F4EFE4]/50 mt-1">
                    Stored as ISO date: {date || 'YYYY-MM-DD'}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Time
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g., 5:30 PM – 8:00 PM IST"
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Venue & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g., Carter Road Promenade (Stairs)"
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Area / City Region
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g., Bandra West, Mumbai"
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Capacity Limit & Registration Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#14120F] p-3.5 border border-[#F4EFE4]/15">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Max Capacity / RSVP Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={maxPeople}
                    onChange={(e) => setMaxPeople(e.target.value)}
                    placeholder="e.g., 30"
                    className="w-full px-3.5 py-2.5 bg-[#1A1713] border border-[#F4EFE4]/20 text-[#F4EFE4] font-mono text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                  <span className="block text-[10px] font-mono text-[#F4EFE4]/50 mt-1">
                    Leave empty for unlimited capacity
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Registration Status
                  </label>
                  <select
                    value={registrationStatus}
                    onChange={(e) => setRegistrationStatus(e.target.value as RegistrationStatus)}
                    className="w-full px-3.5 py-2.5 bg-[#1A1713] border border-[#F4EFE4]/20 text-[#F4EFE4] font-mono text-sm focus:border-[#FFC93C] focus:outline-none cursor-pointer"
                  >
                    <option value="open">Open (Accepting RSVPs)</option>
                    <option value="full">Full (Slots Filled)</option>
                    <option value="closed">Closed (Registration Ended)</option>
                  </select>
                  <span className="block text-[10px] font-mono text-[#F4EFE4]/50 mt-1">
                    Controls whether attendees can register
                  </span>
                </div>
              </div>

              {/* Entry Details */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Entry Rule
                </label>
                <input
                  type="text"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="e.g., Free Entry / Open Mic"
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                />
              </div>

              {/* Blurb / Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Event Blurb / Instructions
                </label>
                <textarea
                  rows={3}
                  value={blurb}
                  onChange={(e) => setBlurb(e.target.value)}
                  placeholder="Details for attendees, warmups, sounds to practice, exact meeting spot..."
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                />
              </div>

              {/* Battle / Live Jam Checkbox */}
              <div className="flex items-center gap-3 p-3 bg-[#14120F] border border-[#F4EFE4]/15">
                <input
                  type="checkbox"
                  id="isBattleOrLive"
                  checked={isBattleOrLive}
                  onChange={(e) => setIsBattleOrLive(e.target.checked)}
                  className="w-4 h-4 accent-[#E4402A] cursor-pointer"
                />
                <label htmlFor="isBattleOrLive" className="text-xs font-mono text-[#F4EFE4] cursor-pointer select-none">
                  Highlight as <strong className="text-[#E4402A]">Battle & Jam</strong> (Red badge with fire icon)
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4EFE4]/15">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 bg-[#14120F] hover:bg-[#25211B] text-[#F4EFE4] font-mono text-xs uppercase tracking-wider border border-[#F4EFE4]/20 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#FFC93C] hover:bg-[#ffe082] disabled:opacity-50 text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] cursor-pointer"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Event' : 'Add Event to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
