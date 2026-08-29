import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Flame, 
  Users, 
  Heart, 
  UserPlus, 
  Calendar, 
  MapPin, 
  X, 
  ChevronRight, 
  Check, 
  MessageSquare, 
  Share2, 
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import type { Report, Zone, Cell, User, ReportStatus, MeetingType } from '../types';

interface ReportsTableViewProps {
  reports: Report[];
  zones: Zone[];
  cells: Cell[];
  currentUser: User | null;
  onUpdateReportStatus: (reportId: string, status: ReportStatus, coordinatorNotes?: string, pastorNotes?: string) => Promise<void>;
  onDeleteReport: (reportId: string) => Promise<void>;
  onExportCsv: () => void;
}

export const ReportsTableView: React.FC<ReportsTableViewProps> = ({
  reports,
  zones,
  cells,
  currentUser,
  onUpdateReportStatus,
  onDeleteReport,
  onExportCsv
}) => {
  // Filter States
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [selectedCell, setSelectedCell] = useState('all');
  const [selectedMeetingType, setSelectedMeetingType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Detail Modal State
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [coordinatorNotesInput, setCoordinatorNotesInput] = useState('');
  const [pastorNotesInput, setPastorNotesInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  // Apply filters
  const filteredReports = reports.filter(r => {
    if (selectedZone !== 'All Zones' && r.zone !== selectedZone) return false;
    if (selectedCell !== 'all' && r.cellId !== selectedCell && r.cellName !== selectedCell) return false;
    if (selectedMeetingType !== 'all' && r.meetingType !== selectedMeetingType) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        r.cellName.toLowerCase().includes(q) ||
        r.leaderName.toLowerCase().includes(q) ||
        r.zone.toLowerCase().includes(q) ||
        (r.testimonies && r.testimonies.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const openReportDetail = (report: Report) => {
    setActiveReport(report);
    setCoordinatorNotesInput(report.coordinatorNotes || '');
    setPastorNotesInput(report.pastorNotes || '');
  };

  const handleApprove = async () => {
    if (!activeReport) return;
    setIsUpdating(true);
    try {
      await onUpdateReportStatus(
        activeReport.id, 
        'approved', 
        coordinatorNotesInput, 
        pastorNotesInput
      );
      setActiveReport(prev => prev ? {
        ...prev,
        status: 'approved',
        coordinatorNotes: coordinatorNotesInput,
        pastorNotes: pastorNotesInput,
        reviewedBy: currentUser?.name || 'Coordinator'
      } : null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeReport) return;
    setIsUpdating(true);
    try {
      await onUpdateReportStatus(
        activeReport.id, 
        activeReport.status, 
        coordinatorNotesInput, 
        pastorNotesInput
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    await onDeleteReport(reportId);
    if (activeReport?.id === reportId) {
      setActiveReport(null);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
            <Check className="w-3 h-3 text-blue-600" />
            Reviewed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  const getMeetingTypeBadge = (type: MeetingType) => {
    switch (type) {
      case 'Prayer and Planning':
        return <span className="bg-amber-100/90 text-amber-900 border border-amber-300 text-[11px] px-2 py-0.5 rounded font-bold">1. Prayer & Planning</span>;
      case 'Bible Study 1':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[11px] px-2 py-0.5 rounded font-bold">2. Bible Study 1</span>;
      case 'Bible Study 2':
        return <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] px-2 py-0.5 rounded font-bold">3. Bible Study 2</span>;
      case 'Outreach':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] px-2 py-0.5 rounded font-bold">4. Outreach</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] px-2 py-0.5 rounded font-medium">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls Bar */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 font-['Outfit']">
                Submitted Cell Reports
              </h2>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {filteredReports.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Review, approve, and verify all cell meeting submissions across Christ Embassy Prolific Church.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reports-export-csv"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              id="reports-print"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors border-b-2 border-amber-500"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print Docket</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-100">
          
          {/* Search */}
          <div className="col-span-2 sm:col-span-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cell, leader, testimony..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Zone Filter */}
          <div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="All Zones">All Zones</option>
              {zones.map(z => (
                <option key={z.id} value={z.name}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Cell Filter */}
          <div>
            <select
              value={selectedCell}
              onChange={(e) => setSelectedCell(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Cells</option>
              {cells.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Meeting Type Filter */}
          <div>
            <select
              value={selectedMeetingType}
              onChange={(e) => setSelectedMeetingType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Meeting Types</option>
              <option value="Prayer and Planning">1. Prayer and Planning</option>
              <option value="Bible Study 1">2. Bible Study 1</option>
              <option value="Bible Study 2">3. Bible Study 2</option>
              <option value="Outreach">4. Outreach</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div>
            <button
              onClick={() => {
                setSelectedZone('All Zones');
                setSelectedCell('all');
                setSelectedMeetingType('all');
                setSelectedStatus('all');
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Cell & Leader</th>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4">Date / Type</th>
                <th className="py-3.5 px-3 text-center">Cell Att.</th>
                <th className="py-3.5 px-3 text-center">Sun & Wed Att.</th>
                <th className="py-3.5 px-3 text-center">Souls</th>
                <th className="py-3.5 px-3 text-center">First-Timers</th>
                <th className="py-3.5 px-3 text-center">Offering</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No reports match the current filter criteria.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try resetting or selecting another zone.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr 
                    key={report.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => openReportDetail(report)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {report.cellName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {report.leaderName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 font-medium">
                        {report.zone.replace(/Zone \d+ - /, '')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-semibold">{report.date}</div>
                      <div className="mt-0.5">{getMeetingTypeBadge(report.meetingType)}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-black text-slate-900 text-sm">{report.attendanceCell || report.attendanceTotal}</span>
                      <div className="text-[10px] text-amber-700 font-medium">Cell Meeting</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="text-xs font-bold text-slate-800">
                        <span className="text-indigo-700">Sun: {report.attendanceSunday || 0}</span> • <span className="text-cyan-700">Wed: {report.attendanceWednesday || 0}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-black text-amber-700 text-sm">{report.soulsWon}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-blue-700 text-sm">{report.firstTimers}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-slate-700 font-medium">
                        {report.offering ? `₦${report.offering.toLocaleString()}` : '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openReportDetail(report)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 transition-colors"
                        title="View Report Details & Review"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-sm text-slate-700">No reports found.</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <div 
                key={report.id}
                onClick={() => openReportDetail(report)}
                className="p-4 hover:bg-slate-50 transition-colors space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{report.cellName}</h3>
                    <p className="text-xs text-slate-500">{report.leaderName} • {report.zone}</p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{report.date}</span>
                  </div>
                  <div>{getMeetingTypeBadge(report.meetingType)}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Cell Att.</div>
                    <div className="text-sm font-black text-slate-900">{report.attendanceCell || report.attendanceTotal}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-indigo-700 uppercase font-semibold">Sun / Wed</div>
                    <div className="text-xs font-bold text-indigo-900">{report.attendanceSunday || 0} / {report.attendanceWednesday || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-800 uppercase font-semibold">Souls Won</div>
                    <div className="text-sm font-black text-amber-700">{report.soulsWon}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Report Detail Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-amber-500 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {activeReport.id}
                  </span>
                  {getStatusBadge(activeReport.status)}
                </div>
                <h3 className="text-xl font-black text-white mt-1 font-['Outfit']">
                  {activeReport.cellName}
                </h3>
                <p className="text-xs text-slate-400">
                  Leader: <span className="text-white font-semibold">{activeReport.leaderName}</span> • {activeReport.zone}
                </p>
              </div>

              <button
                onClick={() => setActiveReport(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto bg-slate-50">
              
              {/* Meeting Meta & Type */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Meeting</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{activeReport.date}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Meeting Type</span>
                  <span className="text-sm font-extrabold text-amber-700 mt-0.5 block">{activeReport.meetingType}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Meeting</span>
                  <span className="text-sm font-extrabold text-slate-700 mt-0.5 block">{activeReport.nextMeetingDate || 'Not specified'}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Offering Collected</span>
                  <span className="text-sm font-extrabold text-emerald-700 mt-0.5 block">
                    {activeReport.offering ? `₦${activeReport.offering.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Numerical Metrics Cards */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Numerical Harvest Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-slate-500 font-semibold">Cell Attendance</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{activeReport.attendanceCell || activeReport.attendanceTotal}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Meeting Attendees</div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-xs">
                    <div className="text-xs text-indigo-700 font-semibold">Sunday Service Att.</div>
                    <div className="text-2xl font-black text-indigo-800 mt-1">{activeReport.attendanceSunday || 0}</div>
                    <div className="text-[10px] text-indigo-600 mt-0.5">Sunday Service</div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-cyan-200 shadow-xs">
                    <div className="text-xs text-cyan-700 font-semibold">Wednesday Service Att.</div>
                    <div className="text-2xl font-black text-cyan-800 mt-1">{activeReport.attendanceWednesday || 0}</div>
                    <div className="text-[10px] text-cyan-600 mt-0.5">Midweek Service</div>
                  </div>

                  <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 shadow-xs">
                    <div className="text-xs text-amber-900 font-semibold">Souls Won</div>
                    <div className="text-2xl font-black text-amber-700 mt-1">{activeReport.soulsWon}</div>
                    <div className="text-[10px] text-amber-800/80 mt-0.5">Salvation decisions</div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-blue-700 font-semibold">First-Timers</div>
                    <div className="text-2xl font-black text-blue-700 mt-1">{activeReport.firstTimers}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">New visitors</div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-emerald-700 font-semibold">Followed Up</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">{activeReport.followedUp}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Home & phone visits</div>
                  </div>
                </div>
              </div>

              {/* Qualitative Narrative */}
              <div className="space-y-4">
                {activeReport.testimonies && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      Testimonies & Miracles Recorded
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed whitespace-pre-wrap">
                      "{activeReport.testimonies}"
                    </p>
                  </div>
                )}

                {activeReport.challenges && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Challenges Faced & Required Assistance
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {activeReport.challenges}
                    </p>
                  </div>
                )}

                {activeReport.prayerRequests && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" />
                      Prayer Requests & Targets
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {activeReport.prayerRequests}
                    </p>
                  </div>
                )}
              </div>

              {/* Photos Gallery */}
              {activeReport.mediaUrls && activeReport.mediaUrls.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    Attached Meeting Photos ({activeReport.mediaUrls.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeReport.mediaUrls.map((url, i) => (
                      <div 
                        key={i} 
                        className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 cursor-pointer group relative shadow-xs"
                        onClick={() => setSelectedImagePreview(url)}
                      >
                        <img 
                          src={url} 
                          alt="Cell meeting" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          Click to enlarge
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pastoral Approval Section */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Pastoral Review & Approval Desk
                  </h4>
                  {activeReport.reviewedBy && (
                    <span className="text-[11px] text-slate-500">
                      Reviewed by <strong className="text-slate-800">{activeReport.reviewedBy}</strong>
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Review Remarks & Notes
                    </label>
                    <textarea
                      rows={2}
                      value={coordinatorNotesInput}
                      onChange={(e) => setCoordinatorNotesInput(e.target.value)}
                      placeholder="Add commendations, follow-up instructions, or pastoral guidance..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {currentUser?.role === 'admin' && (
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 mb-1">
                        Senior Pastor Direct Comments
                      </label>
                      <textarea
                        rows={2}
                        value={pastorNotesInput}
                        onChange={(e) => setPastorNotesInput(e.target.value)}
                        placeholder="Pastoral blessings, prophetic word, or directives..."
                        className="w-full bg-slate-50 border border-amber-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(activeReport.id)}
                    className="p-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-amber-600" />
                  <span>Print Slip</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-200"
                >
                  Save Notes
                </button>

                {activeReport.status !== 'approved' && (
                  <button
                    id="approve-report-modal-btn"
                    onClick={handleApprove}
                    disabled={isUpdating}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Report</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Image Lightbox Preview */}
      {selectedImagePreview && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImagePreview(null)}
        >
          <img 
            src={selectedImagePreview} 
            alt="Enlarged cell report preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" 
            referrerPolicy="no-referrer"
          />
        </div>
      )}

    </div>
  );
};
