/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  ArrowRight,
  Award,
  Users,
  History,
  FileText,
  Sparkles,
  Calendar,
  Heart,
  Flame,
  BookOpen,
  Gift,
  Trophy,
  CheckCircle,
  HeartHandshake,
  ArrowUpRight,
  MapPin,
  Bell,
  Download,
  Info
} from 'lucide-react';
import {
  OfficeBearer,
  ParishUnit,
  CMLEvent,
  Announcement,
  NewsItem,
  GalleryAlbum,
  DownloadItem,
  PortalSettings
} from '../types';

import thereseImg from '../assets/images/st_therese_of_lisieux_1780072293326.png';
import groupPhotoImg from '../assets/images/regenerated_image_1780418817430.webp';
import cmlLogoImg from '../assets/images/regenerated_image_1780235265355.jpg';
import founderPriestImg from '../assets/images/founder_priest_1780076622051.png';
import founderLaymanImg from '../assets/images/founder_layman_1780076640521.png';
import saintLittleFlowerImg from '../assets/images/saint_little_flower_1780503586974.png';

interface HomeViewProps {
  settings: PortalSettings;
  announcements: Announcement[];
  news: NewsItem[];
  bearers: OfficeBearer[];
  units: ParishUnit[];
  events: CMLEvent[];
  albums: GalleryAlbum[];
  downloads: DownloadItem[];
  setActiveTab: (tab: string) => void;
}

