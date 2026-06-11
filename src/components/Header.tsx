/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, Mail, Menu, X, ShieldAlert, Award, BookOpen, Sparkles, PenTool, Star, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import { Announcement, PortalSettings } from '../types';

import cmlLogoImg from '../assets/images/logo.jpg';
import thereseImg from '../assets/images/st_therese.png';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: PortalSettings;
  announcements: Announcement[];
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  settings,
  announcements,
  isAdminLoggedIn,
  onLogout,
  onOpenAdmin
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);

  const showKalolsavam = settings?.showKalolsavam !== false;
  const showSahithyamalsaram = settings?.showSahithyamalsaram !== false;
  const showChosen = settings?.showChosen !== false;

  // Rotate scrolling announcements in header banner
  const urgentAnnouncements = announcements.filter(a => a.type === 'urgent');
  const scrollItems = urgentAnnouncements.length > 0 ? urgentAnnouncements : announcements;

  console.log('HEADER DEBUG:', { isAdminLoggedIn, showKalolsavam, showSahithyamalsaram, settings });

  useEffect(() => {
    if (scrollItems.length <= 1) return;
    const interval = setInterval(() => {
      setScrollIndex(prev => (prev + 1) % scrollItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [scrollItems]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'bearers', label: 'Office Bearers' },
    { id: 'units', label: 'Units' },
    { id: 'history', label: 'History' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'downloads', label: 'Downloads' },
  ];

  const handleLinkClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  // CML Crest Logo IMG
  const CMLLogo = () => (
    <div id="header-cml-logo-container" className="relative group shrink-0">
      <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full group-hover:bg-amber-500/40 transition-colors duration-500" />
      <img
        id="header-cml-logo-img"
        src={cmlLogoImg}
        alt="Cherupushpa Mission League Logo"
        className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] border-amber-400/90 bg-slate-900 p-0.5 object-cover shadow-[0_0_15px_rgba(251,191,36,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all duration-300 relative z-10"
        referrerPolicy="no-referrer"
      />
    </div>
  );

  return (
    <header className="w-full flex flex-col bg-slate-950 text-white shadow-2xl relative overflow-hidden">
      {/* Subtle Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => handleLinkClick('home')}>
          <CMLLogo />
          <div className="flex flex-col">
            <h1 className="font-sans font-bold text-xl md:text-2xl lg:text-[28px] text-amber-500 tracking-tight leading-snug mb-1">
              Cherupushpa Mission League
            </h1>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] md:text-[11px] font-bold tracking-widest uppercase shadow-sm">
                Kaliyar Mekhala
              </span>
              <span className="text-[10px] md:text-[11px] text-slate-400 font-medium tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                Official Portal
              </span>
            </div>
          </div>
        </div>

        {/* Support desk and Email Contacts */}
        <div className="hidden lg:flex items-center gap-4">
          <a href="https://instagram.com/cml_kaliyar_mekhala" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-white/5 hover:border-pink-500/30 transition-all group backdrop-blur-sm shadow-sm whitespace-nowrap shrink-0">
            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 group-hover:scale-110 group-hover:bg-pink-500/20 transition-all shrink-0">
              <Instagram className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-pink-400/70 transition-colors">Instagram</span>
              <span className="text-sm font-bold text-slate-200">cml_kaliyar_mekhala</span>
            </div>
          </a>

          <a href={`mailto:${settings.email}`} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-white/5 hover:border-rose-400/30 transition-all group backdrop-blur-sm shadow-sm whitespace-nowrap shrink-0">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-rose-400/70 transition-colors">Email Us</span>
              <span className="text-sm font-bold text-slate-200">{settings.email}</span>
            </div>
          </a>

          <div className="w-px h-8 bg-white/10 mx-2 shrink-0" />

          {/* Saint Therese Image */}
          <div className="relative flex items-center justify-center shrink-0 w-16 h-16 md:w-20 md:h-20 ml-2">
            <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full" />
            <img 
              src={thereseImg} 
              alt="Saint Thérèse" 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] border-amber-400/90 object-cover shadow-[0_0_15px_rgba(251,191,36,0.3)] relative z-10"
            />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center justify-between w-full sm:w-auto gap-4 sm:ml-auto">
          {/* Instagram Link for mobile */}
          <a href="https://instagram.com/cml_kaliyar_mekhala" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 text-pink-400 rounded-lg sm:hidden">
            <Instagram className="w-5 h-5" />
          </a>

          {/* Saint Therese Image Mobile */}
          <div className="relative flex items-center justify-center shrink-0 w-16 h-16">
            <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full" />
            <img 
              src={thereseImg} 
              alt="Saint Thérèse" 
              className="w-16 h-16 rounded-full border-[3px] border-amber-400/90 object-cover shadow-[0_0_10px_rgba(251,191,36,0.3)] relative z-10"
            />
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Red Ribbon: Scrolling Announcements */}
      <div className="w-full bg-rose-900 border-y border-rose-950 flex items-center overflow-hidden h-10 select-none">
        <div className="h-full bg-rose-700 text-amber-200 font-bold px-4 text-[11px] md:text-xs tracking-wider flex items-center shrink-0 uppercase shadow-md shadow-rose-950/40 z-10 font-sans">
          🔔 LATEST UPDATES
        </div>
        <div className="flex-1 px-4 text-xs md:text-sm font-medium text-rose-100 flex items-center overflow-hidden">
          {scrollItems.length > 0 && (
            <div className="whitespace-nowrap transition-all duration-500 transform animate-fade-in flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 inline-block animate-pulse"></span>
              <span>{scrollItems[scrollIndex]?.text}</span>
              <span className="text-[10px] text-rose-300 bg-rose-950/60 font-mono px-1.5 py-0.5 rounded ml-2">
                {scrollItems[scrollIndex]?.date}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Main Rounded Pill Navbar - Inspired exactly by Image */}
      <div className="hidden lg:block w-full bg-slate-950/40 py-4 px-6 border-b border-slate-800/40 backdrop-blur-xs">
        <div
          id="desktop-pill-nav-container"
          className="max-w-6xl xl:max-w-7xl mx-auto bg-white/95 backdrop-blur-xl rounded-full p-2 shadow-[0_10px_40px_rgba(244,63,94,0.15)] flex items-center justify-between border-2 border-rose-200/60 ring-4 ring-amber-500/10 transition-all duration-300"
        >
          <div className="w-full flex items-center justify-between gap-1 xl:gap-2 px-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-2 xl:px-3.5 py-2 xl:py-2.5 rounded-full text-xs xl:text-sm font-extrabold tracking-tight xl:tracking-wide transition-all duration-200 relative whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === link.id
                    ? 'text-rose-800 bg-rose-50/90 shadow-2xs border border-rose-100/50'
                    : 'text-slate-700 hover:text-rose-700 hover:bg-rose-50/40'
                }`}
              >
                {link.label}
              </button>
            ))}

            {!isAdminLoggedIn && (showKalolsavam || showSahithyamalsaram || showChosen) && (
              <>
                <div className="h-6 w-px bg-slate-200 mx-1 xl:mx-2 shrink-0"></div>

                {/* Special styled highlight keys with glorious accents and high-contrast premium visibility */}
                <div className="relative flex items-center gap-1.5 xl:gap-3 shrink-0">
                  {/* Kalolsavam Tab Button */}
                  {showKalolsavam && (
                    <div className="relative group text-center flex flex-col items-center">
                      <button
                        onClick={() => handleLinkClick('kalolsavam')}
                        className={`flex items-center gap-1.5 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full text-[11px] xl:text-xs font-black tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 border-2 select-none ${
                          activeTab === 'kalolsavam'
                            ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700 hover:border-rose-700 shadow-md shadow-rose-600/25 ring-2 ring-rose-500/15'
                            : 'bg-rose-50/90 border-rose-400 text-rose-700 hover:text-rose-800 hover:bg-rose-100/95 hover:border-rose-500 shadow-5xs'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'kalolsavam' ? 'fill-current text-white' : 'text-rose-700'}`} />
                        <span>KALOLSAVAM 2026</span>
                      </button>
                      {activeTab === 'kalolsavam' && (
                        <span className="absolute -bottom-2.5 w-10 h-1 bg-rose-600 rounded-full animate-pulse shadow-xs" />
                      )}
                    </div>
                  )}

                  {/* Sahithyamalsaram Tab Button */}
                  {showSahithyamalsaram && (
                    <div className="relative group text-center flex flex-col items-center">
                      <button
                        onClick={() => handleLinkClick('sahithyamalsaram')}
                        className={`flex items-center gap-1.5 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full text-[11px] xl:text-xs font-black tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 border-2 select-none ${
                          activeTab === 'sahithyamalsaram'
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-600 text-white shadow-lg shadow-amber-600/40 hover:from-amber-700 hover:to-amber-800 hover:border-amber-700 ring-2 ring-amber-500/15'
                            : 'bg-amber-50/90 border-amber-400 text-amber-900 hover:text-amber-950 hover:bg-amber-100/95 hover:border-amber-500 shadow-5xs'
                        }`}
                      >
                        <BookOpen className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'sahithyamalsaram' ? 'text-white' : 'text-amber-800'}`} />
                        <span>SAHITHYAMALSARAM 2026</span>
                        <span className={`ml-1 px-1 py-0.5 text-[8px] xl:text-[9px] font-black tracking-normal rounded-md transition-all duration-305 ${
                          activeTab === 'sahithyamalsaram'
                            ? 'bg-amber-900 border border-amber-800 text-white'
                            : 'bg-amber-600 border border-amber-500 text-white shadow-5xs'
                        }`}>JULY</span>
                      </button>
                      {activeTab === 'sahithyamalsaram' && (
                        <span className="absolute -bottom-2.5 w-10 h-1 bg-amber-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(217,119,6,0.8)]" />
                      )}
                    </div>
                  )}

                  {/* Chosen Tab Button */}
                  {showChosen && (
                    <div className="relative group text-center flex flex-col items-center">
                      <button
                        onClick={() => handleLinkClick('chosen')}
                        className={`flex items-center gap-1.5 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full text-[11px] xl:text-xs font-black tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer shrink-0 border-2 select-none ${
                          activeTab === 'chosen'
                              ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/35 hover:bg-slate-800 hover:border-slate-800 ring-2 ring-slate-900/15'
                            : 'bg-indigo-50/90 border-indigo-300 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100/95 hover:border-indigo-400 shadow-5xs'
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'chosen' ? 'text-amber-300' : 'text-indigo-700'}`} />
                        <span>CHOSEN 2026</span>
                      </button>
                      {activeTab === 'chosen' && (
                        <span className="absolute -bottom-2.5 w-10 h-1 bg-slate-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(15,23,42,0.8)]" />
                      )}
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-slate-950 border-t border-slate-800 p-4 flex flex-col gap-2 shadow-2xl relative z-40 animate-slide-down">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === link.id
                  ? 'bg-rose-950/50 border-l-4 border-rose-500 text-rose-300 pl-6'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* Quick Special Category Anchors */}
          {!isAdminLoggedIn && (showKalolsavam || showSahithyamalsaram || showChosen) && (
            <div className={`grid gap-1.5 mt-2 pt-3 border-t border-slate-800 ${
              [showKalolsavam, showSahithyamalsaram, showChosen].filter(Boolean).length === 3
                ? 'grid-cols-3'
                : [showKalolsavam, showSahithyamalsaram, showChosen].filter(Boolean).length === 2
                ? 'grid-cols-2'
                : 'grid-cols-1'
            }`}>
              {showKalolsavam && (
                <button
                  onClick={() => handleLinkClick('kalolsavam')}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black tracking-tighter truncate transition-all cursor-pointer ${
                    activeTab === 'kalolsavam'
                      ? 'bg-rose-750 text-white shadow-md shadow-rose-600/30'
                      : 'bg-rose-950/30 text-rose-200 border border-rose-900/40 hover:bg-rose-900/30'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>KALOLSAVAM</span>
                </button>
              )}
              
              {showSahithyamalsaram && (
                <button
                  onClick={() => handleLinkClick('sahithyamalsaram')}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black tracking-tighter truncate transition-all cursor-pointer ${
                    activeTab === 'sahithyamalsaram'
                      ? 'bg-amber-700 text-white shadow-md shadow-amber-600/30'
                      : 'bg-amber-950/30 text-amber-200 border border-amber-900/40 hover:bg-amber-900/30'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>SAHITHYA</span>
                </button>
              )}

              {showChosen && (
                <button
                  onClick={() => handleLinkClick('chosen')}
                  className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-black tracking-tighter truncate transition-all cursor-pointer ${
                    activeTab === 'chosen'
                      ? 'bg-slate-800 text-white shadow-md shadow-slate-900/40'
                      : 'bg-slate-950/40 text-slate-300 border border-slate-900/60 hover:bg-slate-900/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>CHOSEN</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
