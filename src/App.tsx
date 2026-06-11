/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import HistoryView from './components/HistoryView';
import OfficeBearersView from './components/OfficeBearersView';
import UnitsView from './components/UnitsView';
import GalleryView from './components/GalleryView';
import EventsView from './components/EventsView';
import NewsAnnouncementsView from './components/NewsAnnouncementsView';
import DownloadsView from './components/DownloadsView';
import AdminDashboard from './components/AdminDashboard';
import KalolsavamView from './components/KalolsavamView';
import SahithyamalsaramView from './components/SahithyamalsaramView';
import ChosenView from './components/ChosenView';
import { ShieldCheck, Lock, Activity, KeyRound } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return window.location.pathname === '/admin' ? 'admin' : 'home';
  });
  const [loading, setLoading] = useState(true);
  
  // Database State
  const [dbData, setDbData] = useState<any>({
    settings: {
      supportDesk: '+91 94470 12345',
      email: 'cmlkaliyarmekhala@gmail.com',
      mottoPrimary: 'സ്നേഹം • ത്യാഗം',
      mottoSecondary: 'സേവനം • സഹനം',
      heroIntro: 'ഓരോ പ്രവൃത്തിയിലൂടെയും മിഷനറി ചൈതന്യം പകർന്നുനൽകിക്കൊണ്ട് നമുക്ക് വിശ്വാസത്തിന്റെ ഒരു കൂട്ടായ്മ പടുത്തുയർത്താം.',
      parishUnitsCount: 11
    },
    announcements: [],
    news: [],
    officeBearers: [],
    units: [],
    events: [],
    galleryAlbums: [],
    galleryImages: [],
    downloads: [],
    logs: [],
    results: [],
    chosenRegistrations: [],
    registrations: [],
    competitionStatuses: {}
  });

  // Admin Session States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Load from Express persistent server on boot
  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.settings) {
          setDbData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to link Express background persistent database:', err);
        setLoading(false);
      });
  }, []);

  // Handle Login submission
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Invalid authentication credentials specified!');
        }
        return res.json();
      })
      .then((resData) => {
        if (resData.success) {
          setIsAdminLoggedIn(true);
          setCurrentUser(resData.user);
          setActiveTab('admin');
          setLoginEmail('');
          setLoginPassword('');
        }
      })
      .catch((err) => {
        setLoginError(err.message || 'Incorrect email or password combination.');
      });
  };

  // Handle Admin Logout action
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('home');
  };

  // Handle persistent save database action over REST API post
  const handleSaveDatabase = async (updatedData: any, action: string, target: string) => {
    try {
      const res = await fetch('/api/save-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedData,
          userEmail: currentUser?.email || 'System Seed',
          action,
          target
        })
      });
      if (res.ok) {
        setDbData(updatedData);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to save to express disk:', e);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="animate-spin text-amber-500 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-widest uppercase text-amber-400">CML KALIYAR MEKHALA</span>
        <p className="text-xs text-slate-500 mt-1">Bootstrapping official persistent database files...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-800">
      
      {/* Universal header block with dynamic scrolling ribbon */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={dbData.settings}
        announcements={dbData.announcements}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleAdminLogout}
        onOpenAdmin={() => setActiveTab('admin')}
      />

      {/* Main Dynamic Viewport router */}
      <main className="flex-1 w-full flex flex-col">
        {activeTab === 'home' && (
          <HomeView
            settings={dbData.settings}
            announcements={dbData.announcements}
            news={dbData.news}
            bearers={dbData.officeBearers}
            units={dbData.units}
            events={dbData.events}
            albums={dbData.galleryAlbums}
            downloads={dbData.downloads}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'bearers' && <OfficeBearersView bearers={dbData.officeBearers} />}

        {activeTab === 'units' && <UnitsView units={dbData.units} />}

        {activeTab === 'history' && <HistoryView />}

        {activeTab === 'gallery' && (
          <GalleryView albums={dbData.galleryAlbums} images={dbData.galleryImages} />
        )}

        {activeTab === 'events' && <EventsView events={dbData.events} />}

        {activeTab === 'news' && (
          <NewsAnnouncementsView news={dbData.news} announcements={dbData.announcements} />
        )}

        {activeTab === 'downloads' && <DownloadsView downloads={dbData.downloads} />}

        {activeTab === 'kalolsavam' && (
          <KalolsavamView
            dbData={dbData}
            isAdminLoggedIn={isAdminLoggedIn}
            onSaveDatabase={handleSaveDatabase}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'sahithyamalsaram' && (
          <SahithyamalsaramView
            dbData={dbData}
            isAdminLoggedIn={isAdminLoggedIn}
            onSaveDatabase={handleSaveDatabase}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'chosen' && (
          <ChosenView
            dbData={dbData}
            onSaveDatabase={handleSaveDatabase}
          />
        )}

        {/* ADMIN TAB LAYER */}
        {activeTab === 'admin' && (
          <>
            {isAdminLoggedIn ? (
              <AdminDashboard
                dbData={dbData}
                currentUser={currentUser}
                onSaveDatabase={handleSaveDatabase}
              />
            ) : (
              /* High Fidelity Login Gateway */
              <div className="w-full min-h-[500px] bg-slate-900 py-16 px-4 flex items-center justify-center animate-fade-in text-left">
                <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                  
                  {/* Glowing upper blur bubble */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-rose-500/10 blur-2xl index-0"></div>

                  <div className="flex flex-col items-center gap-4 text-center relative z-10">
                    <div className="p-3 bg-rose-950 text-rose-500 border border-rose-900 rounded-2xl">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-widest block mb-1">Mekhala Admin Console</span>
                      <h4 className="font-sans font-black text-white text-lg tracking-tight">Authority Security Shield</h4>
                    </div>

                    {loginError && (
                      <div className="w-full p-3 bg-rose-950/40 border border-rose-900 text-rose-300 text-[11px] rounded-xl font-bold text-left animate-shake leading-normal">
                        ⚠️ error: {loginError}
                      </div>
                    )}

                    <form onSubmit={handleAdminLogin} className="w-full flex flex-col gap-4 text-left text-xs mt-3">
                      <div className="flex flex-col gap-1.5 label text-slate-400">
                        <label className="font-bold">Credential Username Email</label>
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="admin@cmlkaliyar.org"
                          className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-rose-500 transition font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 label text-slate-400">
                        <label className="font-bold">Security Master Password</label>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••••"
                          className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-rose-500 transition"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-lg mt-2 transition"
                      >
                        Authorize & Login
                      </button>
                    </form>

                    {/* Quick Access Roles Guide list */}
                    <div className="border-t border-slate-900 pt-4 mt-2 w-full text-[10px] text-slate-500 leading-tight">
                      <span className="font-bold text-slate-400 block mb-1">Console Access Logins:</span>
                      <div className="flex flex-col gap-1">
                        <div>🔑 Admin: admin@cmlkaliyar.org / CMLKaliyar#2026</div>
                        <div>🔑 Editor: editor@cmlkaliyar.org / CML</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Universal footer block */}
      <Footer setActiveTab={setActiveTab} settings={dbData.settings} />
    </div>
  );
}
