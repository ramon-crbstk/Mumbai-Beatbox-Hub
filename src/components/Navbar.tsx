import React, { useState } from 'react';
import { Menu, X, Mic2, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onOpenJoinModal?: (eventName?: string) => void;
  onJoinCypherClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenJoinModal, onJoinCypherClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Events', href: '#events' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Videos', href: '#videos' },
    { label: 'Members', href: '#members' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJoinCypherClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (onJoinCypherClick) {
      onJoinCypherClick();
      return;
    }
    const target =
      document.getElementById('inquiry-form-card') ||
      document.getElementById('inquiry-form') ||
      document.getElementById('contact');

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const nameInput = document.getElementById('contact-name') as HTMLInputElement | null;
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 600);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#14120F]/95 backdrop-blur-md border-b-2 border-[#E4402A]/40">
      {/* Top Taxi Stripe Accent Line */}
      <div className="h-1 w-full bg-taxi-pattern opacity-80" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo Mark & Wordmark */}
          <a
            href="#home"
            id="nav-logo"
            className="group flex items-center gap-2.5 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC93C] min-w-0"
            onClick={(e) => handleLinkClick(e, '#home')}
          >
            {/* Official MBH Logo Mark */}
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/MBH_LOGO_NORMAL_02411e7a.png"
                alt="Mumbai Beatbox Hub Logo"
                className="h-[39px] w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-['Anton'] text-base sm:text-2xl tracking-wider text-white group-hover:text-[#FFC93C] transition-colors leading-none truncate">
                MUMBAI BEATBOX HUB
              </span>
              <span className="hidden xs:flex text-[10px] sm:text-[11px] font-mono tracking-widest text-white/80 uppercase mt-0.5 items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4402A] inline-block animate-pulse shrink-0" />
                <span>MBH Vocal Percussion Collective</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                id={`nav-link-${link.label.toLowerCase()}`}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-[#14120F] hover:bg-[#FFC93C] transition-all rounded-sm border border-transparent hover:border-[#14120F]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Nav Right CTA Action */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="nav-join-button"
              onClick={handleJoinCypherClick}
              className="relative inline-flex items-center gap-2 bg-[#FFC93C] text-[#14120F] px-4 py-2 text-xs font-bold uppercase tracking-widest font-mono border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#E4402A] hover:bg-white hover:shadow-[1px_1px_0px_0px_#E4402A] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer min-h-[40px]"
            >
              <Mic2 className="w-4 h-4 text-[#14120F]" />
              <span>Join Cypher</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <button
              type="button"
              id="nav-mobile-toggle"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-white bg-[#14120F] border-2 border-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#14120F] border-b-4 border-[#E4402A] px-4 sm:px-6 py-5 sm:py-6 space-y-4 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
          <div className="text-[11px] font-mono tracking-widest text-white/80 border-b border-white/20 pb-2">
            NAVIGATION INDEX // MUMBAI METRO
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                id={`mobile-nav-link-${link.label.toLowerCase()}`}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="flex items-center px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#181512] border border-white/20 hover:border-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] transition-all min-h-[44px]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              id="mobile-nav-cta"
              onClick={handleJoinCypherClick}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-[#FFC93C] text-[#14120F] py-3 text-sm font-bold uppercase tracking-wider font-mono border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#E4402A] active:translate-y-0.5 cursor-pointer"
            >
              <Mic2 className="w-4 h-4" />
              <span>Join a Cypher</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
