/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OfficeBearer {
  id: string;
  name: string;
  designation: string;
  photoUrl: string;
  contact: string;
  email: string;
  servicePeriod: string;
  orderIndex: number;
  houseName?: string;
  unit?: string;
}

export interface ParishUnit {
  id: string;
  name: string;
  patronSaint: string;
  contactNumber: string;
  bgPhoto: string;
  stats: {
    members: number;
    families: number;
    directorsCount: number;
  };
  description: string;
  orderIndex: number;
  directorName?: string;
  directorPhone?: string;
  presidentName?: string;
  presidentPhone?: string;
}

export interface CMLEvent {
  id: string;
  title: string;
  type: 'upcoming' | 'past';
  date: string;
  time: string;
  venue: string;
  description: string;
  imageUrl?: string;
  summary?: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImageUrl: string;
}

export interface GalleryImage {
  id: string;
  albumId: string;
  title: string;
  imageUrl: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  text: string;
  type: 'urgent' | 'regular';
  date: string;
  isSticky: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  category: string;
  imageUrl?: string;
  date: string;
  isFeatured: boolean;
}

export interface DownloadItem {
  id: string;
  title: string;
  category: 'circular' | 'form' | 'report';
  fileSize: string;
  downloadUrl: string;
  uploadDate: string;
  description?: string;
}

export interface ActivityLog {
  id: string;
  userEmail: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface PortalSettings {
  supportDesk: string;
  email: string;
  mottoPrimary: string;
  mottoSecondary: string;
  heroIntro: string;
  parishUnitsCount: number;
  showKalolsavam?: boolean;
  showSahithyamalsaram?: boolean;
  showChosen?: boolean;
}

export interface UserRole {
  email: string;
  name: string;
  role: 'Super Admin' | 'Admin' | 'Editor';
  lastActive?: string;
}

export interface ParticipantResult {
  id: string;
  competitorName: string;
  unitId: string;
  unitName: string;
  competition: 'Kalolsavam' | 'Sahithyamalsaram';
  eventName: string;
  grade: 'A' | 'B' | 'C' | 'None';
  position: '1st' | '2nd' | '3rd' | 'None';
  totalPoints: number;
  isPublished: boolean;
  createdAt: string;
}

export interface ChosenRegistration {
  id: string;
  participantName: string;
  fatherName: string;
  position: string;
  shakha: string;
  contactNumber: string;
  parentsContactNumber: string;
  createdAt: string;
}
