/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import logoImg from '../assets/images/logo.jpg';
import { 
  Trophy, 
  Users, 
  Sparkles, 
  CheckCircle, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Eye, 
  EyeOff, 
  Download, 
  FileSpreadsheet,
  List,
  Star,
  Search,
  BookOpen,
  Activity,
  Award,
  Crown,
  Medal,
  TrendingUp,
  Flame,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

interface KalolsavamViewProps {
  dbData: any;
  isAdminLoggedIn: boolean;
  onSaveDatabase: (updatedData: any, action: string, target: string) => Promise<boolean>;
  currentUser: any;
}

export default function KalolsavamView({ dbData, isAdminLoggedIn, onSaveDatabase, currentUser }: KalolsavamViewProps) {
  // Compute categories and items dynamically from registrations
  const itemsMap: Record<string, Array<{ id: string; name: string; eventName: string; status: string }>> = {};
  
  (dbData.registrations || []).forEach((reg: any) => {
    if (!itemsMap[reg.section]) {
      itemsMap[reg.section] = [];
    }
    const existing = itemsMap[reg.section].find(i => i.eventName === reg.eventName);
    if (!existing) {
      const statusKey = `Kalolsavam_${reg.section}_${reg.eventName}`;
      const status = (dbData.competitionStatuses && dbData.competitionStatuses[statusKey]) || 'Not Started';
      itemsMap[reg.section].push({
        id: `event_${reg.section}_${reg.eventName}`.replace(/\s+/g, ''),
        name: reg.eventName.toUpperCase(),
        eventName: reg.eventName,
        status: status
      });
    }
  });

  // Default to these categories if db is empty
  if (Object.keys(itemsMap).length === 0) {
    itemsMap["Sub Junior"] = [];
    itemsMap["Junior"] = [];
    itemsMap["Senior"] = [];
    itemsMap["Super Senior"] = [];
    itemsMap["Group Items"] = [];
  }

  const ageCategories = Object.keys(itemsMap);

  // Build participants dynamically
  const participantsList = (dbData.registrations || []).map((reg: any) => {
    return {
      id: reg.id,
      name: reg.competitorName,
      shakha: dbData.units.find((u: any) => u.id === reg.shakhaId)?.name || reg.shakhaId,
      itemId: `event_${reg.section}_${reg.eventName}`.replace(/\s+/g, ''),
      categoryName: `${reg.eventName.toUpperCase()} - ${reg.section.toUpperCase()}`
    };
  });

  // Selected filters states
  const [selectedCategory, setSelectedCategory] = useState<string>("Sub Junior");
  const [selectedItem, setSelectedItem] = useState<string>("sj-3"); // Displays SOLO SUB JUNIOR BOYS by default, matching screenshot
  const [standingsLayout, setStandingsLayout] = useState<'bento' | 'podium' | 'analytics'>('bento');

  // Registrar panel entry states
  const [resCompetitorName, setResCompetitorName] = useState('');
  const [resUnitId, setResUnitId] = useState('');
  const [resEventName, setResEventName] = useState('');
  const [resGrade, setResGrade] = useState<'A' | 'B' | 'C' | 'None'>('None');
  const [resPosition, setResPosition] = useState<'1st' | '2nd' | '3rd' | 'None'>('None');
  const [resIsPublished, setResIsPublished] = useState(true);
  const [resMarks, setResMarks] = useState(''); // Live marks e.g. 92, 85
  const [editingResultId, setEditingResultId] = useState<string | null>(null);

  const [leaderboardFilter, setLeaderboardFilter] = useState<'Overall' | 'Kalolsavam' | 'Sahithyamalsaram'>('Kalolsavam');

  // Unified visual Search and Filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [positionFilter, setPositionFilter] = useState<string>('All');

  const getGradePoints = (grade: string) => {
    if (grade === 'A') return 5;
    if (grade === 'B') return 3;
    if (grade === 'C') return 1;
    return 0;
  };

  const getPositionPoints = (pos: string) => {
    if (pos === '1st') return 5;
    if (pos === '2nd') return 3;
    if (pos === '3rd') return 1;
    return 0;
  };

  const calculateTotalScore = (grade: string, pos: string) => {
    return getGradePoints(grade) + getPositionPoints(pos);
  };

  // Safe category switching that resets item defaults
  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    const items = itemsMap[catName];
    if (items && items.length > 0) {
      // Set to first item of new category
      setSelectedItem(items[0].id);
    } else {
      setSelectedItem('All');
    }
  };

  // Calculate overall rankings using standard CML tie-breakers
  const calculateLeaderboard = (compMode: 'Overall' | 'Kalolsavam' | 'Sahithyamalsaram') => {
    const unitsList = dbData?.units || [];
    const resultsList = dbData?.results || [];

    const relevantResults = resultsList.filter((r: any) => {
      if (!r.isPublished) return false;
      if (compMode === 'Kalolsavam') return r.competition === 'Kalolsavam';
      if (compMode === 'Sahithyamalsaram') return r.competition === 'Sahithyamalsaram';
      return true;
    });

    const summary = unitsList.map((unit: any) => {
      const unitResults = relevantResults.filter((r: any) => r.unitId === unit.id);
      const totalPoints = unitResults.reduce((sum: number, r: any) => sum + (r.totalPoints || 0), 0);
      const participantsCount = unitResults.length;
      const aGradesCount = unitResults.filter((r: any) => r.grade === 'A').length;
      const firstPositionsCount = unitResults.filter((r: any) => r.position === '1st').length;
      const secondPositionsCount = unitResults.filter((r: any) => r.position === '2nd').length;

      return {
        unitId: unit.id,
        unitName: unit.name,
        totalPoints,
        participantsCount,
        aGradesCount,
        firstPositionsCount,
        secondPositionsCount
      };
    });

    summary.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.aGradesCount !== a.aGradesCount) return b.aGradesCount - a.aGradesCount;
      if (b.firstPositionsCount !== a.firstPositionsCount) return b.firstPositionsCount - a.firstPositionsCount;
      if (b.secondPositionsCount !== a.secondPositionsCount) return b.secondPositionsCount - a.secondPositionsCount;
      if (b.participantsCount !== a.participantsCount) return b.participantsCount - a.participantsCount;
      return 0;
    });

    const ranked: any[] = [];
    summary.forEach((item, index) => {
      if (index > 0) {
        const prev = summary[index - 1];
        const isTied = (
          item.totalPoints === prev.totalPoints &&
          item.aGradesCount === prev.aGradesCount &&
          item.firstPositionsCount === prev.firstPositionsCount &&
          item.secondPositionsCount === prev.secondPositionsCount &&
          item.participantsCount === prev.participantsCount
        );
        if (isTied) {
          ranked.push({ ...item, rank: ranked[index - 1].rank });
        } else {
          ranked.push({ ...item, rank: index + 1 });
        }
      } else {
        ranked.push({ ...item, rank: 1 });
      }
    });

    return ranked;
  };

  // Handles adding/editing participant results
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resCompetitorName || !resUnitId || !resEventName) {
      alert('Missing selections! Competitor, Parish Unit, and Event are mandatory.');
      return;
    }

    const selectedUnit = dbData?.units?.find((u: any) => u.id === resUnitId);
    if (!selectedUnit) {
      alert('Parish Unit list corrupted.');
      return;
    }

    const totalPts = calculateTotalScore(resGrade, resPosition);
    let originalResults = [...(dbData?.results || [])];

    if (editingResultId) {
      originalResults = originalResults.map(r => r.id === editingResultId ? {
        ...r,
        competitorName: resCompetitorName,
        unitId: resUnitId,
        unitName: selectedUnit.name,
        eventName: resEventName,
        grade: resGrade,
        position: resPosition,
        totalPoints: totalPts,
        isPublished: resIsPublished,
        marks: resMarks || '-'
      } : r);
    } else {
      const newRes = {
        id: `res-${Date.now()}`,
        competitorName: resCompetitorName,
        unitId: resUnitId,
        unitName: selectedUnit.name,
        competition: 'Kalolsavam' as const,
        eventName: resEventName,
        grade: resGrade,
        position: resPosition,
        totalPoints: totalPts,
        isPublished: resIsPublished,
        marks: resMarks || '-',
        createdAt: new Date().toISOString()
      };
      originalResults.push(newRes);
    }

    const updated = { ...dbData, results: originalResults };
    const success = await onSaveDatabase(
      updated, 
      editingResultId ? 'EDIT_RESULT' : 'ADD_RESULT', 
      `Result for ${resCompetitorName} (Score: ${totalPts})`
    );

    if (success) {
      setResCompetitorName('');
      setResUnitId('');
      setResEventName('');
      setResGrade('None');
      setResPosition('None');
      setResMarks('');
      setResIsPublished(true);
      setEditingResultId(null);
    }
  };

  const handleDeleteResult = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete participant result record for "${name}"? This recalculates all unit score tables.`)) {
      return;
    }
    const filteredRegs = (dbData?.results || []).filter((r: any) => r.id !== id);
    const updated = { ...dbData, results: filteredRegs };
    await onSaveDatabase(updated, 'DELETE_RESULT', `Remove ledger result index of ${name}`);
  };

  const handleEditClick = (participant: any, matchedDbResult?: any) => {
    const defaultUnit = dbData?.units?.find((u: any) => u.name.includes(participant.shakha) || participant.shakha.includes(u.name.replace(' Church', '').replace('St. Marys Church, ', '')));
    
    if (matchedDbResult) {
      setEditingResultId(matchedDbResult.id);
      setResCompetitorName(matchedDbResult.competitorName);
      setResUnitId(matchedDbResult.unitId);
      setResEventName(matchedDbResult.eventName);
      setResGrade(matchedDbResult.grade);
      setResPosition(matchedDbResult.position);
      setResMarks(matchedDbResult.marks || '');
      setResIsPublished(matchedDbResult.isPublished);
    } else {
      setEditingResultId(null);
      setResCompetitorName(participant.name);
      setResUnitId(defaultUnit ? defaultUnit.id : '');
      
      const currentItemObj = itemsMap[selectedCategory]?.find(i => i.id === selectedItem);
      setResEventName(currentItemObj ? currentItemObj.eventName : '');
      setResGrade('None');
      setResPosition('None');
      setResMarks('');
      setResIsPublished(true);
    }

    const formElement = document.getElementById('ad-form-box-kalolsavam');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTogglePublish = async (r: any) => {
    const toggled = !r.isPublished;
    const modified = (dbData?.results || []).map((item: any) => item.id === r.id ? { ...item, isPublished: toggled } : item);
    const updated = { ...dbData, results: modified };
    await onSaveDatabase(updated, toggled ? 'PUBLISH_RESULT' : 'UNPUBLISH_RESULT', `Change publish flag for ${r.competitorName}`);
  };

  // High-fidelity PDF exporter
  const exportPDF = async (type: 'participant' | 'competition' | 'unit' | 'leaderboard', selectedEntity?: any) => {
    const doc = new jsPDF();
    
    doc.setFillColor(136, 19, 55); 
    doc.rect(0, 0, 210, 42, 'F');
    try {
      const img = new Image();
      img.src = logoImg;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      doc.addImage(img, 'JPEG', 15, 8, 26, 26);
    } catch(e) { console.warn(e); }
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CHERUPUSHPA MISSION LEAGUE', 105, 17, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('KALIYAR MEKHALA', 105, 25, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(244, 63, 94);
    doc.text('AUTOMATED COMPETITION PORTAL SCORING & LEDGER CERTIFICATION', 105, 31, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(220, 220, 220);
    doc.text(`Document Released: ${new Date().toLocaleDateString()} (Virtual Registry File)`, 195, 37, { align: 'right' });
    
    let y = 55;
    
    if (type === 'leaderboard') {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`OFFICIAL COMPREHENSIVE SCOREBOARD (${selectedEntity.toUpperCase()})`, 15, y);
      y += 4;
      doc.setDrawColor(244, 63, 94);
      doc.setLineWidth(0.6);
      doc.line(15, y, 195, y);
      y += 10;
      
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 10, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('Rank', 20, y + 6.5);
      doc.text('Parish Church Unit', 35, y + 6.5);
      doc.text('Points', 110, y + 6.5);
      doc.text('Cadets', 125, y + 6.5);
      doc.text('A-Grades', 145, y + 6.5);
      doc.text('1st Pos', 165, y + 6.5);
      doc.text('2nd Pos', 182, y + 6.5);
      y += 10;
      
      const rows = calculateLeaderboard(selectedEntity);
      rows.forEach((row, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 30;
        }
        doc.setFillColor(idx % 2 === 0 ? 255 : 252, idx % 2 === 0 ? 255 : 251, idx % 2 === 0 ? 255 : 251);
        doc.rect(15, y, 180, 8.5, 'F');
        doc.setTextColor(15, 23, 42);
        if (row.rank === 1) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(180, 83, 9);
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        doc.text(String(row.rank), 20, y + 5.5);
        doc.text(row.unitName, 35, y + 5.5);
        doc.text(String(row.totalPoints), 110, y + 5.5);
        doc.text(String(row.participantsCount), 125, y + 5.5);
        doc.text(String(row.aGradesCount), 145, y + 5.5);
        doc.text(String(row.firstPositionsCount), 165, y + 5.5);
        doc.text(String(row.secondPositionsCount), 182, y + 5.5);
        y += 8.5;
      });
    } else if (type === 'competition') {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`COMPETITION TRACK SPECIFICATION SHEET - ${selectedEntity}`, 15, y);
      y += 4;
      doc.setDrawColor(244, 63, 94);
      doc.line(15, y, 195, y);
      y += 10;
      
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 10, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Participant Name', 16, y + 6.5);
      doc.text('Parish Church Unit', 65, y + 6.5);
      doc.text('Grade', 145, y + 6.5);
      doc.text('Position', 162, y + 6.5);
      doc.text('Points Claimed', 180, y + 6.5);
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
        doc.text(row.competitorName, 16, y + 5.5);
        doc.text(row.unitName, 65, y + 5.5);
        doc.text(row.grade, 145, y + 5.5);
        doc.text(row.position, 162, y + 5.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`${row.totalPoints} Pts`, 180, y + 5.5);
        y += 8.5;
      });
    } else if (type === 'participant') {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`INDIVIDUAL ACHIEVEMENT CERTIFICATE TRANSCRIPT`, 15, y);
      y += 4;
      doc.setDrawColor(244, 63, 94);
      doc.line(15, y, 195, y);
      y += 10;
      
      const row = selectedEntity;
      
      doc.setFillColor(254, 252, 232);
      doc.rect(15, y, 180, 52, 'F');
      
      doc.setTextColor(180, 83, 9);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.text(row.competitorName, 25, y + 11);
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Parish Unit Church: `, 25, y + 21);
      doc.setFont('helvetica', 'normal');
      doc.text(row.unitName, 65, y + 21);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Competition Class: `, 25, y + 28);
      doc.setFont('helvetica', 'normal');
      doc.text(row.competition, 65, y + 28);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Registered Event: `, 25, y + 35);
      doc.setFont('helvetica', 'normal');
      doc.text(row.eventName, 60, y + 35);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Certificate Credit: `, 25, y + 43);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(190, 18, 60);
      doc.text(`${row.totalPoints} Total Automatic Points (Grade: ${row.grade} | Pos: ${row.position})`, 60, y + 43);
      
      y += 62;
      
      doc.setFontSize(9.5);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'bold');
      doc.text('FORMULA METRIC CALCULATIONS:', 15, y);
      y += 6;
      
      doc.setDrawColor(230, 230, 230);
      doc.rect(15, y, 180, 26);
      doc.line(15, y + 8, 195, y + 8);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text('Assessment Field', 20, y + 5);
      doc.text('Acquired Grade/Pos', 80, y + 5);
      doc.text('Points Sum', 150, y + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Grade Points Weight', 20, y + 14);
      doc.text(`${row.grade} Grade`, 80, y + 14);
      doc.text(`${getGradePoints(row.grade)} Points`, 150, y + 14);
      
      doc.text('Position Placement Weight', 20, y + 21);
      doc.text(`${row.position || 'None'} Place`, 80, y + 21);
      doc.text(`${getPositionPoints(row.position)} Points`, 150, y + 21);
      
      y += 38;
      
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text('This digital transcript is automatically computed by the CML central scoreboard database.', 15, y);
      doc.text('All points count under direct audit guidelines outlined in the Golden Jubilee Constitution.', 15, y + 4.5);
      
      y += 22;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9.5);
      doc.text('Rev. Fr. Mathew Elanjimattom', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('CML Mekhala Director (Presbytery Seal)', 20, y + 4);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('Mr. Joel Veliyath', 140, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Mekhala Central Organizer', 140, y + 4);
    }
    
    doc.save(`cml_report_${type}_${selectedEntity?.name || selectedEntity?.competitorName || selectedEntity || 'sheet'}.pdf`);
  };

  // Build the live visual table rows including seed lists merged dynamically with database outputs
  const getVisibleParticipants = () => {
    // Current chosen items in state
    const currentItemConfigs = itemsMap[selectedCategory] || [];
    const activeResults = dbData?.results || [];

    // Filter which item IDs are relevant based on "All" vs specific selection
    const targetItemIds = selectedItem === 'All' 
      ? currentItemConfigs.map(item => item.id)
      : [selectedItem];

    // Build unique participant list
    const list: Array<{
      id: string;
      name: string;
      shakha: string;
      category: string;
      marks: string;
      grade?: string;
      position?: string;
      points?: number;
      isDynamic?: boolean;
      dbResult?: any;
    }> = [];

    targetItemIds.forEach(itemId => {
      const itemConfig = currentItemConfigs.find(i => i.id === itemId);
      if (!itemConfig) return;

      // 1. Load active seed rows that belong to this item
      const itemSeeds = participantsList.filter(p => p.itemId === itemId);
      itemSeeds.forEach(seed => {
        // Scan for matching database override results
        const dbOverride = activeResults.find((r: any) => 
          r.registrationId === seed.id || (r.competition === 'Kalolsavam' && 
          r.eventName.toLowerCase().trim() === itemConfig.eventName.toLowerCase().trim() && 
          r.competitorName.toLowerCase().trim() === seed.name.toLowerCase().trim())
        );

        list.push({
          id: dbOverride ? dbOverride.id : seed.id,
          name: seed.name,
          shakha: seed.shakha,
          category: seed.categoryName,
          marks: dbOverride ? (dbOverride.marks || `${dbOverride.totalPoints}`) : '-',
          grade: dbOverride?.grade,
          position: dbOverride?.position,
          points: dbOverride?.totalPoints,
          isDynamic: false,
          dbResult: dbOverride
        });
      });

      // 2. Load any new entries manually created inside db.json that belong to this event of Kalolsavam
      const dbOnlyEntries = activeResults.filter((r: any) => 
        r.competition === 'Kalolsavam' && 
        r.eventName.toLowerCase().trim() === itemConfig.eventName.toLowerCase().trim() &&
        !itemSeeds.some(seed => seed.name.toLowerCase().trim() === r.competitorName.toLowerCase().trim())
      );

      dbOnlyEntries.forEach((r: any) => {
        list.push({
          id: r.id,
          name: r.competitorName.toUpperCase(),
          shakha: r.unitName.replace(' Church', '').replace('St. Marys ', '').replace('St. Sebastian ', '').replace('St. Augustine ', '').replace('St. George ', '').replace('St. Thomas ', ''),
          category: `${itemConfig.name} - KALIYAR REGION`,
          marks: r.marks || `${r.totalPoints}`,
          grade: r.grade,
          position: r.position,
          points: r.totalPoints,
          isDynamic: true,
          dbResult: r
        });
      });
    });

    return list;
  };

  const rawParticipants = getVisibleParticipants();
  const visibleParticipants = rawParticipants.filter(p => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchShakha = p.shakha.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      if (!matchName && !matchShakha && !matchCategory) return false;
    }
    if (gradeFilter !== 'All') {
      if (gradeFilter === 'None') {
        if (p.grade && p.grade !== 'None') return false;
      } else {
        if (p.grade !== gradeFilter) return false;
      }
    }
    if (positionFilter !== 'All') {
      if (positionFilter === 'None') {
        if (p.position && p.position !== 'None') return false;
      } else {
        if (p.position !== positionFilter) return false;
      }
    }
    return true;
  });

  const parishUnitsList = dbData?.units || [];
  const activeEventsList = itemsMap[selectedCategory] || [];

  return (
    <div className="w-full bg-[#fafbfd] relative pb-24 overflow-hidden">
      {/* Premium subtle dotted visual background grid matching Swiss modern layout */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-75 pointer-events-none -z-10" />
      
      {/* Elegant atmospheric radial glow lights */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-rose-500/5 to-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/5 to-rose-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 flex flex-col gap-8 relative z-10">
        
        {/* Elite modular header bar with card-like micro elevations */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/60 pb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-550 rounded-2xl border border-rose-200/30 shadow-xs shrink-0 mt-1 pb-2.5">
              <Flame className="w-6 h-6 animate-pulse text-rose-500" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest font-mono bg-rose-50 border border-rose-200/40 px-2.5 py-0.5 rounded-full">
                  Cherupushpa Mission League
                </span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider">
                  Live Registry
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black font-display text-slate-900 tracking-tight leading-none mt-1.5">
                Kalolsavam <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f43f5e] to-rose-600">Results Desk</span>
              </h1>
              <p className="text-xs md:text-sm font-sans text-slate-550 mt-1.5 font-medium">
                Official certified live ledger, academic grade aggregates, and Shakha championships of Kaliyar Mekhala.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2.5 sm:items-center self-stretch md:self-auto">
            <button
              onClick={() => exportPDF('leaderboard', 'Kalolsavam')}
              className="flex-1 md:flex-none px-4 md:px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-sans font-black text-[11px] tracking-wider uppercase rounded-xl flex items-center justify-center gap-2.5 transition active:scale-[0.99] hover:shadow-md hover:shadow-slate-900/5 cursor-pointer select-none"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Championship PDF</span>
            </button>
            <button
              onClick={() => exportPDF('competition', 'Kalolsavam')}
              className="flex-1 md:flex-none px-4 md:px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/80 font-sans font-black text-[11px] tracking-wider uppercase rounded-xl flex items-center justify-center gap-2.5 transition active:scale-[0.99] hover:shadow-xs shadow-2xs cursor-pointer select-none"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-550" />
              <span>Ledger Spreadsheet</span>
            </button>
          </div>
        </div>

        {/* Master Full-Width Dashboard Layout */}
        <div className="flex flex-col gap-8 items-stretch w-full">
          
          {/* Main content grids */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* REDESIGNED OVERALL SHAKHA/UNIT LEADERS (Trophy Standing Card) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-xs relative overflow-hidden">
              {/* Backglow lights for ambient premium aesthetic */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-xs">
                    <Trophy className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm md:text-base text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                      Mekhala Unit Championship Standings
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5 font-medium">
                      Real-time aggregated points & certified grade tally across all Shakhas
                    </p>
                  </div>
                </div>
                
                {/* Visual View-Mode Toggles */}
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100 self-stretch sm:self-auto justify-between">
                  <button
                    onClick={() => setStandingsLayout('bento')}
                    className={`flex-1 sm:flex-none px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      standingsLayout === 'bento'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40 font-extrabold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Bento Grid</span>
                  </button>
                  <button
                    onClick={() => setStandingsLayout('podium')}
                    className={`flex-1 sm:flex-none px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      standingsLayout === 'podium'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40 font-extrabold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Podium Arena</span>
                  </button>
                  <button
                    onClick={() => setStandingsLayout('analytics')}
                    className={`flex-1 sm:flex-none px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      standingsLayout === 'analytics'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40 font-extrabold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Detailed List</span>
                  </button>
                </div>
              </div>

              {/* DYNAMIC CONTENT AREA */}
              <AnimatePresence mode="wait">
                {standingsLayout === 'bento' && (
                  <motion.div
                    key="bento"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10"
                  >
                    {calculateLeaderboard('Kalolsavam').map((unitRank, idx) => {
                      let medalBadge = null;
                      let cardStyle = "bg-white border-slate-200/80 hover:border-slate-350 shadow-2xs hover:shadow-sm";
                      let rankBadgeStyle = "bg-slate-100/70 border border-slate-200 text-slate-600";
                      let scoreColor = "text-[#8b5cf6]";
                      let progressColor = "bg-slate-400";
                      let premiumBadge = null;
                      
                      if (unitRank.rank === 1) {
                        cardStyle = "bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white border-amber-250 hover:border-amber-400 shadow-md shadow-amber-500/5 ring-1 ring-amber-400/10 hover:shadow-amber-500/10";
                        rankBadgeStyle = "bg-amber-100/80 border border-amber-300 text-amber-900 font-extrabold shadow-2xs";
                        scoreColor = "text-amber-500";
                        progressColor = "bg-gradient-to-r from-amber-400 to-amber-600";
                        medalBadge = <Crown className="w-4.5 h-4.5 text-amber-550 fill-amber-100 animate-bounce" />;
                        premiumBadge = (
                          <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400 text-amber-50 text-[8px] font-black uppercase tracking-widest rounded-full shadow-xs">
                            Championship Leader
                          </div>
                        );
                      } else if (unitRank.rank === 2) {
                        cardStyle = "bg-gradient-to-b from-slate-100/60 via-slate-50/10 to-white border-slate-300 hover:border-slate-400 shadow-xs hover:shadow-md";
                        rankBadgeStyle = "bg-slate-150/80 border border-slate-300 text-slate-800 font-extrabold";
                        scoreColor = "text-slate-600";
                        progressColor = "bg-gradient-to-r from-slate-400 to-slate-500";
                        medalBadge = <Medal className="w-4 h-4 text-slate-500 fill-slate-100" />;
                      } else if (unitRank.rank === 3) {
                        cardStyle = "bg-gradient-to-b from-orange-100/40 via-orange-50/5 to-white border-orange-200 hover:border-orange-350 shadow-xs hover:shadow-md";
                        rankBadgeStyle = "bg-orange-100/80 border border-orange-300 text-orange-900 font-extrabold";
                        scoreColor = "text-orange-600";
                        progressColor = "bg-gradient-to-r from-orange-400 to-orange-550";
                        medalBadge = <Medal className="w-4 h-4 text-orange-600 fill-orange-100" />;
                      }

                      const displayName = unitRank.unitName
                        .replace(' Church', '')
                        .replace('St. Marys ', '')
                        .replace('St. Sebastian ', '')
                        .replace('St. Augustine ', '')
                        .replace('St. George ', '')
                        .replace('St. Thomas ', '')
                        .replace('St. Josephs ', '')
                        .trim();

                      const standingsList = calculateLeaderboard('Kalolsavam');
                      const maxPoints = standingsList.length > 0 ? standingsList[0].totalPoints : 1;
                      const pct = maxPoints > 0 ? (unitRank.totalPoints / maxPoints) * 100 : 0;

                      return (
                        <div
                          key={unitRank.unitId}
                          className={`rounded-2xl p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-300 border relative group ${cardStyle}`}
                        >
                          {premiumBadge}
                          <div className="flex items-center justify-between gap-1 mb-3.5">
                            <span className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 leading-none ${rankBadgeStyle}`}>
                              RANK {unitRank.rank}
                            </span>
                            {medalBadge || <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:scale-125 transition" />}
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-sans font-black text-slate-805 text-xs md:text-sm tracking-tight truncate group-hover:text-slate-950 transition" title={unitRank.unitName}>
                                {displayName}
                              </h4>
                            </div>

                            <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-slate-100 font-mono">
                              <span className="text-[9px] text-slate-450 uppercase font-sans font-bold select-none">Points</span>
                              <p className={`text-xl md:text-2xl font-black ${scoreColor} leading-none tracking-tight flex items-center gap-1`}>
                                {unitRank.totalPoints}
                                <span className="text-[10px] text-slate-400 font-bold ml-1 font-sans">PTS</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {standingsLayout === 'podium' && (
                  <motion.div
                    key="podium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-8 relative z-10"
                  >
                    {/* Visual Arena Podium Display */}
                    <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 py-6 md:pt-14 md:pb-4">
                      
                      {/* SILVER MEDALIST CARD (2nd Place) */}
                      {(() => {
                        const sList = calculateLeaderboard('Kalolsavam');
                        const secondRank = sList[1];
                        if (!secondRank) return null;
                        
                        const displayName = secondRank.unitName
                          .replace(' Church', '')
                          .replace('St. Marys ', '')
                          .replace('St. Sebastian ', '')
                          .replace('St. Augustine ', '')
                          .replace('St. George ', '')
                          .replace('St. Thomas ', '')
                          .replace('St. Josephs ', '')
                          .trim();

                        return (
                          <div className="order-2 md:order-1 flex-1 flex flex-col items-center justify-end">
                            <div className="w-full md:max-w-[200px] bg-gradient-to-b from-slate-100 to-white border border-slate-300 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs relative pt-8">
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-200 border border-slate-300 text-slate-800 font-mono font-black text-sm flex items-center justify-center shadow-xs">
                                2
                              </span>
                              <Medal className="w-10 h-10 text-slate-450 fill-slate-100 mb-2" />
                              <h4 className="font-sans font-black text-slate-800 text-xs sm:text-sm tracking-tight truncate w-full" title={secondRank.unitName}>
                                {displayName}
                              </h4>
                              <p className="text-[9px] text-slate-400 uppercase font-black font-mono tracking-wider mt-1">
                                {secondRank.participantsCount} entries • {secondRank.aGradesCount} A Grades
                              </p>
                            </div>
                            <div className="hidden md:flex w-full md:max-w-[200px] h-28 bg-gradient-to-b from-slate-200 to-slate-100/50 border-x border-b border-slate-200 rounded-b-xl flex-col items-center justify-center p-3">
                              <span className="text-3xl font-black text-slate-705 leading-none">{secondRank.totalPoints}</span>
                              <span className="text-[10px] text-slate-450 font-black tracking-wider uppercase mt-1">PTS</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* GOLD CHAMPIONSHIP (1st Place) */}
                      {(() => {
                        const sList = calculateLeaderboard('Kalolsavam');
                        const firstRank = sList[0];
                        if (!firstRank) return null;
                        
                        const displayName = firstRank.unitName
                          .replace(' Church', '')
                          .replace('St. Marys ', '')
                          .replace('St. Sebastian ', '')
                          .replace('St. Augustine ', '')
                          .replace('St. George ', '')
                          .replace('St. Thomas ', '')
                          .replace('St. Josephs ', '')
                          .trim();

                        return (
                          <div className="order-1 md:order-2 flex-1 flex flex-col items-center justify-end">
                            <div className="w-full md:max-w-[220px] bg-gradient-to-b from-amber-50 to-white border border-amber-300 rounded-2xl p-4 flex flex-col items-center text-center shadow-md relative pt-10 ring-2 ring-amber-400/20">
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 border-2 border-white text-amber-950 font-mono font-black text-lg flex items-center justify-center shadow-md animate-pulse">
                                <Crown className="w-6 h-6 text-amber-950 fill-amber-100" />
                              </span>
                              <Sparkles className="w-5 h-5 text-amber-400 absolute top-2 right-4 animate-bounce" />
                              <h4 className="font-sans font-black text-amber-950 text-sm tracking-tight truncate w-full" title={firstRank.unitName}>
                                {displayName}
                              </h4>
                              <p className="text-[9px] text-amber-800/80 uppercase font-black font-mono tracking-wider mt-1">
                                {firstRank.participantsCount} entries • {firstRank.aGradesCount} A Grades
                              </p>
                            </div>
                            <div className="hidden md:flex w-full md:max-w-[220px] h-36 bg-gradient-to-b from-amber-100 to-amber-50/30 border-x border-b border-amber-200 rounded-b-xl flex-col items-center justify-center p-3 shadow-xs">
                              <span className="text-4xl font-black text-amber-650 leading-none">{firstRank.totalPoints}</span>
                              <span className="text-[10px] text-amber-700 font-black tracking-wider uppercase mt-1">PTS</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* BRONZE MEDALIST CARD (3rd Place) */}
                      {(() => {
                        const sList = calculateLeaderboard('Kalolsavam');
                        const thirdRank = sList[2];
                        if (!thirdRank) return null;
                        
                        const displayName = thirdRank.unitName
                          .replace(' Church', '')
                          .replace('St. Marys ', '')
                          .replace('St. Sebastian ', '')
                          .replace('St. Augustine ', '')
                          .replace('St. George ', '')
                          .replace('St. Thomas ', '')
                          .replace('St. Josephs ', '')
                          .trim();

                        return (
                          <div className="order-3 md:order-3 flex-1 flex flex-col items-center justify-end">
                            <div className="w-full md:max-w-[200px] bg-gradient-to-b from-orange-50 to-white border border-orange-200 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs relative pt-8">
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-orange-100 border border-orange-200 text-orange-950 font-mono font-black text-sm flex items-center justify-center shadow-xs">
                                3
                              </span>
                              <Medal className="w-10 h-10 text-orange-600 fill-orange-105 mb-2" />
                              <h4 className="font-sans font-black text-slate-800 text-xs sm:text-sm tracking-tight truncate w-full" title={thirdRank.unitName}>
                                {displayName}
                              </h4>
                              <p className="text-[9px] text-orange-800/70 uppercase font-black font-mono tracking-wider mt-1">
                                {thirdRank.participantsCount} entries • {thirdRank.aGradesCount} A Grades
                              </p>
                            </div>
                            <div className="hidden md:flex w-full md:max-w-[200px] h-20 bg-gradient-to-b from-orange-100/60 to-orange-50/20 border-x border-b border-orange-200 rounded-b-xl flex-col items-center justify-center p-3">
                              <span className="text-2xl font-black text-orange-605 leading-none">{thirdRank.totalPoints}</span>
                              <span className="text-[10px] text-orange-604 font-semibold tracking-wider uppercase mt-1">PTS</span>
                            </div>
                          </div>
                        );
                      })()}

                    </div>

                    {/* Stiff runners list layout below the podium arena */}
                    {(() => {
                      const sList = calculateLeaderboard('Kalolsavam');
                      const runners = sList.slice(3);
                      if (runners.length === 0) return null;

                      return (
                        <div className="border-t border-slate-100 pt-6">
                          <span className="text-[10px] font-black text-slate-400 font-sans uppercase tracking-[0.15em] block mb-3 text-left">
                            Remaining Standings
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {runners.map((runRank) => {
                              const displayName = runRank.unitName
                                .replace(' Church', '')
                                .replace('St. Marys ', '')
                                .replace('St. Sebastian ', '')
                                .replace('St. Augustine ', '')
                                .replace('St. George ', '')
                                .replace('St. Thomas ', '')
                                .replace('St. Josephs ', '')
                                .trim();

                              const maxPoints = sList[0].totalPoints || 1;
                              const pct = (runRank.totalPoints / maxPoints) * 100;

                              return (
                                <div 
                                  key={runRank.unitId}
                                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 hover:border-slate-350 transition rounded-2xl gap-3"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-7 h-7 rounded-full bg-slate-200/70 font-mono font-bold text-slate-800 text-xs flex items-center justify-center shrink-0">
                                      {runRank.rank}
                                    </span>
                                    <div className="min-w-0 text-left">
                                      <h5 className="font-sans font-extrabold text-xs text-slate-805 truncate" title={runRank.unitName}>
                                        {displayName}
                                      </h5>
                                      <div className="w-24 sm:w-32 h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                                        <div className="h-full bg-[#f43f5e] rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end shrink-0 text-right">
                                    <span className="text-[15px] font-mono font-black text-[#8b5cf6]">{runRank.totalPoints} PTS</span>
                                    <span className="text-[8px] font-bold text-slate-450 uppercase">{runRank.participantsCount} entries</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {standingsLayout === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-2 relative z-10"
                  >
                    <div className="w-full overflow-x-auto rounded-2xl border border-slate-150 shadow-2xs">
                      <table className="w-full text-left border-collapse min-w-[400px] bg-white">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                            <th className="py-3 px-4 w-12 text-center">Rank</th>
                            <th className="py-3 px-4">Parish Unit / Shakha</th>
                            <th className="py-3 px-4 text-right">Points Tally</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-left">
                          {calculateLeaderboard('Kalolsavam').map((unitRank) => {
                            const displayName = unitRank.unitName
                              .replace(' Church', '')
                              .replace('St. Marys ', '')
                              .replace('St. Sebastian ', '')
                              .replace('St. Augustine ', '')
                              .replace('St. George ', '')
                              .replace('St. Thomas ', '')
                              .replace('St. Josephs ', '')
                              .trim();

                            let badge = null;
                            if (unitRank.rank === 1) badge = "🥇";
                            else if (unitRank.rank === 2) badge = "🥈";
                            else if (unitRank.rank === 3) badge = "🥉";

                            return (
                              <tr 
                                key={unitRank.unitId}
                                className="hover:bg-slate-50/70 transition-colors"
                              >
                                <td className="py-3.5 px-4 text-center font-mono font-black text-slate-800 text-xs flex items-center justify-center gap-1">
                                  <span>{unitRank.rank}</span>
                                  {badge && <span className="text-xs">{badge}</span>}
                                </td>
                                <td className="py-3.5 px-4 font-sans font-black text-slate-800 text-xs tracking-tight uppercase">
                                  {displayName}
                                  <span className="text-[10px] text-slate-400 capitalize font-medium font-sans block tracking-normal mt-0.5">
                                    {unitRank.unitName}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="inline-flex items-baseline gap-1 font-mono">
                                    <span className="text-base font-black text-[#8b5cf6]">{unitRank.totalPoints}</span>
                                    <span className="text-[9px] text-slate-405 font-black font-sans uppercase">PTS</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Class Competitive Event Selector */}
            <div className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-col gap-1.5 mb-5 border-b border-slate-100 pb-4">
                <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-rose-500 fill-rose-500/25" />
                  Track Performance Event List
                </h4>
                <p className="text-xs text-slate-450 font-sans font-medium">
                  Select a specific festival category event below to filter competitor tally logs, academic weights, and certify formal transcripts:
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2.5">
                {activeEventsList.length === 0 ? (
                  <div className="w-full py-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Activity className="w-8 h-8 text-slate-200 mb-1" />
                    <span className="font-bold text-sm text-slate-500">No Events Configured Yet</span>
                    <span className="text-xs">Once you upload the official PDF registry, events will appear here automatically.</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedItem('All')}
                      className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 border cursor-pointer select-none ${
                        selectedItem === 'All'
                          ? 'border-rose-500 text-[#8b5cf6] bg-rose-50/40 shadow-xs'
                          : 'bg-slate-50 text-slate-705 border-slate-150/40 hover:bg-slate-100/80 hover:border-slate-205'
                      }`}
                    >
                      All Competitions
                    </button>
                    {activeEventsList.map((item) => {
                  const isActive = selectedItem === item.id;
                  let statusBadgeColor = "bg-slate-100 text-slate-600 border-slate-200/50";
                  if (item.status === 'Result Published') statusBadgeColor = "bg-rose-50 text-rose-600 border-rose-100/40 font-black";
                  if (item.status === 'Completed') statusBadgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100/40 font-black";
                  if (item.status === 'Ongoing' || item.status === 'Started') statusBadgeColor = "bg-amber-50 text-amber-700 border-amber-100/40 font-black";

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 border flex items-center gap-2.5 cursor-pointer select-none whitespace-nowrap ${
                        isActive
                          ? 'border-rose-500 text-[#8b5cf6] bg-rose-50/40 shadow-xs'
                          : 'bg-slate-50 text-slate-705 border-slate-150/40 hover:bg-slate-100/80 hover:border-slate-205'
                      }`}
                    >
                      <span className="tracking-tight">{item.name}</span>
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded-lg border uppercase ${statusBadgeColor}`}>
                        {item.status}
                      </span>
                    </button>
                  );
                })}
                  </>
                )}
              </div>


            </div>

            {/* TABLE AND RESULTS GRID (LEDGER CAPABILITIES) */}
            <div className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
              
              {/* Filter and Search Box Control Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b border-slate-105">
                <div className="w-full md:w-1/2 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search participant name, Shakha parish unit or event classification..."
                    className="w-full bg-slate-50 text-slate-800 pl-10 pr-16 py-3 text-xs rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f43f5e]/10 focus:bg-white border border-slate-150/80 placeholder-slate-400 font-sans shadow-2xs font-medium transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 text-[10px] font-black uppercase tracking-wider bg-slate-200/60 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                    >
                      clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
                  {/* Grade Filters */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-black text-[10px] uppercase tracking-wider font-mono mr-0.5 select-none text-slate-400">Grade:</span>
                    <select
                      value={gradeFilter}
                      onChange={(e) => setGradeFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-150/80 text-slate-750 px-3.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#f43f5e]/10 focus:bg-white cursor-pointer transition-all"
                    >
                      <option value="All">All Grades</option>
                      <option value="A">Grade A Only</option>
                      <option value="B">Grade B Only</option>
                      <option value="C">Grade C Only</option>
                      <option value="None">No Grade</option>
                    </select>
                  </div>

                  {/* Position filters */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-black text-[10px] uppercase tracking-wider font-mono mr-0.5 select-none text-slate-400">Position:</span>
                    <select
                      value={positionFilter}
                      onChange={(e) => setPositionFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-150/80 text-slate-755 px-3.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#f43f5e]/10 focus:bg-white cursor-pointer transition-all"
                    >
                      <option value="All">All Positions</option>
                      <option value="1st">1st Place</option>
                      <option value="2nd">2nd Place</option>
                      <option value="3rd">3rd Place</option>
                      <option value="None">No position</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Ledger Output */}
              <div className="w-full overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.14em] font-mono bg-slate-50/50">
                      <th className="py-4 px-5 font-semibold text-slate-450 h-11">Name</th>
                      <th className="py-4 px-5 font-semibold text-slate-450 h-11">Shakha / parish unit</th>
                      <th className="py-4 px-5 font-semibold text-slate-450 h-11">Category Class</th>
                      <th className="py-4 px-5 font-semibold text-slate-450 text-center h-11">Grade</th>
                      <th className="py-4 px-5 font-semibold text-slate-450 text-center h-11">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/70">
                    {visibleParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-xs text-slate-400">
                          <div className="flex flex-col items-center gap-2.5">
                            <Users className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                            <span className="font-semibold text-slate-500">No results or entries found match selected guidelines.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visibleParticipants.map((p) => {
                        return (
                          <tr 
                            key={p.id}
                            onClick={() => isAdminLoggedIn && handleEditClick(p, p.dbResult)}
                            className={`group transition duration-250 hover:bg-slate-50/80 ${
                              isAdminLoggedIn ? 'cursor-pointer' : ''
                            } ${
                              p.dbResult && !p.dbResult.isPublished ? 'opacity-65 bg-amber-50/10' : ''
                            }`}
                          >
                            <td className="py-4 px-5 text-xs md:text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                              <div className="flex items-center gap-2">
                                <span className="group-hover:text-rose-600 transition duration-200">{p.name}</span>
                                {isAdminLoggedIn && (
                                  <span className="inline-flex items-center gap-1 text-[8px] bg-rose-50 border border-rose-150/40 text-rose-600 font-extrabold px-2 py-0.5 rounded-lg scale-90 translate-y-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <Edit2 className="w-2.5 h-2.5" /> Tap to Edit
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-5 text-xs font-semibold text-slate-600 font-sans">
                              {p.shakha}
                            </td>
                            <td className="py-4 px-5 text-xs text-slate-500 font-medium font-sans max-w-[280px] truncate" title={p.category}>
                              {p.category}
                            </td>
                            <td className="py-4 px-5 text-xs text-center">
                              {p.grade && p.grade !== 'None' ? (
                                <span className={`px-3 py-1 text-[10px] font-black rounded-lg tracking-wider uppercase inline-block border ${
                                  p.grade === 'A' 
                                    ? 'bg-rose-50 border-rose-100 text-rose-550 shadow-xs' 
                                    : p.grade === 'B'
                                    ? 'bg-amber-50 border-amber-100 text-amber-700'
                                    : 'bg-slate-50 border-slate-100 text-slate-600'
                                }`}>
                                  Grade {p.grade}
                                </span>
                              ) : (
                                <span className="text-slate-350 font-sans font-semibold text-xs">-</span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-xs text-center">
                              {p.position && p.position !== 'None' ? (
                                <span className={`px-3 py-1 font-black text-[10px] rounded-lg tracking-wider uppercase inline-block border ${
                                  p.position === '1st'
                                    ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/20 border-amber-300 text-amber-800'
                                    : p.position === '2nd'
                                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                                    : 'bg-amber-700/10 border-amber-700/20 text-amber-900'
                                }`}>
                                  {p.position} Placement
                                </span>
                              ) : (
                                <span className="text-slate-350 font-sans font-semibold text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Secured registrar form rendering if active admin session */}
            {isAdminLoggedIn && (
              <div id="ad-form-box-kalolsavam" className="bg-slate-950 border border-slate-850 rounded-[32px] p-6 md:p-8 relative overflow-hidden text-left shadow-2xl text-white">
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-850 pb-5 mb-6 relative z-10">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                      <Save className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-amber-550 font-mono font-black uppercase tracking-widest block">
                        Secured Registration Authority
                      </span>
                      <h4 className="font-sans font-black text-md text-white tracking-tight flex items-center gap-1.5">
                        {editingResultId ? 'Modify Tally Ledger Record' : 'Log New Competitor Entry'}
                      </h4>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {editingResultId && (
                      <div className="flex items-center gap-1.5">
                        {/* Toggle Publish button inside form */}
                        {resIsPublished ? (
                          <button
                            type="button"
                            onClick={() => {
                              const matched = dbData?.results?.find((r: any) => r.id === editingResultId);
                              if (matched) handleTogglePublish(matched);
                            }}
                            className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-emerald-905/60 transition cursor-pointer flex items-center gap-1 select-none"
                            title="Set ledger item to draft mode"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-450" /> Published
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const matched = dbData?.results?.find((r: any) => r.id === editingResultId);
                              if (matched) handleTogglePublish(matched);
                            }}
                            className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900/80 text-amber-500 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-amber-900/60 transition cursor-pointer flex items-center gap-1 select-none"
                            title="Publish ledger item live immediately"
                          >
                            <EyeOff className="w-3.5 h-3.5 text-amber-500" /> Draft
                          </button>
                        )}

                        {/* Individual certificate document trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            const matched = dbData?.results?.find((r: any) => r.id === editingResultId);
                            if (matched) exportPDF('participant', matched);
                          }}
                          className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-100 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-slate-800 transition cursor-pointer flex items-center gap-1 select-none"
                          title="Generate individual certificate pdf"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" /> Cert
                        </button>

                        {/* Delete button (Super Admin/Admin only) */}
                        {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteResult(editingResultId, resCompetitorName)}
                            className="px-3 py-1.5 bg-rose-955/80 hover:bg-rose-900 text-rose-400 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-rose-900/60 transition cursor-pointer flex items-center gap-1 select-none"
                            title="Permanently drop record"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Delete
                          </button>
                        )}
                      </div>
                    )}

                    {editingResultId && (
                      <button
                        onClick={() => {
                          setEditingResultId(null);
                          setResCompetitorName('');
                          setResUnitId('');
                          setResEventName('');
                          setResGrade('None');
                          setResPosition('None');
                          setResMarks('');
                          setResIsPublished(true);
                        }}
                        className="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition"
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveResult} className="grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10 text-xs text-left">
                  {/* Competitor Name */}
                  <div className="md:col-span-4 flex flex-col gap-1.5">
                    <label className="font-extrabold text-[#94a3b8] text-[10px] uppercase tracking-wider font-mono">Competitor Name:</label>
                    <input
                      type="text"
                      required
                      value={resCompetitorName}
                      onChange={(e: any) => setResCompetitorName(e.target.value)}
                      placeholder="e.g. ABRAHAM MATHEW"
                      className="w-full bg-[#0f172a] border border-[#1e293b] text-slate-100 p-3 rounded-xl focus:outline-none focus:border-[#f43f5e]/80 font-sans font-semibold placeholder-slate-650 transition-colors shadow-inner"
                    />
                  </div>

                  {/* Associated Parish Unit */}
                  <div className="md:col-span-4 flex flex-col gap-1.5">
                    <label className="font-extrabold text-[#94a3b8] text-[10px] uppercase tracking-wider font-mono">Parish Unit / Shakha:</label>
                    <select
                      required
                      value={resUnitId}
                      onChange={(e: any) => setResUnitId(e.target.value)}
                      className="w-full bg-[#0f172a] border border-[#1e293b] text-slate-100 p-3 rounded-xl focus:outline-none focus:border-[#f43f5e]/80 font-semibold cursor-pointer text-xs transition-colors shadow-inner text-slate-200"
                    >
                      <option value="">-- Choose Parish Unit --</option>
                      {parishUnitsList.map((u: any) => (
                        <option key={u.id} value={u.id} className="bg-[#0f172a] text-white">{u.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Registered Event Category */}
                  <div className="md:col-span-4 flex flex-col gap-1.5">
                    <label className="font-extrabold text-[#94a3b8] text-[10px] uppercase tracking-wider font-mono">Registered Event Category:</label>
                    <select
                      required
                      value={resEventName}
                      onChange={(e: any) => setResEventName(e.target.value)}
                      className="w-full bg-[#0f172a] border border-[#1e293b] text-slate-100 p-3 rounded-xl focus:outline-none focus:border-[#f43f5e]/80 font-semibold cursor-pointer text-xs transition-colors shadow-inner text-slate-200"
                    >
                      <option value="">-- Choose Category Event --</option>
                      {selectedItem === 'All' ? (
                        activeEventsList.map((item) => (
                          <option key={item.id} value={item.eventName} className="bg-[#0f172a] text-white">{item.name}</option>
                        ))
                      ) : (
                        activeEventsList.filter(item => item.id === selectedItem).map((item) => (
                          <option key={item.id} value={item.eventName} className="bg-[#0f172a] text-white">{item.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Competitor Marks Input */}
                  <div className="md:col-span-3 flex flex-col gap-1.5">
                    <label className="font-extrabold text-[#94a3b8] text-[10px] uppercase tracking-wider font-mono">Competitor Marks:</label>
                    <input
                      type="text"
                      value={resMarks}
                      onChange={(e: any) => setResMarks(e.target.value)}
                      placeholder="e.g. 92.5 or 85"
                      className="w-full bg-[#0f172a] border border-[#1e293b] text-slate-100 p-3 rounded-xl focus:outline-none focus:border-[#f43f5e]/80 font-sans font-semibold placeholder-slate-655 transition-colors shadow-inner"
                    />
                  </div>

                  {/* Performance Grade Selection */}
                  <div className="md:col-span-3 flex flex-col gap-1.5">
                    <label className="font-extrabold text-[#94a3b8] flex justify-between text-[10px] uppercase tracking-wider font-mono font-bold">
                      <span>Performance Grade:</span>
                      <span className="text-amber-400 font-mono">+{getGradePoints(resGrade)} Pts</span>
                    </label>
                    <select
                      value={resGrade}
                      onChange={(e: any) => setResGrade(e.target.value as any)}
                      className="w-full bg-[#0f172a] border border-[#1e293b] text-slate-100 p-3 rounded-xl focus:outline-none focus:border-[#f43f5e]/80 font-semibold cursor-pointer text-xs transition-colors shadow-inner text-slate-200"
                    >
                      <option value="None" className="bg-[#0f172a] text-white">None / No Grade (0 pts)</option>
                      <option value="A" className="bg-[#0f172a] text-white">A Grade (5 pts)</option>
                      <option value="B" className="bg-[#0f172a] text-white">B Grade (3 pts)</option>
                      <option value="C" className="bg-[#0f172a] text-white">C Grade (1 pt)</option>
                    </select>
                  </div>

                  {/* Placement position select */}
                  <div className="md:col-span-3 flex flex-col gap-1.5">
                    <label className="font-extrabold text-[#94a3b8] flex justify-between text-[10px] uppercase tracking-wider font-mono font-bold">
                      <span>Jury Position:</span>
                      <span className="text-rose-400 font-mono">+{getPositionPoints(resPosition)} Pts</span>
                    </label>
                    <select
                      value={resPosition}
                      onChange={(e: any) => setResPosition(e.target.value as any)}
                      className="w-full bg-[#0f172a] border border-[#1e293b] text-slate-100 p-3 rounded-xl focus:outline-none focus:border-[#f43f5e]/80 font-semibold cursor-pointer text-xs transition-colors shadow-inner text-slate-200"
                    >
                      <option value="None">No Position Placement (0 pts)</option>
                      <option value="1st">1st Position (5 pts)</option>
                      <option value="2nd">2nd Position (3 pts)</option>
                      <option value="3rd">3rd Position (1 pt)</option>
                    </select>
                  </div>

                  {/* Live total calculated output check */}
                  <div className="md:col-span-3 flex items-center gap-4 bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] mt-1 shadow-inner h-[50px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-[#94a3b8] font-black uppercase tracking-widest block font-mono">Live Sum Weight:</span>
                      <span className="text-xs font-mono font-black text-amber-300 leading-none mt-0.5">
                        {calculateTotalScore(resGrade, resPosition)} Total Pts
                      </span>
                      <span className="text-[8px] text-slate-550 font-mono leading-none mt-0.5">
                        ({getGradePoints(resGrade)} gr. + {getPositionPoints(resPosition)} pos.)
                      </span>
                    </div>
                    
                    {/* Publish Checkbox */}
                    <div className="ml-auto flex items-center gap-1.5 select-none shrink-0 border-l border-slate-800 pl-4 h-full">
                      <input
                        type="checkbox"
                        id="cb-is-published"
                        checked={resIsPublished}
                        onChange={(e: any) => setResIsPublished(e.target.checked)}
                        className="accent-rose-600 h-4.5 w-4.5 rounded cursor-pointer leading-none"
                      />
                      <label htmlFor="cb-is-published" className="font-bold text-[10px] uppercase tracking-wider text-slate-400 pointer-events-auto cursor-pointer leading-none">
                        Publish Live
                      </label>
                    </div>
                  </div>

                  {/* Submit trigger button */}
                  <div className="md:col-span-12 flex justify-end mt-3">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-rose-600 to-[#f43f5e] hover:from-rose-500 hover:to-rose-600 text-white font-sans font-black text-[10px] tracking-wider uppercase rounded-xl shadow-lg hover:shadow-rose-500/10 transition duration-300 cursor-pointer select-none border border-rose-500/20"
                    >
                      {editingResultId ? 'Save Ledger Record Entry' : 'Publish Ledger Entry'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
