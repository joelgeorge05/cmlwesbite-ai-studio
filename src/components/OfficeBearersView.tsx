/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  MapPin, 
  Home, 
  Search, 
  Award, 
  Mail, 
  Sparkles, 
  Clock, 
  Copy, 
  Check, 
  X, 
  ExternalLink,
  Filter,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OfficeBearer } from '../types';

interface OfficeBearersViewProps {
  bearers: OfficeBearer[];
}

export default function OfficeBearersView({ bearers }: OfficeBearersViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBearer, setSelectedBearer] = useState<OfficeBearer | null>(null);

  // Filter bearers based on classification criteria
  const classifiedBearers = useMemo(() => {
    return bearers.map(b => {
      const designationLower = b.designation.toLowerCase();
      let category: 'spiritual' | 'executive' | 'others' = 'others';
      
      if (designationLower.includes('director') || designationLower.includes('priest') || designationLower.includes('sister')) {
        category = 'spiritual';
      } else if (
        designationLower.includes('president') || 
        designationLower.includes('secretary') || 
        designationLower.includes('organizer') || 
        designationLower.includes('treasurer')
      ) {
        category = 'executive';
      }
      
      return { ...b, category };
    });
  }, [bearers]);

  // Apply search query and category filters
  const filteredBearers = useMemo(() => {
    return classifiedBearers.slice().sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [classifiedBearers]);

  // Copy contact credentials to clipboard
  const handleCopyCard = (e: React.MouseEvent, ob: OfficeBearer) => {
    e.stopPropagation();
    const info = `Name: ${ob.name}\nDesignation: ${ob.designation}\nPhone: ${ob.contact}\nEmail: ${ob.email || 'N/A'}\nUnit: ${ob.unit || 'Kaliyar Mekhala'}`;
    navigator.clipboard.writeText(info).then(() => {
      setCopiedId(ob.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="w-full bg-[#fcf9f5] min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative backglow backgrounds matching existing design tokens */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Title Presentation Block */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 border border-rose-100 rounded-full shadow-3xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-rose-800 tracking-widest uppercase">
              Official Leadership Council
            </span>
          </div>
          
          <h2 className="font-serif font-black text-3.5xl sm:text-4xl md:text-5xl text-slate-900 tracking-tight leading-none">
            Mekhala Board Directory
            <span className="block mt-2 font-sans font-black text-rose-600 text-lg sm:text-2xl tracking-normal">
              Dedicated Ministry • Servant Leaders
            </span>
          </h2>
          
          <p className="text-slate-600 text-xs sm:text-sm font-semibold max-w-xl">
            Meet the central administrative committee, spiritual guardians, and youth organizers guiding Cherupushpa Mission League's vision across the region.
          </p>
        </div>

        {/* Directory Card Shelf */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBearers.map((ob, idx) => {
            const isSpiritual = ob.category === 'spiritual';
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.4) }}
                key={ob.id || idx}
                onClick={() => setSelectedBearer(ob)}
                className={`bg-white rounded-[24px] border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group shadow-sm hover:-translate-y-1 cursor-pointer ${
                  isSpiritual 
                    ? 'border-amber-250 ring-2 ring-amber-500/5 hover:border-amber-450 hover:shadow-md' 
                    : 'border-slate-150 hover:border-rose-300 hover:shadow-md'
                }`}
              >
                {/* Visual Status Stripes */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${isSpiritual ? 'bg-amber-400' : 'bg-rose-500'}`} />

                <div className="p-5 flex flex-col gap-5 text-left">
                  
                  {/* Photo Headliner Frame */}
                  <div className="flex items-center gap-4">
                    <div className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 select-none pointer-events-none ${
                      isSpiritual ? 'border-amber-200' : 'border-slate-100'
                    }`}>
                      <img
                        src={ob.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={ob.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <h3 className="font-serif font-black text-rose-955 text-base leading-tight truncate group-hover:text-rose-700 transition" title={ob.name}>
                        {ob.name}
                      </h3>
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-black tracking-wide uppercase rounded-md w-fit ${
                        isSpiritual 
                          ? 'bg-amber-50 text-amber-900 border border-amber-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {ob.designation}
                      </span>
                    </div>
                  </div>

                  {/* Highlight Coordinates Sheet */}
                  <div className="flex flex-col gap-2.5 pt-3.5 border-t border-dashed border-slate-150 text-[11px] font-semibold text-slate-700">
                    
                    {/* Unit field */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-mono uppercase text-slate-400 font-extrabold tracking-wider leading-none mb-0.5">Parish Unit</span>
                        <span className="text-slate-900 text-xs font-extrabold leading-none truncate">{ob.unit || 'Kaliyar Mekhala HQ'}</span>
                      </div>
                    </div>

                    {/* House Name */}
                    {ob.houseName && (
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 shrink-0">
                          <Home className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[8px] font-mono uppercase text-slate-400 font-extrabold tracking-wider leading-none mb-0.5">House Name</span>
                          <span className="text-slate-700 text-xs font-semibold leading-none truncate">{ob.houseName}</span>
                        </div>
                      </div>
                    )}

                    {/* Term Block */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-mono uppercase text-slate-400 font-extrabold tracking-wider leading-none mb-0.5">Service Term</span>
                        <span className="text-slate-750 font-black font-sans text-xs leading-none">{ob.servicePeriod || '2026 - Active'}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Communication Drawer */}
                <div className="px-5 pb-5 pt-1.5 flex gap-2">
                  <a
                    href={`tel:${ob.contact}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-rose-700 active:scale-98 text-white rounded-xl text-[10px] font-mono font-black tracking-wider uppercase transition-all duration-200 cursor-pointer"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  
                  <button
                    type="button"
                    onClick={(e) => handleCopyCard(e, ob)}
                    className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-500 rounded-xl transition cursor-pointer relative"
                    title="Copy Profile Details"
                  >
                    {copiedId === ob.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Empty Search Results Prompt */}
        {filteredBearers.length === 0 && (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-slate-200/85 shadow-sm max-w-lg mx-auto flex flex-col items-center gap-3">
            <span className="text-3xl">🧩</span>
            <h4 className="font-serif font-black text-rose-900 text-lg">No Officers Found</h4>
            <p className="text-slate-500 text-xs font-semibold max-w-xs leading-relaxed">
              No leadership committee members are currently listed in the directory database of the Mekhala.
            </p>
          </div>
        )}

      </div>

      {/* DETAILED EXPANSION DRAWER / PORTAL OVERLAY */}
      <AnimatePresence>
        {selectedBearer && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative border border-slate-100 text-left"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setSelectedBearer(null)}
                  className="p-2 bg-slate-900/60 hover:bg-slate-950/85 backdrop-blur-xs text-white rounded-full transition cursor-pointer shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Decorative Cover */}
              <div className="h-28 bg-gradient-to-r from-amber-600 via-rose-650 to-indigo-900 relative">
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
              </div>

              {/* Profile Main Body */}
              <div className="px-6 pb-6 pt-0 relative flex flex-col items-start text-left">
                
                {/* Floating Avatar */}
                <div className="relative -mt-16 w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-stone-50 mb-4">
                  <img
                    src={selectedBearer.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={selectedBearer.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Identity header */}
                <div className="flex flex-col gap-0.5 w-full">
                  <span className="text-[9px] font-mono font-black text-rose-600 uppercase tracking-widest">
                    CML Kaliyar Mekhala Board Member
                  </span>
                  <h3 className="font-serif font-black text-slate-900 text-2xl tracking-tight leading-tight mt-1">
                    {selectedBearer.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 w-full flex-wrap">
                    <span className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-100 text-[10px] font-black uppercase rounded-lg">
                      {selectedBearer.designation}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-stone-200 text-[10px] font-bold uppercase rounded-lg">
                      {selectedBearer.servicePeriod || 'Current Term'}
                    </span>
                  </div>
                </div>

                {/* Info Fields Shelf */}
                <div className="w-full mt-6 space-y-4 pt-4 border-t border-slate-100">
                  
                  {/* Parish Unit info */}
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-150 text-slate-400 shrink-0">
                      <MapPin className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-extrabold tracking-wider block">Office Parish Unit</span>
                      <span className="text-slate-900 text-sm font-extrabold">{selectedBearer.unit || 'Mekhala central headquarters'}</span>
                    </div>
                  </div>

                  {/* House Address info */}
                  {selectedBearer.houseName && (
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-150 text-slate-400 shrink-0">
                        <Home className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 font-extrabold tracking-wider block">Family House Address</span>
                        <span className="text-slate-800 text-sm font-semibold">{selectedBearer.houseName}</span>
                      </div>
                    </div>
                  )}

                  {/* Phone Line Coordinates */}
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-150 text-slate-400 shrink-0">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-extrabold tracking-wider block">Official Support Contact</span>
                      <span className="text-rose-950 text-sm font-black font-mono leading-none">{selectedBearer.contact}</span>
                    </div>
                  </div>

                  {/* Email Box Coordinates */}
                  {selectedBearer.email && (
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-150 text-slate-400 shrink-0">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 font-extrabold tracking-wider block">Digital Mailing Address</span>
                        <span className="text-slate-900 text-sm font-bold truncate block select-all">{selectedBearer.email}</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Interactive Action desk controls */}
                <div className="w-full flex gap-3 mt-8 pt-4 border-t border-slate-100">
                  <a
                    href={`tel:${selectedBearer.contact}`}
                    className="flex-1 py-3 text-center bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer shadow-sm shadow-rose-605/10 flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" /> Start Direct Call
                  </a>

                  {selectedBearer.email && (
                    <a
                      href={`mailto:${selectedBearer.email}`}
                      className="px-4 py-3 border border-slate-250 hover:bg-slate-50 hover:text-slate-950 text-slate-650 rounded-xl transition cursor-pointer flex items-center justify-center"
                      title="Send Email"
                    >
                      <Mail className="w-4.5 h-4.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      const info = `Name: ${selectedBearer.name}\nDesignation: ${selectedBearer.designation}\nPhone: ${selectedBearer.contact}\nUnit: ${selectedBearer.unit}`;
                      navigator.clipboard.writeText(info).then(() => {
                        setCopiedId(selectedBearer.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      });
                    }}
                    className="relative px-4 py-3 border border-slate-250 hover:bg-slate-50 text-slate-650 rounded-xl transition cursor-pointer flex items-center justify-center"
                    title="Copy Profile Info"
                  >
                    {copiedId === selectedBearer.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="w-full mt-4 text-center">
                  <span className="text-[9px] text-slate-400 font-mono tracking-wide uppercase">
                    Verification ID: {selectedBearer.id}
                  </span>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
