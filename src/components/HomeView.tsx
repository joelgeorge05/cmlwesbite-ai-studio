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

              {/* Beautiful clean high-contrast Quote card */}
              <div className="relative p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 shadow-xs max-w-xl lg:max-w-none mx-auto lg:mx-0 text-left overflow-hidden">
                <div className="absolute right-4 -bottom-6 text-7xl text-stone-200/40 font-serif pointer-events-none select-none z-0">
                  ”
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 via-amber-600 to-rose-600 rounded-l-full" />
                <p className="text-stone-800 text-base sm:text-lg font-bold font-anek leading-relaxed relative z-10 pl-2 tracking-wide">
                  "സഭയെ സ്നേഹിക്കുക ലോകത്തിൽ സാക്ഷികളാകുക"
                </p>
              </div>

            </div>

            <div className="flex flex-col gap-4 mt-2">
              {/* Clean CTA Button actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
                <button
                  onClick={() => setActiveTab('units')}
                  className="group w-full sm:w-auto px-8 py-3.5 bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-[12px] tracking-wider uppercase rounded-xl transition-all duration-300 transform active:scale-98 hover:shadow-lg hover:shadow-rose-900/20 flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 border border-rose-800"
                >
                  <span>Parish Units</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className="group w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-amber-500/40 text-stone-900 font-extrabold text-[12px] tracking-wider uppercase rounded-xl transition-all duration-300 transform active:scale-98 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                >
                  <span>Our Legacy</span>
                  <ArrowRight className="w-4 h-4 text-amber-500 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              {/* Minimal quick access badges with clean separation */}
              <div className="flex items-center gap-2.5 flex-wrap justify-center lg:justify-start pt-4 border-t border-stone-200/80 w-full border-dashed max-w-xl lg:max-w-none mx-auto lg:mx-0">
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest leading-none shrink-0 sm:mr-1 font-semibold">
                  QUICK PORTALS:
                </span>
                <button
                  id="portal-kalolsavam-btn"
                  onClick={() => setActiveTab('kalolsavam')}
                  className="group flex items-center gap-2 px-4 py-2 bg-rose-50/80 hover:bg-rose-100/90 border border-rose-200 hover:border-rose-350 text-rose-950 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95 hover:-translate-y-0.5 shadow-3xs"
                >
                  <span className="p-1 bg-white rounded-lg shadow-5xs border border-rose-100 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5 text-rose-600" />
                  </span>
                  <span>Kalolsavam Results</span>
                </button>
                <button
                  id="portal-sahithyamalsaram-btn"
                  onClick={() => setActiveTab('sahithyamalsaram')}
                  className="group flex items-center gap-2 px-4 py-2 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200 hover:border-amber-350 text-amber-950 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95 hover:-translate-y-0.5 shadow-3xs"
                >
                  <span className="p-1 bg-white rounded-lg shadow-5xs border border-amber-100 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  <span>Sahithyamalsaram</span>
                </button>
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
                    <span className="text-[11px] font-mono font-bold text-stone-300">shakha</span>
                    <span className="text-xs font-black text-amber-400 mt-0.5">13 active</span>
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
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-stone-200/60 pb-5">
            <div className="flex items-start gap-3">
              <div className="p-2 sm:p-2.5 bg-rose-50 border border-rose-100/80 text-rose-700 rounded-2xl shrink-0 shadow-5xs mt-0.5">
                <BookOpen className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black text-rose-700 tracking-wider">CREED STUDY HUB</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                </div>
                <h3 className="font-display font-black text-lg sm:text-xl text-stone-900 leading-tight tracking-tight mt-0.5">
                  Insight into Cherupushpa Mission League
                </h3>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100/80 rounded-2xl border border-stone-200/40 w-full sm:w-auto">
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
                    className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 border cursor-pointer flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-white border-stone-200 text-rose-800 font-extrabold shadow-sm transform scale-102'
                        : 'bg-transparent border-transparent text-stone-600 hover:text-stone-900 hover:bg-white/40'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-rose-600' : 'text-stone-400'}`} />
                    <span className="whitespace-nowrap">{tab.label}</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {[
                      { 
                        title: 'Sneham (Love)', 
                        text: 'Personal prayer with Jesus expressed through genuine daily kindness to our neighborhood of families.', 
                        accent: 'from-rose-500 to-rose-600', 
                        bg: 'bg-rose-500/[0.02]',
                        num: '01'
                      },
                      { 
                        title: 'Thyagam (Sacrifice)', 
                        text: 'Putting aside short-term desires (sweets, phone screens) to contribute to parish mission boxes.', 
                        accent: 'from-amber-400 to-amber-500', 
                        bg: 'bg-amber-500/[0.02]',
                        num: '02'
                      },
                      { 
                        title: 'Sevanam (Service)', 
                        text: 'Vibrant involvement in parish Liturgy as altar servers, helpers for catechists, and cleanup volunteers.', 
                        accent: 'from-emerald-500 to-emerald-600', 
                        bg: 'bg-emerald-500/[0.02]',
                        num: '03'
                      },
                      { 
                        title: 'Sahanam (Suffering)', 
                        text: 'Cheerfully taking corrections, daily study constraints, and physical chores following St. Thérèse\'s Little Way.', 
                        accent: 'from-sky-400 to-sky-500', 
                        bg: 'bg-sky-500/[0.02]',
                        num: '04'
                      }
                    ].map((p, idx) => (
                      <div 
                        key={idx} 
                        className={`group/pillar p-4.5 rounded-2xl border border-stone-200/60 ${p.bg} hover:bg-white hover:border-stone-300 hover:shadow-xs transition-all duration-300 flex flex-col gap-3 relative overflow-hidden`}
                      >
                        {/* Dynamic Top line accent and numbers */}
                        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${p.accent}`} />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-extrabold text-stone-400 tracking-wider">PILLAR {p.num}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-350 group-hover/pillar:scale-125 transition-transform" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <h4 className="font-display font-extrabold text-sm text-stone-900 group-hover/pillar:text-rose-900 transition-colors">
                            {p.title}
                          </h4>
                          <p className="text-stone-600 text-[11px] leading-relaxed font-semibold">
                            {p.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: History block */}
                {activeCmlTab === 'history' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
                    <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-rose-700">
                          <History className="w-4 h-4" />
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Vibrant Legacy since 1947</span>
                        </div>
                        <h4 className="font-display font-black text-base sm:text-lg text-stone-900 leading-tight">
                          An Apostolic Lay Spark In Kerala
                        </h4>
                        <p className="text-stone-600 text-xs sm:text-[13px] leading-relaxed font-semibold">
                          Formed in the sacred halls of Bharananganam shrine in 1947, right under the spiritual aegis of Saint Alphonsa, the Cherupushpa Mission League (CML) was pioneered to foster lay leadership and apostolic fire in younger generations. It has grown exponentially to become Asia's largest youth lay spiritual movement, counting over 2 million vibrant missionary apostles today.
                        </p>
                      </div>

                      {/* Timeline flow highlights */}
                      <div className="grid grid-cols-3 gap-3 border-t border-stone-200/60 pt-4 mt-1">
                        <div>
                          <span className="text-rose-700 font-mono font-black text-sm block">1947</span>
                          <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Founded</span>
                        </div>
                        <div>
                          <span className="text-rose-700 font-mono font-black text-sm block">2M+</span>
                          <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Apostles</span>
                        </div>
                        <div>
                          <span className="text-rose-700 font-mono font-black text-sm block">Asia's #1</span>
                          <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Lay Movement</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-gradient-to-br from-stone-55 to-stone-100/70 border border-stone-200/55 p-5 rounded-2xl flex flex-col justify-between shadow-5xs relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-stone-200 pointer-events-none select-none font-display font-black text-7xl opacity-40 animate-pulse">
                        1947
                      </div>
                      <div className="flex flex-col gap-2 relative z-10">
                        <h5 className="font-display font-bold text-xs uppercase tracking-wider text-rose-800">Honorary Founders</h5>
                        <div className="space-y-3 mt-1 text-stone-800">
                          <div className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                            <div>
                              <p className="font-bold text-xs text-stone-900 leading-none">Fr. Joseph Maliparambil</p>
                              <p className="text-[10px] text-stone-500 font-semibold mt-0.5">The Founding Spiritual Director</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="font-bold text-xs text-stone-900 leading-none">Mr. P.C. Abraham (Kunjettan)</p>
                              <p className="text-[10px] text-stone-500 font-semibold mt-0.5">Pioneering Lay Apostle & Leader</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-stone-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="font-bold text-xs text-stone-900 leading-none">Saint Alphonsa</p>
                              <p className="text-[10px] text-stone-500 font-semibold mt-0.5">Spiritual Mother & Guiding Inspiration</p>
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
