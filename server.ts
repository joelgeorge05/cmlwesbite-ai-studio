/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json());

// Users & roles
const defaultUsers = [
  { email: 'joelveliyath05@gmail.com', name: 'Joel Veliyath', role: 'Super Admin', password: 'CML' },
  { email: 'admin@cmlkaliyar.org', name: 'Mekhala Office Bearer', role: 'Admin', password: 'CMLKaliyar#2026' },
  { email: 'editor@cmlkaliyar.org', name: 'Editor Kaliyar', role: 'Editor', password: 'CML' }
];

// Initial Seed Data
const initialDB = {
  settings: {
    supportDesk: '+91 94470 12345',
    email: 'contact@cmlkothamangalam.ac-inc.in',
    mottoPrimary: 'സ്നേഹം • ത്യാഗം',
    mottoSecondary: 'സേവനം • സഹനം',
    heroIntro: 'Live updates from the Cherupushpa Mission League Kothamangalam Diocese — competitions, announcements, and galleries.',
    parishUnitsCount: 115
  },
  announcements: [
    {
      id: 'ann-1',
      text: 'Mekhala Kalolsavam 2026 is scheduled to be held at Karimannoor on July 4-5. Online registration portal has started!',
      type: 'urgent',
      date: '2026-05-28',
      isSticky: true
    },
    {
      id: 'ann-2',
      text: 'CML Kaliyar Mekhala Golden Jubilee Year celebration guidelines have been distributed to all parish directors.',
      type: 'regular',
      date: '2026-05-25',
      isSticky: false
    },
    {
      id: 'ann-3',
      text: 'Unit Secretaries should submit the mid-term membership reports before June 5, 2026.',
      type: 'urgent',
      date: '2025-05-29',
      isSticky: true
    }
  ],
  news: [
    {
      id: 'news-1',
      title: 'Mekhala Leaders Workshop Concluded at St. Marys Hall Kaliyar',
      body: 'The annual leadership seminar and training workshop for parish unit bearers of Cherupushpa Mission League Kaliyar Mekhala was held successfully. Over 80 student leaders and animator sisters from 11 parish units participated. Rev. Fr. Mathew Elanjimattom inaugurated the session, urging youngsters to embrace the missionary spirit in their daily routines, embodying the CML ideals of Love, Sacrifice, Service, and Suffering.',
      category: 'Workshop',
      imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png',
      date: '2026-05-24',
      isFeatured: true
    },
    {
      id: 'news-2',
      title: 'Golden Jubilee Celebration Preparations Commences',
      body: 'CML Kaliyar Mekhala has officially formed the executive committee for planning the upcoming Golden Jubilee celebrations. Various spiritual, social service, and literary events will be hosted throughout the academic year. Bishop of Kothamangalam Diocese will join the central opening ceremony.',
      category: 'Celebration',
      imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png',
      date: '2026-05-20',
      isFeatured: false
    }
  ],
  officeBearers: [
    {
      id: 'ob-1',
      name: 'Rev. Fr. Mathew Elanjimattom',
      designation: 'Mekhala Director',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      contact: '+91 94460 21345',
      email: 'mathew.fr@cmlkaliyar.org',
      servicePeriod: '2024 - Present',
      orderIndex: 0,
      houseName: 'Elanjimattom Presbytery',
      unit: 'Kaliyar Unit'
    },
    {
      id: 'ob-2',
      name: 'Rev. Sr. Treesa SIC',
      designation: 'Mekhala Joint Director',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      contact: '+91 85930 11223',
      email: 'treesa.sr@cmlkaliyar.org',
      servicePeriod: '2025 - Present',
      orderIndex: 1,
      houseName: 'Sacred Heart Convent',
      unit: 'Vannappuram Unit'
    },
    {
      id: 'ob-3',
      name: 'Mr. Joel Veliyath',
      designation: 'Mekhala Organizer',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      contact: '+91 98450 67890',
      email: 'joelveliyath05@gmail.com',
      servicePeriod: '2024 - Present',
      orderIndex: 2,
      houseName: 'Veliyath House',
      unit: 'Karimannoor Unit'
    },
    {
      id: 'ob-4',
      name: 'Miss Sharon Saji',
      designation: 'Mekhala President',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      contact: '+91 75924 12345',
      email: 'sharon.president@cmlkaliyar.org',
      servicePeriod: '2025 - 2026',
      orderIndex: 3,
      houseName: 'Thachapuzha House',
      unit: 'Kaliyar Unit'
    },
    {
      id: 'ob-5',
      name: 'Mr. George Kutty',
      designation: 'Mekhala General Secretary',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      contact: '+91 95421 98765',
      email: 'george.secretary@cmlkaliyar.org',
      servicePeriod: '2025 - 2026',
      orderIndex: 4,
      houseName: 'Nedumpallil House',
      unit: 'Kodikulam Unit'
    }
  ],
  units: [
    {
      id: 'unit-1',
      name: 'St. Marys Church, Kaliyar',
      patronSaint: 'Holy Mary',
      contactNumber: '+91 94475 22110',
      bgPhoto: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400',
      stats: { members: 320, families: 180, directorsCount: 3 },
      description: 'Mekhala Headquarters. Extremely active unit leading spiritual quiz groups, social volunteering drives, and charity works in Kaliyar parish.',
      orderIndex: 0
    },
    {
      id: 'unit-2',
      name: 'St. Sebastian Church, Vannappuram',
      patronSaint: 'St. Sebastian',
      contactNumber: '+91 94460 30040',
      bgPhoto: 'https://images.unsplash.com/photo-1548625361-155deee223d5?w=400',
      stats: { members: 410, families: 220, directorsCount: 4 },
      description: 'The largest parish unit in Kaliyar Mekhala, consistently winning laurels in literary (Sahithyamalsaram) and cultural stages.',
      orderIndex: 1
    },
    {
      id: 'unit-3',
      name: 'St. George Church, Kodikulam',
      patronSaint: 'St. George',
      contactNumber: '+91 98451 12233',
      bgPhoto: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400',
      stats: { members: 195, families: 110, directorsCount: 2 },
      description: 'A dedicated unit known for exceptional Holy Childhood missionary savings bank accounts and pious service works.',
      orderIndex: 2
    },
    {
      id: 'unit-4',
      name: 'St. Augustine Church, Karimannoor',
      patronSaint: 'St. Augustine',
      contactNumber: '+91 80753 99881',
      bgPhoto: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=400',
      stats: { members: 350, families: 195, directorsCount: 3 },
      description: 'Historically significant unit that regularly produces excellent theatrical performances and organizes regional mission retreats.',
      orderIndex: 3
    },
    {
      id: 'unit-5',
      name: 'St. Thomas Church, Thommankuthu',
      patronSaint: 'St. Thomas',
      contactNumber: '+91 94471 21212',
      bgPhoto: 'https://images.unsplash.com/photo-1501535033-a593e6afb94d?w=400',
      stats: { members: 140, families: 80, directorsCount: 2 },
      description: 'Set in a beautiful scenic tourism belt, this unit excels in nature volunteering and holy standard-keeping classes.',
      orderIndex: 4
    }
  ],
  events: [
    {
      id: 'ev-1',
      title: 'Mekhala Kalolsavam 2026',
      type: 'upcoming',
      date: '2026-07-04',
      time: '09:00 AM - 05:00 PM',
      venue: 'St. Augustine Higher Secondary School, Karimannoor',
      description: 'The grand annual cultural fiesta of Kaliyar Mekhala where hundreds of children showcase their Talents in group song, Margam Kali, Elocution, Painting, and Bible Skits. Registrations are open through unit secretaries.',
      imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png'
    },
    {
      id: 'ev-2',
      title: 'Feast of St. Therese (Patroness Feast Day)',
      type: 'upcoming',
      date: '2026-10-01',
      time: '04:30 PM - 07:30 PM',
      venue: 'St. Mary’s Forane Church HQ, Kaliyar',
      description: 'Solemn Holy Mass, Novena, Candlelight procession, and distribution of rose petals. Followed by annual missionary award announcement.',
      imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png'
    },
    {
      id: 'ev-3',
      title: 'Mekhala Sahithyamalsaram 2025',
      type: 'past',
      date: '2025-11-20',
      time: '10:00 AM',
      venue: 'St. George Parish, Kodikulam',
      description: 'Literary competition focusing on Malayalam Essay Writing, Bible Verse recitation, Storytelling, and Mission Poetry. Vannappuram Unit emerged Overall Champions.',
      imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png',
      summary: 'Vannappuram parish unit scored 112 points to win the rolling trophy. Kodikulam secured second place with 84 points. Bishop of Kothamangalam presented the trophies.'
    }
  ],
  galleryAlbums: [
    {
      id: 'alb-1',
      title: 'CML Mekhala Kalolsavam Highlights',
      category: 'Arts & Culture',
      description: 'Spectacular visual memories of theatrical plays, religious songs, and cultural quiz stages.',
      coverImageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png'
    },
    {
      id: 'alb-2',
      title: 'Mekhala Leaders Training Camp',
      category: 'Seminars',
      description: 'Nurturing future church leaders with high spiritual morals, team building, and social values.',
      coverImageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png'
    }
  ],
  galleryImages: [
    {
      id: 'img-1',
      albumId: 'alb-1',
      title: 'Margam Kali Performance Win',
      imageUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600',
      createdAt: '2025-11-20'
    },
    {
      id: 'img-2',
      albumId: 'alb-1',
      title: 'Overall Trophy presentation',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
      createdAt: '2025-11-20'
    },
    {
      id: 'img-3',
      albumId: 'alb-2',
      title: 'Inspirations lecture under roses painting',
      imageUrl: '/src/assets/images/st_therese_of_lisieux_1780072293326.png',
      createdAt: '2026-05-24'
    }
  ],
  downloads: [
    {
      id: 'dl-1',
      title: 'CML Kalolsavam 2026 Registration Sheet',
      category: 'form',
      fileSize: '420 KB',
      downloadUrl: '#',
      uploadDate: '2026-05-28',
      description: 'Authorized spreadsheet template for unit secretaries to compile parish entry submissions.'
    },
    {
      id: 'dl-2',
      title: 'CML Kaliyar Mekhala Calendar & Activities Planner 2026',
      category: 'circular',
      fileSize: '1.4 MB',
      downloadUrl: '#',
      uploadDate: '2026-01-10',
      description: 'The complete agenda, circular directives, exam dates, and prayer guidelines for the whole year.'
    },
    {
      id: 'dl-3',
      title: 'Midterm Report Template (June 2026)',
      category: 'report',
      fileSize: '210 KB',
      downloadUrl: '#',
      uploadDate: '2026-05-29',
      description: 'Prescribed report form to document member collections, missionary box stats, and unit activities.'
    }
  ],
  logs: [
    {
      id: 'log-1',
      userEmail: 'joelveliyath05@gmail.com',
      action: 'INITIAL_SEED',
      target: 'Database Initialized',
      timestamp: '2026-05-29T16:30:40Z'
    }
  ],
  results: [
    {
      id: 'res-1',
      competitorName: 'Albin Kurian',
      unitId: 'unit-2',
      unitName: 'St. Sebastian Church, Vannappuram',
      competition: 'Kalolsavam',
      eventName: 'Margamkali (മാർഗംകളി)',
      grade: 'A',
      position: '1st',
      totalPoints: 10,
      isPublished: true,
      createdAt: '2026-05-29T17:00:00Z'
    },
    {
      id: 'res-2',
      competitorName: 'Maria Augustine',
      unitId: 'unit-4',
      unitName: 'St. Augustine Church, Karimannoor',
      competition: 'Kalolsavam',
      eventName: 'Margamkali (മാർഗംകളി)',
      grade: 'A',
      position: '2nd',
      totalPoints: 8,
      isPublished: true,
      createdAt: '2026-05-29T17:05:00Z'
    },
    {
      id: 'res-3',
      competitorName: 'Robin Joseph',
      unitId: 'unit-1',
      unitName: 'St. Marys Church, Kaliyar',
      competition: 'Kalolsavam',
      eventName: 'Bible Story Recitation (കഥാപ്രസംഗം)',
      grade: 'A',
      position: '1st',
      totalPoints: 10,
      isPublished: true,
      createdAt: '2026-05-29T17:10:00Z'
    },
    {
      id: 'res-4',
      competitorName: 'Tessa Saji',
      unitId: 'unit-3',
      unitName: 'St. George Church, Kodikulam',
      competition: 'Kalolsavam',
      eventName: 'Bible Story Recitation (കഥാപ്രസംഗം)',
      grade: 'B',
      position: '2nd',
      totalPoints: 6,
      isPublished: true,
      createdAt: '2026-05-29T17:15:00Z'
    },
    {
      id: 'res-5',
      competitorName: 'Sharon Saji',
      unitId: 'unit-1',
      unitName: 'St. Marys Church, Kaliyar',
      competition: 'Sahithyamalsaram',
      eventName: 'Bible Essay Writing (ഉപന്യാസ രചന)',
      grade: 'A',
      position: '1st',
      totalPoints: 10,
      isPublished: true,
      createdAt: '2026-05-29T17:20:00Z'
    },
    {
      id: 'res-6',
      competitorName: 'George Kutty',
      unitId: 'unit-3',
      unitName: 'St. George Church, Kodikulam',
      competition: 'Sahithyamalsaram',
      eventName: 'Poetry Composition (കവിതാ രചന)',
      grade: 'A',
      position: '2nd',
      totalPoints: 8,
      isPublished: true,
      createdAt: '2026-05-29T17:25:00Z'
    },
    {
      id: 'res-7',
      competitorName: 'Sandra Manoj',
      unitId: 'unit-2',
      unitName: 'St. Sebastian Church, Vannappuram',
      competition: 'Sahithyamalsaram',
      eventName: 'Poetry Composition (കവിതാ രചന)',
      grade: 'B',
      position: '3rd',
      totalPoints: 4,
      isPublished: true,
      createdAt: '2026-05-29T17:30:00Z'
    }
  ]
};

// Initialize DB file
function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
    return initialDB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.results) {
      parsed.results = initialDB.results;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (e) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
    return initialDB;
  }
}

function saveDatabase(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Router API
app.get('/api/data', (req, res) => {
  const data = loadDatabase();
  res.json(data);
});

// Authentications
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = defaultUsers.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
});

// Logs helper
function appendLog(userEmail: string, action: string, target: string) {
  const data = loadDatabase();
  const newLog = {
    id: `log-${Date.now()}`,
    userEmail: userEmail || 'Anonymous',
    action,
    target,
    timestamp: new Date().toISOString()
  };
  data.logs = [newLog, ...(data.logs || [])].slice(0, 100); // maintain last 100 logs
  saveDatabase(data);
}

// Global generic save endpoint to support all dashboard operations
app.post('/api/save-database', (req, res) => {
  const { updatedData, userEmail, action, target } = req.body;
  if (!updatedData) {
    return res.status(400).json({ error: 'Missing updatedData' });
  }
  
  saveDatabase(updatedData);
  if (action && target) {
    appendLog(userEmail, action, target);
  }
  res.json({ success: true, message: 'Database persistent save success' });
});

// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CML Portal Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
