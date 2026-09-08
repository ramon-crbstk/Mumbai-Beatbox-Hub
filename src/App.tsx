import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { WhatWeDoSection } from './components/WhatWeDoSection';
import { MidPageCta } from './components/MidPageCta';
import { EventsSection } from './components/EventsSection';
import { GallerySection } from './components/GallerySection';
import { FeaturedVideosSection } from './components/FeaturedVideosSection';
import { MembersSection } from './components/MembersSection';
import { PartnersSection } from './components/PartnersSection';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { RsvpModal } from './components/RsvpModal';
import { AdminPortal } from './components/AdminPortal';
import { EventItem } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'site' | 'admin'>('site');
  const [dataRefreshCounter, setDataRefreshCounter] = useState(0);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [selectedEventName, setSelectedEventName] = useState<string | undefined>(undefined);

  // Synchronize route via URL hash (#admin) or keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (currentView === 'admin' && window.location.hash !== '#admin') {
        setCurrentView('site');
      }
    };

    if (window.location.hash === '#admin') {
      setCurrentView('admin');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey: Ctrl+Shift+A or Cmd+Shift+A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (currentView === 'admin') {
          window.location.hash = '';
          setCurrentView('site');
        } else {
          window.location.hash = '#admin';
          setCurrentView('admin');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentView]);

  const handleDataChanged = () => {
    setDataRefreshCounter((prev) => prev + 1);
  };

  const handleOpenJoinModal = (purpose?: string) => {
    setSelectedEventName(purpose || 'Next Mumbai Cypher Session');
    setRsvpModalOpen(true);
  };

  const handleRsvpEvent = (event: EventItem) => {
    setSelectedEventName(event.name);
    setRsvpModalOpen(true);
  };

  const scrollToContact = () => {
    const contactElement = document.getElementById('contact');
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in Admin Mode, render the full dedicated Admin Portal page
  if (currentView === 'admin') {
    return (
      <AdminPortal
        onBackToSite={() => {
          window.location.hash = '';
          setCurrentView('site');
        }}
        onDataChanged={handleDataChanged}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#14120F] text-[#F4EFE4] font-sans selection:bg-[#FFC93C] selection:text-[#14120F]">
      
      {/* Navigation Bar */}
      <Navbar
        onOpenJoinModal={() => handleOpenJoinModal()}
      />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section */}
        <Hero onOpenJoinModal={() => handleOpenJoinModal('Weekend Community Jam')} />

        {/* About Section */}
        <AboutSection />

        {/* What We Do Section */}
        <WhatWeDoSection onOpenJoinModal={handleOpenJoinModal} />

        {/* Mid-Page Call to Action Banner */}
        <MidPageCta onOpenContactModal={scrollToContact} />

        {/* Upcoming Events Section */}
        <EventsSection onRsvpClick={handleRsvpEvent} />

        {/* Gallery Section - Connected to Supabase */}
        <GallerySection
          refreshTrigger={dataRefreshCounter}
        />

        {/* Featured Videos Section - Connected to Supabase */}
        <FeaturedVideosSection
          refreshTrigger={dataRefreshCounter}
        />

        {/* Members of the Community Section with Voice Notes & Audio Preview */}
        <MembersSection
          refreshTrigger={dataRefreshCounter}
        />

        {/* Collaborated With / Partners */}
        <PartnersSection />

        {/* Blog Preview Section */}
        <BlogSection />

        {/* Contact & Direct Community Channel Section */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Cypher RSVP Modal */}
      <RsvpModal
        isOpen={rsvpModalOpen}
        eventName={selectedEventName}
        onClose={() => {
          setRsvpModalOpen(false);
          setSelectedEventName(undefined);
        }}
      />

    </div>
  );
}
