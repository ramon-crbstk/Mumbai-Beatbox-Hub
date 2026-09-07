import React, { useState } from 'react';
import { X, CheckCircle2, Ticket, MapPin, Calendar, Clock, MessageCircle, ArrowRight } from 'lucide-react';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName?: string;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose, eventName }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [skill, setSkill] = useState('Beginner');
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmed(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#F4EFE4] text-[#14120F] border-4 border-[#14120F] p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#FFC93C] relative"
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
              RSVP CONFIRMED // TICKET #MBX-2026
            </div>

            <h3 className="font-['Anton'] text-3xl uppercase tracking-tight text-[#14120F]">
              You&apos;re in the Circle!
            </h3>

            <p className="text-xs sm:text-sm font-sans text-[#14120F]/85 max-w-sm mx-auto">
              We saved your spot, <strong>{name}</strong>. Remember: zero instruments, no gatekeeping. Just show up with your vocal energy.
            </p>

            <div className="p-3 bg-[#E5DFC8] border border-[#14120F]/30 text-xs text-left space-y-1">
              <div><strong>Event:</strong> {eventName || 'Next Community Cypher'}</div>
              <div><strong>Coordinates:</strong> Bandra Carter Rd Promenade</div>
              <div><strong>Time:</strong> Sat 5:30 PM IST onwards</div>
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {/* Top Ticket Header */}
            <div className="flex items-center gap-2 text-[#E4402A] font-bold uppercase border-b-2 border-[#14120F] pb-3 mb-2">
              <Ticket className="w-4 h-4" />
              <span>COMMUNITY CYPHER ENTRY PASS</span>
            </div>

            <div>
              <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#14120F] leading-tight">
                {eventName ? `RSVP: ${eventName}` : 'Join the Next Open Cypher'}
              </h3>
              <p className="text-xs font-sans text-[#14120F]/70 mt-1">
                Drop your details so we can send the live location pin on WhatsApp.
              </p>
            </div>

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
                className="w-full py-3.5 bg-[#14120F] hover:bg-[#E4402A] text-[#FFC93C] hover:text-[#F4EFE4] font-mono text-xs sm:text-sm font-bold uppercase tracking-widest border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] transition-all cursor-pointer"
              >
                Confirm Free RSVP
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
