import React, { useState } from 'react';
import { 
  Flame, 
  FileText, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  Bell, 
  LogIn, 
  LogOut, 
  UserCheck, 
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  Layers,
  Lock
} from 'lucide-react';
import type { User, NotificationItem } from '../types';

interface NavbarProps {
  currentUser: User | null;
  currentTab: 'submit' | 'reports' | 'analytics' | 'cells' | 'users';
  setCurrentTab: (tab: 'submit' | 'reports' | 'analytics' | 'cells' | 'users') => void;
  notifications: NotificationItem[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  setCurrentTab,
  notifications,
  onOpenAuth,
  onLogout,
  onOpenNotifications
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-0.5 rounded-full font-medium">Pastor / Admin</span>;
      case 'cell_leader':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-medium">Cell Leader</span>;
      default:
        return <span className="bg-slate-700/60 text-slate-300 border border-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium">Public / Guest</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 text-white shadow-xl no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-22 sm:h-24">
          
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center gap-4.5 cursor-pointer group py-2 select-none" 
            onClick={() => setCurrentTab('submit')}
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 p-[2px] shadow-xl shadow-amber-500/20 shrink-0 transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="font-black text-base sm:text-lg tracking-wider text-amber-400 font-serif">
                  CE
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-lg sm:text-xl md:text-2xl tracking-tight text-white leading-tight">
                  CE Prolific Teens Church
                </span>
                <span className="hidden sm:inline-flex bg-amber-500/15 text-amber-300 border border-amber-500/30 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-widest">
                  Portal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide mt-0.5">
                Cell Ministry &amp; Leadership Portal
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 shadow-inner">
            <button
              id="nav-tab-submit"
              onClick={() => setCurrentTab('submit')}
              className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                currentTab === 'submit'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <PlusCircle className="w-4.5 h-4.5 text-current" />
              <span>Submit Report</span>
            </button>

            <button
              id="nav-tab-reports"
              onClick={() => setCurrentTab('reports')}
              className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                currentTab === 'reports'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <FileText className="w-4.5 h-4.5 text-current" />
              <span>All Reports</span>
            </button>

            <button
              id="nav-tab-analytics"
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                currentTab === 'analytics'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5 text-current" />
              <span>Analytics</span>
            </button>

            <button
              id="nav-tab-cells"
              onClick={() => setCurrentTab('cells')}
              className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                currentTab === 'cells'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Layers className="w-4.5 h-4.5 text-current" />
              <span>Cells Directory</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                id="nav-tab-users"
                onClick={() => setCurrentTab('users')}
                className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                  currentTab === 'users'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Users className="w-4.5 h-4.5 text-current" />
                <span>Leaders &amp; Users</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-3.5">
            
            {/* Notification Bell */}
            <button
              id="notifications-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              aria-label="Notifications"
              title="Notifications & Broadcasts"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-3.5 pl-3.5 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold text-white leading-tight truncate max-w-[170px]">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-amber-400/90 font-medium mt-0.5">
                    {currentUser.role === 'admin' ? 'Pastor / Admin' : currentUser.cellName || 'Cell Leader'}
                  </div>
                </div>
                <div className="hidden md:block">
                  {getRoleBadge(currentUser.role)}
                </div>
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-rose-500/15 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 text-slate-400 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                id="login-modal-open-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 cursor-pointer"
              >
                <LogIn className="w-4.5 h-4.5" />
                <span>Leader Login</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Dropdown Nav Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2">
          {currentUser && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <p className="text-sm font-bold text-white">{currentUser.name}</p>
                <p className="text-xs text-amber-400">{currentUser.zone}</p>
              </div>
              {getRoleBadge(currentUser.role)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => { setCurrentTab('submit'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                currentTab === 'submit' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Submit Report
            </button>

            <button
              onClick={() => { setCurrentTab('reports'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                currentTab === 'reports' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              All Reports
            </button>

            <button
              onClick={() => { setCurrentTab('analytics'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                currentTab === 'analytics' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>

            <button
              onClick={() => { setCurrentTab('cells'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                currentTab === 'cells' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Cells Directory
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => { setCurrentTab('users'); setMobileMenuOpen(false); }}
                className={`col-span-2 p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                  currentTab === 'users' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Manage Leaders & Users
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
