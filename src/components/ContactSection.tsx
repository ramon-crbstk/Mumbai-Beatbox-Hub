import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, Instagram, Youtube, MapPin, Mail, ArrowUpRight, Database, Loader2 } from 'lucide-react';
import { saveContactDispatch } from '../lib/supabase';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    experience: 'Beginner (Just starting out)',
    area: 'Bandra (Carter Rd / Bandstand)',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saveSource, setSaveSource] = useState<'supabase' | 'local'>('local');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await saveContactDispatch(formData);
      setSaveSource(res.source);
    } catch {
      // fallback handled
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#FFC93C]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-widest mb-3 border border-[#14120F] -rotate-1 shadow-sm">
            <Mail className="w-3.5 h-3.5" />
            <span>CONTACT & JOIN</span>
          </div>
          <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4]">
            Plug into the Mumbai Beatbox Community
          </h2>
          <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-1">
            Looking to join the weekend circle, book a workshop, or suggest a new spot? Send a dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Action & Community Channels */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Community Box (High priority for Indian grassroots cyphers) */}
            <div className="bg-[#181512] border-2 border-[#FFC93C] p-6 shadow-[6px_6px_0px_0px_#FFC93C] relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#FFC93C] text-[#14120F] flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5 text-[#14120F]" />
                </div>
                <div>
                  <h3 className="font-['Anton'] text-xl uppercase tracking-wider text-[#F4EFE4]">
                    Official WhatsApp Hub
                  </h3>
                  <span className="text-[11px] font-mono text-[#FFC93C]">
                    Instant Live Location Pings
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-sans text-[#F4EFE4]/80 mb-5 leading-relaxed">
                Our main active chat where weekend meetups are called, pin drops are shared, and sound exchanges happen daily.
              </p>

              <a
                href="https://chat.whatsapp.com/placeholder-mumbai-beatbox"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#FFC93C] hover:bg-[#F4EFE4] text-[#14120F] py-3 px-4 text-xs font-mono font-bold uppercase tracking-widest border border-[#14120F] transition-all shadow-[2px_2px_0px_0px_#14120F]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join Community WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Social Channels Strip */}
            <div className="bg-[#181512] border border-[#F4EFE4]/20 p-6 space-y-4">
              <span className="text-xs font-mono font-bold uppercase text-[#FFC93C] block">
                BROADCAST CHANNELS
              </span>

              <div className="space-y-3 font-mono text-xs">
                <a
                  href="https://instagram.com/mumbaibeatboxhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-[#14120F] border border-[#F4EFE4]/10 hover:border-[#FFC93C] text-[#F4EFE4] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Instagram className="w-4 h-4 text-[#E4402A]" />
                    <span>@mumbaibeatboxhub</span>
                  </div>
                  <span className="text-[10px] text-[#FFC93C] uppercase group-hover:underline">Instagram</span>
                </a>

                <a
                  href="https://youtube.com/@mumbaibeatboxhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-[#14120F] border border-[#F4EFE4]/10 hover:border-[#FFC93C] text-[#F4EFE4] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Youtube className="w-4 h-4 text-[#E4402A]" />
                    <span>Mumbai Beatbox Hub (Official Drops)</span>
                  </div>
                  <span className="text-[10px] text-[#FFC93C] uppercase group-hover:underline">YouTube</span>
                </a>
              </div>

              <div className="pt-2 text-[11px] font-mono text-[#F4EFE4]/50 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FFC93C]" />
                <span>Cyphers hold at public promenades across Mumbai</span>
              </div>
            </div>

          </div>

          {/* Right Column: Contact & Cypher RSVP Form */}
          <div className="lg:col-span-7 bg-[#F4EFE4] text-[#14120F] border-2 border-[#14120F] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#FFC93C]">
            
            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 bg-[#FFC93C] text-[#14120F] border-2 border-[#14120F] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#14120F]">
                  <CheckCircle2 className="w-8 h-8 text-[#14120F]" />
                </div>
                <h3 className="font-['Anton'] text-3xl uppercase tracking-tight text-[#14120F]">
                  Vocal Dispatch Received!
                </h3>
                <p className="text-sm font-sans text-[#14120F]/80 max-w-md mx-auto">
                  Thanks for reaching out, <strong>{formData.name}</strong>. A community mentor will ping you on WhatsApp with the upcoming cypher location and meetup details.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E5DFC8] border border-[#14120F]/30 text-[11px] font-mono text-[#14120F]/80">
                  <Database className="w-3.5 h-3.5 text-[#14120F]" />
                  <span>
                    {saveSource === 'supabase'
                      ? 'Dispatch stored in Supabase database (contact_dispatches)'
                      : 'Dispatch saved to local community inbox'}
                  </span>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-[#14120F] text-[#FFC93C] font-mono text-xs font-bold uppercase tracking-wider border border-[#14120F] hover:bg-[#FFC93C] hover:text-[#14120F] transition-colors cursor-pointer"
                  >
                    Send Another Dispatch
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
                
                <div className="flex items-center justify-between border-b-2 border-[#14120F] pb-3 mb-4">
                  <span className="font-['Anton'] text-xl uppercase tracking-wider text-[#14120F]">
                    GET IN TOUCH // JOIN A CYPHER
                  </span>
                  <span className="text-[10px] text-[#E4402A] font-bold uppercase">
                    OPEN TO ALL LEVELS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block font-bold uppercase text-[#14120F] mb-1.5">
                      Your Name / Beatbox Handle *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. Aryan / BeatFlow"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#E5DFC8] border-2 border-[#14120F] p-3 text-sm text-[#14120F] placeholder-[#14120F]/40 focus:outline-none focus:border-[#E4402A]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block font-bold uppercase text-[#14120F] mb-1.5">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      placeholder="+91 98XXX XXXXX"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full bg-[#E5DFC8] border-2 border-[#14120F] p-3 text-sm text-[#14120F] placeholder-[#14120F]/40 focus:outline-none focus:border-[#E4402A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label htmlFor="contact-experience" className="block font-bold uppercase text-[#14120F] mb-1.5">
                      Vocal Experience Level
                    </label>
                    <select
                      id="contact-experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full bg-[#E5DFC8] border-2 border-[#14120F] p-3 text-xs text-[#14120F] focus:outline-none focus:border-[#E4402A]"
                    >
                      <option>Beginner (Just starting out)</option>
                      <option>Intermediate (Have basic routines)</option>
                      <option>Battler / Advanced Sound Design</option>
                      <option>Curious Listener / Acoustic Explorer</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-area" className="block font-bold uppercase text-[#14120F] mb-1.5">
                      Preferred Mumbai Zone
                    </label>
                    <select
                      id="contact-area"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full bg-[#E5DFC8] border-2 border-[#14120F] p-3 text-xs text-[#14120F] focus:outline-none focus:border-[#E4402A]"
                    >
                      <option>Bandra (Carter Rd / Bandstand)</option>
                      <option>Dadar / Shivaji Park</option>
                      <option>South Mumbai (Marine Drive / Fort)</option>
                      <option>Western Suburbs (Andheri / Borivali)</option>
                      <option>Central / Navi Mumbai / Thane</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1">
                  <label htmlFor="contact-message" className="block font-bold uppercase text-[#14120F] mb-1.5">
                    What sounds/questions are you bringing? (Optional)
                  </label>
                  <textarea
                    id="contact-message"
                    rows={3}
                    placeholder="Tell us what you like to spit, sounds you want to learn, or if you're looking for collabs..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#E5DFC8] border-2 border-[#14120F] p-3 text-sm text-[#14120F] placeholder-[#14120F]/40 focus:outline-none focus:border-[#E4402A]"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    id="contact-submit-button"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#14120F] hover:bg-[#E4402A] disabled:opacity-75 text-[#FFC93C] hover:text-[#F4EFE4] py-3.5 px-6 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest border-2 border-[#14120F] shadow-[4px_4px_0px_0px_#14120F] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connecting to Database...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit & Get Connected</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-[#14120F]/60 text-center pt-1">
                  Zero spam. Your number is only used to send jam location updates.
                </div>

              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
