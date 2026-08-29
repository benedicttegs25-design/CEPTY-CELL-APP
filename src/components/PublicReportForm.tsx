import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Send, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Calendar, 
  Users, 
  Flame, 
  Heart, 
  UserPlus, 
  DollarSign, 
  MessageSquare, 
  AlertCircle, 
  Share2, 
  Printer, 
  Sparkles,
  ChevronRight,
  RefreshCw,
  Clock,
  MapPin,
  FileCheck
} from 'lucide-react';
import type { Cell, Zone, Report, MeetingType, User } from '../types';

interface PublicReportFormProps {
  currentUser: User | null;
  cells: Cell[];
  zones: Zone[];
  onSubmitSuccess: (newReport: Report) => void;
  onViewReports: () => void;
}

export const PublicReportForm: React.FC<PublicReportFormProps> = ({
  currentUser,
  cells,
  zones,
  onSubmitSuccess,
  onViewReports
}) => {
  // Form State
  const [cellName, setCellName] = useState('');
  const [selectedCellId, setSelectedCellId] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [zone, setZone] = useState('Zone 1 - Kings Court');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [meetingType, setMeetingType] = useState<MeetingType>('Prayer and Planning');
  
  // Metrics State (Cell, Sunday Service, Wednesday Service Attendance)
  const [attendanceCell, setAttendanceCell] = useState<number>(20);
  const [attendanceSunday, setAttendanceSunday] = useState<number>(18);
  const [attendanceWednesday, setAttendanceWednesday] = useState<number>(14);
  const [firstTimers, setFirstTimers] = useState<number>(3);
  const [soulsWon, setSoulsWon] = useState<number>(2);
  const [followedUp, setFollowedUp] = useState<number>(5);
  const [offering, setOffering] = useState<string>('');
  
  // Qualitative fields
  const [testimonies, setTestimonies] = useState('');
  const [challenges, setChallenges] = useState('');
  const [prayerRequests, setPrayerRequests] = useState('');
  const [nextMeetingDate, setNextMeetingDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  
  // Media uploads
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-populate if leader is logged in
  useEffect(() => {
    if (currentUser) {
      setLeaderName(currentUser.name || '');
      setLeaderPhone(currentUser.phone || '');
      setLeaderEmail(currentUser.email || '');
      if (currentUser.zone && currentUser.zone !== 'All Zones') {
        setZone(currentUser.zone);
      }
      if (currentUser.cellName) {
        setCellName(currentUser.cellName);
        const matched = cells.find(c => c.name.toLowerCase() === currentUser.cellName?.toLowerCase());
        if (matched) {
          setSelectedCellId(matched.id);
        }
      }
    }
  }, [currentUser, cells]);

  // When user selects an existing cell from dropdown/autocomplete
  const handleCellSelect = (selectedName: string) => {
    setCellName(selectedName);
    const matched = cells.find(c => c.name === selectedName);
    if (matched) {
      setSelectedCellId(matched.id);
      setZone(matched.zone);
      if (!currentUser && matched.leaderName) {
        setLeaderName(matched.leaderName);
        setLeaderPhone(matched.leaderPhone || '');
        setLeaderEmail(matched.leaderEmail || '');
      }
    }
  };

  const handleZoneChange = (newZone: string) => {
    setZone(newZone);
  };

  // Image Upload handler (Base64 file reading)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaUrls(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Sample quick photo presets for fast testing
  const addSamplePhoto = (url: string) => {
    if (!mediaUrls.includes(url)) {
      setMediaUrls(prev => [...prev, url]);
    }
  };

  const removePhoto = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const attendanceTotal = Number(attendanceCell) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!cellName.trim()) {
      setFormError('Please enter or select the Cell Name.');
      return;
    }
    if (!leaderName.trim()) {
      setFormError('Please enter the Cell Leader Name.');
      return;
    }
    if (!date) {
      setFormError('Please select the Date of the Meeting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        cellId: selectedCellId || undefined,
        cellName: cellName.trim(),
        leaderId: currentUser?.id,
        leaderName: leaderName.trim(),
        leaderPhone: leaderPhone.trim(),
        leaderEmail: leaderEmail.trim(),
        zone,
        date,
        meetingType,
        attendanceCell: Number(attendanceCell) || 0,
        attendanceSunday: Number(attendanceSunday) || 0,
        attendanceWednesday: Number(attendanceWednesday) || 0,
        attendanceTotal,
        firstTimers: Number(firstTimers) || 0,
        soulsWon: Number(soulsWon) || 0,
        followedUp: Number(followedUp) || 0,
        offering: offering ? Number(offering) : undefined,
        testimonies: testimonies.trim(),
        challenges: challenges.trim(),
        prayerRequests: prayerRequests.trim(),
        mediaUrls,
        nextMeetingDate
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      const createdReport: Report = await res.json();
      setSubmittedReport(createdReport);
      onSubmitSuccess(createdReport);
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedReport(null);
    setAttendanceCell(20);
    setAttendanceSunday(18);
    setAttendanceWednesday(14);
    setFirstTimers(3);
    setSoulsWon(2);
    setFollowedUp(5);
    setOffering('');
    setTestimonies('');
    setChallenges('');
    setPrayerRequests('');
    setMediaUrls([]);
  };

  // WhatsApp share link generator
  const getWhatsAppShareUrl = () => {
    if (!submittedReport) return '';
    const message = `*CHRIST EMBASSY PROLIFIC CHURCH - CELL REPORT*
Cell: ${submittedReport.cellName}
Zone: ${submittedReport.zone}
Leader: ${submittedReport.leaderName}
Date: ${submittedReport.date} (${submittedReport.meetingType})
-----------------------------
👥 *Cell Meeting Attendance:* ${submittedReport.attendanceCell || submittedReport.attendanceTotal}
⛪ *Sunday Service Attendance:* ${submittedReport.attendanceSunday || 0}
📖 *Wednesday Service Attendance:* ${submittedReport.attendanceWednesday || 0}
🔥 *Souls Won:* ${submittedReport.soulsWon}
🌟 *First-Timers:* ${submittedReport.firstTimers}
🤝 *Followed-Up:* ${submittedReport.followedUp}
${submittedReport.offering ? `💰 *Offering:* ₦${submittedReport.offering.toLocaleString()}` : ''}
${submittedReport.testimonies ? `\n📖 *Testimonies:* ${submittedReport.testimonies}` : ''}
-----------------------------
_Submitted on Prolific Cell Portal (Status: Pending Review)_`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 px-2 sm:px-4">
      
      {/* Submission Success Confirmation Modal / Card */}
      {submittedReport ? (
        <div className="bg-white border-2 border-amber-500/40 rounded-xl p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200 text-slate-800">
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Submission Received
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              Glory to God! Report Submitted
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto">
              Thank you, <span className="text-amber-700 font-bold">{submittedReport.leaderName}</span>. Your cell report for <span className="text-slate-900 font-bold">{submittedReport.cellName}</span> has been logged and routed to your Zone Coordinator for review.
            </p>
          </div>

          {/* Submission Summary Slip */}
          <div className="my-6 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 border-b border-slate-200/80 pb-3">
              <span>Report Ref: <strong className="text-slate-800 font-mono">{submittedReport.id}</strong></span>
              <span>Date: <strong className="text-slate-800">{submittedReport.date}</strong></span>
              <span>Type: <strong className="text-amber-700 font-semibold">{submittedReport.meetingType}</strong></span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Cell Attendance</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{submittedReport.attendanceCell || submittedReport.attendanceTotal}</div>
                <div className="text-[10px] text-slate-500">Meeting Attendees</div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">Sunday Service Att.</div>
                <div className="text-2xl font-black text-indigo-700 mt-1">{submittedReport.attendanceSunday || 0}</div>
                <div className="text-[10px] text-slate-500">Sunday Service</div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider text-cyan-600 font-bold">Wed. Service Att.</div>
                <div className="text-2xl font-black text-cyan-700 mt-1">{submittedReport.attendanceWednesday || 0}</div>
                <div className="text-[10px] text-slate-500">Midweek Service</div>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">Souls Won</div>
                <div className="text-2xl font-black text-amber-700 mt-1">{submittedReport.soulsWon}</div>
                <div className="text-[10px] text-amber-700/80">Salvation decisions</div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">First-Timers</div>
                <div className="text-2xl font-black text-blue-700 mt-1">{submittedReport.firstTimers}</div>
                <div className="text-[10px] text-slate-500">New visitors</div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">Followed Up</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{submittedReport.followedUp}</div>
                <div className="text-[10px] text-slate-500">Past attendees</div>
              </div>
            </div>

            {submittedReport.testimonies && (
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-amber-800 block mb-1 uppercase tracking-wide text-[10px]">Testimonies & Miracles:</span>
                <p className="text-slate-700 italic">"{submittedReport.testimonies}"</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              id="whatsapp-share-btn"
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md text-xs uppercase tracking-wider"
            >
              <Share2 className="w-4 h-4" />
              Share Summary to WhatsApp
            </a>

            <button
              id="view-all-reports-btn"
              onClick={onViewReports}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-wider border-b-4 border-amber-500"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              View on Reports Dashboard
            </button>

            <button
              id="submit-another-btn"
              onClick={handleResetForm}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-5 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-wider shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Submit Another
            </button>
          </div>
        </div>
      ) : (
        /* The Public Report Submission Form */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-slate-50/70 p-5 sm:p-7 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 border border-amber-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-2">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  Weekly & Monthly Cell Report
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
                  Submit Cell Activity Report
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Log your cell meeting, outreach, attendance numbers, souls won, and testimonies. No login required.
                </p>
              </div>

              {!currentUser && (
                <div className="flex items-center gap-2 self-start sm:self-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-700 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-[11px] uppercase tracking-wider">Fast Track Mode</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-7">
            
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Please check the form</p>
                  <p className="text-xs text-red-700 mt-0.5">{formError}</p>
                </div>
              </div>
            )}

            {/* Section 1: Cell & Leader Identification */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-amber-600" />
                1. Cell & Leadership Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Zone Selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                    Zone / Group <span className="text-amber-600">*</span>
                  </label>
                  <select
                    id="input-zone"
                    value={zone}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    required
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.name}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cell Name (with autocomplete suggestion from existing cells) */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                    Cell Name <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-cell-name"
                      type="text"
                      list="cells-datalist"
                      value={cellName}
                      onChange={(e) => handleCellSelect(e.target.value)}
                      placeholder="e.g. Royalty Teens Cell, Dynasty Youth..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                      required
                    />
                    <datalist id="cells-datalist">
                      {cells.map(c => (
                        <option key={c.id} value={c.name}>{c.zone} - {c.leaderName}</option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Leader Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                    Cell Leader Name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    id="input-leader-name"
                    type="text"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="Brother / Sister Full Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    required
                  />
                </div>

                {/* Leader Phone / Contact */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                    Leader Phone Number <span className="text-slate-400 text-[9px] font-normal">(for Coordinator contact)</span>
                  </label>
                  <input
                    id="input-leader-phone"
                    type="tel"
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Meeting Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-amber-600" />
                2. Meeting Date & Type
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                    Date of Meeting <span className="text-amber-600">*</span>
                  </label>
                  <input
                    id="input-meeting-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                    Meeting Type <span className="text-amber-600">*</span>
                  </label>
                  <select
                    id="input-meeting-type"
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors font-medium"
                    required
                  >
                    <option value="Prayer and Planning">1. Prayer and Planning</option>
                    <option value="Bible Study 1">2. Bible Study 1</option>
                    <option value="Bible Study 2">3. Bible Study 2</option>
                    <option value="Outreach">4. Outreach</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Numerical Breakdown (Attendance, Souls, First-timers) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
                  <Users className="w-4 h-4 text-amber-600" />
                  3. Numerical Report & Impact
                </div>
                <div className="text-xs bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-900 font-semibold">
                  Cell Meeting Att: <strong className="text-amber-700 text-sm font-black">{attendanceCell}</strong>
                </div>
              </div>

              {/* Attendance Inputs: Cell Meeting, Sunday Service, Wednesday Service */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Cell Meeting Attendance */}
                <div className="bg-amber-50/50 p-3.5 rounded-lg border border-amber-200 shadow-xs">
                  <label className="block text-[10px] uppercase font-bold text-amber-900 mb-1 tracking-wider">
                    Cell Meeting Attendance <span className="text-amber-600">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAttendanceCell(Math.max(0, attendanceCell - 1))}
                      className="w-8 h-8 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-slate-800 font-bold flex items-center justify-center text-sm transition-colors"
                    >
                      -
                    </button>
                    <input
                      id="input-attendance-cell"
                      type="number"
                      min="0"
                      value={attendanceCell}
                      onChange={(e) => setAttendanceCell(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-center bg-white border border-amber-300 rounded-lg py-1.5 text-base font-black text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setAttendanceCell(attendanceCell + 1)}
                      className="w-8 h-8 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-slate-800 font-bold flex items-center justify-center text-sm transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-amber-700/80 text-center block mt-1">Cell fellowship attendees</span>
                </div>

                {/* Sunday Service Attendance */}
                <div className="bg-indigo-50/50 p-3.5 rounded-lg border border-indigo-200 shadow-xs">
                  <label className="block text-[10px] uppercase font-bold text-indigo-900 mb-1 tracking-wider">
                    Sunday Service Attendance <span className="text-indigo-600">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAttendanceSunday(Math.max(0, attendanceSunday - 1))}
                      className="w-8 h-8 rounded-lg bg-indigo-200/80 hover:bg-indigo-300 text-indigo-900 font-bold flex items-center justify-center text-sm transition-colors"
                    >
                      -
                    </button>
                    <input
                      id="input-attendance-sunday"
                      type="number"
                      min="0"
                      value={attendanceSunday}
                      onChange={(e) => setAttendanceSunday(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-center bg-white border border-indigo-300 rounded-lg py-1.5 text-base font-black text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setAttendanceSunday(attendanceSunday + 1)}
                      className="w-8 h-8 rounded-lg bg-indigo-200/80 hover:bg-indigo-300 text-indigo-900 font-bold flex items-center justify-center text-sm transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-indigo-700/80 text-center block mt-1">Members in Sunday Service</span>
                </div>

                {/* Wednesday Service Attendance */}
                <div className="bg-cyan-50/50 p-3.5 rounded-lg border border-cyan-200 shadow-xs">
                  <label className="block text-[10px] uppercase font-bold text-cyan-900 mb-1 tracking-wider">
                    Wednesday Service Attendance <span className="text-cyan-600">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAttendanceWednesday(Math.max(0, attendanceWednesday - 1))}
                      className="w-8 h-8 rounded-lg bg-cyan-200/80 hover:bg-cyan-300 text-cyan-900 font-bold flex items-center justify-center text-sm transition-colors"
                    >
                      -
                    </button>
                    <input
                      id="input-attendance-wednesday"
                      type="number"
                      min="0"
                      value={attendanceWednesday}
                      onChange={(e) => setAttendanceWednesday(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-center bg-white border border-cyan-300 rounded-lg py-1.5 text-base font-black text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setAttendanceWednesday(attendanceWednesday + 1)}
                      className="w-8 h-8 rounded-lg bg-cyan-200/80 hover:bg-cyan-300 text-cyan-900 font-bold flex items-center justify-center text-sm transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-cyan-700/80 text-center block mt-1">Members in Midweek Service</span>
                </div>
              </div>

              {/* Souls Won, First-Timers, Followed-up, Offering */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {/* Souls Won */}
                <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                  <label className="block text-[10px] uppercase font-bold text-amber-900 mb-1 flex items-center gap-1 tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    Souls Won
                  </label>
                  <input
                    id="input-souls-won"
                    type="number"
                    min="0"
                    value={soulsWon}
                    onChange={(e) => setSoulsWon(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-sm font-bold text-center text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <span className="text-[10px] text-amber-700/80 text-center block mt-1">Salvation count</span>
                </div>

                {/* First-Timers */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-[10px] uppercase font-bold text-blue-700 mb-1 flex items-center gap-1 tracking-wider">
                    <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                    First-Timers
                  </label>
                  <input
                    id="input-first-timers"
                    type="number"
                    min="0"
                    value={firstTimers}
                    onChange={(e) => setFirstTimers(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold text-center text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 text-center block mt-1">New visitors</span>
                </div>

                {/* Followed Up */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-[10px] uppercase font-bold text-emerald-700 mb-1 flex items-center gap-1 tracking-wider">
                    <Heart className="w-3.5 h-3.5 text-emerald-600" />
                    Followed Up
                  </label>
                  <input
                    id="input-followed-up"
                    type="number"
                    min="0"
                    value={followedUp}
                    onChange={(e) => setFollowedUp(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold text-center text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 text-center block mt-1">Visits / calls</span>
                </div>

                {/* Offering (Optional) */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1 flex items-center gap-1 tracking-wider">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    Offering <span className="text-[9px] text-slate-400 font-normal">(Opt)</span>
                  </label>
                  <input
                    id="input-offering"
                    type="number"
                    min="0"
                    placeholder="e.g. 25000"
                    value={offering}
                    onChange={(e) => setOffering(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 text-center block mt-1">Amount (₦)</span>
                </div>
              </div>
            </div>

            {/* Section 4: Narrative Fields (Testimonies, Challenges, Prayer Requests) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                4. Testimonies, Challenges & Prayer Requests
              </div>

              <div className="space-y-3">
                {/* Testimonies */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                    Testimonies & Miracles Recorded <span className="text-slate-400 text-[9px] font-normal">(healing, academic breakthroughs, holy ghost baptism)</span>
                  </label>
                  <textarea
                    id="input-testimonies"
                    rows={3}
                    value={testimonies}
                    onChange={(e) => setTestimonies(e.target.value)}
                    placeholder="Share the testimonies from this meeting to inspire the pastoral leadership..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-y"
                  />
                </div>

                {/* Challenges Faced */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                    Challenges Faced <span className="text-slate-400 text-[9px] font-normal">(venue, transportation, sound, materials needed)</span>
                  </label>
                  <textarea
                    id="input-challenges"
                    rows={2}
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="Any bottlenecks or assistance required from your Zone Coordinator..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-y"
                  />
                </div>

                {/* Prayer Requests */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                    Prayer Requests & Targets
                  </label>
                  <textarea
                    id="input-prayer-requests"
                    rows={2}
                    value={prayerRequests}
                    onChange={(e) => setPrayerRequests(e.target.value)}
                    placeholder="Specific prayer targets for your cell members or upcoming outreach..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Photos & Next Meeting Date */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                5. Media Uploads & Next Meeting Schedule
              </div>

              {/* Photos upload box */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                  Meeting Photos / Media <span className="text-slate-400 text-[9px] font-normal">(Optional, attach cell meeting photos)</span>
                </label>
                
                <div className="border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-lg p-5 text-center bg-slate-50/50 transition-colors">
                  <input
                    type="file"
                    id="report-photo-upload"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="report-photo-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-amber-600">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to upload photos or take picture
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Supports JPG, PNG up to 10MB each
                    </span>
                  </label>
                </div>

                {/* Demo Presets button */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Sample Photos:</span>
                  <button
                    type="button"
                    onClick={() => addSamplePhoto('https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80')}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium border border-slate-200 transition-colors"
                  >
                    + Youth Meeting
                  </button>
                  <button
                    type="button"
                    onClick={() => addSamplePhoto('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80')}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium border border-slate-200 transition-colors"
                  >
                    + Outreach Group
                  </button>
                </div>

                {/* Uploaded Photos Preview list */}
                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                    {mediaUrls.map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                        <img 
                          src={url} 
                          alt={`Cell report ${idx + 1}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Meeting Date */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                  Next Meeting Date <span className="text-amber-600">*</span>
                </label>
                <input
                  id="input-next-meeting-date"
                  type="date"
                  value={nextMeetingDate}
                  onChange={(e) => setNextMeetingDate(e.target.value)}
                  className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Submission CTA */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reports are securely stored in the church database and accessible to leadership.</span>
              </div>

              <button
                id="submit-cell-report-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider border-b-4 border-amber-500 active:border-b-0 active:translate-y-1 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Submitting Report...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>Submit Cell Report</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};
