import React, { useState, useEffect } from 'react';
import { EventItem, RegistrationStatus } from '../types';
import { Calendar, Clock, MapPin, Ticket, Flame, Users, AlertTriangle, Ban, CheckCircle2 } from 'lucide-react';
import { fetchUpcomingEvents, getLocalEvents, formatEventDate, fetchAllEventRsvpCounts } from '../lib/supabase';

interface EventsSectionProps {
  onRsvpClick: (event: EventItem) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({ onRsvpClick }) => {
  const [events, setEvents] = useState<EventItem[]>(getLocalEvents);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchUpcomingEvents(), fetchAllEventRsvpCounts()]).then(([data, counts]) => {
      if (isMounted) {
        if (data) setEvents(data);
        if (counts) setRsvpCounts(counts);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="events" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#FFC93C]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E4402A] text-[#F4EFE4] text-xs font-mono font-bold uppercase tracking-widest mb-3 rotate-[-1deg] shadow-sm">
              <Flame className="w-3.5 h-3.5" />
              <span>LIVE GATHERINGS</span>
            </div>
            <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4]">
              Upcoming Events & Cyphers
            </h2>
            <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-1">
              Real open circles across Mumbai. Drop in, listen, or jump on the mic.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#FFC93C]">
            <span className="w-2 h-2 rounded-full bg-[#FFC93C] animate-pulse" />
            <span>FREE ENTRY // NO PASSES NEEDED</span>
          </div>
        </div>

        {/* 1-2 Event Cards as Street Flyers */}
        {events.length === 0 ? (
          <div className="bg-[#1A1713] border-2 border-dashed border-[#FFC93C]/30 p-12 text-center">
            <Calendar className="w-12 h-12 text-[#FFC93C]/40 mx-auto mb-3" />
            <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#F4EFE4] mb-2">
              Next Cypher Date Dropping Soon
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[#F4EFE4]/70 max-w-md mx-auto">
              Our organizers are scouting outdoor spots across South Bombay & suburbs. Keep notifications on or RSVP below to receive the venue drop first.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map((evt, idx) => {
              const maxCap = evt.maxPeople !== undefined ? evt.maxPeople : evt.max_people;
              const count = rsvpCounts[evt.id] || (evt.name ? rsvpCounts[evt.name] : 0) || evt.rsvpCount || 0;
              const rawStatus = (evt.registrationStatus || evt.registration_status || 'open') as RegistrationStatus;
              
              // If count reached or exceeded maxCap, it's effectively full
              const isFull = rawStatus === 'full' || (maxCap !== null && maxCap !== undefined && count >= maxCap);
              const isClosed = rawStatus === 'closed';
              const isOpen = !isFull && !isClosed;

              return (
                <div
                  key={evt.id}
                  id={`event-card-${evt.id}`}
                  className={`relative bg-[#F4EFE4] text-[#14120F] border-2 border-[#14120F] shadow-[8px_8px_0px_0px_#FFC93C] ${
                    idx % 2 === 0 ? 'rotate-[-0.8deg]' : 'rotate-[0.8deg]'
                  } hover:rotate-0 transition-transform duration-200 p-6 sm:p-8 flex flex-col justify-between`}
                >
                  
                  {/* Event Badge Header */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#14120F] pb-4 mb-6">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#14120F] uppercase">
                        <span className="w-2.5 h-2.5 bg-[#FFC93C] border border-[#14120F]" />
                        <span>EVENT FLYER #{idx + 1}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {evt.isBattleOrLive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#E4402A] text-[#F4EFE4] text-xs font-mono font-bold uppercase tracking-wider">
                            <Flame className="w-3.5 h-3.5" />
                            Battle & Jam
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#14120F] text-[#FFC93C] text-xs font-mono font-bold uppercase tracking-wider">
                            Open Cypher
                          </span>
                        )}

                        {/* Status Pill */}
                        {isClosed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-900 text-white text-xs font-mono font-bold uppercase tracking-wider border border-red-800">
                            <Ban className="w-3 h-3" />
                            Closed
                          </span>
                        ) : isFull ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-600 text-white text-xs font-mono font-bold uppercase tracking-wider border border-amber-700">
                            <AlertTriangle className="w-3 h-3" />
                            Slots Full
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-700 text-white text-xs font-mono font-bold uppercase tracking-wider border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            RSVP Open
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Event Name */}
                    <h3 className="font-['Anton'] text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-[#14120F] mb-4 leading-tight">
                      {evt.title || evt.name}
                    </h3>

                    {/* Meta details list */}
                    <div className="space-y-2.5 mb-6 text-xs sm:text-sm font-mono text-[#14120F]/90 bg-[#E5DFC8] p-4 border border-[#14120F]/30">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-[#E4402A] flex-shrink-0" />
                        <span className="font-bold">{formatEventDate(evt.date)}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-[#14120F] flex-shrink-0" />
                        <span>{evt.time}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#14120F] flex-shrink-0" />
                        <span className="leading-snug">
                          {evt.venue} — <strong className="text-[#14120F]">{evt.location || evt.area}</strong>
                        </span>
                      </div>

                      {/* Capacity & Slot indicator if limit configured */}
                      <div className="flex items-center gap-2.5 pt-1.5 border-t border-[#14120F]/15 text-xs">
                        <Users className="w-4 h-4 text-[#14120F] flex-shrink-0" />
                        <span>
                          {maxCap !== null && maxCap !== undefined ? (
                            isFull ? (
                              <strong className="text-amber-800">
                                Capacity: {count}/{maxCap} slots booked (Full)
                              </strong>
                            ) : (
                              <span>
                                Slots: <strong>{count} of {maxCap}</strong> filled ({maxCap - count} spots left)
                              </span>
                            )
                          ) : (
                            <span>Capacity: <strong>Unlimited</strong> ({count} already joined)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Short Blurb */}
                    <p className="text-sm sm:text-base text-[#14120F]/85 font-sans leading-relaxed mb-6">
                      {evt.description || evt.blurb}
                    </p>
                  </div>

                  {/* Event Bottom Action & RSVP */}
                  <div className="pt-4 border-t-2 border-[#14120F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs font-mono text-[#14120F]/70">
                      <span>Entry: </span>
                      <strong className="text-[#14120F] font-bold">{evt.entry}</strong>
                    </div>

                    {isClosed ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center gap-2 bg-gray-400 text-gray-800 px-6 py-3 text-xs font-bold uppercase tracking-widest font-mono border-2 border-gray-600 opacity-60 cursor-not-allowed"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Registration Closed</span>
                      </button>
                    ) : isFull ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center gap-2 bg-amber-800 text-[#F4EFE4] px-6 py-3 text-xs font-bold uppercase tracking-widest font-mono border-2 border-amber-950 opacity-80 cursor-not-allowed"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Slots Filled</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        id={`rsvp-btn-${evt.id}`}
                        onClick={() => onRsvpClick(evt)}
                        className="inline-flex items-center justify-center gap-2 bg-[#14120F] text-[#FFC93C] hover:bg-[#E4402A] hover:text-[#F4EFE4] px-6 py-3 text-xs font-bold uppercase tracking-widest font-mono border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>RSVP for Jam</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Street Note Banner */}
        <div className="mt-10 p-4 bg-[#181512] border border-[#FFC93C]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#F4EFE4]/70">
          <div className="flex items-center gap-2">
            <span className="text-[#FFC93C]">⚡ WEATHER / PERMIT NOTE:</span>
            <span>All sessions are acoustic. In case of unexpected rains, jams shift to nearby covered walkways.</span>
          </div>
          <span className="text-[#FFC93C] underline uppercase tracking-wider cursor-pointer">
            WhatsApp group gets instant live pin
          </span>
        </div>

      </div>
    </section>
  );
};
