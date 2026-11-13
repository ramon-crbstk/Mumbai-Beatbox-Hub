import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AboutSection } from '../components/AboutSection';
import { WhatWeDoSection } from '../components/WhatWeDoSection';
import { PartnersSection } from '../components/PartnersSection';
import { EventsSection } from '../components/EventsSection';
import { GallerySection } from '../components/GallerySection';
import { FeaturedVideosSection } from '../components/FeaturedVideosSection';
import { MembersSection } from '../components/MembersSection';
import { ContactSection } from '../components/ContactSection';
import { RsvpModal } from '../components/RsvpModal';
import { SeoHead } from '../components/SeoHead';
import {
  buildEventSchema,
  buildVideoObjectSchema,
  getSiteBaseUrl,
  PAGE_SEO,
  SITE_BRAND,
} from '../data/seoConfig';
import { EventItem, VideoItem } from '../types';
import { COMMUNITY_CONTACT } from '../data/communityData';
import { fetchUpcomingEvents, formatEventDate } from '../lib/supabase';
import {
  Trophy,
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  ChevronRight,
  MessageCircle,
  BookOpen,
  Mail,
} from 'lucide-react';

function PageBreadcrumbBar({ label, currentPath }: { label: string; currentPath: string }) {
  return (
    <div className="bg-[#181512] border-b border-white/10">
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 text-xs font-mono text-white/65"
      >
        <Link to="/" className="hover:text-[#FFC93C] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />
        <Link to={currentPath} className="text-[#FFC93C] font-semibold" aria-current="page">
          {label}
        </Link>
      </nav>
    </div>
  );
}

function SubPageShell({
  children,
  onJoinClick,
}: {
  children: React.ReactNode;
  onJoinClick?: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#14120F] text-white font-sans selection:bg-[#FFC93C] selection:text-[#14120F] flex flex-col">
      <Navbar onOpenJoinModal={onJoinClick} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function AboutPage() {
  return (
    <SubPageShell>
      <SeoHead
        meta={PAGE_SEO.about}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About Us', path: '/about' },
        ]}
      />
      <PageBreadcrumbBar label="About Mumbai Beatbox Hub" currentPath="/about" />
      <AboutSection headingTag="h1" />
      <WhatWeDoSection onOpenJoinModal={() => {}} />
      <PartnersSection />
    </SubPageShell>
  );
}

export function EventsPage() {
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | undefined>(undefined);
  const [eventSchemas, setEventSchemas] = useState<Record<string, unknown>[]>([]);

  const handleEventsLoaded = useCallback((events: EventItem[]) => {
    const baseUrl = getSiteBaseUrl();
    const schemas = events
      .map((evt) => buildEventSchema(baseUrl, evt, '/events'))
      .filter((s): s is Record<string, unknown> => s !== null);
    setEventSchemas(schemas);
  }, []);

  return (
    <SubPageShell onJoinClick={() => setRsvpModalOpen(true)}>
      <SeoHead
        meta={PAGE_SEO.events}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Events & Cyphers', path: '/events' },
        ]}
        structuredData={eventSchemas}
      />
      <PageBreadcrumbBar label="Beatbox Events in Mumbai" currentPath="/events" />
      <EventsSection
        headingTag="h1"
        onEventsLoaded={handleEventsLoaded}
        onRsvpClick={(evt) => {
          setSelectedEvent(evt);
          setRsvpModalOpen(true);
        }}
      />
      <RsvpModal
        isOpen={rsvpModalOpen}
        event={selectedEvent}
        eventName={selectedEvent?.title || selectedEvent?.name}
        onClose={() => {
          setRsvpModalOpen(false);
          setSelectedEvent(undefined);
        }}
      />
    </SubPageShell>
  );
}

