import React, { useState } from 'react';
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
import { EventItem } from './types';

export default function App() {
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [selectedEventName, setSelectedEventName] = useState<string | undefined>(undefined);

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

  return (
    <div className="min-h-screen bg-[#14120F] text-[#F4EFE4] font-sans selection:bg-[#FFC93C] selection:text-[#14120F]">
      {/* Navigation Bar */}
      <Navbar onOpenJoinModal={() => handleOpenJoinModal()} />

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

        {/* Gallery Section */}
        <GallerySection />

        {/* Featured Videos Section */}
        <FeaturedVideosSection />

        {/* Members of the Community Section with Voice Notes & Horizontal Scroll */}
        <MembersSection />

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
