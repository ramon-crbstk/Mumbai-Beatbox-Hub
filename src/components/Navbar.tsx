import React, { useState } from 'react';
import { Menu, X, Mic2, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onOpenJoinModal: (eventName?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenJoinModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Events', href: '#events' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Videos', href: '#videos' },
    { label: 'Members', href: '#members' },
    { label: 'Blog', href: '#blog' },
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

  return (
    <header className="sticky top-0 z-50 bg-[#14120F]/95 backdrop-blur-md border-b-2 border-[#FFC93C]/40">
      {/* Top Taxi Stripe Accent Line */}
      <div className="h-1 w-full bg-taxi-pattern opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo Mark & Wordmark */}
          <a
            href="#home"
            id="nav-logo"
            className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC93C]"
            onClick={(e) => handleLinkClick(e, '#home')}
          >
            {/* MBX Kaali-Peeli Stamp Badge */}
            <div className="relative flex items-center justify-center w-11 h-11 bg-[#FFC93C] text-[#14120F] font-black border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#F4EFE4] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[1px_1px_0px_0px_#F4EFE4] transition-all">
              <span className="font-['Anton'] tracking-wider text-xl leading-none">MBX</span>
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#E4402A] rounded-full ring-2 ring-[#14120F]" title="Vocal Live Division" />
            </div>

            <div className="flex flex-col">
              <span className="font-['Anton'] text-xl sm:text-2xl tracking-wider text-[#F4EFE4] group-hover:text-[#FFC93C] transition-colors leading-none">
                MUMBAI BEATBOX HUB
              </span>
              <span className="text-[11px] font-mono tracking-widest text-[#FFC93C] uppercase mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC93C] inline-block animate-pulse" />
                Vocal Percussion Collective
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
                className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#F4EFE4]/80 hover:text-[#14120F] hover:bg-[#FFC93C] transition-all rounded-sm border border-transparent hover:border-[#14120F]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Nav Right CTA Action */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              id="nav-join-button"
              onClick={() => onOpenJoinModal()}
              className="relative inline-flex items-center gap-2 bg-[#FFC93C] text-[#14120F] px-4 py-2 text-xs font-bold uppercase tracking-widest font-mono border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#F4EFE4] hover:bg-[#F4EFE4] hover:shadow-[1px_1px_0px_0px_#FFC93C] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              <Mic2 className="w-4 h-4 text-[#14120F]" />
              <span>Join a Cypher</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              id="nav-mobile-toggle"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#FFC93C] bg-[#14120F] border-2 border-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#14120F] border-b-4 border-[#FFC93C] px-6 py-6 space-y-4">
          <div className="text-[11px] font-mono tracking-widest text-[#FFC93C] border-b border-[#FFC93C]/20 pb-2">
            NAVIGATION INDEX // MUMBAI METRO
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                id={`mobile-nav-link-${link.label.toLowerCase()}`}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="block px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-[#F4EFE4] bg-[#14120F] border border-[#F4EFE4]/20 hover:border-[#FFC93C] hover:bg-[#FFC93C] hover:text-[#14120F] transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2">
            <button
              type="button"
              id="mobile-nav-cta"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenJoinModal();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#FFC93C] text-[#14120F] py-3 text-sm font-bold uppercase tracking-wider font-mono border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#E4402A]"
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