export function Championship2026Page() {
  const [championshipEvent, setChampionshipEvent] = useState<EventItem | null>(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchUpcomingEvents()
      .then((events) => {
        if (!active || !events) return;
        const match = events.find((e) =>
          `${e.title || ''} ${e.name || ''} ${e.slug || ''}`.toLowerCase().includes('championship')
        );
        if (match) {
          setChampionshipEvent(match);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const baseUrl = getSiteBaseUrl();
  const confirmedEventSchema = championshipEvent
    ? buildEventSchema(baseUrl, championshipEvent, '/mumbai-beatbox-championship-2026')
    : null;

  return (
    <SubPageShell onJoinClick={() => setRsvpOpen(true)}>
      <SeoHead
        meta={PAGE_SEO.championship2026}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Events', path: '/events' },
          { name: 'Mumbai Beatbox Championship 2026', path: '/mumbai-beatbox-championship-2026' },
        ]}
        structuredData={confirmedEventSchema ? [confirmedEventSchema] : []}
      />
      <PageBreadcrumbBar
        label="Mumbai Beatbox Championship 2026"
        currentPath="/mumbai-beatbox-championship-2026"
      />

      <section className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#E4402A]/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-widest border border-[#14120F] shadow-[2px_2px_0px_0px_#E4402A]">
              <Trophy className="w-3.5 h-3.5" />
              <span>OFFICIAL EVENT HUB // MUMBAI, MAHARASHTRA</span>
            </div>

            <h1 className="font-['Anton'] text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white leading-[1.02]">
              Mumbai Beatbox Championship 2026
            </h1>

            <p className="text-base sm:text-lg text-white/85 font-sans leading-relaxed max-w-3xl">
              Organized by <strong className="text-white">{SITE_BRAND.name}</strong>, the flagship <strong className="text-white">Mumbai Beatbox Hub championship</strong> brings vocal percussionists from across the country together for <strong className="text-white">Beatbox Battle Mumbai 2026</strong>—elevating every local Mumbai beatbox competition and strengthening the national beatbox championship India scene.
            </p>
          </div>

          {championshipEvent ? (
            <div className="bg-white text-[#14120F] border-2 border-[#14120F] shadow-[6px_6px_0px_0px_#E4402A] p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#14120F] pb-4">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E4402A]">
                  CONFIRMED EVENT DETAILS
                </span>
                <span className="px-2.5 py-1 bg-[#14120F] text-[#FFC93C] font-mono text-xs font-bold uppercase">
                  {championshipEvent.entry}
                </span>
              </div>

              <h2 className="font-['Anton'] text-3xl sm:text-4xl uppercase tracking-tight">
                {championshipEvent.title || championshipEvent.name}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs sm:text-sm bg-[#F4EFE4] p-4 border border-[#14120F]/30">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E4402A] shrink-0" />
                  <span>{formatEventDate(championshipEvent.date)} · {championshipEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E4402A] shrink-0" />
                  <span>
                    {championshipEvent.venue} — {championshipEvent.location || championshipEvent.area}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#14120F]/85 font-sans leading-relaxed">
                {championshipEvent.description || championshipEvent.blurb}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setRsvpOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#FFC93C] text-[#14120F] hover:bg-[#E4402A] hover:text-white px-6 py-3 text-xs font-bold uppercase tracking-widest font-mono border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] cursor-pointer transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Register / RSVP Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#181512] border-2 border-[#FFC93C]/50 p-6 sm:p-8 shadow-[6px_6px_0px_0px_#E4402A] space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#FFC93C]">
                <Calendar className="w-4 h-4" />
                <span>2026 SCHEDULE &amp; VENUE ANNOUNCEMENT STATUS</span>
              </div>
              <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-white">
                Confirmed Battle Dates &amp; Venue Dropping Soon
              </h2>
              <p className="text-sm sm:text-base text-white/80 font-sans leading-relaxed">
                Looking for verified beatbox events December 2026 updates, a beatbox competition Mumbai December 2026 schedule, or beatbox competitions near me? Confirmed dates, rules, and showcase venues (including hubs such as Andheri, Mumbai when finalized) will be published right here first.
              </p>

              <div className="flex flex-wrap gap-3 pt-2 font-mono text-xs">
                <a
                  href={COMMUNITY_CONTACT.whatsappGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#FFC93C] text-[#14120F] hover:bg-white px-5 py-3 font-bold uppercase tracking-wider border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#E4402A]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Get Announcement Alerts on WhatsApp</span>
                </a>
                <a
                  href={COMMUNITY_CONTACT.emailHref}
                  className="inline-flex items-center gap-2 bg-[#14120F] text-white hover:border-[#FFC93C] px-5 py-3 font-bold uppercase tracking-wider border border-white/30"
                >
                  <Mail className="w-4 h-4 text-[#FFC93C]" />
                  <span>Partner / Sponsor Inquiries</span>
                </a>
              </div>
            </div>
          )}

          {/* Editorial Context & Internal Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-[#181512] border border-white/15 p-6 space-y-3">
              <h2 className="font-['Anton'] text-2xl uppercase text-white">
                How to Participate in Beatbox Battles
              </h2>
              <p className="text-sm text-white/75 leading-relaxed">
                Whether entering structured 1v1 brackets, beatbox competitions in Mumbai, or nationwide beatbox events and competitions in India, learn how elimination wildcards and live rounds are judged on musicality, technical precision, and stage presence.
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#FFC93C] hover:underline"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explore the MBH Journal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-[#181512] border border-white/15 p-6 space-y-3">
              <h2 className="font-['Anton'] text-2xl uppercase text-white">
                Warm Up at Weekly Cyphers
              </h2>
              <p className="text-sm text-white/75 leading-relaxed">
                New to beatbox competitions or refining a 90-second battle routine before qualifiers? Drop by our upcoming beatbox events in Mumbai and beatbox workshops in Mumbai.
              </p>
              <div className="flex flex-wrap gap-4 pt-1 font-mono text-xs font-bold uppercase">
                <Link to="/events" className="text-[#FFC93C] hover:underline inline-flex items-center gap-1">
                  <span>All Upcoming Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/videos" className="text-white hover:text-[#FFC93C] inline-flex items-center gap-1">
                  <span>Watch Live Performances</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RsvpModal
        isOpen={rsvpOpen}
        event={championshipEvent || undefined}
        eventName={championshipEvent?.title || 'Mumbai Beatbox Championship 2026'}
        onClose={() => setRsvpOpen(false)}
      />
    </SubPageShell>
  );
}

export function GalleryPage() {
  return (
    <SubPageShell>
      <SeoHead
        meta={PAGE_SEO.gallery}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Gallery', path: '/gallery' },
        ]}
      />
      <PageBreadcrumbBar label="Cypher Photo Archive" currentPath="/gallery" />
      <GallerySection headingTag="h1" />
    </SubPageShell>
  );
}

export function VideosPage() {
  const [videoSchemas, setVideoSchemas] = useState<Record<string, unknown>[]>([]);

  const handleVideosLoaded = useCallback((videos: VideoItem[]) => {
    const baseUrl = getSiteBaseUrl();
    const schemas = videos
      .map((vid) => buildVideoObjectSchema(baseUrl, vid))
      .filter((s): s is Record<string, unknown> => s !== null);
    setVideoSchemas(schemas);
  }, []);

  return (
    <SubPageShell>
      <SeoHead
        meta={PAGE_SEO.videos}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Videos & Routine Drops', path: '/videos' },
        ]}
        structuredData={videoSchemas}
      />
      <PageBreadcrumbBar label="Videos & Routine Drops" currentPath="/videos" />
      <FeaturedVideosSection headingTag="h1" onVideosLoaded={handleVideosLoaded} />
    </SubPageShell>
  );
}

export function MembersPage() {
  return (
    <SubPageShell>
      <SeoHead
        meta={PAGE_SEO.members}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Community Members', path: '/members' },
        ]}
      />
      <PageBreadcrumbBar label="Mumbai Beatboxers & Community" currentPath="/members" />
      <MembersSection headingTag="h1" />
    </SubPageShell>
  );
}

export function ContactPage() {
  return (
    <SubPageShell>
      <SeoHead
        meta={PAGE_SEO.contact}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact Us', path: '/contact' },
        ]}
      />
      <PageBreadcrumbBar label="Contact Mumbai Beatbox Hub" currentPath="/contact" />
      <ContactSection headingTag="h1" />
    </SubPageShell>
  );
}

export function NotFoundPage() {
  return (
    <SubPageShell>
      <SeoHead
        meta={{
          ...PAGE_SEO.home,
          path: '/404',
          title: 'Page Not Found | Mumbai Beatbox Hub',
          description: 'The requested page could not be found on Mumbai Beatbox Hub.',
          noindex: true,
        }}
      />
      <section className="py-24 bg-[#14120F] text-center px-4">
        <div className="max-w-xl mx-auto bg-[#181512] border-2 border-[#E4402A] p-8 shadow-[6px_6px_0px_0px_#FFC93C] space-y-5">
          <span className="inline-block px-3 py-1 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase">
            404 // FREQUENCY LOST
          </span>
          <h1 className="font-['Anton'] text-4xl sm:text-5xl uppercase text-white">
            Page Not Found
          </h1>
          <p className="text-sm font-mono text-white/75">
            The URL you followed does not exist or has moved. Jump back into Mumbai Beatbox Hub below.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 font-mono text-xs font-bold uppercase">
            <Link
              to="/"
              className="px-5 py-3 bg-[#FFC93C] text-[#14120F] border border-[#14120F] hover:bg-white transition-colors"
            >
              Back to Homepage
            </Link>
            <Link
              to="/events"
              className="px-5 py-3 bg-[#14120F] text-white border border-white/30 hover:border-[#FFC93C] transition-colors"
            >
              View Events
            </Link>
          </div>
        </div>
      </section>
    </SubPageShell>
  );
}
