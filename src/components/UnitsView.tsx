/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Phone, ExternalLink, Heart, Layers, Eye } from 'lucide-react';
import { ParishUnit } from '../types';

interface UnitsViewProps {
  units: ParishUnit[];
}

export default function UnitsView({ units }: UnitsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<ParishUnit | null>(null);

  const filteredUnits = units.filter((un) =>
    un.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    un.patronSaint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-50 py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 text-left">
        
        {/* Page title and description */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-widest">
            <MapPin className="w-4 h-4" /> Regional Compositions
          </div>
          <h2 className="font-sans font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
            Parish Units Directory
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
            Detailed lists of our active local branches located throughout parishes on the diocese borders. View patron saints, members strength and local coordinators.
          </p>
        </div>



        {/* Primary directory grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {filteredUnits.map((un) => (
            <div
              key={un.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col group hover:border-slate-300 hover:shadow-md transition text-left"
            >
              {/* Cover header block */}
              <div role="img" aria-label={un.name} className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent z-10"></div>
                <img
                  src={un.bgPhoto}
                  alt={un.name}
                  className="w-full h-full object-cover absolute inset-0 z-0 opacity-70 scale-102 transform group-hover:scale-105 transition duration-500"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-slate-950/70 border border-slate-700 px-2 py-0.5 rounded shadow">
                    Patroness: {un.patronSaint}
                  </span>
                  <h4 className="font-sans font-bold text-base md:text-lg text-white mt-1 leading-snug">
                    {un.name}
                  </h4>
                </div>
              </div>

                {/* Description & coordinators details */}
                <div className="p-5 flex flex-col gap-4 flex-1">
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {un.description}
                </p>

                {(un.directorName || un.presidentName) && (
                  <div className="flex flex-col gap-1.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {un.directorName && (
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Director</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-slate-800 text-xs font-black truncate">{un.directorName}</span>
                          {un.directorPhone && (
                            <a href={`tel:${un.directorPhone}`} className="text-rose-600 hover:text-rose-800 shrink-0 font-bold font-mono text-[9px] bg-rose-50 px-1.5 py-0.5 rounded shadow-2xs border border-rose-100">
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    {un.presidentName && (
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-[10px] uppercase font-mono font-bold text-slate-400">President</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-slate-800 text-xs font-black truncate">{un.presidentName}</span>
                          {un.presidentPhone && (
                            <a href={`tel:${un.presidentPhone}`} className="text-rose-600 hover:text-rose-800 shrink-0 font-bold font-mono text-[9px] bg-rose-50 px-1.5 py-0.5 rounded shadow-2xs border border-rose-100">
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}



                {/* Footer unit contact click */}
                <div className="flex items-center justify-between gap-4 mt-2 pt-3 border-t border-slate-100 border-dashed">
                  <span className="text-[10px] text-slate-400 font-semibold truncate select-all">
                    📞 {un.contactNumber}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${un.contactNumber}`}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition"
                      title="Call Unit Administrator"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setSelectedUnit(un)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg transition"
                    >
                      <Eye className="w-3 h-3 text-amber-400" /> Inspect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Modal Drawer for detailed parish inspection */}
        {selectedUnit && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl relative text-left animate-scale-up">
              
              <div role="img" aria-label={selectedUnit.name} className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent z-10"></div>
                <img
                  src={selectedUnit.bgPhoto}
                  alt={selectedUnit.name}
                  className="w-full h-full object-cover absolute inset-0 z-0 opacity-70"
                />
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="absolute top-4 right-4 p-1.5 bg-slate-900/80 hover:bg-slate-950 rounded-full text-slate-300 hover:text-white border border-slate-700 font-bold z-20"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="text-[9px] uppercase font-bold text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded shadow">
                    Saint: {selectedUnit.patronSaint}
                  </span>
                  <h3 className="font-sans font-black text-lg text-white mt-1 leading-snug">
                    {selectedUnit.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unit Profile Description</h5>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {selectedUnit.description}
                  </p>
                </div>



                {(selectedUnit.directorName || selectedUnit.presidentName) && (
                  <div className="flex flex-col gap-2 pt-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unit Leadership</h5>
                    <div className="flex flex-col gap-2">
                      {selectedUnit.directorName && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] uppercase font-bold text-slate-400">CML Director</span>
                            <span className="text-xs font-black text-slate-900 mt-0.5">{selectedUnit.directorName}</span>
                          </div>
                          {selectedUnit.directorPhone && (
                            <a
                              href={`tel:${selectedUnit.directorPhone}`}
                              className="px-2.5 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 rounded-xl transition text-[10px] font-mono font-black"
                            >
                              📞 {selectedUnit.directorPhone}
                            </a>
                          )}
                        </div>
                      )}
                      
                      {selectedUnit.presidentName && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] uppercase font-bold text-slate-400">CML President</span>
                            <span className="text-xs font-black text-slate-900 mt-0.5">{selectedUnit.presidentName}</span>
                          </div>
                          {selectedUnit.presidentPhone && (
                            <a
                              href={`tel:${selectedUnit.presidentPhone}`}
                              className="px-2.5 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 rounded-xl transition text-[10px] font-mono font-black"
                            >
                              📞 {selectedUnit.presidentPhone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 border-dashed pt-4 flex sm:flex-row flex-col justify-between items-center gap-3">
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Direct Hotline Desk</span>
                    <span className="text-xs font-semibold text-slate-700 mt-1 select-all">{selectedUnit.contactNumber}</span>
                  </div>
                  <a
                    href={`tel:${selectedUnit.contactNumber}`}
                    className="w-full sm:w-auto px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px] rounded-xl shadow-xs transition text-center"
                  >
                    📞 Call coordinator
                  </a>
                </div>
              </div>
              
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
