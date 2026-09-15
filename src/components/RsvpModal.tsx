import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Ticket, 
  MapPin, 
  Calendar, 
  Clock, 
  MessageCircle, 
  ArrowRight, 
  Database, 
  Loader2,
  AlertTriangle,
  Ban,
  Users
} from 'lucide-react';
import { EventItem, RegistrationStatus } from '../types';
import { submitEventRsvp, formatEventDate } from '../lib/supabase';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventItem;
  eventName?: string;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose, event, eventName }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [skill, setSkill] = useState('Beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEventFull, setIsEventFull] = useState(false);
  const [saveSource, setSaveSource] = useState<'supabase' | 'local'>('local');

  if (!isOpen) return null;

  const targetName = event?.title || event?.name || eventName || 'Next Community Cypher';
  const status = (event?.registrationStatus || event?.registration_status || 'open') as RegistrationStatus;
  const maxCap = event?.maxPeople !== undefined ? event?.maxPeople : event?.max_people;
  const currentCount = event?.rsvpCount || 0;
  const isPreFull = status === 'full' || (maxCap !== null && maxCap !== undefined && currentCount >= maxCap);
  const isPreClosed = status === 'closed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await submitEventRsvp({
        eventId: event?.id,
        eventName: targetName,
        attendeeName: name.trim(),
        whatsapp: whatsapp.trim(),
        skillLevel: skill,
      });

      if (!res.success) {
        if (res.isFull) {
          setIsEventFull(true);
        }
        setErrorMessage(res.error || 'Failed to submit RSVP. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setSaveSource(res.source);
      setConfirmed(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#F4EFE4] text-[#14120F] border-4 border-[#14120F] p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#FFC93C] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-[#14120F] text-[#F4EFE4] hover:bg-[#E4402A] transition-colors border border-[#14120F] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmed ? (
          <div className="py-6 text-center space-y-4 font-mono">
            <div className="w-14 h-14 bg-[#FFC93C] text-[#14120F] border-2 border-[#14120F] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#14120F]">
              <CheckCircle2 className="w-8 h-8 text-[#14120F]" />
            </div>

            <div className="inline-block px-3 py-1 bg-[#14120F] text-[#FFC93C] text-xs font-bold uppercase">
              RSVP CONFIRMED // SPOT RESERVED
            </div>

            <h3 className="font-['Anton'] text-3xl uppercase tracking-tight text-[#14120F]">
              You&apos;re in the Circle!
            </h3>

            <p className="text-xs sm:text-sm font-sans text-[#14120F]/85 max-w-sm mx-auto">
              We saved your spot, <strong>{name}</strong>. Zero instruments, zero gatekeeping. Just show up ready to share vocal sound.
            </p>

            <div className="p-3 bg-[#E5DFC8] border border-[#14120F]/30 text-xs text-left space-y-1.5">
              <div><strong>Event:</strong> {targetName}</div>
              {event?.date && (
                <div><strong>Date:</strong> {formatEventDate(event.date)} ({event.date})</div>
              )}
              {event?.time && <div><strong>Time:</strong> {event.time}</div>}
              {event?.venue && (
                <div>
                  <strong>Venue:</strong> {event.venue} — {event.location || event.area}
                </div>
              )}
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-800 font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Confirmed & registered in official cypher attendee roster</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://chat.whatsapp.com/placeholder-mumbai-beatbox"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] text-[#FFC93C] py-3 text-xs font-bold uppercase tracking-wider border-2 border-[#14120F] transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join WhatsApp Cypher Group</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs underline text-[#14120F]/70 hover:text-[#14120F] pt-2 block mx-auto cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        ) : isPreClosed ? (
          <div className="py-6 text-center space-y-4 font-mono">
            <div className="w-14 h-14 bg-red-800 text-white border-2 border-[#14120F] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#14120F]">
              <Ban className="w-8 h-8" />
            </div>
            <div className="inline-block px-3 py-1 bg-red-900 text-white text-xs font-bold uppercase">
              REGISTRATION CLOSED
            </div>
            <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#14120F]">
              Registration Has Ended
            </h3>
            <p className="text-xs font-sans text-[#14120F]/80 max-w-sm mx-auto">
              Registration for <strong>{targetName}</strong> is currently closed. Join our WhatsApp group to get alerts for the next gathering!
            </p>
            <div className="pt-2">
              <a
                href="https://chat.whatsapp.com/placeholder-mumbai-beatbox"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] text-[#FFC93C] py-3 text-xs font-bold uppercase tracking-wider border-2 border-[#14120F] transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join Community WhatsApp</span>
              </a>
            </div>
          </div>
        ) : isPreFull || isEventFull ? (
          <div className="py-6 text-center space-y-4 font-mono">
            <div className="w-14 h-14 bg-amber-600 text-white border-2 border-[#14120F] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#14120F]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="inline-block px-3 py-1 bg-amber-600 text-white text-xs font-bold uppercase">
              CAPACITY REACHED // SLOTS FULL
            </div>
            <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#14120F]">
              All RSVP Slots Filled
            </h3>
            <p className="text-xs font-sans text-[#14120F]/80 max-w-sm mx-auto">
              Sorry, <strong>{targetName}</strong> has reached its maximum attendee capacity limit{maxCap ? ` (${maxCap} attendees)` : ''}.
            </p>
            <p className="text-xs font-mono text-[#14120F]/60">
              Join our WhatsApp group to get notified if any attendee drops out or when the next session opens.
            </p>
            <div className="pt-2">
              <a
                href="https://chat.whatsapp.com/placeholder-mumbai-beatbox"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] text-[#FFC93C] py-3 text-xs font-bold uppercase tracking-wider border-2 border-[#14120F] transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join Waitlist via WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {/* Top Ticket Header */}
            <div className="flex items-center justify-between border-b-2 border-[#14120F] pb-3 mb-2">
              <div className="flex items-center gap-2 text-[#E4402A] font-bold uppercase">
                <Ticket className="w-4 h-4" />
                <span>COMMUNITY CYPHER ENTRY PASS</span>
              </div>
              {maxCap !== null && maxCap !== undefined && (
                <span className="text-[10px] font-mono text-[#14120F]/80 font-bold bg-[#E5DFC8] px-2 py-0.5 border border-[#14120F]/20">
                  {Math.max(0, maxCap - currentCount)} slots left
                </span>
              )}
            </div>

            <div>
              <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#14120F] leading-tight">
                {targetName}
              </h3>
              {event?.date && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#14120F]/80 mt-1 font-mono">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#E4402A]" />
                    {formatEventDate(event.date)}
                  </span>
                  {event.time && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {event.time}
                    </span>
                  )}
                  {event.venue && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.venue}
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs font-sans text-[#14120F]/70 mt-2">
                Drop your details below to lock in your attendee pass and receive the coordinates.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-bold uppercase text-[#14120F] mb-1">
                  Name / Vocal Tag *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#E5DFC8] border-2 border-[#14120F] p-2.5 text-sm text-[#14120F] placeholder-[#14120F]/40 focus:outline-none focus:border-[#E4402A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#14120F] mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 XXXXX"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-[#E5DFC8] border-2 border-[#14120F] p-2.5 text-sm text-[#14120F] placeholder-[#14120F]/40 focus:outline-none focus:border-[#E4402A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#14120F] mb-1">
                  Skill Level
                </label>
                <select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  className="w-full bg-[#E5DFC8] border-2 border-[#14120F] p-2.5 text-xs text-[#14120F] focus:outline-none focus:border-[#E4402A]"
                >
                  <option>Beginner (First time at a cypher)</option>
                  <option>Intermediate (Knows basics & sounds)</option>
                  <option>Advanced / Battler</option>
                  <option>Just coming to watch and vibe</option>
                </select>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#14120F] hover:bg-[#E4402A] disabled:opacity-70 text-[#FFC93C] hover:text-[#F4EFE4] font-mono text-xs sm:text-sm font-bold uppercase tracking-widest border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Capacity & Confirming...</span>
                  </>
                ) : (
                  <span>Confirm Free RSVP</span>
                )}
              </button>
            </div>

            <div className="text-[11px] text-[#14120F]/60 text-center">
              100% Free · No instruments · Open to all ages
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

