/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  PenTool, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  BookMarked,
  FileCheck,
  Search,
  MessageSquare,
  FileText,
  Trophy,
  Download,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Plus,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import jsPDF from 'jspdf';

interface SahithyamalsaramViewProps {
  dbData: any;
  isAdminLoggedIn: boolean;
  onSaveDatabase: (updatedData: any, action: string, target: string) => Promise<boolean>;
  currentUser: any;
}

export default function SahithyamalsaramView({ dbData, isAdminLoggedIn, onSaveDatabase, currentUser }: SahithyamalsaramViewProps) {
  const contestPrompts = [
    {
      id: 1,
      title: 'Bible Essay Writing (ഉപന്യാസ രചന)',
      desc: 'Deep analytical essays examining original theological narratives, early Christian martyrs, or modern ecclesial challenges.',
      wordLimit: '1500 Words Max',
      deadline: 'July 31, 2026',
      badge: 'Highly Popular',
      icon: <PenTool className="w-5 h-5 text-[#d97706]" />,
      promptText: 'Topic of the Month: "The Role of Youth in Reigniting Apostolic Mission - Lessons from St. Thérèse\'s Daily Labours."',
      referenceGuidelines: 'Must contain biblical verses citations. Originality is verified via automated digital academic engines.'
    },
    {
      id: 2,
      title: 'Poetry Composition (കവിതാ രചന)',
      desc: 'Elegant Malayalam verse composition displaying spiritual passion, theological virtues, or praises of Saint Thérèse of Lisieux.',
      wordLimit: '40 Lines Max',
      deadline: 'July 31, 2026',
      badge: 'Creative Craft',
      icon: <Sparkles className="w-5 h-5 text-rose-500" />,
      promptText: 'Theme: "The Unfading Fragrance of the Little Rose of Lisieux" (ചെറുപുഷ്പത്തിന്റെ സുഗന്ധം).',
      referenceGuidelines: 'Metric compliance (വൃത്തശാസ്ത്രം) is not mandatory, but rhythmic structure and phonetic charm earn premium grade margins.'
    },
    {
      id: 3,
      title: 'Manuscript Magazine (ഹസ്തലിഖിത മാസിക)',
      desc: 'Handcrafted illustrated magazine compilations originating from any local Parish Unit. Blending articles, stories, poems, and drawings into a single bound folder.',
      wordLimit: 'Min 20 Pages',
      deadline: 'August 5, 2026',
      badge: 'Flagship Unit Shield',
      icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
      promptText: 'Submissions are compiled by the local unit joint committee and signed off by the Parish Priest/Director.',
      referenceGuidelines: 'Must be completely written by hand (no custom printed typography or AI illustrations elements allowed). Unique drawings and handwriting styling are highly rated.'
    },
    {
      id: 4,
      title: 'Short Story Writing (ചെറു കഥ)',
      desc: 'Inspiring narratives showcasing simple mercy acts, modern missionary choices, spiritual turnarounds, or parish life situations.',
      wordLimit: '1000 Words Max',
      deadline: 'July 31, 2026',
      badge: 'Fiction',
      icon: <BookMarked className="w-5 h-5 text-emerald-500" />,
      promptText: 'Create a story revolving around a single coin dropped into a missionary box under silent sacrifice.',
      referenceGuidelines: 'Sensationalism or direct political references are barred; moral integrity of the characters should inspire Christian virtue.'
    }
  ];

  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [textSearch, setTextSearch] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

  // Competitions Score & Leaderboard administration states
  const [resCompetitorName, setResCompetitorName] = useState('');
  const [resUnitId, setResUnitId] = useState('');
  const [resEventName, setResEventName] = useState('');
  const [resGrade, setResGrade] = useState<'A' | 'B' | 'C' | 'None'>('None');
  const [resPosition, setResPosition] = useState<'1st' | '2nd' | '3rd' | 'None'>('None');
  const [resIsPublished, setResIsPublished] = useState(true);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);

  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsUnitFilter, setResultsUnitFilter] = useState('ALL');
  const [resultsPubFilter, setResultsPubFilter] = useState('ALL');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'Overall' | 'Kalolsavam' | 'Sahithyamalsaram'>('Sahithyamalsaram');

  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Proposed contest draft states
  const [authorName, setAuthorName] = useState('');
  const [authorParish, setAuthorParish] = useState('');
  const [selectedContest, setSelectedContest] = useState('');

  // Scoreboard calculation functions (A=5, B=3, C=1 / 1st=5, 2nd=3, 3rd=1)
  const getGradePoints = (grade: string): number => {
    if (grade === 'A') return 5;
    if (grade === 'B') return 3;
    if (grade === 'C') return 1;
    return 0;
  };

  const getPositionPoints = (pos: string): number => {
    if (pos === '1st') return 5;
    if (pos === '2nd') return 3;
    if (pos === '3rd') return 1;
    return 0;
  };

  const calculateTotalScore = (grade: string, pos: string): number => {
    return getGradePoints(grade) + getPositionPoints(pos);
  };

  // Calculate Leaderboard rows inside Sahithyamalsaram component scoped to the database results
  const calculateLeaderboard = (filterVal: string) => {
    const rawResults = dbData?.results || [];
    const units = dbData?.units || [];
    
    // Group totals by unit
    const groupMap: Record<string, {
      unitId: string;
      unitName: string;
      totalPoints: number;
      participantsCount: number;
      aGradesCount: number;
      firstPositionsCount: number;
      secondPositionsCount: number;
      rank?: number;
    }> = {};

    // Seed units
    units.forEach((u: any) => {
      groupMap[u.id] = {
        unitId: u.id,
        unitName: u.name,
        totalPoints: u.points || 0, // Fallback default
        participantsCount: 0,
        aGradesCount: 0,
        firstPositionsCount: 0,
        secondPositionsCount: 0,
      };
    });

    // Populate actual calculated points from published results
    rawResults.forEach((res: any) => {
      // Filter by competition name if not Overall
      if (filterVal !== 'Overall' && res.competition !== filterVal) {
        return;
      }
      
      if (!res.isPublished) return; // Ignore unpublished draft entries

      const pAmt = calculateTotalScore(res.grade, res.position);
      
      if (!groupMap[res.unitId]) {
        groupMap[res.unitId] = {
          unitId: res.unitId,
          unitName: res.unitName,
          totalPoints: 0,
          participantsCount: 0,
          aGradesCount: 0,
          firstPositionsCount: 0,
          secondPositionsCount: 0,
        };
      }

      const grp = groupMap[res.unitId];
      grp.totalPoints += pAmt;
      grp.participantsCount += 1;
      if (res.grade === 'A') grp.aGradesCount += 1;
      if (res.position === '1st') grp.firstPositionsCount += 1;
      if (res.position === '2nd') grp.secondPositionsCount += 1;
    });

    const rows = Object.values(groupMap);

    // Tie-Breaking Rules:
    // 1. High A Grades count
    // 2. High 1st positions count
    // 3. High 2nd positions count
    // 4. High Participants count
    // If all are equal, they share the rank.
    rows.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.aGradesCount !== a.aGradesCount) {
        return b.aGradesCount - a.aGradesCount;
      }
      if (b.firstPositionsCount !== a.firstPositionsCount) {
        return b.firstPositionsCount - a.firstPositionsCount;
      }
      if (b.secondPositionsCount !== a.secondPositionsCount) {
        return b.secondPositionsCount - a.secondPositionsCount;
      }
      return b.participantsCount - a.participantsCount;
    });

    // Assign shared ranks
    let currentRank = 1;
    let computedRows: any[] = [];
    
    rows.forEach((row, index) => {
      if (index === 0) {
        row.rank = 1;
      } else {
        const prev = rows[index - 1];
        const isTie = (
          row.totalPoints === prev.totalPoints &&
          row.aGradesCount === prev.aGradesCount &&
          row.firstPositionsCount === prev.firstPositionsCount &&
          row.secondPositionsCount === prev.secondPositionsCount &&
          row.participantsCount === prev.participantsCount
        );
        if (isTie) {
          row.rank = prev.rank;
        } else {
          row.rank = index + 1; // standard competition rank density
        }
      }
      computedRows.push(row);
    });

    return computedRows;
  };

  // Administration mutation handlers
  const handleTogglePublish = async (result: any) => {
    const updatedResults = (dbData?.results || []).map((r: any) => {
      if (r.id === result.id) {
        return { ...r, isPublished: !r.isPublished };
      }
      return r;
    });
    
    const nextDb = { ...dbData, results: updatedResults };
    await onSaveDatabase(nextDb, `Toggled publish state for participant ${result.competitorName}`, 'results');
  };

  const handleEditClick = (result: any) => {
    setEditingResultId(result.id);
    setResCompetitorName(result.competitorName);
    setResUnitId(result.unitId);
    setResEventName(result.eventName);
    setResGrade(result.grade);
    setResPosition(result.position);
    setResIsPublished(result.isPublished);

    // Scroll to form smoothly
    const fEl = document.getElementById('ad-form-box-sahithya');
    if (fEl) {
      fEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteResult = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the results for ${name}?`)) return;
    
    const updatedResults = (dbData?.results || []).filter((r: any) => r.id !== id);
    const nextDb = { ...dbData, results: updatedResults };
    
    await onSaveDatabase(nextDb, `Permanently deleted result record of ${name}`, 'results');
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resCompetitorName || !resUnitId || !resEventName) return;

    const findUnit = (dbData?.units || []).find((u: any) => u.id === resUnitId);
    const selUnitName = findUnit ? findUnit.name : 'Unknown';

    const calculatedPoints = calculateTotalScore(resGrade, resPosition);

    let nextResultsList = [...(dbData?.results || [])];

    if (editingResultId) {
      // Modify existing
      nextResultsList = nextResultsList.map((r: any) => {
        if (r.id === editingResultId) {
          return {
            ...r,
            competitorName: resCompetitorName,
            unitId: resUnitId,
            unitName: selUnitName,
            eventName: resEventName,
            grade: resGrade,
            position: resPosition,
            totalPoints: calculatedPoints,
            isPublished: resIsPublished
          };
        }
        return r;
      });
    } else {
      // Create new result record
      const newRecord = {
        id: 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        competitorName: resCompetitorName,
        unitId: resUnitId,
        unitName: selUnitName,
        competition: 'Sahithyamalsaram', // Hardcoded for this view context
        eventName: resEventName,
        grade: resGrade,
        position: resPosition,
        totalPoints: calculatedPoints,
        isPublished: resIsPublished
      };
      nextResultsList.push(newRecord);
    }

    const nextDb = { ...dbData, results: nextResultsList };
    const actionDesc = editingResultId 
      ? `Modified Sahithyamalsaram result record for ${resCompetitorName}` 
      : `Added new Sahithyamalsaram result entry for ${resCompetitorName}`;

    const succeeded = await onSaveDatabase(nextDb, actionDesc, 'results');
    if (succeeded) {
      // Clear administration form states
      setEditingResultId(null);
      setResCompetitorName('');
      setResUnitId('');
      setResEventName('');
      setResGrade('None');
      setResPosition('None');
      setResIsPublished(true);
    }
  };

  // PDF Download Engine using jsPDF
  const exportPDF = (type: 'leaderboard' | 'competition' | 'unit' | 'participant', selectedEntity: any) => {
    const doc = new jsPDF();
    let y = 20;

    // Outer framing styling
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(1.5);
    doc.rect(5, 5, 200, 287);
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.5);
    doc.rect(6.5, 6.5, 197, 284);

    // Header Emblem Card overlay
    doc.setFillColor(30, 41, 59);
    doc.rect(15, y, 180, 26, 'F');
    
    doc.setTextColor(253, 224, 71);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CHEV. GEEVARGHESE JOSEPH CO-FOUNDERS MEMORIAL SHIELD', 24, y + 8);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('CML MEKHALA ACADEMIC BOARD • JURY DESK TRANSCRIPT', 24, y + 15);
    doc.text(`Official Jubilee Ledger Document Verification • Issued: ${new Date().toLocaleDateString()}`, 24, y + 21);
    
    y += 35;

    if (type === 'leaderboard') {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`CML MEKHALA OFFICIAL SHIELD LEADERBOARD [${selectedEntity || 'Overall'}]`, 15, y);
      y += 10;
      
      // Table Header definitions
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 10, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Rank', 20, y + 6.5);
      doc.text('Parish Church Unit', 45, y + 6.5);
      doc.text('Cadets', 105, y + 6.5);
      doc.text('A-Grades', 125, y + 6.5);
      doc.text('1st Places', 150, y + 6.5);
      doc.text('Total Score', 172, y + 6.5);
      y += 10;

      const rows = calculateLeaderboard(selectedEntity);
      rows.forEach((row: any, idx: number) => {
        if (y > 270) {
          doc.addPage();
          y = 30;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFillColor(idx % 2 === 0 ? 255 : 251, idx % 2 === 0 ? 255 : 251, idx % 2 === 0 ? 255 : 251);
        doc.rect(15, y, 180, 8.5, 'F');

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(`${row.rank}`, 20, y + 5.5);
        doc.setFont('helvetica', 'normal');
        doc.text(row.unitName, 45, y + 5.5);
        doc.text(`${row.participantsCount}`, 108, y + 5.5);
        doc.text(`${row.aGradesCount}`, 128, y + 5.5);
        doc.text(`${row.firstPositionsCount}`, 153, y + 5.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`${row.totalPoints} PTS`, 172, y + 5.5);
        
        y += 8.5;
      });
    } 
    else if (type === 'competition') {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`CML OFFICIAL LEDGER: COMPETITION RESULTS - ${selectedEntity.toUpperCase()}`, 15, y);
      y += 10;
      
      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 10, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Participant Name', 20, y + 6.5);
      doc.text('Parish Church Unit', 75, y + 6.5);
      doc.text('Grade', 125, y + 6.5);
      doc.text('Position', 145, y + 6.5);
      doc.text('Points Claimed', 168, y + 6.5);
      y += 10;
      
      const list = (dbData?.results || []).filter((r: any) => r.competition === selectedEntity && r.isPublished);
      list.forEach((row: any, idx: number) => {
        if (y > 270) {
          doc.addPage();
          y = 30;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFillColor(idx % 2 === 0 ? 255 : 251, idx % 2 === 0 ? 255 : 251, idx % 2 === 0 ? 255 : 251);
        doc.rect(15, y, 180, 8.5, 'F');

        doc.setTextColor(15, 23, 42);
        doc.text(row.competitorName, 20, y + 5.5);
        doc.text(row.unitName, 75, y + 5.5);
        doc.text(row.grade, 125, y + 5.5);
        doc.text(row.position || 'None', 145, y + 5.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`${row.totalPoints}`, 172, y + 5.5);
        
        y += 8.5;
      });
    } 
    else if (type === 'unit') {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`CML LEDGER: UNIT ACHIEVEMENT TRANSCRIPT - ${selectedEntity.name.toUpperCase()}`, 15, y);
      y += 10;
      
      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 10, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Participant Name', 20, y + 6.5);
      doc.text('Sect', 68, y + 6.5);
      doc.text('Category Event Name', 100, y + 6.5);
      doc.text('Grade', 145, y + 6.5);
      doc.text('Pos', 160, y + 6.5);
      doc.text('Points', 178, y + 6.5);
      y += 10;
      
      const list = (dbData?.results || []).filter((r: any) => r.unitId === selectedEntity.id && r.isPublished);
      list.forEach((row: any, idx: number) => {
        if (y > 270) {
          doc.addPage();
          y = 30;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFillColor(idx % 2 === 0 ? 255 : 251, idx % 2 === 0 ? 255 : 251, idx % 2 === 0 ? 255 : 251);
        doc.rect(15, y, 180, 8.5, 'F');
        
        doc.setTextColor(15, 23, 42);
        doc.text(row.competitorName, 20, y + 5.5);
        doc.text(row.competition, 68, y + 5.5);
        doc.text(row.eventName, 100, y + 5.5);
        doc.text(row.grade, 145, y + 5.5);
        doc.text(row.position, 160, y + 5.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`${row.totalPoints}`, 178, y + 5.5);
        y += 8.5;
      });
    } 
    else if (type === 'participant') {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`INDIVIDUAL ACHIEVEMENT CERTIFICATE TRANSCRIPT`, 15, y);
      y += 15;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, 180, 65, 'F');
      doc.rect(15, y, 180, 65);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Participant Name:  ${selectedEntity.competitorName}`, 25, y + 12);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Parish Church Unit:  ${selectedEntity.unitName}`, 25, y + 22);
      doc.text(`Competition Track: ${selectedEntity.competition}`, 25, y + 30);
      doc.text(`Category Event:    ${selectedEntity.eventName}`, 25, y + 38);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(25, y + 45, 185, y + 45);

      doc.setFont('helvetica', 'bold');
      doc.text(`Performance Grade: ${selectedEntity.grade} Grade`, 25, y + 54);
      doc.text(`Jury Position Rank:  ${selectedEntity.position || 'None'}`, 25, y + 60);

      // Score Badge Box in individual
      doc.setFillColor(239, 68, 68);
      doc.rect(130, y + 48, 55, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(`CLAIMED: ${selectedEntity.totalPoints} PTS`, 136, y + 56);

      y += 85;

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text('This visual verified transcript constitutes official confirmation of the academic standings', 15, y);
      doc.text('verified directly by the Mekhala Central Jury committee. No secondary alterations are digital-compliant.', 15, y + 5);
    }

    // Footnotes and Board signatures at very bottom
    y = 265;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);
    y += 10;
    
    // Joint certification signature blocks
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Compiled & Authenticated By:', 15, y);
    doc.text('Verified By:', 140, y);
    
    y += 10;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Rev. Fr. Mathew Kolath', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Central Mekhala Director', 15, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Mr. Joel Veliyath', 140, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Mekhala Central Organizer', 140, y + 4);
    
    doc.save(`cml_report_${type}_${selectedEntity?.name || selectedEntity?.competitorName || selectedEntity || 'sheet'}.pdf`);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Check file extension (.docx, .pdf, .txt, .jpg allowed)
    const allowedExtensions = ['pdf', 'docx', 'doc', 'txt', 'jpg', 'jpeg', 'png'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension && allowedExtensions.includes(extension)) {
      setUploadedFile(file);
      setUploadSuccess(false);
    } else {
      alert('Error: Only PDF, Word Documents, plain Text, or scanned JPG images are accepted.');
    }
  };

  const executeUploadSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !authorParish || !selectedContest || !uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(10);

    // Simulate safe upload progress ticks
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadSuccess(true);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const handleResetUpload = () => {
    setUploadedFile(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setAuthorName('');
    setAuthorParish('');
    setSelectedContest('');
  };

  const filteredContests = contestPrompts.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(textSearch.toLowerCase()) || 
                          item.desc.toLowerCase().includes(textSearch.toLowerCase());
    const matchesFilter = activeCategoryFilter === 'ALL' || 
                          (activeCategoryFilter === 'INDIVIDUAL' && item.title !== 'Manuscript Magazine (ഹസ്തലിഖിത മാസിക)') ||
                          (activeCategoryFilter === 'UNIT' && item.title === 'Manuscript Magazine (ഹസ്തലിഖിത മാസിക)');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full bg-[#fdfbfa] relative pb-20 overflow-hidden min-h-screen">
      {/* Editorial Watermark Backglow */}
      <div className="absolute top-0 right-10 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 flex flex-col gap-12 relative z-10">
        
        {/* Scholar Banner Headline Card */}
        <div className="bg-gradient-to-br from-[#1e1e1e] to-[#0f0e0d] rounded-[40px] p-8 sm:p-12 text-white border-2 border-amber-900/20 shadow-2xl relative overflow-hidden flex flex-col gap-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-80 pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Top category pill layout */}
          <div className="flex flex-wrap items-center gap-3 self-start z-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#451a03] border border-amber-700/50 text-amber-200 text-xs font-black tracking-widest uppercase rounded-full shadow-lg">
              <PenTool className="w-4 h-4 text-amber-400" /> WRITING LEAGUE
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-black tracking-widest uppercase rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 text-rose-400" /> CLOSED: JULY 31
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 z-10">
            <div className="flex flex-col gap-3.5 max-w-3xl text-left">
              <h2 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-amber-100 tracking-tight leading-tight">
                Mekhala Sahithyamalsaram
                <span className="block mt-2.5 text-rose-500 text-2xl sm:text-3xl lg:text-4.5xl font-sans font-black">
                  സാഹിത്യമത്സരം • ഭാഷാ സപര്യ
                </span>
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm md:text-base leading-relaxed font-semibold max-w-2xl opacity-90">
                The premier literary competition celebrating writing, poetry composition, analytical essays, and handcrafted parish manuscript magazines. An intellectual arena designed to prompt children to deeply study Biblical truths, Saints' examples, and write with profound style.
              </p>
            </div>

            {/* Scholar Desk Badge Widget */}
            <div className="shrink-0 bg-white/5 border border-white/10 backdrop-blur-md p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col items-start gap-2 max-w-xs text-left">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-[10px] font-mono font-black tracking-wider text-amber-300 uppercase">Jury Desk</span>
              </div>
              <h4 className="text-lg font-sans font-black text-white leading-tight">Draft Evaluation Active</h4>
              <p className="text-[11px] text-stone-300 font-bold leading-normal">Top scoring papers will win publication highlights inside the grand Diocesan Annual Souvenir book.</p>
            </div>
          </div>
        </div>

        {/* Categories Search and Filter Section */}
        <section className="flex flex-col gap-6 text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-amber-200/60 pb-5">
            <div className="flex flex-col gap-1.5 text-left">
              <span className="text-[10px] font-mono font-black text-amber-800 tracking-widest uppercase">WRITTEN CHALLENGES</span>
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Official Writing Subjects • മത്സര വിഷയങ്ങൾ
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Select your specialized creative stream. Click on any block to expand and inspect topics and metrics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Element */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter writing contests..."
                  value={textSearch}
                  onChange={(e) => setTextSearch(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none focus:border-amber-600 transition-all text-slate-800 shadow-3xs"
                />
              </div>

              {/* Categorization Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                {['ALL', 'INDIVIDUAL', 'UNIT'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveCategoryFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-mono font-black tracking-wider uppercase cursor-pointer transition-all ${
                      activeCategoryFilter === filter
                        ? 'bg-amber-850 text-white shadow-md'
                        : 'text-slate-650 hover:bg-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredContests.map((prompt) => {
                const isOpen = selectedTopicId === prompt.id;
                
                return (
                  <motion.div
                    key={prompt.id}
                    layoutId={`sahithya-card-${prompt.id}`}
                    onClick={() => setSelectedTopicId(isOpen ? null : prompt.id)}
                    className={`bg-white rounded-[28px] p-6 sm:p-7 border-2 transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer text-left relative overflow-hidden group/item ${
                      isOpen 
                        ? 'border-amber-500 ring-4 ring-amber-500/10 shadow-lg' 
                        : 'border-slate-200/60 hover:border-amber-400 hover:shadow-xl hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100/50 text-yellow-800 shrink-0">
                          {prompt.icon}
                        </div>
                        <div className="flex items-center gap-1.5 animate-pulse">
                          <span className="inline-flex py-0.5 px-2.5 bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-mono font-black tracking-widest uppercase rounded">
                            {prompt.wordLimit}
                          </span>
                          <span className="inline-flex py-0.5 px-2.5 bg-slate-900 text-amber-300 text-[9px] font-mono font-black tracking-widest uppercase rounded-full">
                            {prompt.badge}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-serif font-black text-slate-900 text-base sm:text-lg leading-tight group-hover/item:text-amber-850 transition-colors mt-1">
                        {prompt.title}
                      </h4>
                      <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed font-semibold">
                        {prompt.desc}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between mt-1 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 text-rose-700">
                        <Clock className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Deadline: {prompt.deadline}
                      </span>
                      <span className="text-amber-800 flex items-center gap-1 font-extrabold group-hover/item:translate-x-0.5 transition-transform">
                        Guidelines & Prompt →
                      </span>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-4 border-t border-dashed border-amber-200/60 flex flex-col gap-3.5 text-xs text-left"
                        >
                          <div className="flex flex-col gap-1.5 p-4 bg-amber-50/50 border border-amber-200/55 rounded-2xl text-left">
                            <span className="text-[9px] font-mono font-black uppercase text-amber-850 tracking-wider flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-700" /> Active Prompt Topic:
                            </span>
                            <span className="font-serif font-bold text-slate-900 text-sm leading-relaxed block">
                              {prompt.promptText}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <span className="text-[9px] font-mono font-black uppercase text-slate-500 tracking-wider block">Official Style Instructions:</span>
                            <span className="leading-relaxed text-slate-650 font-semibold text-[11.5px]">
                              {prompt.referenceGuidelines}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredContests.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-sm font-semibold text-slate-400">
                🚫 No topics found matching "{textSearch}".
              </div>
            )}
          </div>
        </section>

        {/* Drag and Drop Upload System */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2 items-stretch text-left">
          
          {/* Left Uploader Module Block */}
          <div className="lg:col-span-7 bg-white rounded-[32px] border-2 border-slate-200/80 p-6 sm:p-8 flex flex-col gap-6 text-left relative overflow-hidden shadow-xs">
            <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
              <span className="text-[10px] font-mono font-black text-amber-850 tracking-widest uppercase">DRAFT ARCHIVE PORTAL</span>
              <h3 className="font-serif font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
                Submit Your Scholarly Manuscript
              </h3>
              <p className="text-xs text-slate-500 font-bold">Submit typed PDF/Word files or high-quality photographs of handwritten manuscript pages under parish endorsement.</p>
            </div>

            {uploadSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-emerald-50 border-2 border-emerald-100 rounded-3xl text-center flex flex-col items-center gap-3 my-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg font-bold shadow-md">
                  ✓
                </div>
                <h4 className="text-lg font-black text-emerald-950">Manuscript Upload Completed!</h4>
                <p className="text-xs text-emerald-850 leading-relaxed max-w-sm font-bold">
                  Perfect! **"{uploadedFile?.name}"** is logged inside virtual storage lines. Keep a physical print safe of your article for final validation rounds.
                </p>
                <button
                  onClick={handleResetUpload}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-black rounded-xl tracking-wider uppercase mt-2 transition"
                >
                  Submit Another Document
                </button>
              </motion.div>
            ) : (
              <form onSubmit={executeUploadSubmission} className="flex flex-col gap-5 text-xs text-slate-650 font-semibold text-left">
                
                {/* Text fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left font-serif">
                    <label className="text-slate-800 font-black">Author Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Augustine"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-slate-850 font-semibold focus:outline-none focus:border-amber-600 focus:bg-white transition shadow-3xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left font-serif">
                    <label className="text-slate-800 font-black">Parish / School Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kuninji Unit"
                      value={authorParish}
                      onChange={(e) => setAuthorParish(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-slate-850 font-semibold focus:outline-none focus:border-amber-600 focus:bg-white transition shadow-3xs"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1.5 text-left font-serif">
                    <label className="text-slate-800 font-black">Target Contest Stream</label>
                    <select
                      required
                      value={selectedContest}
                      onChange={(e) => setSelectedContest(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-slate-850 font-semibold focus:outline-none focus:border-amber-600 focus:bg-white transition shadow-3xs cursor-pointer"
                    >
                      <option value="">-- Choose Category --</option>
                      {contestPrompts.map(p => (
                        <option key={p.id} value={p.title}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Drag & Drop Box */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed p-8 text-center rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-amber-500 bg-amber-50/20' 
                      : uploadedFile 
                        ? 'border-emerald-550 bg-emerald-50/10' 
                        : 'border-slate-300 hover:border-amber-600 bg-[#fafafa]/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png"
                  />
                  
                  {uploadedFile ? (
                    <>
                      <FileCheck className="w-12 h-12 text-emerald-600 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">{uploadedFile.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium font-mono mt-1">Size: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to transmit</span>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">CHOSEN FILE</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-12 h-12 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">Drag & Drop your draft or click to browse files</span>
                        <span className="text-[10px] text-slate-500 font-medium font-mono mt-1.5">Accepts PDF, DOCX, TXT or clear images up to 10MB</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Progress bar */}
                {isUploading && (
                  <div className="w-full flex flex-col gap-1 text-left">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold font-mono">
                      <span>UPLOADING MANUSCRIPT TRUNK DIRECT TO JURY</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className="bg-amber-600 h-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!authorName || !authorParish || !selectedContest || !uploadedFile || isUploading}
                  className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-850 hover:from-amber-850 hover:to-amber-900 text-white font-extrabold text-xs tracking-widest uppercase rounded-xl transition shadow-lg hover:shadow-amber-950/15 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUploading ? 'DISPATCHING TO JURY SHELVES...' : 'TRANSMIT FINAL WORK TO COMMISSION JURY'}
                </button>
              </form>
            )}
          </div>

          {/* Right Reference Reading block */}
          <div className="lg:col-span-5 bg-slate-950 rounded-[32px] p-6 sm:p-8 border border-slate-900 text-white flex flex-col justify-between gap-6 shadow-xl text-left">
            <div className="flex flex-col gap-3">
              <span className="text-amber-400 font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-widest block bg-amber-500/10 px-3 py-1.5 rounded-lg self-start border border-amber-500/10">
                Recommended reading guides
              </span>
              <h4 className="font-serif font-black text-xl text-stone-100 tracking-tight">
                Curated Sacred Literatures
              </h4>
              <p className="text-xs text-stone-300 font-medium leading-relaxed">
                Unlock higher point evaluation score-ranges by thoroughly studying classic ecclesial biographies, missionary letters, and papal texts:
              </p>
            </div>

            <div className="flex flex-col gap-4 my-1">
              <div className="flex items-start gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-850 transition-colors hover:bg-slate-900/60">
                <span className="text-2xl leading-none bg-slate-850 p-2 rounded-xl text-amber-400">📖</span>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-snug">"Story of a Soul" (ആത്മകഥ)</span>
                  <span className="text-[11px] text-stone-400 font-semibold mt-1">The complete autobiography of Saint Thérèse of Lisieux.</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-850 transition-colors hover:bg-slate-900/60">
                <span className="text-2xl leading-none bg-slate-850 p-2 rounded-xl text-amber-400">📖</span>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-snug">"Redemptoris Missio"</span>
                  <span className="text-[11px] text-stone-400 font-semibold mt-1">St. John Paul II's powerful enclyclical letter on missionary actions.</span>
                </div>
              </div>
            </div>

            {/* Quote footnote */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs italic font-bold text-amber-200/90 leading-relaxed font-serif">
              "Words carry the light of active faith. Write to ignite the hearts of the generation."
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
