/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Settings,
  Users,
  MapPin,
  Calendar,
  Newspaper,
  Image,
  FileText,
  Activity,
  Plus,
  Trash,
  Edit,
  Save,
  CheckCircle,
  Database,
  Lock,
  Sparkles
} from 'lucide-react';
import {
  OfficeBearer,
  ParishUnit,
  CMLEvent,
  Announcement,
  NewsItem,
  GalleryAlbum,
  GalleryImage,
  DownloadItem,
  PortalSettings,
  ActivityLog,
  UserRole
} from '../types';

interface AdminDashboardProps {
  dbData: {
    settings: PortalSettings;
    announcements: Announcement[];
    news: NewsItem[];
    officeBearers: OfficeBearer[];
    units: ParishUnit[];
    events: CMLEvent[];
    galleryAlbums: GalleryAlbum[];
    galleryImages: GalleryImage[];
    downloads: DownloadItem[];
    logs: ActivityLog[];
    chosenRegistrations?: any[];
  };
  currentUser: { email: string; name: string; role: 'Super Admin' | 'Admin' | 'Editor' };
  onSaveDatabase: (updatedData: any, action: string, target: string) => Promise<boolean>;
}

export default function AdminDashboard({ dbData, currentUser, onSaveDatabase }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'bearers' | 'units' | 'events' | 'news' | 'announcements' | 'gallery' | 'downloads' | 'logs' | 'chosen'>('overview');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // States for CRUD / Form templates
  const [settingsForm, setSettingsForm] = useState<PortalSettings>({ ...dbData.settings });

  // Office bearer crud
  const [editingBearerId, setEditingBearerId] = useState<string | null>(null);
  const [bearerForm, setBearerForm] = useState<Partial<OfficeBearer>>({
    name: '', designation: '', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', contact: '', email: '', servicePeriod: '2025 - Present', houseName: '', unit: '', orderIndex: 0
  });

  // Unit crud
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitForm, setUnitForm] = useState<Partial<ParishUnit>>({
    name: '', patronSaint: '', contactNumber: '', bgPhoto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400', stats: { members: 100, families: 50, directorsCount: 2 }, description: '', orderIndex: 0, directorName: '', directorPhone: '', presidentName: '', presidentPhone: ''
  });

  // Event crud
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<Partial<CMLEvent>>({
    title: '', type: 'upcoming', date: '2026-07-04', time: '10:00 AM', venue: '', description: '', imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png', summary: ''
  });

  // News crud
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
    title: '', body: '', category: 'General', imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png', date: '2026-05-29', isFeatured: false
  });

  // Announcement crud
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState<Partial<Announcement>>({
    text: '', type: 'regular', date: '2026-05-29', isSticky: false
  });

  // Gallery album crud
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [albumForm, setAlbumForm] = useState<Partial<GalleryAlbum>>({
    title: '', category: 'Activities', description: '', coverImageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png'
  });

  // Gallery image crud
  const [imageForm, setImageForm] = useState<Partial<GalleryImage>>({
    albumId: dbData.galleryAlbums[0]?.id || '', title: '', imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600', createdAt: '2026-05-29'
  });

  // Download crud
  const [editingDownloadId, setEditingDownloadId] = useState<string | null>(null);
  const [downloadForm, setDownloadForm] = useState<Partial<DownloadItem>>({
    title: '', category: 'circular', fileSize: '1.2 MB', downloadUrl: '#', uploadDate: '2026-05-29', description: ''
  });

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const isEditorOnly = currentUser.role === 'Editor';

  const verifyPermission = () => {
    if (isEditorOnly && activeTab === 'settings') {
      triggerToast('Permission Denied: Editors cannot modify master portal settings!');
      return false;
    }
    return true;
  };

  // Helper endpoint poster
  const saveState = async (updated: typeof dbData, action: string, target: string) => {
    const success = await onSaveDatabase(updated, action, target);
    if (success) {
      triggerToast(`Successfully persisted database change: ${action}!`);
    } else {
      triggerToast('Server Connection Timeout: Failed to persist to file db.');
    }
  };

  // 1. Settings Save
  const handleSaveSettings = () => {
    if (!verifyPermission()) return;
    const updated = { ...dbData, settings: settingsForm };
    saveState(updated, 'UPDATE_SETTINGS', 'Portal Configurations');
  };

  // 2. Bearers CRUD
  const handleSaveBearer = () => {
    if (!verifyPermission()) return;
    if (!bearerForm.name || !bearerForm.designation) {
      triggerToast('Please complete bearer name and designation!');
      return;
    }

    let updatedBearers = [...dbData.officeBearers];
    let action = '';
    let target = '';

    if (editingBearerId) {
      updatedBearers = updatedBearers.map(b => b.id === editingBearerId ? { ...b, ...bearerForm } as OfficeBearer : b);
      action = 'EDIT_BEARER';
      target = bearerForm.name!;
    } else {
      const newBearer: OfficeBearer = {
        id: `ob-${Date.now()}`,
        name: bearerForm.name!,
        designation: bearerForm.designation!,
        photoUrl: bearerForm.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        contact: bearerForm.contact || '',
        email: bearerForm.email || '',
        servicePeriod: bearerForm.servicePeriod || '2025 - Present',
        houseName: bearerForm.houseName || '',
        unit: bearerForm.unit || '',
        orderIndex: updatedBearers.length
      };
      updatedBearers.push(newBearer);
      action = 'ADD_BEARER';
      target = newBearer.name;
    }

    const updated = { ...dbData, officeBearers: updatedBearers };
    saveState(updated, action, target);
    setEditingBearerId(null);
    setBearerForm({ name: '', designation: '', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', contact: '', email: '', servicePeriod: '2025 - Present', houseName: '', unit: '', orderIndex: 0 });
  };

  const handleDeleteBearer = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      officeBearers: dbData.officeBearers.filter(b => b.id !== id)
    };
    saveState(updated, 'DELETE_BEARER', name);
  };

  // 3. Units CRUD
  const handleSaveUnit = () => {
    if (!verifyPermission()) return;
    if (!unitForm.name || !unitForm.patronSaint) {
      triggerToast('Please enter parish church name and patron saint!');
      return;
    }

    let updatedUnits = [...dbData.units];
    let action = '';
    let target = '';

    if (editingUnitId) {
      updatedUnits = updatedUnits.map(u => u.id === editingUnitId ? { ...u, ...unitForm } as ParishUnit : u);
      action = 'EDIT_PARISH_UNIT';
      target = unitForm.name;
    } else {
      const newUnit: ParishUnit = {
        id: `unit-${Date.now()}`,
        name: unitForm.name!,
        patronSaint: unitForm.patronSaint!,
        contactNumber: unitForm.contactNumber || '',
        bgPhoto: unitForm.bgPhoto || 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400',
        stats: unitForm.stats || { members: 100, families: 40, directorsCount: 2 },
        description: unitForm.description || '',
        orderIndex: updatedUnits.length,
        directorName: unitForm.directorName || '',
        directorPhone: unitForm.directorPhone || '',
        presidentName: unitForm.presidentName || '',
        presidentPhone: unitForm.presidentPhone || ''
      };
      updatedUnits.push(newUnit);
      action = 'ADD_PARISH_UNIT';
      target = newUnit.name;
    }

    const updated = { ...dbData, units: updatedUnits };
    saveState(updated, action, target);
    setEditingUnitId(null);
    setUnitForm({ name: '', patronSaint: '', contactNumber: '', bgPhoto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400', stats: { members: 100, families: 50, directorsCount: 2 }, description: '', orderIndex: 0, directorName: '', directorPhone: '', presidentName: '', presidentPhone: '' });
  };

  const handleDeleteUnit = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      units: dbData.units.filter(u => u.id !== id)
    };
    saveState(updated, 'DELETE_PARISH_UNIT', name);
  };

  // 4. Events CRUD
  const handleSaveEvent = () => {
    if (!verifyPermission()) return;
    if (!eventForm.title || !eventForm.venue) {
      triggerToast('Please complete event title and hosting venue!');
      return;
    }

    let updatedEvents = [...dbData.events];
    let action = '';
    let target = '';

    if (editingEventId) {
      updatedEvents = updatedEvents.map(e => e.id === editingEventId ? { ...e, ...eventForm } as CMLEvent : e);
      action = 'EDIT_EVENT';
      target = eventForm.title;
    } else {
      const newEvent: CMLEvent = {
        id: `ev-${Date.now()}`,
        title: eventForm.title!,
        type: eventForm.type as any || 'upcoming',
        date: eventForm.date || '2026-07-04',
        time: eventForm.time || '10:00 AM',
        venue: eventForm.venue!,
        description: eventForm.description || '',
        imageUrl: eventForm.imageUrl || '/src/assets/images/st_therese_of_lisieux_1780072293326.png',
        summary: eventForm.summary || ''
      };
      updatedEvents.push(newEvent);
      action = 'ADD_EVENT';
      target = newEvent.title;
    }

    const updated = { ...dbData, events: updatedEvents };
    saveState(updated, action, target);
    setEditingEventId(null);
    setEventForm({ title: '', type: 'upcoming', date: '2026-07-04', time: '10:00 AM', venue: '', description: '', imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png', summary: '' });
  };

  const handleDeleteEvent = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      events: dbData.events.filter(e => e.id !== id)
    };
    saveState(updated, 'DELETE_EVENT', name);
  };

  // 5. News CRUD
  const handleSaveNews = () => {
    if (!verifyPermission()) return;
    if (!newsForm.title || !newsForm.body) {
      triggerToast('Please complete story title and article content body!');
      return;
    }

    let updatedNews = [...dbData.news];
    let action = '';
    let target = '';

    if (editingNewsId) {
      updatedNews = updatedNews.map(n => n.id === editingNewsId ? { ...n, ...newsForm } as NewsItem : n);
      action = 'EDIT_NEWS';
      target = newsForm.title;
    } else {
      const newNews: NewsItem = {
        id: `news-${Date.now()}`,
        title: newsForm.title!,
        body: newsForm.body!,
        category: newsForm.category || 'General',
        imageUrl: newsForm.imageUrl || '/src/assets/images/st_therese_of_lisieux_1780072293326.png',
        date: newsForm.date || '2026-05-29',
        isFeatured: newsForm.isFeatured || false
      };
      // For toggle unselect other features
      if (newNews.isFeatured) {
        updatedNews = updatedNews.map(n => ({ ...n, isFeatured: false }));
      }
      updatedNews.push(newNews);
      action = 'ADD_NEWS_POST';
      target = newNews.title;
    }

    const updated = { ...dbData, news: updatedNews };
    saveState(updated, action, target);
    setEditingNewsId(null);
    setNewsForm({ title: '', body: '', category: 'General', imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png', date: '2026-05-29', isFeatured: false });
  };

  const handleDeleteNews = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      news: dbData.news.filter(n => n.id !== id)
    };
    saveState(updated, 'DELETE_NEWS_POST', name);
  };

  // 6. Announcements CRUD
  const handleSaveAnn = () => {
    if (!verifyPermission()) return;
    if (!annForm.text) {
      triggerToast('Please type the announcement notification bulletin!');
      return;
    }

    let updatedAnn = [...dbData.announcements];
    let action = '';
    let target = '';

    if (editingAnnId) {
      updatedAnn = updatedAnn.map(a => a.id === editingAnnId ? { ...a, ...annForm } as Announcement : a);
      action = 'EDIT_ANNOUNCEMENT';
      target = annForm.text.substring(0, 30);
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        text: annForm.text!,
        type: annForm.type as any || 'regular',
        date: annForm.date || '2026-05-29',
        isSticky: annForm.isSticky || false
      };
      updatedAnn.push(newAnn);
      action = 'ADD_ANNOUNCEMENT';
      target = newAnn.text.substring(0, 30);
    }

    const updated = { ...dbData, announcements: updatedAnn };
    saveState(updated, action, target);
    setEditingAnnId(null);
    setAnnForm({ text: '', type: 'regular', date: '2026-05-29', isSticky: false });
  };

  const handleDeleteAnn = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      announcements: dbData.announcements.filter(a => a.id !== id)
    };
    saveState(updated, 'DELETE_ANNOUNCEMENT', name.substring(0, 30));
  };

  // 7. Gallery CRUD
  const handleAddAlbum = () => {
    if (!verifyPermission()) return;
    if (!albumForm.title) {
      triggerToast('Please submit an album title!');
      return;
    }
    const newAlbum: GalleryAlbum = {
      id: `alb-${Date.now()}`,
      title: albumForm.title!,
      category: albumForm.category || 'Activities',
      description: albumForm.description || '',
      coverImageUrl: albumForm.coverImageUrl || '/src/assets/images/st_therese_of_lisieux_1780072293326.png'
    };
    const updated = { ...dbData, galleryAlbums: [...dbData.galleryAlbums, newAlbum] };
    saveState(updated, 'CREATE_GALLERY_ALBUM', newAlbum.title);
    setAlbumForm({ title: '', category: 'Activities', description: '', coverImageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png' });
  };

  const handleAddImage = () => {
    if (!verifyPermission()) return;
    if (!imageForm.title || !imageForm.albumId) {
      triggerToast('Please enter cover title and select target album category!');
      return;
    }
    const newImage: GalleryImage = {
      id: `img-${Date.now()}`,
      albumId: imageForm.albumId!,
      title: imageForm.title!,
      imageUrl: imageForm.imageUrl || 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600',
      createdAt: imageForm.createdAt || '2026-05-29'
    };
    const updated = { ...dbData, galleryImages: [...dbData.galleryImages, newImage] };
    saveState(updated, 'UPLOAD_GALLERY_PHOTO', newImage.title);
    setImageForm({ albumId: dbData.galleryAlbums[0]?.id || '', title: '', imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600', createdAt: '2026-05-29' });
  };

  // 8. Downloads CRUD
  const handleSaveDownload = () => {
    if (!verifyPermission()) return;
    if (!downloadForm.title) {
      triggerToast('Please enter download document title!');
      return;
    }

    let updatedDownloads = [...dbData.downloads];
    let action = '';
    let target = '';

    if (editingDownloadId) {
      updatedDownloads = updatedDownloads.map(d => d.id === editingDownloadId ? { ...d, ...downloadForm } as DownloadItem : d);
      action = 'EDIT_DOWNLOAD_ITEM';
      target = downloadForm.title;
    } else {
      const newDl: DownloadItem = {
        id: `dl-${Date.now()}`,
        title: downloadForm.title!,
        category: downloadForm.category as any || 'circular',
        fileSize: downloadForm.fileSize || '1.1 MB',
        downloadUrl: '#',
        uploadDate: downloadForm.uploadDate || '2026-05-29',
        description: downloadForm.description || ''
      };
      updatedDownloads.push(newDl);
      action = 'ADD_DOWNLOAD_RESOURCES';
      target = newDl.title;
    }

    const updated = { ...dbData, downloads: updatedDownloads };
    saveState(updated, action, target);
    setEditingDownloadId(null);
    setDownloadForm({ title: '', category: 'circular', fileSize: '1.2 MB', downloadUrl: '#', uploadDate: '2026-05-29', description: '' });
  };

  const handleDeleteDownload = (id: string, name: string) => {
    if (!verifyPermission()) return;
    const updated = {
      ...dbData,
      downloads: dbData.downloads.filter(d => d.id !== id)
    };
    saveState(updated, 'DELETE_DOWNLOAD_RESOURCE', name);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Database className="w-4 h-4" /> },
    { id: 'settings', label: 'Master Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'bearers', label: 'Office Bearers', icon: <Users className="w-4 h-4" /> },
    { id: 'units', label: 'Parish Units', icon: <MapPin className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { id: 'news', label: 'News Posts', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'announcements', label: 'Announcements', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'gallery', label: 'Gallery Media', icon: <Image className="w-4 h-4" /> },
    { id: 'downloads', label: 'Downloads', icon: <FileText className="w-4 h-4" /> },
    { id: 'chosen', label: 'Chosen Delegates', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'logs', label: 'Activity Logs', icon: <Activity className="w-4 h-4" /> }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row shadow-inner">
      
      {/* Toast persistent notification overlay */}
      {successMsg && (
        <div className="fixed top-4 right-4 bg-slate-950 border-2 border-emerald-500 text-emerald-400 p-4 rounded-xl shadow-2xl z-50 animate-slide-left font-bold text-xs">
          ✅ {successMsg}
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 bg-slate-950 shrink-0 border-r border-slate-800 p-6 flex flex-col justify-between text-left">
        <div className="flex flex-col gap-6">
          
          {/* Admin Profile Details */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
            <div className="p-2.5 bg-rose-950 rounded-xl text-rose-500 border border-rose-900">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">Mekhala Console</span>
              <span className="text-xs font-bold text-white truncate max-w-[140px] block">{currentUser.name}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">{currentUser.role}</span>
            </div>
          </div>

          {/* Menu items list */}
          <ul className="flex flex-col gap-1.5 list-none m-0 p-0 text-xs">
            {navItems.map((item) => (
              <li key={item.id} className="p-0 m-0">
                <button
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold tracking-wide transition leading-none ${
                    activeTab === item.id
                      ? 'bg-rose-950 text-rose-300 border-l-4 border-rose-500 pl-5'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

        </div>

        {/* Console database state summary */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 mt-6 hidden lg:block text-[10px] text-slate-500 leading-normal">
          <span className="text-slate-400 font-bold block mb-1">🗄️ PERSISTENCE DATA</span>
          <span>Saving to server: <strong>db.json</strong></span>
          <span className="block mt-1">Status: Active container connection</span>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 p-6 md:p-10 text-left bg-slate-900 overflow-y-auto">
        
        {/* VIEW 1: OVERVIEW COMPONENT */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1.5 border-b border-slate-800 pb-4">
              <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">WORKSPACE</span>
              <h3 className="font-sans font-black text-2xl text-white">Console Overview</h3>
              <p className="text-slate-400 text-xs">A comprehensive telemetry summary of our digital compositions stored inside CML Mekhala folder.</p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col">
                <span className="text-2xl font-black text-white">{dbData.officeBearers.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Executive Leaders</span>
              </div>
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col">
                <span className="text-2xl font-black text-white">{dbData.units.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Parish Units</span>
              </div>
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col">
                <span className="text-2xl font-black text-white">{dbData.events.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Calendar Schedules</span>
              </div>
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col">
                <span className="text-2xl font-black text-white">{dbData.downloads.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Circular Media</span>
              </div>
            </div>

            {/* Live user badge details */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs flex flex-col gap-3">
              <h4 className="font-bold text-slate-300">Identity Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-400">
                <div>🧑‍💻 Logged user: <strong>{currentUser.name}</strong></div>
                <div>👤 Security Role: <strong>{currentUser.role}</strong></div>
                <div>✉️ Primary Email: <strong>{currentUser.email}</strong></div>
              </div>
              {isEditorOnly && (
                <div className="mt-2 p-3 bg-rose-950/40 border border-rose-900 rounded-xl text-rose-300 text-[11px] font-semibold leading-normal">
                  ⚠️ Note: You log in under an Editor level profile. You are permitted to execute normal CRUD operations on lists, but master portal settings config is strictly locked for Super Admin!
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: MASTER SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
              <h3 className="font-sans font-bold text-lg text-white">Configure Homepage Metadata</h3>
              <p className="text-slate-500 text-xs text-left">Update support emails, hotlines, Malayalam slogans and unit stats badges instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">🚨 Support Desk Phone</label>
                <input
                  type="text"
                  value={settingsForm.supportDesk}
                  onChange={(e) => setSettingsForm({ ...settingsForm, supportDesk: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">✉️ General Hotline Email</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">🌟 Motto Primary (Malayalam script)</label>
                <input
                  type="text"
                  value={settingsForm.mottoPrimary}
                  onChange={(e) => setSettingsForm({ ...settingsForm, mottoPrimary: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">🔥 Motto Secondary (Malayalam script)</label>
                <input
                  type="text"
                  value={settingsForm.mottoSecondary}
                  onChange={(e) => setSettingsForm({ ...settingsForm, mottoSecondary: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                <label className="font-bold text-slate-400">🎨 Hero Intro Text Block (Malayalam Description)</label>
                <textarea
                  rows={3}
                  value={settingsForm.heroIntro}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroIntro: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">⛪ Parish Units Badge Count</label>
                <input
                  type="number"
                  value={settingsForm.parishUnitsCount}
                  onChange={(e) => setSettingsForm({ ...settingsForm, parishUnitsCount: parseInt(e.target.value) || 11 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 animate-fade-in"
                />
              </div>

              <div className="flex flex-col gap-3 text-left md:col-span-2 pt-5 border-t border-slate-900">
                <span className="font-bold text-slate-300 text-xs uppercase tracking-wider">Premium Feature Tab Visibility</span>
                <p className="text-slate-500 text-[11px] -mt-1.5 mb-1 text-left">Toggle whether these high-fidelity sections appear in the main navigation menu for visitors.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Kalolsavam Toggle */}
                  <label className="flex items-center gap-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 p-4 rounded-xl cursor-pointer select-none transition">
                    <input
                      type="checkbox"
                      checked={settingsForm.showKalolsavam !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showKalolsavam: e.target.checked })}
                      className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Kalolsavam 2026</span>
                      <span className="text-[10px] text-slate-500">Show result desk panel</span>
                    </div>
                  </label>

                  {/* Sahithyamalsaram Toggle */}
                  <label className="flex items-center gap-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 p-4 rounded-xl cursor-pointer select-none transition">
                    <input
                      type="checkbox"
                      checked={settingsForm.showSahithyamalsaram !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showSahithyamalsaram: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-xs leading-none">Sahithyamalsaram 2026</span>
                      <span className="text-[10px] text-slate-500 mt-1">Show literary contest</span>
                    </div>
                  </label>

                  {/* Chosen Toggle */}
                  <label className="flex items-center gap-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 p-4 rounded-xl cursor-pointer select-none transition">
                    <input
                      type="checkbox"
                      checked={settingsForm.showChosen !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showChosen: e.target.checked })}
                      className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Chosen Summit 2026</span>
                      <span className="text-[10px] text-slate-500">Show delegation desk</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 pt-3 border-t border-slate-900 leading-none flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition flex items-center gap-1"
                >
                  <Save className="w-4 h-4" /> Save General Configs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: OFFICE BEARERS */}
        {activeTab === 'bearers' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
              <h3 className="font-sans font-bold text-lg text-white">Manage Executive Board Members</h3>
              <p className="text-slate-500 text-xs">Execute immediate CRUD edits over religious directors and youth secretariats.</p>
            </div>

            {/* Bearer Form */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                <h4 className="font-extrabold text-slate-300 text-sm">{editingBearerId ? '✏️ Edit Bearer Details' : '➕ Register New Board Leader'}</h4>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">FullName</label>
                <input
                  type="text"
                  value={bearerForm.name}
                  onChange={(e) => setBearerForm({ ...bearerForm, name: e.target.value })}
                  placeholder="e.g. Rev. Fr. Mathew"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Designation / Title</label>
                <input
                  type="text"
                  value={bearerForm.designation}
                  onChange={(e) => setBearerForm({ ...bearerForm, designation: e.target.value })}
                  placeholder="e.g. Mekhala General Secretary"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Avatar Image URL (or Unsplash mockup link)</label>
                <input
                  type="text"
                  value={bearerForm.photoUrl}
                  onChange={(e) => setBearerForm({ ...bearerForm, photoUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Contact Telephone Hotline</label>
                <input
                  type="text"
                  value={bearerForm.contact}
                  onChange={(e) => setBearerForm({ ...bearerForm, contact: e.target.value })}
                  placeholder="e.g. +91 94460 12345"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Contact Email</label>
                <input
                  type="email"
                  value={bearerForm.email}
                  onChange={(e) => setBearerForm({ ...bearerForm, email: e.target.value })}
                  placeholder="e.g. treesa@cml.org"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Service Tenure period</label>
                <input
                  type="text"
                  value={bearerForm.servicePeriod}
                  onChange={(e) => setBearerForm({ ...bearerForm, servicePeriod: e.target.value })}
                  placeholder="e.g. 2025 - Present"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">House Name</label>
                <input
                  type="text"
                  value={bearerForm.houseName}
                  onChange={(e) => setBearerForm({ ...bearerForm, houseName: e.target.value })}
                  placeholder="e.g. Veliyath House"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Parish / Unit Name</label>
                <input
                  type="text"
                  value={bearerForm.unit}
                  onChange={(e) => setBearerForm({ ...bearerForm, unit: e.target.value })}
                  placeholder="e.g. Kaliyar Unit"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-3 border-t border-slate-900">
                {editingBearerId && (
                  <button
                    onClick={() => {
                      setEditingBearerId(null);
                      setBearerForm({ name: '', designation: '', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', contact: '', email: '', servicePeriod: '2025 - Present', houseName: '', unit: '', orderIndex: 0 });
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveBearer}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" /> {editingBearerId ? 'Save Edits' : 'Add Register'}
                </button>
              </div>
            </div>

            {/* Bearers listing Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-xs">
              <table className="w-full leading-normal border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-left border-b border-slate-800">
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">House</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {dbData.officeBearers.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/60 transition">
                      <td className="px-4 py-2.5">
                        <img src={b.photoUrl} alt={b.name} className="w-8 h-8 rounded-full object-cover border border-slate-800" />
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-200">{b.name}</td>
                      <td className="px-4 py-2.5 text-rose-400 font-medium">{b.designation}</td>
                      <td className="px-4 py-2.5 text-slate-300">{b.houseName || '-'}</td>
                      <td className="px-4 py-2.5 text-amber-400 font-medium">{b.unit || '-'}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">{b.contact}</td>
                      <td className="px-4 py-2.5 text-slate-500">{b.servicePeriod}</td>
                      <td className="px-4 py-2.5 text-right flex items-center justify-end gap-1.5 h-full mt-1 border-none bg-transparent">
                        <button
                          onClick={() => {
                            setEditingBearerId(b.id);
                            setBearerForm(b);
                          }}
                          className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-750"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBearer(b.id, b.name)}
                          className="p-1.5 bg-rose-950 text-rose-400 hover:text-rose-300 rounded-lg border border-rose-900"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: PARISH UNITS */}
        {activeTab === 'units' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
              <h3 className="font-sans font-bold text-lg text-white">Manage Parish Units</h3>
              <p className="text-slate-500 text-xs">Register new church branches and update parish strength metrics.</p>
            </div>

            {/* Unit Create Form */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 text-left">
                <h4 className="font-bold text-slate-300 text-sm">{editingUnitId ? '✏️ Edit Parish Unit Config' : '➕ Register New CML Parish Unit'}</h4>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Unit Name</label>
                <input
                  type="text"
                  value={unitForm.name}
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                  placeholder="e.g. St. Sebastian Church Forane, Vannappuram"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Patron Saint</label>
                <input
                  type="text"
                  value={unitForm.patronSaint}
                  onChange={(e) => setUnitForm({ ...unitForm, patronSaint: e.target.value })}
                  placeholder="e.g. St. Sebastian"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Supervisor Hotline Number</label>
                <input
                  type="text"
                  value={unitForm.contactNumber}
                  onChange={(e) => setUnitForm({ ...unitForm, contactNumber: e.target.value })}
                  placeholder="e.g. +91 94460 30040"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Backdrop Picture URL</label>
                <input
                  type="text"
                  value={unitForm.bgPhoto}
                  onChange={(e) => setUnitForm({ ...unitForm, bgPhoto: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                <label className="font-bold text-slate-400">Unit Descriptions & Historical Work Notes</label>
                <textarea
                  rows={2}
                  value={unitForm.description}
                  onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              {/* Stats Metrics nested fields */}
              <div className="flex flex-col gap-1.5 text-left bg-slate-900 p-3 rounded-xl border border-slate-800">
                <label className="font-bold text-slate-400">👨‍👩‍👧‍👦 CML Student Members Count</label>
                <input
                  type="number"
                  value={unitForm.stats?.members}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    stats: { ...unitForm.stats!, members: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-900 p-3 rounded-xl border border-slate-800">
                <label className="font-bold text-slate-400">🏡 Parish Familes Count</label>
                <input
                  type="number"
                  value={unitForm.stats?.families}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    stats: { ...unitForm.stats!, families: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <label className="font-bold text-slate-400">👤 CML Director Name</label>
                <input
                  type="text"
                  value={unitForm.directorName || ''}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    directorName: e.target.value
                  })}
                  placeholder="e.g. Rev. Fr. Mathew"
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <label className="font-bold text-slate-400">📞 CML Director Contact</label>
                <input
                  type="text"
                  value={unitForm.directorPhone || ''}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    directorPhone: e.target.value
                  })}
                  placeholder="e.g. +91 94472 11220"
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <label className="font-bold text-slate-400">👤 CML President Name</label>
                <input
                  type="text"
                  value={unitForm.presidentName || ''}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    presidentName: e.target.value
                  })}
                  placeholder="e.g. Basil Veliyath"
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <label className="font-bold text-slate-400">📞 CML President Contact</label>
                <input
                  type="text"
                  value={unitForm.presidentPhone || ''}
                  onChange={(e) => setUnitForm({
                    ...unitForm,
                    presidentPhone: e.target.value
                  })}
                  placeholder="e.g. +91 95621 55440"
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-slate-100 placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-900">
                {editingUnitId && (
                  <button
                    onClick={() => {
                      setEditingUnitId(null);
                      setUnitForm({ name: '', patronSaint: '', contactNumber: '', bgPhoto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400', stats: { members: 100, families: 50, directorsCount: 2 }, description: '', orderIndex: 0, directorName: '', directorPhone: '', presidentName: '', presidentPhone: '' });
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveUnit}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" /> Save Parish Unit
                </button>
              </div>

            </div>

            {/* List columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbData.units.map((u) => (
                <div key={u.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between gap-4 text-xs items-center">
                  <div className="flex flex-col text-left gap-1 truncate">
                    <span className="font-bold text-slate-200 truncate">{u.name}</span>
                    <span className="text-[10px] text-amber-400">Patron Saint: {u.patronSaint} • Members: {u.stats.members}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingUnitId(u.id);
                        setUnitForm(u);
                      }}
                      className="p-1.5 bg-slate-800 hover:text-white rounded-lg border border-slate-750"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(u.id, u.name)}
                      className="p-1.5 bg-rose-950 text-rose-450 hover:text-rose-300 rounded-lg border border-rose-900"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: EVENTS */}
        {activeTab === 'events' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
              <h3 className="font-sans font-bold text-lg text-white">Manage Activity Calendar</h3>
              <p className="text-slate-500 text-xs">Configure upcoming summit schedules or edit summary winners list for past events.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="md:col-span-2 text-left">
                <h4 className="font-bold text-slate-300 text-sm">📅 Add / Edit Calendar Schedule</h4>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Conclave/Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Mekhala Kalolsavam 2026"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Calendar Phase Type</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:outline-none"
                >
                  <option value="upcoming">⏳ Upcoming (Active/Pending)</option>
                  <option value="past">📁 Completed Past Archive</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Event Date</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Event Clock Time</label>
                <input
                  type="text"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  placeholder="e.g. 09:30 AM - 05:00 PM"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Hosting Venue Address</label>
                <input
                  type="text"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  placeholder="e.g. St. Augustine Parish Hall, Karimannoor"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                <label className="font-bold text-slate-400">Event Description & Program Details</label>
                <textarea
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              {eventForm.type === 'past' && (
                <div className="flex flex-col gap-1.5 text-left md:col-span-2 bg-emerald-950/20 p-4 rounded-xl border border-emerald-900 animate-fade-in text-slate-100">
                  <label className="font-bold text-emerald-400">🏅 Winners Summary & points table details (For Past Archives Only)</label>
                  <input
                    type="text"
                    value={eventForm.summary}
                    onChange={(e) => setEventForm({ ...eventForm, summary: e.target.value })}
                    placeholder="e.g. Vannappuram emerged Overall Champions with 112 points."
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white mt-1.5"
                  />
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-900">
                {editingEventId && (
                  <button
                    onClick={() => {
                      setEditingEventId(null);
                      setEventForm({ title: '', type: 'upcoming', date: '2026-07-04', time: '10:00 AM', venue: '', description: '', imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png', summary: '' });
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveEvent}
                  className="px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl transition"
                >
                  Save Calendar Schedule
                </button>
              </div>
            </div>

            {/* List calendar */}
            <div className="flex flex-col gap-3">
              {dbData.events.map((e) => (
                <div key={e.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between gap-4 text-xs items-center">
                  <div className="flex items-center gap-3 text-left truncate">
                    <span className="p-2 bg-rose-950 hover:bg-rose-900 border border-rose-900 rounded-lg text-rose-450 font-bold tracking-wide shrink-0">
                      {e.type === 'upcoming' ? '⏳ UP' : '📁 PAST'}
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-white truncate">{e.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Date: {e.date} • Venue: {e.venue}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingEventId(e.id);
                        setEventForm(e);
                      }}
                      className="p-1.5 bg-slate-800 hover:text-white rounded-lg border border-slate-750"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(e.id, e.title)}
                      className="p-1.5 bg-rose-950 text-rose-450 hover:text-rose-300 rounded-lg border border-rose-900"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: NEWS */}
        {activeTab === 'news' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
              <h3 className="font-sans font-bold text-lg text-white">Manage News Posts & Editorial Press</h3>
              <p className="text-slate-500 text-xs">Write beautiful articles summarizing diocesan conferences and toggle spotlight featured layout status.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs flex flex-col gap-4">
              <div className="text-left font-bold text-slate-300 text-sm">
                🎙️ Edit Editorial Press Bulletin
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-bold text-slate-400">Story Title</label>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    placeholder="e.g. Bishop inaugurated Leadership Meet"
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-bold text-slate-400">News Category Class</label>
                  <input
                    type="text"
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    placeholder="e.g. Celebration"
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-bold text-slate-400">Release Timestamp Date</label>
                  <input
                    type="date"
                    value={newsForm.date}
                    onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center gap-3 text-left pl-2 pt-2 bg-slate-900 rounded-xl border border-slate-800 px-4">
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={newsForm.isFeatured}
                    onChange={(e) => setNewsForm({ ...newsForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-850 rounded"
                  />
                  <label htmlFor="featured-check" className="font-bold text-slate-300 cursor-pointer select-none text-xs leading-none">
                    ⭐ Spotlight on Headline block (Featured layout)
                  </label>
                </div>

                <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                  <label className="font-bold text-slate-400">Press Release Article Body Content</label>
                  <textarea
                    rows={4}
                    value={newsForm.body}
                    onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-900">
                {editingNewsId && (
                  <button
                    onClick={() => {
                      setEditingNewsId(null);
                      setNewsForm({ title: '', body: '', category: 'General', imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png', date: '2026-05-29', isFeatured: false });
                    }}
                    className="px-4 py-2.5 bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveNews}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  Save Editorial Release
                </button>
              </div>
            </div>

            {/* News Roll list table */}
            <div className="flex flex-col gap-4 text-xs">
              {dbData.news.map((n) => (
                <div key={n.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between gap-4 text-left items-center">
                  <div className="flex flex-col truncate gap-0.5">
                    <span className="font-bold text-white truncate text-sm">{n.title}</span>
                    <span className="text-[10px] text-slate-500">Category: {n.category} • {n.date} {n.isFeatured && <strong className="text-amber-400 ml-1">★ Featured Spotlight Headline</strong>}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingNewsId(n.id);
                        setNewsForm(n);
                      }}
                      className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-755"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNews(n.id, n.title)}
                      className="p-1.5 bg-rose-950 text-rose-450 hover:text-rose-300 rounded-lg border border-rose-900"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 7: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
              <h3 className="font-sans font-bold text-lg text-white">Manage Red Ribbon Announcements</h3>
              <p className="text-slate-500 text-xs">Scribble quick notice notifications that scroll continuously on the top red banner.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs flex flex-col gap-4">
              <div className="text-left font-bold text-slate-300">
                🔔 Publish Urgent Bulletin Notification
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Bulletin notice details</label>
                <input
                  type="text"
                  value={annForm.text}
                  onChange={(e) => setAnnForm({ ...annForm, text: e.target.value })}
                  placeholder="e.g. Registrations for Mekhala Kalolsavam 2026 is officially open..."
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="font-bold text-slate-400">Notice Category Type</label>
                  <select
                    value={annForm.type || 'regular'}
                    onChange={(e) => setAnnForm({ ...annForm, type: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white font-bold"
                  >
                    <option value="urgent">🚨 Critical / Urgent (Priority banner scroll)</option>
                    <option value="regular">📋 Standard notice / regular</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pl-2 pt-5 select-none text-left">
                  <input
                    type="checkbox"
                    id="sticky-check-ann"
                    checked={annForm.isSticky || false}
                    onChange={(e) => setAnnForm({ ...annForm, isSticky: e.target.checked })}
                    className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-850 rounded"
                  />
                  <label htmlFor="sticky-check-ann" className="font-bold text-slate-300 cursor-pointer text-xs">
                    📌 Keep sticky on announcement margins
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-900">
                {editingAnnId && (
                  <button
                    onClick={() => {
                      setEditingAnnId(null);
                      setAnnForm({ text: '', type: 'regular', date: '2026-05-29', isSticky: false });
                    }}
                    className="px-4 py-2 bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveAnn}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  Post Announcement Balloon
                </button>
              </div>
            </div>

            {/* Roll list */}
            <div className="flex flex-col gap-3">
              {dbData.announcements.map((a) => (
                <div key={a.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between gap-4 text-xs items-center">
                  <div className="flex items-center gap-3 text-left truncate">
                    <span className={`p-1.5 px-2.5 rounded-lg font-bold shrink-0 text-[10px] ${
                      a.type === 'urgent' ? 'bg-rose-950 border border-rose-950 text-rose-450' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {a.type.toUpperCase()}
                    </span>
                    <span className="font-bold text-slate-200 truncate">{a.text}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingAnnId(a.id);
                        setAnnForm(a);
                      }}
                      className="p-1.5 bg-slate-800 hover:text-white rounded-lg border border-slate-700"
                    >
                      <Edit className="w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnn(a.id, a.text)}
                      className="p-1.5 bg-rose-950 text-rose-450 hover:text-rose-300 rounded-lg border border-rose-900"
                    >
                      <Trash className="w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 8: GALLERY MEDIA */}
        {activeTab === 'gallery' && (
          <div className="flex flex-col gap-8 animate-fade-in text-xs">
            {/* Page title and description */}
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
              <h3 className="font-sans font-bold text-lg text-white">Manage Photo Gallery Vault</h3>
              <p className="text-slate-500 text-xs text-left">Upload visual pictures and construct organized albums categories.</p>
            </div>

            {/* Album creation and Image uploading form block nested */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
              
              {/* Box 1: Create categories album */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
                <h4 className="font-bold text-sm text-amber-500">📁 Construct Organized Album</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">Album Name</label>
                  <input
                    type="text"
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    placeholder="e.g. Golden Jubilee Inauguration"
                    className="bg-slate-900 border border-slate-850 p-2.5 rounded text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">Album category</label>
                  <input
                    type="text"
                    value={albumForm.category}
                    onChange={(e) => setAlbumForm({ ...albumForm, category: e.target.value })}
                    className="bg-slate-900 border border-slate-850 p-2.5 rounded text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">Descriptions</label>
                  <input
                    type="text"
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                    className="bg-slate-900 border border-slate-850 p-2.5 rounded text-white"
                  />
                </div>

                <button
                  onClick={handleAddAlbum}
                  className="mt-2 py-2 w-full bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg rounded-xl transition"
                >
                  Create Album Slot
                </button>
              </div>

              {/* Box 2: Upload images on existing files */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col gap-3">
                <h4 className="font-bold text-sm text-amber-500">🖼️ Upload Photo to Album Slot</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">Select target album category</label>
                  <select
                    value={imageForm.albumId}
                    onChange={(e) => setImageForm({ ...imageForm, albumId: e.target.value })}
                    className="bg-slate-900 border border-slate-850 p-2.5 rounded text-white"
                  >
                    {dbData.galleryAlbums.map(alb => (
                      <option key={alb.id} value={alb.id}>{alb.title} ({alb.category})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">Photo Title Cover name</label>
                  <input
                    type="text"
                    value={imageForm.title}
                    onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })}
                    placeholder="e.g. Diocesan Bishop Speech"
                    className="bg-slate-900 border border-slate-850 p-2.5 rounded text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-400">Picture URL (Mockup or Unsplash)</label>
                  <input
                    type="text"
                    value={imageForm.imageUrl}
                    onChange={(e) => setImageForm({ ...imageForm, imageUrl: e.target.value })}
                    className="bg-slate-900 border border-slate-850 p-2.5 rounded text-white"
                  />
                </div>

                <button
                  onClick={handleAddImage}
                  className="mt-2 py-2 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg rounded-xl transition"
                >
                  Submit Photo Upload
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 9: DOWNLOADS */}
        {activeTab === 'downloads' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
              <h3 className="font-sans font-bold text-lg text-white">Manage Documentation Assets</h3>
              <p className="text-slate-500 text-xs">Register download circular files and PDF guideline templates.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 text-left font-bold text-slate-350">
                📄 Register Document assets
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Document Title</label>
                <input
                  type="text"
                  value={downloadForm.title}
                  onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })}
                  placeholder="e.g. Unit registration guide sheet"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white hover:border-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Document Category Type</label>
                <select
                  value={downloadForm.category || 'circular'}
                  onChange={(e) => setDownloadForm({ ...downloadForm, category: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white font-bold"
                >
                  <option value="circular">📜 Official Circular Banner</option>
                  <option value="form">📋 Dynamic Registration Form</option>
                  <option value="report">📊 Diocese Midterm Report</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-slate-400">Estimated File Size</label>
                <input
                  type="text"
                  value={downloadForm.fileSize}
                  onChange={(e) => setDownloadForm({ ...downloadForm, fileSize: e.target.value })}
                  placeholder="e.g. 1.2 MB"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left md:col-span-2">
                <label className="font-bold text-slate-400">File Description</label>
                <input
                  type="text"
                  value={downloadForm.description}
                  onChange={(e) => setDownloadForm({ ...downloadForm, description: e.target.value })}
                  placeholder="Describe circular targets briefly"
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-900">
                {editingDownloadId && (
                  <button
                    onClick={() => {
                      setEditingDownloadId(null);
                      setDownloadForm({ title: '', category: 'circular', fileSize: '1.2 MB', downloadUrl: '#', uploadDate: '2026-05-29', description: '' });
                    }}
                    className="p-3 bg-slate-800 rounded-xl hover:bg-slate-705"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveDownload}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition"
                >
                  Save Document Resource
                </button>
              </div>
            </div>

            {/* List document */}
            <div className="flex flex-col gap-3">
              {dbData.downloads.map((d) => (
                <div key={d.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between gap-4 text-xs items-center">
                  <div className="flex items-center gap-3 text-left truncate">
                    <span className="p-2 bg-slate-900 text-amber-500 font-bold rounded-lg">
                      📄
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-slate-200 truncate">{d.title}</span>
                      <span className="text-[10px] text-slate-500">Category: {d.category} • Size: {d.fileSize}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingDownloadId(d.id);
                        setDownloadForm(d);
                      }}
                      className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-750"
                    >
                      <Edit className="w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteDownload(d.id, d.title)}
                      className="p-1.5 bg-rose-950 text-rose-450 hover:text-rose-300 rounded-lg border border-rose-900"
                    >
                      <Trash className="w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 10: ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 text-left">
              <h3 className="font-sans font-bold text-lg text-white">Admin Activity Audit Logs</h3>
              <p className="text-slate-500 text-xs">Real-time log trails generated by the server. Only Super Admins can clean trails.</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 font-mono text-[11px] text-slate-300 flex flex-col gap-3 text-left overflow-x-auto max-h-[450px]">
              {dbData.logs?.map((log) => (
                <div key={log.id} className="p-3 bg-slate-900 rounded-xl border border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-rose-400 font-bold">🛠️ {log.action}</span>
                    <span className="text-slate-400 text-xs">Target: <strong>{log.target}</strong></span>
                    <span className="text-slate-500 text-[10px]">Executor Agent: {log.userEmail}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded italic whitespace-nowrap shrink-0">
                    Timestamp: {log.timestamp}
                  </span>
                </div>
              ))}
              {dbData.logs?.length === 0 && (
                <div className="text-slate-500 py-6 text-center text-xs">
                  Console report clean. No operational state adjustments tracked yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 11: CHOSEN DELEGATES MANAGEMENT */}
        {activeTab === 'chosen' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 text-left">
              <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">REGISTRATION REGISTRY</span>
              <h3 className="font-sans font-bold text-lg text-white">Chosen Summit Enrolled Delegates</h3>
              <p className="text-slate-500 text-xs">Track, examine, and manage delegates registered on the public dynamic Summit page.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">REGISTERED DELEGATES: <strong>{dbData.chosenRegistrations?.length || 0}</strong></span>
                {dbData.chosenRegistrations && dbData.chosenRegistrations.length > 0 && (
                  <button
                    onClick={() => {
                      if (!confirm('Are you sure you want to delete ALL chosen delegates? This action cannot be undone!')) return;
                      const updated = { ...dbData, chosenRegistrations: [] };
                      saveState(updated, 'CLEAR_CHOSEN_REGISTRATIONS_ALL', 'Registry Clean-up');
                    }}
                    className="px-3 py-1.5 bg-rose-950 text-rose-400 hover:text-rose-350 hover:bg-rose-900/40 border border-rose-900 rounded-xl text-xs font-bold transition"
                  >
                    Clear All Enrolments
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(dbData.chosenRegistrations || []).map((reg: any) => (
                  <div key={reg.id} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-3 right-3 opacity-60 group-hover:opacity-100 transition duration-200">
                      <button
                        onClick={() => {
                          if (!confirm(`Are you sure you want to dismiss ${reg.participantName}?`)) return;
                          const updated = {
                            ...dbData,
                            chosenRegistrations: (dbData.chosenRegistrations || []).filter((r: any) => r.id !== reg.id)
                          };
                          saveState(updated, 'REMOVE_CHOSEN_REGISTRATION', reg.participantName);
                        }}
                        className="p-1.5 bg-rose-950 text-rose-450 border border-rose-900 rounded-md hover:bg-rose-900 hover:text-white transition cursor-pointer"
                        title="Dismiss Registration"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-col text-left">
                      <span className="text-slate-500 text-[10px] font-mono tracking-wider">ID: {reg.id}</span>
                      <h4 className="font-sans font-black text-sm text-white mt-1 leading-tight">{reg.participantName}</h4>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs">
                        <span className="text-rose-400 font-bold">Shakha: {reg.shakha}</span>
                        {reg.fatherName && (
                          <span className="text-slate-400 font-medium">Father: {reg.fatherName}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-900 text-xs text-slate-300">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Position</span>
                        <span className="font-semibold text-slate-100 truncate">{reg.position || 'Mission Activist'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Enrolled</span>
                        <span className="font-mono text-slate-500 text-[10px] truncate">{new Date(reg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-slate-300">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Contact Number</span>
                        <span className="font-semibold text-slate-100 truncate font-mono">{reg.contactNumber}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Parent Contact</span>
                        <span className="font-semibold text-slate-100 truncate font-mono">{reg.parentsContactNumber}</span>
                      </div>
                    </div>

                  </div>
                ))}

                {(!dbData.chosenRegistrations || dbData.chosenRegistrations.length === 0) && (
                  <div className="bg-slate-950/60 p-10 rounded-2xl border border-slate-800 text-center text-slate-500 font-medium text-xs md:col-span-2">
                    No active delegates registered for Chosen 2026 yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
