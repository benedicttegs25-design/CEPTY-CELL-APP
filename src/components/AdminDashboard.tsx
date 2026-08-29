import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Flame, 
  Heart, 
  UserPlus, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Award, 
  Download, 
  Send, 
  Calendar, 
  MapPin, 
  FileSpreadsheet, 
  Printer, 
  Share2,
  Copy,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import type { AnalyticsSummary, Zone, Report, Cell } from '../types';

interface AdminDashboardProps {
  analytics: AnalyticsSummary | null;
  zones: Zone[];
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  onSendBroadcastReminder: (customMsg?: string) => void;
  onViewFilteredReports: (filter: { zone?: string; cellId?: string; status?: string }) => void;
  onExportCsv: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  analytics,
  zones,
  selectedZone,
  setSelectedZone,
  onSendBroadcastReminder,
  onViewFilteredReports,
  onExportCsv
}) => {
  const [copiedReminder, setCopiedReminder] = useState(false);
  const [reminderBroadcastSent, setReminderBroadcastSent] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'attendance' | 'souls' | 'firstTimers'>('attendance');

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-3"></div>
        Loading ministry analytics...
      </div>
    );
  }

  // Generate WhatsApp reminder message template for unsubmitted cell leaders
  const generateReminderMessage = () => {
    const unsubmittedNames = analytics.unreportedCells.map(c => `• *${c.name}* (${c.leaderName})`).join('\n');
    return `*CHRIST EMBASSY PROLIFIC CHURCH — WEEKLY REPORT REMINDER* 🕊️

Dear Esteemed Cell Leaders,
Kindly be reminded that the deadline for submitting this week's Cell Meeting, Outreach, and Soul-Winning report is *Monday 12:00 PM*.

We are currently awaiting reports from:
${unsubmittedNames || 'All cells have submitted! Praise God.'}

📱 *Click here to submit your report in under 2 minutes (No login required):*
${window.location.origin}

_Every soul counted is a soul established in the Kingdom!_`;
  };

  const handleCopyReminder = () => {
    navigator.clipboard.writeText(generateReminderMessage());
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 3000);
  };

  const handleBroadcast = () => {
    onSendBroadcastReminder();
    setReminderBroadcastSent(true);
    setTimeout(() => setReminderBroadcastSent(false), 4000);
  };

  // SVG Chart calculation helpers
  const maxWeeklyAttendance = Math.max(...analytics.weeklyTrends.map(w => w.attendance), 100);
  const maxWeeklySouls = Math.max(...analytics.weeklyTrends.map(w => w.soulsWon), 20);
  const maxWeeklyFirstTimers = Math.max(...analytics.weeklyTrends.map(w => w.firstTimers), 20);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
              Ministry Analytics & Executive Dashboard
            </h1>
            <span className="bg-amber-500/10 text-amber-800 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Live Metrics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time harvest metrics, soul-winning trajectory, and cell performance reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export CSV button */}
          <button
            id="export-csv-btn"
            onClick={onExportCsv}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Print PDF Docket */}
          <button
            id="print-dashboard-btn"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors border-b-2 border-amber-500"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Attendance */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2">
            <span>Cell Attendance</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{analytics.totalAttendance}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-indigo-600 font-bold">Sun: {analytics.totalSundayAttendance || 0}</span> • <span className="text-cyan-600 font-bold">Wed: {analytics.totalWednesdayAttendance || 0}</span>
          </div>
        </div>

        {/* Souls Won */}
        <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-900 text-[10px] uppercase font-bold tracking-wider mb-2">
            <span>Souls Won</span>
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500/20" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{analytics.totalSoulsWon}</div>
          <div className="text-[11px] text-amber-800/80 mt-1">
            Salvation decisions
          </div>
        </div>

        {/* First Timers */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-blue-600 text-[10px] uppercase font-bold tracking-wider mb-2">
            <span>First-Timers</span>
            <UserPlus className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700">{analytics.totalFirstTimers}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            New visitors logged
          </div>
        </div>

        {/* Followed Up */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 text-[10px] uppercase font-bold tracking-wider mb-2">
            <span>Followed Up</span>
            <Heart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{analytics.totalFollowedUp}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Visitation & calls
          </div>
        </div>

        {/* Reporting Compliance */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2">
            <span>Compliance Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{analytics.complianceRate}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, analytics.complianceRate)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {analytics.reportingCellsCount} of {analytics.totalCellsCount} cells reported
          </div>
        </div>

        {/* Total Offering */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2">
            <span>Total Offering</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            ₦{analytics.totalOffering.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            From {analytics.totalReports} reports
          </div>
        </div>
      </div>

      {/* Unsubmitted Cells Alert Section (Deadline Reminder Tool) */}
      {analytics.unreportedCells.length > 0 && (
        <div className="bg-white border border-amber-200 p-5 rounded-xl shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Pending Cell Submissions ({analytics.unreportedCells.length} Cells Unreported)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                These cells have not yet submitted their weekly report. Send an instant notification or copy the WhatsApp template to remind them.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="copy-whatsapp-reminder-btn"
                onClick={handleCopyReminder}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedReminder ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Reminder'}</span>
              </button>

              <button
                id="send-broadcast-btn"
                onClick={handleBroadcast}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow-xs border-b-2 border-amber-500"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>{reminderBroadcastSent ? 'Alert Sent!' : 'Send Portal Notification'}</span>
              </button>
            </div>
          </div>

          {/* List of Pending Cells */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-100">
            {analytics.unreportedCells.map(cell => (
              <div key={cell.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{cell.name}</div>
                  <div className="text-[10px] text-slate-500">{cell.leaderName}</div>
                </div>
                {cell.leaderPhone && (
                  <a
                    href={`https://wa.me/${cell.leaderPhone.replace(/\D/g, '')}?text=Dear%20${encodeURIComponent(cell.leaderName)},%20kindly%20remember%20to%20submit%20your%20weekly%20cell%20report%20for%20${encodeURIComponent(cell.name)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 font-semibold px-2 py-1 rounded border border-slate-200 transition-colors"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Charts & Analytics Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  Weekly Ministry Growth Trajectory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Progression across weekly cycles in attendance and soul winning.
                </p>
              </div>

              {/* Chart Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setActiveChartTab('attendance')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeChartTab === 'attendance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setActiveChartTab('souls')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeChartTab === 'souls' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Souls Won
                </button>
                <button
                  onClick={() => setActiveChartTab('firstTimers')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeChartTab === 'firstTimers' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  First-Timers
                </button>
              </div>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="pt-6 pb-2">
              <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 px-2">
                {analytics.weeklyTrends.map((week, idx) => {
                  let value = week.attendance;
                  let maxVal = maxWeeklyAttendance;
                  let barColor = 'from-amber-400 to-amber-600';

                  if (activeChartTab === 'souls') {
                    value = week.soulsWon;
                    maxVal = maxWeeklySouls;
                    barColor = 'from-rose-500 to-amber-500';
                  } else if (activeChartTab === 'firstTimers') {
                    value = week.firstTimers;
                    maxVal = maxWeeklyFirstTimers;
                    barColor = 'from-blue-500 to-cyan-500';
                  }

                  const heightPercent = Math.max(12, Math.round((value / maxVal) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-xs font-extrabold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                        {value}
                      </div>
                      <div className="w-full bg-slate-50 rounded-t-lg h-44 flex items-end p-1 border border-slate-200">
                        <div 
                          className={`w-full bg-gradient-to-t ${barColor} rounded-t-md transition-all duration-700 shadow-xs group-hover:brightness-110`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-amber-700 transition-colors">
                        {week.weekLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Showing 5-week historical progression
            </span>
            <button
              onClick={() => onViewFilteredReports({})}
              className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
            >
              <span>Explore all records</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Performing Cells Leaderboard (Standout Dark Archetype) */}
        <div className="bg-slate-900 rounded-xl shadow-xl p-5 sm:p-6 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500 opacity-10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Top Performing Cells
              </h3>
              <span className="text-xs text-amber-400 font-medium tracking-wider uppercase">Rankings</span>
            </div>

            <div className="space-y-2.5 mt-4">
              {analytics.topPerformingCells.map((top, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md font-black text-xs flex items-center justify-center ${
                      idx === 0 ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' :
                      idx === 1 ? 'bg-slate-300 text-slate-950' :
                      idx === 2 ? 'bg-amber-700 text-amber-100' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[170px]">
                        {top.cellName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {top.leaderName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-amber-400">
                      {top.soulsWon} Souls
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {top.totalAttendance} Attend.
                    </div>
                  </div>
                </div>
              ))}
              {analytics.topPerformingCells.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-6">
                  No reports submitted yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 italic">
              Ranked by soul winning velocity & attendance consistency
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
