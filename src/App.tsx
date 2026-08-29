import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PublicReportForm } from './components/PublicReportForm';
import { AdminDashboard } from './components/AdminDashboard';
import { ReportsTableView } from './components/ReportsTableView';
import { CellDirectoryView } from './components/CellDirectoryView';
import { UserManagementView } from './components/UserManagementView';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import type { User, Report, Cell, Zone, NotificationItem, AnalyticsSummary, ReportStatus } from './types';

export default function App() {
  // Navigation & Modal State
  const [currentTab, setCurrentTab] = useState<'submit' | 'reports' | 'analytics' | 'cells' | 'users'>('submit');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App Data State
  // Fix: require login instead of auto-admin
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ce_prolific_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return null;
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all initial data
  const fetchData = async () => {
    try {
      const [repRes, cellRes, zoneRes, userRes, notifRes, anaRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/cells'),
        fetch('/api/zones'),
        fetch('/api/users'),
        fetch('/api/notifications'),
        fetch(`/api/analytics${selectedZone !== 'All Zones' ? `?zone=${encodeURIComponent(selectedZone)}` : ''}`)
      ]);

      if (repRes.ok) setReports(await repRes.json());
      if (cellRes.ok) setCells(await cellRes.json());
      if (zoneRes.ok) setZones(await zoneRes.json());
      if (userRes.ok) setUsers(await userRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (anaRes.ok) setAnalytics(await anaRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedZone]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ce_prolific_user', JSON.stringify(user));
    showToast(`Welcome back, ${user.name}!`);
    fetchData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ce_prolific_user');
    showToast('Signed out of session');
  };

  // Report Creation Handler
  const handleReportSubmitted = (newReport: Report) => {
    setReports(prev => [newReport, ...prev]);
    showToast(`Report logged successfully for ${newReport.cellName}!`);
    fetchData();
  };

  // Update Report Status
  const handleUpdateReportStatus = async (
    reportId: string, 
    status: ReportStatus, 
    coordinatorNotes?: string, 
    pastorNotes?: string
  ) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          coordinatorNotes,
          pastorNotes,
          reviewedBy: currentUser?.name || 'Coordinator'
        })
      });

      if (!res.ok) throw new Error('Failed to update status');

      const updated: Report = await res.json();
      setReports(prev => prev.map(r => r.id === reportId ? updated : r));
      showToast(`Report marked as ${status.toUpperCase()}!`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error updating report');
    }
  };

  // Delete Report
  const handleDeleteReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete report');
      setReports(prev => prev.filter(r => r.id !== reportId));
      showToast('Report deleted from database');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting report');
    }
  };

  // Add Cell
  const handleAddCell = async (newCellData: Partial<Cell>) => {
    try {
      const res = await fetch('/api/cells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCellData)
      });
      if (!res.ok) throw new Error('Failed to add cell');
      const created = await res.json();
      setCells(prev => [created, ...prev]);
      showToast(`Cell "${created.name}" registered successfully!`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error creating cell');
    }
  };

  // Edit Cell
  const handleEditCell = async (cellId: string, updatedData: Partial<Cell>) => {
    try {
      const res = await fetch(`/api/cells/${cellId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update cell details');
      const updated: Cell = await res.json();
      setCells(prev => prev.map(c => c.id === cellId ? updated : c));
      showToast(`Cell "${updated.name}" updated successfully!`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error updating cell');
    }
  };

  // Delete Cell
  const handleDeleteCell = async (cellId: string) => {
    try {
      const res = await fetch(`/api/cells/${cellId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove cell');
      setCells(prev => prev.filter(c => c.id !== cellId));
      showToast('Cell unit removed successfully');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting cell');
    }
  };

  // Add User
  const handleAddUser = async (userData: Partial<User>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!res.ok) throw new Error('Failed to create user');
      const created = await res.json();
      setUsers(prev => [...prev, created]);
      showToast(`Account created for ${created.name}!`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error creating user');
    }
  };

  // Edit User / Pick Admin Role
  const handleEditUser = async (userId: string, updatedData: Partial<User>) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update user profile');
      const updated: User = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      
      // If current active user was edited, update currentUser state & storage
      if (currentUser?.id === userId) {
        setCurrentUser(updated);
        localStorage.setItem('ce_prolific_user', JSON.stringify(updated));
      }

      showToast(`Updated account & role for ${updated.name}!`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error updating user profile');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('Leader account removed from portal');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting user');
    }
  };

  // Approve Pending User
  const handleApproveUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      if (!res.ok) throw new Error('Failed to approve user');
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      showToast(`Account for ${updated.name} has been APPROVED!`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error approving account');
    }
  };

  // Mark notification as read
  const handleMarkNotifRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      // Ignore
    }
  };

  // Send Broadcast Reminder
  const handleSendBroadcastReminder = async (customMsg?: string) => {
    try {
      const res = await fetch('/api/notifications/broadcast-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customMessage: customMsg })
      });
      if (!res.ok) throw new Error('Failed to send broadcast');
      showToast('Weekly deadline reminder broadcasted to all Cell Leaders!');
      fetchData();
    } catch (e: any) {
      showToast(e.message || 'Failed to send broadcast');
    }
  };

  // Export CSV Helper
  const handleExportCsv = () => {
    if (reports.length === 0) {
      showToast('No reports available to export.');
      return;
    }

    const headers = [
      'Report ID',
      'Cell Name',
      'Leader Name',
      'Leader Phone',
      'Zone',
      'Date of Meeting',
      'Meeting Type',
      'Cell Attendance',
      'Sunday Service Attendance',
      'Wednesday Service Attendance',
      'Total Attendance',
      'First Timers',
      'Souls Won',
      'Followed Up',
      'Offering (NGN)',
      'Status',
      'Next Meeting Date',
      'Testimonies',
      'Challenges',
      'Prayer Requests',
      'Reviewed By'
    ];

    const rows = reports.map(r => [
      `"${r.id}"`,
      `"${r.cellName.replace(/"/g, '""')}"`,
      `"${r.leaderName.replace(/"/g, '""')}"`,
      `"${r.leaderPhone || ''}"`,
      `"${r.zone}"`,
      `"${r.date}"`,
      `"${r.meetingType}"`,
      r.attendanceCell || r.attendanceTotal,
      r.attendanceSunday || 0,
      r.attendanceWednesday || 0,
      r.attendanceTotal,
      r.firstTimers,
      r.soulsWon,
      r.followedUp,
      r.offering || 0,
      `"${r.status}"`,
      `"${r.nextMeetingDate || ''}"`,
      `"${(r.testimonies || '').replace(/"/g, '""')}"`,
      `"${(r.challenges || '').replace(/"/g, '""')}"`,
      `"${(r.prayerRequests || '').replace(/"/g, '""')}"`,
      `"${r.reviewedBy || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CE_Prolific_Cell_Reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-60 bg-slate-900 border border-amber-500/40 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        notifications={notifications}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotifOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Tab 1: Submit Cell Report (Publicly Accessible without login) */}
        {currentTab === 'submit' && (
          <PublicReportForm
            currentUser={currentUser}
            cells={cells}
            zones={zones}
            onSubmitSuccess={handleReportSubmitted}
            onViewReports={() => setCurrentTab('reports')}
          />
        )}

        {/* Tab 2: Reports & Reviews */}
        {currentTab === 'reports' && (
          <ReportsTableView
            reports={reports}
            zones={zones}
            cells={cells}
            currentUser={currentUser}
            onUpdateReportStatus={handleUpdateReportStatus}
            onDeleteReport={handleDeleteReport}
            onExportCsv={handleExportCsv}
          />
        )}

        {/* Tab 3: Ministry Analytics & Dashboard */}
        {currentTab === 'analytics' && (
          <AdminDashboard
            analytics={analytics}
            zones={zones}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            onSendBroadcastReminder={handleSendBroadcastReminder}
            onViewFilteredReports={(filter) => {
              if (filter.zone) setSelectedZone(filter.zone);
              setCurrentTab('reports');
            }}
            onExportCsv={handleExportCsv}
          />
        )}

        {/* Tab 4: Cells Directory */}
        {currentTab === 'cells' && (
          <CellDirectoryView
            cells={cells}
            zones={zones}
            currentUser={currentUser}
            onAddCell={handleAddCell}
            onEditCell={handleEditCell}
            onDeleteCell={handleDeleteCell}
          />
        )}

        {/* Tab 5: Users & Leaders Management (Admin Only) */}
        {currentTab === 'users' && (
          <UserManagementView
            users={users}
            zones={zones}
            cells={cells}
            currentUser={currentUser}
            onApproveUser={handleApproveUser}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 tracking-wider uppercase font-semibold no-print gap-2">
        <div>
          Christ Embassy Prolific Teens & Youth Church • Ministry Management Portal
        </div>
        <div className="text-[10px] text-slate-400">
          "Every Soul Counted, Every Cell Flourishing"
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        zones={zones}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={(msg) => showToast(msg)}
      />

      {/* Notifications Drawer Modal */}
      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        currentUser={currentUser}
        onMarkAsRead={handleMarkNotifRead}
        onSendBroadcast={handleSendBroadcastReminder}
        onViewReportById={(reportId) => {
          setCurrentTab('reports');
        }}
      />

    </div>
  );
}