export default function HomeView({
  settings,
  announcements,
  news,
  bearers,
  units,
  events,
  albums,
  downloads,
  setActiveTab
}: HomeViewProps) {
  const latestNews = news.slice(0, 2);
  const nextEvents = events.filter(e => e.type === 'upcoming').slice(0, 2);
  const featuredNews = news.find(n => n.isFeatured) || news[0];

  // Active state for Knowledge Hub
  const [activeCmlTab, setActiveCmlTab] = useState('pillars');

  // Daily interactive CML Missions for the 4 pillars
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cml_completed_missions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Confetti helper state
  const [showCelebration, setShowCelebration] = useState(false);

  // Floating romantic rose petals and shiny golden stars/banana elements
  const [petals, setPetals] = useState<{ id: number; left: number; delay: number; duration: number; size: number; rotation: number; type?: 'banana' | 'gold-star' | 'rose' }[]>([]);

  const triggerRoseShower = () => {
    const newPetals = [...Array(36)].map((_, i) => {
      const types: ('banana' | 'gold-star' | 'rose')[] = ['banana', 'gold-star', 'rose'];
      return {
        id: Date.now() + i + Math.random(),
        left: 2 + Math.random() * 96, // distributed fully across screen width
        delay: Math.random() * 0.8,
        duration: 3.0 + Math.random() * 3.0,
        size: i % 3 === 0 ? 22 + Math.random() * 10 : 14 + Math.random() * 8,
        rotation: Math.random() * 360,
        type: types[i % 3],
      };
    });
    setPetals(newPetals);
  };

  const toggleMission = (id: string) => {
    const updated = { ...completedMissions, [id]: !completedMissions[id] };
    setCompletedMissions(updated);
    
    // If all 4 are newly completed, trigger a celebration effect
    const finalCount = Object.keys(updated).filter(k => updated[k]).length;
    if (finalCount === 4) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }

    try {
      localStorage.setItem('cml_completed_missions', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const completedCount = Object.keys(completedMissions).filter(id => completedMissions[id]).length;

  return (
    <div className="w-full bg-[#fdfbf7] text-stone-800 relative pb-20 overflow-hidden font-sans">
      
      {/* Dynamic Background Sparkles/Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-200/15 via-amber-100/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-200/10 via-rose-100/5 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* Confetti celebration rendering */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
          >
            {[...Array(40)].map((_, i) => {
              const left = Math.random() * 100;
              const delay = Math.random() * 2;
              const duration = 2 + Math.random() * 3;
              const colors = ['bg-rose-500', 'bg-amber-400', 'bg-sky-400', 'bg-emerald-400'];
              const color = colors[Math.floor(Math.random() * colors.length)];
              return (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full ${color}`}
                  style={{ left: `${left}%`, top: '-5%' }}
                  animate={{
                    top: '105%',
                    x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    delay: delay,
                    ease: "linear"
                  }}
                />
              );
            })}
            <div className="bg-white/90 backdrop-blur-md px-8 py-5 border border-amber-200 rounded-3xl shadow-2xl flex flex-col items-center gap-2 max-w-sm pointer-events-auto">
              <Trophy className="w-12 h-12 text-amber-500 animate-bounce" />
              <h3 className="font-sans font-black text-lg text-emerald-900">Apostle Quest Cleared!</h3>
              <p className="text-stone-600 text-xs text-center leading-normal">
                You have lived out all four holy ideals today. Keep the missionary fire burning bright!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Falling Rose Petals or Golden Sparkles/Banana effect */}
      <AnimatePresence>
        {petals.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: -45, rotate: p.rotation }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              y: '105vh',
              x: p.id % 2 === 0 ? ['0px', '50px', '15px'] : ['0px', '-50px', '-15px'],
              rotate: p.rotation + 360 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: p.duration, 
              delay: p.delay, 
              ease: "easeInOut" 
            }}
            className={`fixed top-0 pointer-events-none z-50 filter drop-shadow-sm select-none ${
              p.type === 'rose' ? 'text-rose-500' : 'text-amber-500'
            }`}
            style={{ 
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-85">
              {p.type === 'banana' && (
                <g>
                  {/* Creative golden banana outline & fill for nano-banana style */}
                  <path d="M25,85 C15,70 15,35 45,15 C48,13 52,17 50,21 C30,40 30,65 42,78 C45,82 40,88 35,88 C31,88 28,87 25,85 Z" fill="#facc15" />
                  <path d="M44,18 C46,16 48,19 46,21 C34,36 33,62 41,75" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <circle cx="48" cy="18" r="3" fill="#713f12" />
                </g>
              )}
              {p.type === 'gold-star' && (
                <path d="M50,10 L62,38 L90,50 L62,62 L50,90 L38,62 L10,50 L38,38 Z" fill="#fde047" />
              )}
              {(!p.type || p.type === 'rose') && (
                <path d="M50,15 C25,10 5,30 15,65 C22,80 40,95 50,90 C60,95 78,80 85,65 C95,30 75,10 50,15 Z" fill="#f43f5e" />
              )}
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Block: Modern Typography & Creed */}
          <div className="lg:col-span-6 flex flex-col justify-start text-center lg:text-left gap-4">
            <div className="flex flex-col gap-4">
              
              {/* Premium Miniature Badge */}
              <div className="inline-flex self-center lg:self-start items-center gap-2.5 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-950 rounded-full shadow-sm hover:bg-amber-500/15 transition-all duration-300 select-none backdrop-blur-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase text-stone-700">
                  CML KALIYAR MEKHALA
                </span>
              </div>

              {/* Outstanding modern typography in balanced natural theme */}
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-center lg:justify-start gap-2.5 select-none">
                  <span className="text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-[0.3em] text-stone-500">
                    OUR SACRED CREED
                  </span>
                  <span className="flex-1 h-px bg-stone-200 hidden lg:block max-w-[80px]" />
                </div>
                
                <div className="flex flex-col gap-1 select-none font-malayalam leading-tight">
                  {/* Line 1: സ്നേഹം ● ത്യാഗം */}
                  <div className="flex items-center justify-center lg:justify-start gap-x-3 sm:gap-x-5 flex-nowrap whitespace-nowrap">
                    <span className="text-stone-900 font-bold text-5xl sm:text-6xl lg:text-[66px] tracking-wide">
                      സ്നേഹം
                    </span>
                    <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-stone-900 shrink-0" />
                    <span className="text-stone-900 font-bold text-5xl sm:text-6xl lg:text-[66px] tracking-wide">
                      ത്യാഗം
                    </span>
                  </div>
                  {/* Line 2: സേവനം ● സഹനം */}
                  <div className="flex items-center justify-center lg:justify-start gap-x-3 sm:gap-x-5 flex-nowrap whitespace-nowrap mt-0.5">
                    <span className="text-[#f43f5e] font-bold text-5xl sm:text-6xl lg:text-[66px] tracking-wide">
                      സേവനം
                    </span>
                    <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#f97316] shrink-0" />
                    <span className="text-[#f59e0b] font-bold text-5xl sm:text-6xl lg:text-[66px] tracking-wide">
                      സഹനം
                    </span>
                  </div>
                </div>

                {/* Minimal elegant separator line */}
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="h-0.5 w-16 bg-gradient-to-r from-amber-400 to-rose-500 rounded-full" />
                </div>
              </div>

              {/* Premium Glassmorphic Quote Card */}
              <div className="relative group p-6 sm:p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-xl lg:max-w-none mx-auto lg:mx-0 text-left overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                {/* Background glow effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors duration-500" />
                
                {/* Large decorative quote marks */}
                <div className="absolute -right-2 -bottom-8 text-9xl text-stone-900/[0.03] font-serif pointer-events-none select-none z-0 transform group-hover:scale-110 group-hover:-translate-y-2 group-hover:text-amber-500/10 transition-all duration-700">
                  ”
                </div>
                
                {/* Left glowing border */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 via-rose-500 to-rose-700 rounded-r-full shadow-[2px_0_10px_rgba(244,63,94,0.4)]" />
                
                <p className="text-stone-800 text-lg sm:text-xl font-bold font-malayalam leading-relaxed relative z-10 pl-2 tracking-wide group-hover:text-stone-950 transition-colors duration-300">
                  "സഭയെ സ്നേഹിക്കുക ലോകത്തിൽ സാക്ഷികളാകുക"
                </p>
              </div>

            </div>

            <div className="flex flex-col gap-6 mt-4">
              {/* Premium CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
                <button
                  onClick={() => setActiveTab('units')}
                  className="relative group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-600 to-rose-800 text-white font-extrabold text-[13px] tracking-wider uppercase rounded-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 cursor-pointer border border-rose-500/50 shadow-[0_10px_20px_rgba(225,29,72,0.3)] hover:shadow-[0_15px_30px_rgba(225,29,72,0.4)] hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Parish Units
                  </span>
                  <ArrowRight className="w-4.5 h-4.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className="relative group w-full sm:w-auto px-8 py-4 bg-white hover:bg-stone-50 border border-stone-200/80 text-stone-900 font-extrabold text-[13px] tracking-wider uppercase rounded-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-amber-500/30 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-amber-50/50 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    <History className="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
                    Our Legacy
                  </span>
                  <ArrowRight className="w-4.5 h-4.5 text-amber-500 relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
              </div>

              {/* Enhanced Quick Portals */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-stone-200/60 w-full max-w-xl lg:max-w-none mx-auto lg:mx-0">
                <span className="text-[11px] font-mono font-extrabold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Quick Portals
                </span>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                  <button
                    id="portal-kalolsavam-btn"
                    onClick={() => setActiveTab('kalolsavam')}
                    className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer active:scale-95 hover:-translate-y-1 shadow-[0_8px_20px_rgba(225,29,72,0.3)] hover:shadow-[0_15px_30px_rgba(225,29,72,0.45)] overflow-hidden border border-rose-400/30 ring-2 ring-rose-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out skew-x-[-20deg]" />
                    <span className="relative z-10 flex items-center justify-center p-1.5 bg-white/20 backdrop-blur-md rounded-full group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Trophy className="w-4 h-4 text-white drop-shadow-md" />
                    </span>
                    <span className="relative z-10 drop-shadow-md text-white font-extrabold tracking-widest">KALOLSAVAM RESULTS</span>
                  </button>
                  <button
                    id="portal-sahithyamalsaram-btn"
                    onClick={() => setActiveTab('sahithyamalsaram')}
                    className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer active:scale-95 hover:-translate-y-1 shadow-[0_8px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.45)] overflow-hidden border border-amber-400/30 ring-2 ring-amber-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out skew-x-[-20deg]" />
                    <span className="relative z-10 flex items-center justify-center p-1.5 bg-white/20 backdrop-blur-md rounded-full group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <BookOpen className="w-4 h-4 text-white drop-shadow-md" />
                    </span>
                    <span className="relative z-10 drop-shadow-md text-white font-extrabold tracking-widest">SAHITHYAMALSARAM</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Block: Magnificent Centerpiece Showcase of the Community group photo */}
          <div className="lg:col-span-6 flex flex-col justify-center items-center relative w-full gap-5">
            
            {/* The Cinematic community card with golden luxury frames */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[1.4] md:aspect-[1.5] lg:aspect-[1.35] border-[3.5px] border-amber-400 rounded-[32px] overflow-hidden shadow-2xl p-1 bg-white transform -rotate-1 hover:rotate-0 hover:scale-[1.01] transition-all duration-700 ease-out z-10 group/hero-frame">
              
              {/* Internal container with borders and live gradient layouts */}
              <div className="w-full h-full rounded-[26px] overflow-hidden bg-stone-950 relative border border-amber-150/50">
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent z-10 pointer-events-none" />
                
                <img
                  src={groupPhotoImg}
                  alt="CML Kaliyar Mekhala Community Group at Jai Rani"
                  className="w-full h-full object-cover object-center relative z-0 transform group-hover/hero-frame:scale-[1.03] transition duration-1000 ease-out"
                  referrerPolicy="no-referrer"
                />

                {/* Floating landmark information card in bottom left overlay */}
                <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1 bg-stone-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-sans font-black text-white uppercase tracking-wider leading-none">
                      chosen leaders meet
                    </span>
                  </div>
                  <span className="text-[8.5px] font-mono text-stone-400 leading-none uppercase">
                    venue: Jai Rani Public School, Kaliyar
                  </span>
                </div>

                {/* Parish statistics badge overlaid inside the image card */}
                <div className="absolute top-4 right-4 z-20 bg-stone-950/90 backdrop-blur-md border border-amber-400/40 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-left">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400/50 bg-white p-0.5 flex items-center justify-center select-none">
                    <img
                      src={cmlLogoImg}
                      alt="CML Logo"
                      className="w-full h-full object-contain rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col leading-none select-none">
                    <span className="text-[11px] font-sans font-extrabold text-stone-200 tracking-wide">shakha</span>
                    <span className="text-[13px] font-sans font-black text-amber-400 mt-0.5 tracking-tight">13 active</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Streamlined Knowledge Hub & Quick-Fact Tabs */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10 relative">
        <div className="bg-[#FAF9F6] border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(44,42,38,0.03)] text-left relative overflow-hidden">
          
          {/* Subtle elegant background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/[0.02] rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/[0.02] rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Minimal Tab selector bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-rose-100/50 pb-6 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/5 via-amber-500/5 to-transparent blur-2xl -z-10 rounded-full" />
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-rose-100 to-rose-50 border border-rose-200/60 text-rose-700 rounded-2xl shrink-0 shadow-[0_4px_20px_rgba(225,29,72,0.15)] mt-0.5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <BookOpen className="w-6 h-6 text-rose-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-black text-rose-600 tracking-widest uppercase px-2 py-0.5 bg-rose-50 rounded-full border border-rose-100/80 shadow-5xs">CREED STUDY HUB</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)] animate-pulse" />
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-stone-900 leading-tight tracking-tight mt-0.5 bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-600">
                  Insight into Cherupushpa Mission League
                </h3>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-stone-200/60 w-full sm:w-auto shadow-sm">
              {[
                { id: 'pillars', label: 'Spiritual Pillars', icon: Flame },
                { id: 'history', label: 'History (1947)', icon: History },
                { id: 'patroness', label: 'Our Patron Saint', icon: Gift },
                { id: 'mekhala', label: 'Kaliyar Region', icon: Compass }
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeCmlTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCmlTab(tab.id)}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 border cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden ${
                      isActive
                        ? 'bg-rose-50/80 border-rose-200/80 text-rose-800 font-extrabold shadow-[0_2px_10px_rgba(225,29,72,0.1)] transform scale-[1.02]'
                        : 'bg-transparent border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50/80'
                    }`}
                  >
                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 to-amber-400/10" />}
                    <IconComp className={`w-4 h-4 transition-all duration-300 relative z-10 ${isActive ? 'text-rose-600 drop-shadow-sm' : 'text-stone-400 group-hover:text-stone-600'}`} />
                    <span className="whitespace-nowrap relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animated Tab container with extremely crisp summaries */}
          <div className="pt-6 min-h-[160px] flex items-center w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCmlTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {/* Tab: Pillars block */}
                {activeCmlTab === 'pillars' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                    {[
                      { 
                        title: 'Sneham (Love)', 
                        text: 'Personal prayer with Jesus expressed through genuine daily kindness to our neighborhood of families.', 
                        accent: 'from-rose-500 to-rose-600', 
                        bgAccent: 'bg-rose-50',
                        shadow: 'hover:shadow-[0_8px_30px_rgba(225,29,72,0.15)]',
                        iconBg: 'bg-rose-100',
                        iconColor: 'text-rose-600',
                        num: '01'
                      },
                      { 
                        title: 'Thyagam (Sacrifice)', 
                        text: 'Putting aside short-term desires (sweets, phone screens) to contribute to parish mission boxes.', 
                        accent: 'from-amber-500 to-amber-600', 
                        bgAccent: 'bg-amber-50',
                        shadow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]',
                        iconBg: 'bg-amber-100',
                        iconColor: 'text-amber-600',
                        num: '02'
                      },
                      { 
                        title: 'Sevanam (Service)', 
                        text: 'Vibrant involvement in parish Liturgy as altar servers, helpers for catechists, and cleanup volunteers.', 
                        accent: 'from-emerald-500 to-emerald-600', 
                        bgAccent: 'bg-emerald-50',
                        shadow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]',
                        iconBg: 'bg-emerald-100',
                        iconColor: 'text-emerald-600',
                        num: '03'
                      },
                      { 
                        title: 'Sahanam (Suffering)', 
                        text: 'Cheerfully taking corrections, daily study constraints, and physical chores following St. Thérèse\'s Little Way.', 
                        accent: 'from-sky-500 to-sky-600', 
                        bgAccent: 'bg-sky-50',
                        shadow: 'hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)]',
                        iconBg: 'bg-sky-100',
                        iconColor: 'text-sky-600',
                        num: '04'
                      }
                    ].map((p, idx) => (
                      <div 
                        key={idx} 
                        className={`group/pillar p-6 rounded-3xl border border-stone-200/70 bg-white/60 backdrop-blur-lg ${p.shadow} hover:-translate-y-1 hover:border-stone-300 transition-all duration-500 flex flex-col gap-4 relative overflow-hidden`}
                      >
                        {/* Dynamic Top line accent */}
                        <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${p.accent} transform origin-left scale-x-0 group-hover/pillar:scale-x-100 transition-transform duration-500`} />
                        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${p.accent} opacity-30`} />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-black text-stone-400 tracking-widest bg-stone-100 px-2.5 py-1 rounded-md group-hover/pillar:bg-stone-200 transition-colors">PILLAR {p.num}</span>
                          <div className={`w-8 h-8 rounded-full ${p.iconBg} flex items-center justify-center opacity-0 transform translate-x-4 group-hover/pillar:opacity-100 group-hover/pillar:translate-x-0 transition-all duration-300 delay-100`}>
                            <Flame className={`w-4 h-4 ${p.iconColor}`} />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                          <h4 className="font-display font-extrabold text-base text-stone-900 group-hover/pillar:text-stone-950 transition-colors">
                            {p.title}
                          </h4>
                          <p className="text-stone-600 text-xs leading-relaxed font-semibold">
                            {p.text}
                          </p>
                        </div>
                        {/* Hover glow effect in the background */}
                        <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-r ${p.accent} opacity-0 group-hover/pillar:opacity-10 blur-2xl transition-opacity duration-500 pointer-events-none`} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: History block */}
                {activeCmlTab === 'history' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch animate-fade-in relative z-10">
                    <div className="lg:col-span-7 flex flex-col justify-between gap-6 relative">
                      <div className="absolute -inset-4 bg-rose-500/5 blur-3xl -z-10 rounded-full pointer-events-none" />
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 shadow-sm">
                            <History className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[11px] font-mono font-black tracking-widest text-rose-600 uppercase">Vibrant Legacy since 1947</span>
                        </div>
                        <h4 className="font-display font-black text-2xl sm:text-3xl text-stone-900 leading-tight">
                          An Apostolic Lay Spark <br className="hidden sm:block" />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600">In Kerala</span>
                        </h4>
                        <p className="text-stone-600 text-sm leading-relaxed font-semibold max-w-xl">
                          Formed in the sacred halls of Bharananganam shrine in 1947, right under the spiritual aegis of Saint Alphonsa, the Cherupushpa Mission League (CML) was pioneered to foster lay leadership and apostolic fire in younger generations. It has grown exponentially to become Asia's largest youth lay spiritual movement, counting over 2 million vibrant missionary apostles today.
                        </p>
                      </div>

                      {/* Timeline flow highlights */}
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        {[
                          { year: '1947', label: 'Founded', color: 'from-rose-500 to-rose-600' },
                          { year: '2M+', label: 'Apostles', color: 'from-amber-500 to-amber-600' },
                          { year: "Asia's #1", label: 'Lay Movement', color: 'from-indigo-500 to-indigo-600' }
                        ].map((stat, i) => (
                          <div key={i} className="group flex flex-col p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-stone-200/60 hover:bg-white hover:border-stone-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <span className={`text-transparent bg-clip-text bg-gradient-to-br ${stat.color} font-display font-black text-xl sm:text-2xl drop-shadow-sm`}>{stat.year}</span>
                            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-5 group relative p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 border border-stone-700 flex flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(225,29,72,0.15)]">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -z-10 group-hover:bg-rose-500/20 transition-colors duration-700" />
                      <div className="absolute -bottom-10 -right-4 text-stone-700/30 pointer-events-none select-none font-display font-black text-9xl transform -rotate-6 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                        1947
                      </div>
                      
                      <div className="flex flex-col gap-4 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-px bg-rose-500/50" />
                          <h5 className="font-display font-extrabold text-xs uppercase tracking-widest text-rose-300">Honorary Founders</h5>
                        </div>
                        
                        <div className="space-y-4 text-stone-200">
                          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
                            <div className="w-12 h-12 rounded-full border-2 border-rose-400/50 shadow-inner shrink-0 bg-stone-100 flex items-center justify-center text-stone-400">
                              <UserCheck className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                              <p className="font-black text-sm text-white leading-tight">Fr. Joseph Maliparambil</p>
                              <p className="text-[11px] text-rose-200 font-semibold mt-0.5 tracking-wide">Founding Spiritual Director</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
                            <div className="w-12 h-12 rounded-full border-2 border-amber-400/50 shadow-inner shrink-0 bg-stone-100 flex items-center justify-center text-stone-400">
                              <UserCheck className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                              <p className="font-black text-sm text-white leading-tight">Mr. P.C. Abraham (Kunjettan)</p>
                              <p className="text-[11px] text-amber-200 font-semibold mt-0.5 tracking-wide">Pioneering Lay Apostle</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
                            <img src={saintLittleFlowerImg} alt="Saint Alphonsa" className="w-12 h-12 rounded-full object-cover object-top border-2 border-sky-400/50 shadow-inner shrink-0 bg-white" />
                            <div className="flex flex-col">
                              <p className="font-black text-sm text-white leading-tight">Saint Alphonsa</p>
                              <p className="text-[11px] text-sky-200 font-semibold mt-0.5 tracking-wide">Spiritual Mother</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Patroness block */}
                {activeCmlTab === 'patroness' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-center">
                    <div className="md:col-span-4 flex items-center justify-center">
                      <div className="relative p-1.5 bg-white border border-stone-200 shadow-xs rounded-2xl flex items-center justify-center shrink-0 w-60 h-60 transform -rotate-1 hover:rotate-0 transition-transform duration-300 overflow-hidden">
                        <img
                          src="/src/assets/images/saint_little_flower_1780503586974.png"
                          alt="Saint Thérèse of Lisieux"
                          className="w-full h-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-1.5 rounded-xl border border-dashed border-rose-200/40 pointer-events-none" />
                        <span className="absolute bottom-1.5 font-mono text-[8px] font-black uppercase text-rose-800 tracking-widest bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-stone-250 shadow-3xs">
                          Lisieux
                        </span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-8 flex flex-col gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Universal Missionary Patroness</span>
                        </div>
                        <h4 className="font-display font-black text-base sm:text-lg text-stone-900 mt-0.5">
                          Saint Thérèse of Lisieux (Our Co-Patroness)
                        </h4>
                      </div>
                      
                      <blockquote className="border-l-3 border-rose-500 pl-3 italic text-stone-750 text-xs sm:text-[13.5px] font-semibold leading-relaxed bg-stone-50 py-2 pr-2 rounded-r-xl">
                        "My vocation is love! In the heart of the Church, my mother, I will be love."
                      </blockquote>
                      
                      <p className="text-stone-600 text-xs leading-relaxed font-semibold">
                        Though she spent her short life cloistered behind Carmel walls in France, Saint Thérèse offered intensive spiritual sacrifices and small daily acts of love for missionaries. CML children replicate this beautiful **"Little Way"** to achieve high spiritual merits in God's eyes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab: Mekhala regional data block */}
                {activeCmlTab === 'mekhala' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center">
                    <div className="lg:col-span-7 flex flex-col gap-3">
                      <div className="flex items-center gap-1.5 text-rose-700">
                        <Compass className="w-4 h-4" />
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase">kaliyar mekhala</span>
                      </div>
                      <h4 className="font-display font-black text-base sm:text-lg text-stone-900">
                        Kaliyar Region (Mekhala) Coordination Hub
                      </h4>
                      <p className="text-stone-600 text-xs sm:text-[13px] leading-relaxed font-semibold">
                        Representing the Kothamangalam diocese context, the Kaliyar Mekhala (Region) serves as a core active summit coordinator. It bridges parish units together—running academic/spiritual study summits, literary Sahithyamalsaram contests, parish youth sports/Kalolsavams, and missionary support collections (CML missionary box) to mold the next generation of lay leaders.
                      </p>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-3 gap-3">
                      {[
                        { value: '11', label: 'Parish Units', desc: 'Active assemblies', color: 'from-rose-500 to-rose-600' },
                        { value: '2.5k', label: 'Apostles', desc: 'Young volunteers', color: 'from-amber-500 to-amber-600' },
                        { value: '100%', label: 'Commitment', desc: 'Spiritual zeal', color: 'from-emerald-500 to-emerald-600' }
                      ].map((item, id) => (
                        <div 
                          key={id} 
                          className="p-4 bg-white border border-stone-200 hover:border-stone-300 rounded-2xl text-center flex flex-col justify-between shadow-5xs hover:shadow-2xs transition-all duration-300 relative overflow-hidden group/mek"
                        >
                          <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.color}`} />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-stone-900 font-display font-black text-base sm:text-lg block group-hover/mek:scale-105 transition-transform duration-300">
                              {item.value}
                            </span>
                            <span className="text-[10px] text-stone-850 font-black leading-tight">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-[8px] text-stone-400 font-bold uppercase tracking-wider block mt-1.5">
                            {item.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* Parish Units Carousel Grid preview */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 z-10 relative">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between border-b border-stone-200/60 pb-2 text-left">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-rose-700 uppercase tracking-widest block mb-0.5">Parish Folders</span>
              <h3 className="font-sans font-black text-lg text-stone-900 tracking-tight leading-none">
                Our Active Parish Units
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('units')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-850 transition flex items-center gap-0.5 cursor-pointer hover:underline"
            >
              All Units <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {units.slice(0, 3).map((un) => (
              <div
                key={un.id}
                className="bg-white rounded-3xl border border-stone-200/60 shadow-3xs overflow-hidden flex flex-col justify-between hover:border-stone-300 transition duration-300 group/u"
              >
                <div className="h-32 bg-stone-950 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/10 to-transparent z-10" />
                  <img
                    alt={un.name}
                    src={un.bgPhoto}
                    className="w-full h-full object-cover opacity-60 absolute inset-0 z-0 transform group-hover/u:scale-102 transition duration-500"
                  />
                  <div className="absolute bottom-3 left-3 z-20 text-left">
                    <span className="text-[8px] uppercase font-bold text-amber-200 bg-stone-900/50 border border-stone-700 px-1.5 py-0.5 rounded">
                      Patron: {un.patronSaint}
                    </span>
                    <h4 className="font-sans font-black text-xs sm:text-sm text-white mt-0.5 dropdown-glow-amber">
                      {un.name}
                    </h4>
                  </div>
                </div>
                <div className="p-3.5 flex flex-col gap-3 flex-1 text-left justify-between bg-[#fcfbfa]/50">
                  <p className="text-[11px] text-stone-400 leading-normal line-clamp-2">
                    {un.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conclave Event Timeline Calendar ribbon and downloads */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Upcoming Event card Conclaved (7 cols) */}
          <div className="md:col-span-7 bg-rose-950 text-white rounded-3xl p-5.5 shadow-4xs relative overflow-hidden flex flex-col justify-between gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-stone-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex flex-col text-left">
              <span className="text-[8.5px] font-bold text-amber-400 tracking-widest font-mono">CALENDAR OF GRACE</span>
              <h3 className="font-sans font-black text-base sm:text-lg text-white mt-0.5">Upcoming Mekhala summits</h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {nextEvents.length === 0 ? (
                <div className="p-3 bg-rose-900/20 border border-rose-800 rounded-xl text-center text-xs text-rose-100/60 font-semibold">
                  No upcoming summits or meetings mapped yet. Check back soon!
                </div>
              ) : (
                nextEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-stone-900/30 border border-stone-800/80 rounded-2xl flex gap-3 items-center text-left"
                  >
                    <div className="bg-amber-400 text-stone-900 font-mono p-1 rounded-xl flex flex-col items-center justify-center shrink-0 w-11 h-11 border border-amber-300">
                      <span className="text-sm font-black leading-none mt-0.5">{ev.date.split('-')[2] || ev.date}</span>
                      <span className="text-[7.5px] uppercase font-extrabold leading-none mt-1">Conclave</span>
                    </div>
                    <div className="flex flex-col leading-tight flex-1">
                      <h4 className="font-extrabold text-[12.5px] text-white line-clamp-1">{ev.title}</h4>
                      <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">{ev.description}</p>
                      <div className="flex items-center gap-2 text-[8.5px] text-amber-300 font-bold mt-1">
                        <span>📍 {ev.venue}</span>
                        <span>•</span>
                        <span>🕒 {ev.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setActiveTab('events')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[10px] tracking-wide uppercase rounded-xl transition duration-150 self-start cursor-pointer shadow-3xs"
            >
              Show Full Calendar
            </button>
          </div>

          {/* Quick downloads folder widget (5 cols) */}
          <div className="md:col-span-5 bg-stone-900 text-stone-200 rounded-3xl p-5.5 shadow-4xs border border-stone-800 flex flex-col justify-between text-left gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400 text-stone-950 rounded-xl shrink-0 shadow-sm">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-extrabold text-xs sm:text-sm text-white">Guidelines & Forms</h4>
                <span className="text-[9.5px] text-stone-400">Official circulars folder</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              Instantly access and import registration templates, calendar copies, list declarations, and liturgical guides.
            </p>

            <button
              onClick={() => setActiveTab('downloads')}
              className="w-full mt-1.5 py-2.5 bg-stone-800 hover:bg-stone-750 border border-stone-700 text-amber-400 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <Download className="w-4 h-4 text-amber-450" />
              Open Downloads Catalog
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
