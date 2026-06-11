import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Sparkles,
  Users,
  MapPin,
  Phone,
  User,
  Award,
  Download,
  Search,
  Plus,
  Trash2,
  Printer,
  X,
  CheckCircle
} from 'lucide-react';
import { ChosenRegistration, ParishUnit } from '../types';

interface ChosenViewProps {
  dbData: any;
  onSaveDatabase: (updatedData: any, action: string, target: string) => Promise<boolean>;
}

export default function ChosenView({ dbData, onSaveDatabase }: ChosenViewProps) {
  const registrations: ChosenRegistration[] = dbData?.chosenRegistrations || [];
  const units: ParishUnit[] = dbData?.units || [];

  const [participantName, setParticipantName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fatherPhoneNumber, setFatherPhoneNumber] = useState('');
  const [position, setPosition] = useState('');
  const [shakha, setShakha] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [draftParticipants, setDraftParticipants] = useState<ChosenRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<ChosenRegistration[] | null>(null);
  const [printData, setPrintData] = useState<{ title: string; list: ChosenRegistration[] } | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const positionsPreset = [
    'President',
    'Vice President',
    'Secretary',
    'Joint Secretary',
    'Organizer',
    'Executive Member'
  ];

  const shakhaOptions = [
    'Kaliyar',
    'Vannappuram',
    'Thommankuth',
    'Kodikulam',
    'Koduvely',
    'Njarakkad',
    'Kadavoor',
    'Thennathoor',
    'Paingottoor',
    'Mullaringad',
    'Rajagiri',
    'Mundanmudy',
    'Punnamattom'
  ];

  const handleAddToBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!participantName.trim()) {
      setMessage({ type: 'error', text: 'Please enter participant name' });
      return;
    }
    if (!fatherName.trim()) {
      setMessage({ type: 'error', text: 'Please enter father\'s name' });
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setMessage({ type: 'error', text: 'Please enter valid 10-digit phone number' });
      return;
    }
    if (!fatherPhoneNumber || fatherPhoneNumber.length < 10) {
      setMessage({ type: 'error', text: 'Please enter valid father\'s phone number' });
      return;
    }
    if (!position) {
      setMessage({ type: 'error', text: 'Please select position' });
      return;
    }
    if (!shakha) {
      setMessage({ type: 'error', text: 'Please select shakha' });
      return;
    }

    const newDraft: ChosenRegistration = {
      id: `chosen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      participantName: participantName.trim(),
      fatherName: fatherName.trim(),
      position,
      shakha,
      contactNumber: phoneNumber,
      parentsContactNumber: fatherPhoneNumber,
      createdAt: new Date().toISOString()
    };

    setDraftParticipants((s) => [...s, newDraft]);
    setMessage({ type: 'success', text: `${participantName} added to draft batch!` });
    
    setParticipantName('');
    setFatherName('');
    setPhoneNumber('');
    setFatherPhoneNumber('');
    setPosition('');
    setShakha('');
  };

  const handleDownloadCSV = (list: ChosenRegistration[], prefix = 'chosen') => {
    if (!list.length) return;
    const csvHeader = 'No.,Participant Name,Father Name,Phone,Father Phone,Position,Shakha\n';
    const csvRows = list
      .map(
        (p, idx) =>
          `"${idx + 1}","${p.participantName}","${p.fatherName}","${p.contactNumber}","${p.parentsContactNumber}","${p.position}","${p.shakha}"`
      )
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResult(null);
      return;
    }
    setSearchResult(
      registrations.filter(
        (r) =>
          r.participantName.toLowerCase().includes(q) ||
          r.shakha.toLowerCase().includes(q) ||
          r.contactNumber.includes(q)
      )
    );
  };

  const openPrint = (list: ChosenRegistration[], title = 'Print') => {
    setPrintData({ title, list });
  };

  const generateCleanPDF = async () => {
    if (!printData || !printData.list.length) {
      alert('No participants to export');
      return;
    }

    setIsPdfGenerating(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const leftMargin = 10;
      const rightMargin = 10;
      const usableWidth = pageWidth - leftMargin - rightMargin;
      let yPosition = 8;

      // ===== HEADER SECTION =====
      // Top line
      pdf.setDrawColor(41, 84, 209);
      pdf.setLineWidth(1.5);
      pdf.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition);
      yPosition += 4;

      // Organization name
      pdf.setFont('times', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(25, 55, 120);
      pdf.text('CHERUPUSHPA MISSION LEAGUE', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;

      // Subtitle
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(60, 80, 110);
      pdf.text('Kaliyar Mekhala', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;

      // Event title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(25, 55, 120);
      pdf.text('CHOSEN LEADERS MEETING 2026', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;

      // Dividing line
      pdf.setDrawColor(100, 150, 230);
      pdf.setLineWidth(0.5);
      pdf.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition);
      yPosition += 3;

      // Document info line 1
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(50, 70, 100);
      pdf.text('Document Type:', leftMargin, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text('Participant Registration', leftMargin + 32, yPosition);

      pdf.setFont('helvetica', 'bold');
      pdf.text('Total:', pageWidth / 2 + 15, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(printData.list.length.toString(), pageWidth / 2 + 28, yPosition);
      yPosition += 4;

      // Document info line 2
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date:', leftMargin, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(dateStr, leftMargin + 10, yPosition);

      pdf.setFont('helvetica', 'bold');
      pdf.text('Time:', pageWidth / 2 + 15, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(timeStr, pageWidth / 2 + 25, yPosition);
      yPosition += 5;

      // Second dividing line
      pdf.setDrawColor(100, 150, 230);
      pdf.setLineWidth(0.5);
      pdf.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition);
      yPosition += 4;

      // ===== TABLE SECTION =====
      // Column configuration - precise widths that add up to usableWidth
      const columnWidths = [6.5, 25, 25, 15, 17, 17, 17]; // Total: 127.5 (usableWidth)
      const columns = ['No.', 'Participant Name', "Father's Name", 'Position', 'Shakha', 'Phone', 'F.Phone'];
      const headerHeight = 8;
      const rowHeight = 6.5;

      // Draw table header
      pdf.setFillColor(41, 84, 209);
      pdf.setDrawColor(25, 55, 120);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(255, 255, 255);
      pdf.setLineWidth(0.4);

      let xPos = leftMargin;
      columns.forEach((col, idx) => {
        // Draw cell background
        pdf.rect(xPos, yPosition, columnWidths[idx], headerHeight, 'F');
        // Draw border
        pdf.setDrawColor(25, 55, 120);
        pdf.rect(xPos, yPosition, columnWidths[idx], headerHeight);
        
        // Text positioning
        const cellCenterX = xPos + columnWidths[idx] / 2;
        const cellCenterY = yPosition + headerHeight / 2 + 1;
        pdf.text(col, cellCenterX, cellCenterY, { align: 'center', maxWidth: columnWidths[idx] - 1 });
        xPos += columnWidths[idx];
      });

      yPosition += headerHeight;

      // ===== DATA ROWS =====
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);

      printData.list.forEach((participant, idx) => {
        // Check page break
        if (yPosition + rowHeight > pageHeight - 15) {
          // Add footer and new page
          yPosition = pageHeight - 2;

          pdf.addPage();
          yPosition = 8;

          // Repeat header on new page
          pdf.setFillColor(41, 84, 209);
          pdf.setDrawColor(25, 55, 120);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7.5);
          pdf.setTextColor(255, 255, 255);
          pdf.setLineWidth(0.4);

          xPos = leftMargin;
          columns.forEach((col, idx) => {
            pdf.rect(xPos, yPosition, columnWidths[idx], headerHeight, 'F');
            pdf.setDrawColor(25, 55, 120);
            pdf.rect(xPos, yPosition, columnWidths[idx], headerHeight);
            const cellCenterX = xPos + columnWidths[idx] / 2;
            const cellCenterY = yPosition + headerHeight / 2 + 1;
            pdf.text(col, cellCenterX, cellCenterY, { align: 'center', maxWidth: columnWidths[idx] - 1 });
            xPos += columnWidths[idx];
          });

          yPosition += headerHeight;
        }

        // Row background
        if (idx % 2 === 0) {
          pdf.setFillColor(240, 245, 255);
          pdf.rect(leftMargin, yPosition, usableWidth, rowHeight, 'F');
        }

        // Row borders
        pdf.setDrawColor(180, 200, 230);
        pdf.setLineWidth(0.2);
        xPos = leftMargin;
        columnWidths.forEach((width) => {
          pdf.rect(xPos, yPosition, width, rowHeight);
          xPos += width;
        });

        // Row text - properly positioned
        pdf.setTextColor(30, 50, 80);
        xPos = leftMargin;

        // Column 1: Number (centered)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        const cellCenterX = xPos + columnWidths[0] / 2;
        const cellCenterY = yPosition + rowHeight / 2 + 0.8;
        pdf.text((idx + 1).toString(), cellCenterX, cellCenterY, { align: 'center' });
        xPos += columnWidths[0];

        // Column 2: Participant Name (left aligned)
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(20, 40, 70);
        const participantName = participant.participantName.length > 26 ? participant.participantName.substring(0, 23) + '...' : participant.participantName;
        pdf.text(participantName, xPos + 1, yPosition + rowHeight / 2 + 0.8, { maxWidth: columnWidths[1] - 2 });
        xPos += columnWidths[1];

        // Column 3: Father's Name (left aligned)
        pdf.setTextColor(20, 40, 70);
        const fatherName = participant.fatherName.length > 26 ? participant.fatherName.substring(0, 23) + '...' : participant.fatherName;
        pdf.text(fatherName, xPos + 1, yPosition + rowHeight / 2 + 0.8, { maxWidth: columnWidths[2] - 2 });
        xPos += columnWidths[2];

        // Column 4: Position (centered)
        pdf.setTextColor(30, 50, 80);
        const posCenterX = xPos + columnWidths[3] / 2;
        const positionText = participant.position.length > 15 ? participant.position.substring(0, 12) + '...' : participant.position;
        pdf.text(positionText, posCenterX, yPosition + rowHeight / 2 + 0.8, { align: 'center', maxWidth: columnWidths[3] - 1 });
        xPos += columnWidths[3];

        // Column 5: Shakha (centered, bold, colored)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(41, 84, 209);
        const shakhaCenterX = xPos + columnWidths[4] / 2;
        const shakhaText = participant.shakha.length > 17 ? participant.shakha.substring(0, 14) + '...' : participant.shakha;
        pdf.text(shakhaText, shakhaCenterX, yPosition + rowHeight / 2 + 0.8, { align: 'center', maxWidth: columnWidths[4] - 1 });
        xPos += columnWidths[4];

        // Column 6: Phone (left aligned, monospace)
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(20, 40, 70);
        pdf.text(participant.contactNumber, xPos + 1, yPosition + rowHeight / 2 + 0.8, { maxWidth: columnWidths[5] - 2 });
        xPos += columnWidths[5];

        // Column 7: Father's Phone (left aligned, monospace)
        pdf.text(participant.parentsContactNumber, xPos + 1, yPosition + rowHeight / 2 + 0.8, { maxWidth: columnWidths[6] - 2 });

        yPosition += rowHeight;
      });

      // ===== FOOTER SECTION =====
      yPosition += 5;

      // Separating line
      pdf.setDrawColor(41, 84, 209);
      pdf.setLineWidth(1);
      pdf.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition);
      yPosition += 6;

      // Signature section
      const signatureStartY = yPosition;
      const colWidth = usableWidth / 3;

      // Left - Seal
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(25, 55, 120);
      pdf.text('SEAL/STAMP', leftMargin + colWidth / 2, signatureStartY, { align: 'center' });
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.4);
      pdf.circle(leftMargin + colWidth / 2, signatureStartY + 8, 8, 'S');

      // Center - Prepared by
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(25, 55, 120);
      pdf.text('Prepared By', leftMargin + colWidth + colWidth / 2, signatureStartY, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(60, 60, 60);
      pdf.text('(Authorized Person)', leftMargin + colWidth + colWidth / 2, signatureStartY + 10, { align: 'center' });
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(leftMargin + colWidth + 8, signatureStartY + 7, leftMargin + 2 * colWidth - 8, signatureStartY + 7);

      // Right - Unit Director
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(25, 55, 120);
      pdf.text('Unit Director', leftMargin + 2 * colWidth + colWidth / 2, signatureStartY, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(60, 60, 60);
      pdf.text('(Parish Priest)', leftMargin + 2 * colWidth + colWidth / 2, signatureStartY + 10, { align: 'center' });
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(leftMargin + 2 * colWidth + 8, signatureStartY + 7, pageWidth - rightMargin - 8, signatureStartY + 7);

      // ===== BOTTOM BORDER =====
      pdf.setDrawColor(41, 84, 209);
      pdf.setLineWidth(1.5);
      pdf.line(leftMargin, pageHeight - 8, pageWidth - rightMargin, pageHeight - 8);

      // Footer text
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(6);
      pdf.setTextColor(100, 120, 150);
      pdf.text('Official Document | CML Kaliyar Mekhala', pageWidth / 2, pageHeight - 3, { align: 'center' });

      // Save PDF
      pdf.save(`CML_Participant_List_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!printData) return;
    
    const element = document.getElementById('printable-content');
    if (!element) {
      alert('Print content not found');
      return;
    }

    setIsPdfGenerating(true);
    try {
      // Use jsPDF with HTML method for better formatting
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();

      // Use html method which preserves styling better
      await pdf.html(element, {
        x: 10,
        y: 10,
        width: pdfWidth - 20,
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true
        }
      });

      // Save the PDF
      pdf.save(`participant_list_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsPdfGenerating(false);
    }
  };


  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-rose-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-rose-300" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">CHOSEN SUMMIT 2026</h1>
                <p className="text-rose-100 text-sm sm:text-base">Delegate Registration Portal</p>
              </div>
            </div>
            <p className="text-slate-200 max-w-2xl">Register participants from your parish shakha for the Cherupushpa Mission League's prestigious summit. Fill in the required details and submit your batch when ready.</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Registration Form - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 border border-slate-100"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900">Batch Registration Form</h2>
                <p className="text-slate-500 text-sm mt-1">Enter delegate information</p>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl mb-6 flex items-center gap-3 ${
                    message.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <span className="text-lg">⚠️</span>
                  )}
                  <span className="font-semibold text-sm">{message.text}</span>
                </motion.div>
              )}

              <form onSubmit={handleAddToBatch} className="space-y-5">
                {/* Participant Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" /> Participant Name
                  </label>
                  <input
                    type="text"
                    required
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  />
                </div>

                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" /> Father's Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Enter father's full name"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  />
                </div>

                {/* Phone Numbers Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit number"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Father's Phone
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={fatherPhoneNumber}
                      onChange={(e) => setFatherPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit number"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition font-mono"
                    />
                  </div>
                </div>

                {/* Position and Shakha Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" /> Position
                    </label>
                    <select
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition bg-white"
                    >
                      <option value="">-- Select Position --</option>
                      {positionsPreset.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Parish Shakha
                    </label>
                    <select
                      required
                      value={shakha}
                      onChange={(e) => setShakha(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition bg-white"
                    >
                      <option value="">-- Select Shakha --</option>
                      {shakhaOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black py-3 px-4 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" /> Add to Draft Batch
                </button>
              </form>
            </motion.div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100"
            >
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" /> Search
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(e); }} className="space-y-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or shakha"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
                >
                  Search Registrations
                </button>
              </form>
              {searchResult && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {searchResult.length > 0 ? (
                    searchResult.map((r) => (
                      <div key={r.id} className="p-2 bg-slate-50 rounded-lg text-xs border border-slate-200">
                        <div className="font-bold text-slate-900">{r.participantName}</div>
                        <div className="text-slate-500">{r.shakha} • {r.position}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-slate-500 text-xs">No results found</div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black">Database Stats</h3>
                <Users className="w-5 h-5 text-rose-400" />
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Registered</span>
                  <span className="font-black text-lg">{registrations.length}</span>
                </div>
                <div className="h-px bg-slate-700"></div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Draft Batch</span>
                  <span className="font-black text-lg text-rose-400">{draftParticipants.length}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Draft Batch Table */}
        {draftParticipants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100"
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Participants</h3>
                <p className="text-sm text-slate-500 mt-1">{draftParticipants.length} participant(s) ready</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadCSV(draftParticipants, 'chosen_participants')}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold text-sm flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button
                  onClick={() => openPrint(draftParticipants, 'Participant Registration List')}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-semibold text-sm flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-left font-bold text-slate-700">Participant</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">Father</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">Position</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">Shakha</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-700">Phone</th>
                    <th className="px-6 py-3 text-center font-bold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {draftParticipants.map((p) => (
                    <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td className="px-6 py-3 font-semibold text-slate-900">{p.participantName}</td>
                      <td className="px-6 py-3 text-slate-600">{p.fatherName}</td>
                      <td className="px-6 py-3 text-slate-600">{p.position}</td>
                      <td className="px-6 py-3 font-semibold text-rose-700">{p.shakha}</td>
                      <td className="px-6 py-3 font-mono text-slate-600">{p.contactNumber}</td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() =>
                            setDraftParticipants((s) => s.filter((x) => x.id !== p.id))
                          }
                          className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Print Modal */}
      <AnimatePresence>
        {printData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Control Bar */}
              <div className="sticky top-0 bg-slate-100 border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-3xl">
                <h3 className="text-lg font-black text-slate-900">Participant Registration List</h3>
                <div className="flex gap-3">
                  <button
                    onClick={generateCleanPDF}
                    disabled={isPdfGenerating}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    <Download className="w-4 h-4" /> {isPdfGenerating ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    <Printer className="w-4 h-4" /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => setPrintData(null)}
                    className="p-2 hover:bg-slate-200 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Print Template */}
              <div id="printable-content" className="p-8 sm:p-12 bg-white">
                {/* Header with Logo */}
                <div className="text-center mb-8 pb-8 border-b-4 border-double border-slate-900">
                  {/* Logo */}
                  <div className="flex justify-center mb-4 bg-white p-2 rounded-lg inline-block mx-auto">
                    <img 
                      src="/src/assets/images/logo.jpg" 
                      alt="CML Logo" 
                      className="h-20 object-contain"
                    />
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 uppercase tracking-tight">
                    Cherupushpa Mission League Kaliyar Mekhala
                  </h1>
                  <h2 className="text-xl font-bold text-rose-700 mb-3 uppercase tracking-wider">
                    Chosen Leaders Meeting
                  </h2>
                  <p className="text-base font-bold text-slate-600 mb-1">
                    Participant Registration
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Summary Box */}
                <div className="mb-8 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Total Participants</p>
                    <p className="text-3xl font-black text-slate-900">{printData.list.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Report Type</p>
                    <p className="text-lg font-bold text-rose-700">Participant List</p>
                  </div>
                </div>

                {/* Table */}
                <div className="mb-8 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-rose-700 text-white">
                        <th className="px-4 py-3 text-left font-bold border border-rose-700 w-12">#</th>
                        <th className="px-4 py-3 text-left font-bold border border-rose-700">Participant Name</th>
                        <th className="px-4 py-3 text-left font-bold border border-rose-700">Father's Name</th>
                        <th className="px-4 py-3 text-left font-bold border border-rose-700 w-32">Position</th>
                        <th className="px-4 py-3 text-left font-bold border border-rose-700 w-32">Parish Shakha</th>
                        <th className="px-4 py-3 text-left font-bold border border-rose-700 w-28">Phone</th>
                        <th className="px-4 py-3 text-left font-bold border border-rose-700 w-32">Father's Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printData.list.map((p, idx) => (
                        <tr key={p.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-200 hover:bg-slate-100 transition`}>
                          <td className="px-4 py-3 font-mono font-bold text-slate-700 border border-slate-200 text-center">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900 border border-slate-200">{p.participantName}</td>
                          <td className="px-4 py-3 text-slate-700 border border-slate-200">{p.fatherName}</td>
                          <td className="px-4 py-3 text-slate-700 border border-slate-200">{p.position}</td>
                          <td className="px-4 py-3 font-semibold text-rose-700 border border-slate-200">{p.shakha}</td>
                          <td className="px-4 py-3 font-mono text-slate-700 border border-slate-200">{p.contactNumber}</td>
                          <td className="px-4 py-3 font-mono text-slate-700 border border-slate-200">{p.parentsContactNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer with Seal and Signature */}
                <div className="mt-12 pt-8 border-t-2 border-slate-300">
                  <div className="flex justify-between items-end">
                    {/* Left: Seal */}
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900">Seal</p>
                    </div>

                    {/* Right: Unit Director Signature */}
                    <div className="text-center">
                      <div className="w-40 h-20 border-b-2 border-slate-400 mb-2"></div>
                      <p className="font-bold text-slate-900 text-sm">Unit Director / Parish Priest</p>
                      <p className="text-xs text-slate-600 mt-1">(Authorized Signature)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Print Styles */}
              <style>{`
                @media print {
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                  
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  
                  #printable-content {
                    width: 100%;
                    page-break-after: auto;
                  }
                  
                  table {
                    page-break-inside: avoid;
                  }
                  
                  tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                  }
                  
                  thead {
                    display: table-header-group;
                  }
                }
              `}</style>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
