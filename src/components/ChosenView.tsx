import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle, 
  Users, 
  MapPin, 
  Phone, 
  User, 
  Award, 
  Download, 
  Search, 
  Heart, 
  Bookmark, 
  Calendar,
  X,
  CreditCard,
  Plus,
  Trash2,
  Printer
} from 'lucide-react';
import { ChosenRegistration, ParishUnit } from '../types';

interface ChosenViewProps {
  dbData: any;
  onSaveDatabase: (updatedData: any, action: string, target: string) => Promise<boolean>;
}

export default function ChosenView({ dbData, onSaveDatabase }: ChosenViewProps) {
  // Pull existing registrations state
  const registrations: ChosenRegistration[] = dbData.chosenRegistrations || [];

  // Form states
  const [participantName, setParticipantName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [position, setPosition] = useState('');
  const [shakha, setShakha] = useState('');
  const [customShakha, setCustomShakha] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [parentsContactNumber, setParentsContactNumber] = useState('');
  
  // UI States
  const [draftParticipants, setDraftParticipants] = useState<ChosenRegistration[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<{ title: string; shakha: string; list: ChosenRegistration[] } | null>(null);
  const [viewingParishUnit, setViewingParishUnit] = useState('');
  
  const [registeredTicket, setRegisteredTicket] = useState<ChosenRegistration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<ChosenRegistration[] | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  const units: ParishUnit[] = dbData.units || [];

  // Preset positions for easy selection
  const positionsPreset = [
    'President',
    'Vice President',
    'Secretary',
    'Joint Secretary',
    'Organizer',
    'Executive Member'
  ];

  const handleAddToBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!participantName.trim()) {
      setMessage({ type: 'err', text: 'Please provide the name of the participant.' });
      return;
    }

    if (!fatherName.trim()) {
      setMessage({ type: 'err', text: "Please provide the Father's Name." });
      return;
    }

    if (!position) {
      setMessage({ type: 'err', text: 'Please select a Position/Designation.' });
      return;
    }
    
    const selectedShakha = shakha === 'Other' ? customShakha : shakha;
    if (!selectedShakha || !selectedShakha.trim()) {
      setMessage({ type: 'err', text: 'Please specify your parish unit (Shakha).' });
      return;
    }

    if (!contactNumber.trim() || contactNumber.length < 10) {
      setMessage({ type: 'err', text: 'Please enter a valid 10-digit contact number.' });
      return;
    }

    if (!parentsContactNumber.trim() || parentsContactNumber.length < 10) {
      setMessage({ type: 'err', text: "Please enter a valid 10-digit Parent's contact number." });
      return;
    }

    // Add unique design key
    const newDraft: ChosenRegistration = {
      id: `chosen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      participantName: participantName.trim(),
      fatherName: fatherName.trim(),
      position: position,
      shakha: selectedShakha.trim(),
      contactNumber: contactNumber.trim(),
      parentsContactNumber: parentsContactNumber.trim(),
      createdAt: new Date().toISOString()
    };

    setDraftParticipants(prev => [...prev, newDraft]);

    // Reset only individual fields. This keeps unit & contact coordinates for rapid multiple entries!
    setParticipantName('');
    setFatherName('');
    setPosition('');

    setMessage({ 
      type: 'success', 
      text: `Draft Enrolled: "${newDraft.participantName}" is added to the batch list below! Keep adding, or submit your batch.` 
    });
  };

  const handleRemoveFromBatch = (id: string) => {
    setDraftParticipants(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => prev.filter(item => item !== id));
    setMessage({ type: 'success', text: 'Removed participant from the local batch list.' });
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === draftParticipants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(draftParticipants.map(p => p.id));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) return;
    setDraftParticipants(prev => prev.filter(p => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    setMessage({ type: 'success', text: 'Removed selected participants from the local batch list.' });
  };

  const handleSubmitBatch = async () => {
    if (draftParticipants.length === 0) {
      setMessage({ type: 'err', text: 'Your registration batch is empty. Please add participants first.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    // Save batch to database in one go
    const updatedRegistrations = [...draftParticipants, ...registrations];
    const updatedDbData = {
      ...dbData,
      chosenRegistrations: updatedRegistrations
    };

    const count = draftParticipants.length;
    const sampleUnit = draftParticipants[0].shakha;

    const success = await onSaveDatabase(
      updatedDbData, 
      'CHOSEN_REGISTRATION_ADD', 
      `Batch of ${count} delegates (${sampleUnit})`
    );

    setIsSubmitting(false);

    if (success) {
      setDraftParticipants([]);
      setSelectedIds([]);
      setMessage({ 
        type: 'success', 
        text: `Successfully registered all ${count} delegates from "${sampleUnit}" to the server database! Output list can be printed or exported below.` 
      });
    } else {
      setMessage({ type: 'err', text: 'Connection failed. Could not write registrations to server database.' });
    }
  };

  const handleDownloadCSV = (listToDownload: ChosenRegistration[], filenamePrefix: string = 'chosen_registrations') => {
    if (listToDownload.length === 0) return;
    
    const csvHeader = 'Sl No,Participant Name,Father Name,Position,Shakha,Contact,Parent Contact\n';
    const csvRows = listToDownload.map((p, index) => 
      `"${index + 1}","${p.participantName.replace(/"/g, '""')}","${p.fatherName.replace(/"/g, '""')}","${p.position.replace(/"/g, '""')}","${p.shakha.replace(/"/g, '""')}","${p.contactNumber}","${p.parentsContactNumber}"`
    ).join('\n');
    
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filenamePrefix}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPrintPreview = (listToPrint: ChosenRegistration[], documentTitle: string, unitName: string) => {
    setPrintData({
      title: documentTitle,
      shakha: unitName,
      list: listToPrint
    });
    setPrintModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }

    const q = searchQuery.toLowerCase();
    const matches = registrations.filter(
      r => r.participantName.toLowerCase().includes(q) || 
           r.contactNumber.includes(q) || 
           r.shakha.toLowerCase().includes(q)
    );
    setSearchResult(matches);
  };

  return (
    <div className="w-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 select-none text-left">
      <div className="max-w-4xl mx-auto">
        {/* Intricate header cards with dynamic premium look */}
        <div className="w-full rounded-3xl bg-gradient-to-br from-slate-900 via-stone-900 to-rose-955 p-6 sm:p-10 text-white relative overflow-hidden shadow-xl mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col text-left">
              <span className="text-amber-400 font-mono text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase">
                ✨ MISSIONARY SUMMIT REGISTRATION
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-sans tracking-tight mt-1">
                CHOSEN 2026
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 font-bold max-w-xl mt-3 leading-relaxed">
                Register now for the prestigious Kaliyar Mekhala Chosen Summit assembly. Enter your credentials to unlock your verified summit ticket.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4.5 shrink-0 self-stretch md:self-auto justify-center">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">TOTAL ENROLLED</span>
                <span className="text-xl font-black text-white">{registrations.length} Delegates</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          
          {/* Form Container */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-4xs">
            <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-sans font-black text-stone-900 text-lg">Enrolment Application</h3>
                <p className="text-xs text-stone-500 font-semibold">Fill all required parameters for active registration recognition</p>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl mb-6 text-xs font-bold leading-normal border ${
                message.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {message.type === 'success' ? '✅' : '⚠️'} {message.text}
              </div>
            )}

            <form onSubmit={handleAddToBatch} className="space-y-5">
              
              {/* Participant Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-stone-700 text-xs font-extrabold flex items-center gap-1.5 uppercase">
                  <User className="w-3.5 h-3.5 text-stone-400" /> Participant Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter full legal name"
                  className="w-full bg-stone-50 border border-stone-250 p-3 sm:p-3.5 rounded-xl text-stone-900 focus:outline-none focus:border-rose-500 focus:bg-white transition text-xs font-bold"
                />
              </div>

              {/* Father's Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-stone-700 text-xs font-extrabold flex items-center gap-1.5 uppercase">
                  <User className="w-3.5 h-3.5 text-stone-400" /> Name of the Father <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Enter Father's name"
                  className="w-full bg-stone-50 border border-stone-250 p-3 sm:p-3.5 rounded-xl text-stone-900 focus:outline-none focus:border-rose-500 focus:bg-white transition text-xs font-bold"
                />
              </div>

              {/* Position */}
              <div className="flex flex-col gap-1.5">
                <label className="text-stone-700 text-xs font-extrabold flex items-center gap-1.5 uppercase">
                  <Award className="w-3.5 h-3.5 text-stone-400" /> Position / Designation <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 p-3 sm:p-3.5 rounded-xl text-stone-900 focus:outline-none focus:border-rose-500 focus:bg-white transition text-xs font-bold"
                >
                  <option value="">-- Choose Position --</option>
                  {positionsPreset.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shakha Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-stone-700 text-xs font-extrabold flex items-center gap-1.5 uppercase">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" /> Shakha / Parish Unit <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={shakha}
                  onChange={(e) => setShakha(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 p-3 sm:p-3.5 rounded-xl text-stone-900 focus:outline-none focus:border-rose-500 focus:bg-white transition text-xs font-bold"
                >
                  <option value="">-- Choose Parish Shakha --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                  <option value="Other">Custom / Other Unit</option>
                </select>

                {shakha === 'Other' && (
                  <input
                    type="text"
                    required
                    value={customShakha}
                    onChange={(e) => setCustomShakha(e.target.value)}
                    placeholder="Type customized shakha organization name"
                    className="w-full bg-stone-50 border border-stone-250 p-3 rounded-xl text-stone-900 focus:outline-none focus:border-rose-500 focus:bg-white transition text-xs font-bold mt-1.5"
                  />
                )}
              </div>

              {/* Contact Numbers Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-700 text-xs font-extrabold flex items-center gap-1.5 uppercase">
                    <Phone className="w-3.5 h-3.5 text-stone-400" /> Contact Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-stone-50 border border-stone-250 p-3 rounded-xl text-stone-900 focus:outline-none focus:border-rose-500 focus:bg-white transition text-xs font-bold font-mono text-left"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-stone-700 text-xs font-extrabold flex items-center gap-1.5 uppercase">
                    <Phone className="w-3.5 h-3.5 text-stone-400" /> Parent's Contact Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={parentsContactNumber}
                    onChange={(e) => setParentsContactNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter Parent's number"
                    className="w-full bg-stone-50 border border-stone-250 p-3 rounded-xl text-stone-900 focus:outline-none focus:border-rose-500 focus:bg-white transition text-xs font-bold font-mono text-left"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-2 select-none"
              >
                <Plus className="w-4 h-4" /> Add Participant to Batch List
              </button>

            </form>
          </div>

          {/* SECTION: Local Batch Preview (if they have items drafted) */}
          {draftParticipants.length > 0 && (
            <div className="mt-8 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 mb-4 gap-4">
                <div>
                  <h3 className="font-sans font-black text-stone-900 text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping"></span>
                    Batch Enrolments Draft ({draftParticipants.length})
                  </h3>
                  <p className="text-xs text-stone-500 font-semibold">Review your entered candidates before submitting them to the server.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleRemoveSelected}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[11px] uppercase rounded-xl transition cursor-pointer flex items-center gap-1 border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Remove Selected ({selectedIds.length})
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadCSV(draftParticipants, 'chosen_draft_batch')}
                    className="px-3 py-1.5 border border-stone-250 hover:bg-stone-50 text-stone-700 font-extrabold text-[11px] uppercase rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleOpenPrintPreview(draftParticipants, 'Batch Registration Draft sheet', draftParticipants[0]?.shakha || 'Multiple Units')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[11px] uppercase rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Print Sheet
                  </button>
                </div>
              </div>

              {/* Table of draft list */}
              <div className="overflow-x-auto border border-stone-150 rounded-xl bg-stone-50/50">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-stone-100/80 border-b border-stone-200 text-[10px] font-mono font-black uppercase text-stone-500 tracking-wider">
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === draftParticipants.length && draftParticipants.length > 0}
                          onChange={handleToggleAll}
                          className="w-4 h-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Father's Name</th>
                      <th className="py-2.5 px-3">Position</th>
                      <th className="py-2.5 px-3">Parish Unit</th>
                      <th className="py-2.5 px-3 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftParticipants.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <tr 
                          key={p.id} 
                          className={`border-b border-stone-150 transition-all duration-200 ${
                            isSelected 
                              ? 'bg-rose-50/70 hover:bg-rose-50 font-medium' 
                              : 'hover:bg-white'
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleRow(p.id)}
                              className="w-4 h-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 font-extrabold text-slate-900">{p.participantName}</td>
                          <td className="py-3 px-3 text-stone-650 font-bold">{p.fatherName}</td>
                          <td className="py-3 px-3 text-stone-600 font-semibold">{p.position}</td>
                          <td className="py-3 px-3 text-rose-700 font-extrabold">{p.shakha}</td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleRemoveFromBatch(p.id)}
                              className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                              title="Remove participant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Server submission trigger */}
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitBatch}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer shadow-md shadow-rose-600/15 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering Batch...' : `Submit and Register Batch (${draftParticipants.length} Delegates)`}
                </button>
              </div>
            </div>
          )}

          {/* SECTION: Parish Enrolment Directory (View / Download already registered items) */}
          <div className="mt-8 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <h3 className="font-sans font-black text-stone-900 text-base">Parish Enrolment Sheets</h3>
                <p className="text-xs text-stone-500 font-semibold">Generate printable delegate sheets with authorized signature margins</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center mb-4">
              <select
                value={viewingParishUnit}
                onChange={(e) => setViewingParishUnit(e.target.value)}
                className="w-full sm:flex-1 bg-stone-50 border border-stone-250 p-2.5 rounded-xl text-stone-900 font-bold text-xs focus:outline-none"
              >
                <option value="">-- Click to Select Parish Unit --</option>
                {Array.from(new Set(registrations.map(r => r.shakha))).filter(Boolean).map((shakhaName) => (
                  <option key={shakhaName} value={shakhaName}>
                    {shakhaName}
                  </option>
                ))}
              </select>

              {viewingParishUnit && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleDownloadCSV(registrations.filter(r => r.shakha === viewingParishUnit), `chosen_${viewingParishUnit}_directory`)}
                    className="flex-1 sm:flex-none px-4 py-2.5 border border-stone-250 hover:bg-stone-50 text-stone-750 font-extrabold text-xs uppercase rounded-xl transition cursor-pointer"
                  >
                    CSV Directory
                  </button>
                  <button
                    onClick={() => handleOpenPrintPreview(registrations.filter(r => r.shakha === viewingParishUnit), 'Authenticated Parish Delegate List', viewingParishUnit)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Sheet
                  </button>
                </div>
              )}
            </div>

            {viewingParishUnit ? (
              <div className="text-left bg-stone-50 border border-stone-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-stone-400">REGISTERED FOR {viewingParishUnit.toUpperCase()}</span>
                  <span className="text-xs font-black text-rose-600">{registrations.filter(r => r.shakha === viewingParishUnit).length} Active Delegates</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {registrations.filter(r => r.shakha === viewingParishUnit).map((r, itemIdx) => (
                    <div key={r.id} className="flex justify-between items-center bg-white p-2 border border-stone-150 rounded-lg text-xs">
                      <div>
                        <span className="font-mono text-stone-400 font-bold mr-2">{itemIdx + 1}.</span>
                        <span className="font-extrabold text-slate-900">{r.participantName}</span>
                        <span className="text-stone-500 font-bold text-[10px] ml-1 mr-1">• Father:</span>
                        <span className="text-stone-700 font-medium text-[11px]">{r.fatherName || 'None'}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-650">{r.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 font-bold">
                No unit picked. Choose a parish unit above to verify, download, or print official summaries.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* TICKET MODAL GATEWAY */}
      <AnimatePresence>
        {registeredTicket && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 select-none backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full border border-stone-200/80 text-center relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => setRegisteredTicket(null)}
                className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 hover:text-stone-900 transition-colors cursor-pointer z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Gradient Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-stone-900 to-rose-955 p-6 text-white text-center relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-rose-500/15 to-transparent rounded-full" />
                <span className="text-amber-400 font-mono text-[9px] font-black tracking-widest uppercase">
                  CML KALIYAR MEKHALA
                </span>
                <h4 className="font-sans font-black text-xl tracking-tight mt-0.5">CHOSEN SUMMIT DELEGATE</h4>
                <p className="text-[10px] text-stone-300 font-bold tracking-wide uppercase mt-1">JULY 4-5 • KARIMANNOOR</p>
              </div>

              {/* Ticket Body with perforated style separator */}
              <div className="p-6 text-left space-y-4 relative bg-radial-to-b from-white to-stone-50">
                <div className="text-center pb-2 border-b border-dashed border-stone-200">
                  <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">TICKET UNIQUE ID</span>
                  <div className="text-sm font-mono font-black text-rose-600 mt-0.5">{registeredTicket.id}</div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-stone-400 block">DELEGATE NAME</span>
                      <span className="font-sans font-black text-slate-900 text-sm">{registeredTicket.participantName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-stone-400 block">FATHER'S NAME</span>
                      <span className="font-sans font-black text-slate-900 text-sm">{registeredTicket.fatherName || 'Not Entered'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-stone-400 block font-mono">PARISH SHAKHA</span>
                      <span className="font-bold text-slate-800">{registeredTicket.shakha}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-stone-400 block">DESIGNATION</span>
                      <span className="font-bold text-slate-800">{registeredTicket.position || 'Mission League Activist'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-stone-400 block font-mono">DELEGATE CO-ORD</span>
                      <span className="font-mono font-bold text-slate-700">{registeredTicket.contactNumber}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-stone-400 block font-mono">PARENT REGISTER</span>
                      <span className="font-mono font-bold text-slate-700">{registeredTicket.parentsContactNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated barcode */}
                <div className="flex flex-col items-center gap-1 bg-stone-100 p-4 rounded-xl border border-stone-200 border-dashed mt-4 text-center">
                  <div className="flex gap-0.5 h-10 w-full justify-center">
                    {[1, 2, 4, 1, 3, 1, 4, 2, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 1, 3].map((val, idx) => (
                      <div key={idx} className="bg-stone-900" style={{ width: `${val * 2}px` }} />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono tracking-[0.3em] font-extrabold text-stone-500 uppercase mt-1">
                    *OFFICIALCHOSENTICKET2026*
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-black text-xs uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Print Ticket
                </button>
                <button
                  onClick={() => setRegisteredTicket(null)}
                  className="px-4 py-2.5 border border-stone-250 text-stone-600 bg-white hover:bg-stone-100 font-extrabold text-xs uppercase rounded-lg transition duration-200 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Preview Modal with Unit Director Signatures */}
      <AnimatePresence>
        {printModalOpen && printData && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-xs select-text">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8"
            >
              {/* Controls bar */}
              <div className="bg-slate-905 px-6 py-4 flex items-center justify-between border-b border-stone-200 text-slate-800" id="print-controls">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-rose-600 rounded-full"></span>
                  <span className="font-sans font-black text-xs uppercase tracking-wider text-slate-900">Document Print & Verification Desk</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => setPrintModalOpen(false)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 hover:text-stone-900 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="p-8 sm:p-12 bg-white text-slate-900 overflow-x-auto text-left" id="printable-document">
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #printable-document, #printable-document * {
                      visibility: visible !important;
                    }
                    #printable-document {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      font-size: 12px !important;
                    }
                    #print-controls, #print-controls-footer {
                      display: none !important;
                    }
                  }
                `}</style>

                {/* Emblem Header */}
                <div className="text-center border-b-4 border-double border-slate-900 pb-5 mb-6 flex flex-col items-center">
                  <span className="text-[10px] font-mono font-black tracking-[0.3em] text-rose-600 block uppercase">
                    Cherupushpa Mission League (CML)
                  </span>
                  <h1 className="font-sans font-black text-xl tracking-tight text-slate-900 mt-1 uppercase">
                    KALIYAR MEKHALA • CHOSEN SUMMIT 2026
                  </h1>
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider block mt-0.5 uppercase">
                    Official Enrolment Verification Sheet
                  </span>
                  <div className="mt-4 flex items-center justify-center flex-wrap gap-4 text-[10px] sm:text-[11px] font-bold text-slate-650 bg-slate-50 border border-slate-250 px-5 py-2 rounded-full">
                    <div>
                      PARISH UNIT: <span className="text-slate-900 font-extrabold">{printData.shakha || 'Multiple Units'}</span>
                    </div>
                    <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
                    <div>
                      DOCUMENT TYPE: <span className="text-slate-900 font-extrabold">{printData.title}</span>
                    </div>
                    <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
                    <div>
                      TOTAL DELEGATES: <span className="text-rose-600 font-extrabold">{printData.list.length}</span>
                    </div>
                  </div>
                </div>

                {/* Table of Enrolled Delegates */}
                <table className="w-full border-collapse text-left text-[11px] mb-8">
                  <thead>
                    <tr className="border-b border-slate-900 text-[9px] font-mono font-black tracking-wider text-slate-500 uppercase bg-slate-50/50">
                      <th className="py-2 px-2 text-center w-10">No</th>
                      <th className="py-2 px-2">Delegate Name</th>
                      <th className="py-2 px-2">Father's Name</th>
                      <th className="py-2 px-2">Assigned Role / Designation</th>
                      <th className="py-2 px-2">Parish Unit / Shakha</th>
                      <th className="py-2 px-2">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printData.list.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-150 hover:bg-slate-50/50 font-medium">
                        <td className="py-2.5 px-2 text-center text-slate-400 font-bold font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-2 font-black text-slate-900">{item.participantName}</td>
                        <td className="py-2.5 px-2 text-stone-600 font-bold">{item.fatherName}</td>
                        <td className="py-2.5 px-2 font-semibold text-slate-700">{item.position}</td>
                        <td className="py-2.5 px-2 text-rose-700 font-extrabold">{item.shakha}</td>
                        <td className="py-2.5 px-2 font-mono text-slate-600 font-bold">{item.contactNumber}</td>
                      </tr>
                    ))}
                    {printData.list.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-400 font-bold">
                          No delegates found in this list. Enter credential coordinates to display output data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Requested signatures block for unit director validation */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-dashed border-stone-250 mt-12 text-slate-800">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-40 h-8 border-b border-slate-400 mb-1.5"></div>
                    <span className="text-[9px] uppercase font-black text-slate-950 tracking-wider">SIGNATURE OF UNIT DIRECTOR</span>
                    <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Cherupushpa Mission League</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-40 h-8 border-b border-slate-400 mb-1.5"></div>
                    <span className="text-[9px] uppercase font-black text-slate-950 tracking-wider">SIGNATURE OF PARISH PRIEST</span>
                    <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Official Parish Seal & Date</span>
                  </div>
                  <div className="flex flex-col items-center text-center col-span-2 md:col-span-1">
                    <div className="w-40 h-8 border-b border-slate-400 mb-1.5"></div>
                    <span className="text-[9px] uppercase font-black text-slate-950 tracking-wider">MEKHALA DESK VERIFIER</span>
                    <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Chosen Summit Secretariat</span>
                  </div>
                </div>

                <div className="mt-12 text-center text-[8px] text-stone-450 font-semibold uppercase tracking-[0.2em] border-t border-stone-100 pt-4">
                  Generated Digitally via Kaliyar Mekhala Chosen Summit Platform • Date: {new Date().toLocaleDateString()}
                </div>

              </div>

              {/* Footer controls bar */}
              <div className="bg-stone-50 px-6 py-4 flex justify-end gap-2 border-t border-stone-100" id="print-controls-footer">
                <button
                  type="button"
                  onClick={() => setPrintModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-extrabold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
