import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Flame, 
  Sparkles, 
  Share2,
  Calendar
} from 'lucide-react';
import type { NotificationItem, User } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currentUser: User | null;
  onMarkAsRead: (id: string) => Promise<void>;
  onSendBroadcast: (message?: string) => Promise<void>;
  onViewReportById?: (reportId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onMarkAsRead,
  onSendBroadcast,
  onViewReportById
}) => {
  const [broadcastInput, setBroadcastInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;

    setIsSending(true);
    try {
      await onSendBroadcast(broadcastInput.trim());
      setBroadcastInput('');
      setShowBroadcastForm(false);
    } finally {
      setIsSending(false);
    }
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'submission_alert':
        return <Flame className="w-4 h-4 text-rose-600" />;
      case 'approval_alert':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b-2 border-amber-500 bg-slate-900 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Ministry Alerts & Reminders
              </h3>
              <p className="text-[11px] text-slate-400">
                Weekly submission deadlines and pastoral alerts
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Weekly Deadline Reminder Card */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-amber-900 block">
              Official Reporting Policy
            </span>
            <p className="text-[11px] text-slate-700 mt-0.5">
              All weekly cell reports must be submitted by <strong>Monday at 12:00 PM</strong> for Pastoral compilation and group review.
            </p>
          </div>
        </div>

        {/* Broadcast Trigger for Admins / Pastors */}
        {currentUser?.role === 'admin' && (
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            {!showBroadcastForm ? (
              <button
                onClick={() => setShowBroadcastForm(true)}
                className="w-full text-center text-xs font-bold text-slate-800 hover:text-amber-800 py-2 rounded-lg border border-dashed border-amber-400 bg-white hover:bg-amber-50/60 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-amber-600" />
                <span>Broadcast Deadline Reminder to Cell Leaders</span>
              </button>
            ) : (
              <form onSubmit={handleBroadcast} className="space-y-2">
                <textarea
                  rows={2}
                  value={broadcastInput}
                  onChange={(e) => setBroadcastInput(e.target.value)}
                  placeholder="Enter reminder notice to send to all cell leaders..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 border-b-2 border-amber-500 transition-colors shadow-xs"
                  >
                    {isSending ? 'Sending...' : 'Send Broadcast'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Notifications List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-slate-50">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recent notifications.
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) onMarkAsRead(notif.id);
                  if (notif.reportId && onViewReportById) {
                    onViewReportById(notif.reportId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-slate-100/80 border-slate-200 text-slate-500'
                    : 'bg-white border-amber-300 text-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.reportId && (
                      <span className="inline-block text-[10px] text-amber-700 font-bold mt-1 hover:underline">
                        View Report Details →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
