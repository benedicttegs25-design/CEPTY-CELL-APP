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
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-amber-500/30 text-white shadow-xl no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setCurrentTab('submit')}>
            <div className="w-11 h-11 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 font-black text-lg shadow-lg shadow-amber-500/20 shrink-0">
              CE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white font-['Outfit']">
                  Christ Embassy Prolific
                </span>
                <span className="bg-amber-500 text-slate-900 font-black text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest">
                  PORTAL
                </span>
              </div>
              <p className="text-[11px] text-amber-400 font-medium tracking-widest uppercase">
                Teens & Youth Church
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-tab-submit"
              onClick={() => setCurrentTab('submit')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs uppercase font-bold tracking-wider transition-all ${
                currentTab === 'submit'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Submit Report
            </button>

            <button
              id="nav-tab-reports"
              onClick={() => setCurrentTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs uppercase font-bold tracking-wider transition-all ${
                currentTab === 'reports'
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Reports & Reviews
            </button>

            <button
              id="nav-tab-analytics"
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs uppercase font-bold tracking-wider transition-all ${
                currentTab === 'analytics'
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>

            <button
              id="nav-tab-cells"
              onClick={() => setCurrentTab('cells')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs uppercase font-bold tracking-wider transition-all ${
                currentTab === 'cells'
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              Cells Directory
            </button>

            {currentUser?.role === 'admin' && (
              <button
                id="nav-tab-users"
                onClick={() => setCurrentTab('users')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs uppercase font-bold tracking-wider transition-all ${
                  currentTab === 'users'
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                Leaders & Users
              </button>
            )}
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Notification Bell */}
            <button
              id="notifications-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Notifications"
              title="Notifications & Broadcasts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[150px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium">
                    {currentUser.role === 'admin' ? 'Pastor / Admin' : currentUser.cellName || 'Cell Leader'}
                  </div>
                </div>
                <div className="hidden xs:block">
                  {getRoleBadge(currentUser.role)}
                </div>
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 hover:text-red-300 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="login-modal-open-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Leader Login</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
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
