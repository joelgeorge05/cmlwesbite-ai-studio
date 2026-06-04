/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Heart, Award, MapPin, Calendar, Compass, ExternalLink } from 'lucide-react';
import { PortalSettings } from '../types';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  settings: PortalSettings;
}

export default function Footer({ setActiveTab, settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 font-sans mt-auto">
      {/* Upper footer */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Brand details */}
        <div className="flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <h4 className="font-sans font-bold text-slate-100 text-base tracking-wide">
              CML KALIYAR MEKHALA
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
            The largest association for Catholic children and lay missionaries in Asia. Dedicated to spiritual formation and church growth in Kaliyar region parishes.
          </p>
          <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold pt-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Motto: Love • Sacrifice • Service • Suffering</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-3 text-left">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Useful Navs</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <button onClick={() => setActiveTab('home')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <Compass className="w-3 h-3" /> Home Overview
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('bearers')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Active Office Bearers
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('units')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Find Parish Units
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('events')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Mekhala Kalolsavam 2026
              </button>
            </li>
          </ul>
        </div>

        {/* Resources / Links */}
        <div className="flex flex-col gap-3 text-left">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Resources</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <button onClick={() => setActiveTab('downloads')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> Diocesan Circulars
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('downloads')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> Download Form templates
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('gallery')} className="hover:text-rose-400 transition flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> Historical Photo Albums
              </button>
            </li>
          </ul>
        </div>

        {/* Support contacts */}
        <div className="flex flex-col gap-3 text-left">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Contact Mekhala</h4>
          <p className="text-xs text-slate-500 leading-normal mb-1">
            Registered Head Office, Cherupushpa Mission League Forane Command Desk, Kaliyar P.O, Kerala, India.
          </p>
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-slate-400">⚡ Support Desk:</span>
            <a href={`tel:${settings.supportDesk}`} className="text-amber-500 font-mono hover:underline">{settings.supportDesk}</a>
          </div>
          <div className="flex flex-col gap-1 text-xs mt-1">
            <span className="text-slate-400">✉️ Email:</span>
            <a href={`mailto:${settings.email}`} className="text-rose-400 font-mono hover:underline text-xs">{settings.email}</a>
          </div>
        </div>
      </div>

      {/* Sub-footer banner */}
      <div className="w-full border-t border-slate-900 bg-slate-950 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 text-center sm:text-left">
            © {currentYear} CML Kaliyar Mekhala. Proudly registered under Syro Malabar Catholic Diocese Kothamangalam.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-slate-600">
            <span>Designed in Kerala</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Award className="w-3 h-3 text-amber-500" />
              Snehahm, Thyagam, Sevanam, Sahanam
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
