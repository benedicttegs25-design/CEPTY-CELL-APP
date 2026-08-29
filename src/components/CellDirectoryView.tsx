import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  Search, 
  Target, 
  CheckCircle, 
  X, 
  Send, 
  Building,
  Edit2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import type { Cell, Zone, User as UserType } from '../types';

interface CellDirectoryViewProps {
  cells: Cell[];
  zones: Zone[];
  currentUser: UserType | null;
  onAddCell: (newCellData: Partial<Cell>) => Promise<void>;
  onEditCell?: (cellId: string, updatedData: Partial<Cell>) => Promise<void>;
  onDeleteCell?: (cellId: string) => Promise<void>;
  onSelectCellForReport?: (cellName: string) => void;
}

export const CellDirectoryView: React.FC<CellDirectoryViewProps> = ({
  cells,
  zones,
  currentUser,
  onAddCell,
  onEditCell,
  onDeleteCell,
  onSelectCellForReport
}) => {
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<Cell | null>(null);
  const [deletingCell, setDeletingCell] = useState<Cell | null>(null);
  
  // New cell form state
  const [name, setName] = useState('');
  const [zone, setZone] = useState('Zone 1 - Kings Court');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [targetAttendance, setTargetAttendance] = useState(35);
  const [targetSouls, setTargetSouls] = useState(10);
  const [meetingDay, setMeetingDay] = useState('Saturday');
  const [meetingTime, setMeetingTime] = useState('4:00 PM');
  const [venue, setVenue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit cell form state
  const [editName, setEditName] = useState('');
  const [editZone, setEditZone] = useState('');
  const [editLeaderName, setEditLeaderName] = useState('');
  const [editLeaderPhone, setEditLeaderPhone] = useState('');
  const [editLeaderEmail, setEditLeaderEmail] = useState('');
  const [editTargetAttendance, setEditTargetAttendance] = useState(35);
  const [editTargetSouls, setEditTargetSouls] = useState(10);
  const [editMeetingDay, setEditMeetingDay] = useState('Saturday');
  const [editMeetingTime, setEditMeetingTime] = useState('4:00 PM');
  const [editVenue, setEditVenue] = useState('');

  const openEditModal = (cell: Cell) => {
    setEditingCell(cell);
    setEditName(cell.name);
    setEditZone(cell.zone);
    setEditLeaderName(cell.leaderName);
    setEditLeaderPhone(cell.leaderPhone || '');
    setEditLeaderEmail(cell.leaderEmail || '');
    setEditTargetAttendance(cell.targetAttendance);
    setEditTargetSouls(cell.targetSouls);
    setEditMeetingDay(cell.meetingDay);
    setEditMeetingTime(cell.meetingTime);
    setEditVenue(cell.venue || '');
  };

  const handleUpdateCell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell || !editName.trim()) return;

    setIsSubmitting(true);
    try {
      if (onEditCell) {
        await onEditCell(editingCell.id, {
          name: editName.trim(),
          zone: editZone,
          leaderName: editLeaderName.trim() || 'Assigned Leader',
          leaderPhone: editLeaderPhone.trim(),
          leaderEmail: editLeaderEmail.trim(),
          targetAttendance: Number(editTargetAttendance) || 30,
          targetSouls: Number(editTargetSouls) || 10,
          meetingDay: editMeetingDay,
          meetingTime: editMeetingTime,
          venue: editVenue.trim() || 'Church Annex'
        });
      }
      setEditingCell(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCell || !onDeleteCell) return;
    setIsSubmitting(true);
    try {
      await onDeleteCell(deletingCell.id);
      setDeletingCell(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCells = cells.filter(cell => {
    if (selectedZone !== 'All Zones' && cell.zone !== selectedZone) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        cell.name.toLowerCase().includes(q) ||
        cell.leaderName.toLowerCase().includes(q) ||
        cell.venue.toLowerCase().includes(q) ||
        cell.zone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateCell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddCell({
        name: name.trim(),
        zone,
        leaderName: leaderName.trim() || 'Assigned Leader',
        leaderPhone: leaderPhone.trim(),
        leaderEmail: leaderEmail.trim(),
        targetAttendance: Number(targetAttendance) || 30,
        targetSouls: Number(targetSouls) || 10,
        meetingDay,
        meetingTime,
        venue: venue.trim() || 'Church Annex'
      });
      setIsAddModalOpen(false);
      setName('');
      setLeaderName('');
      setLeaderPhone('');
      setLeaderEmail('');
      setVenue('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 font-['Outfit']">
              Church Cells Directory
            </h2>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {filteredCells.length} Active Units
            </span>
            {isAdmin && (
              <span className="bg-slate-900 text-amber-400 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">
                Admin Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered fellowship units, leaders, targets, and fellowship locations. {isAdmin ? 'You have full permission to add, edit, and delete cells.' : 'Cell leaders can view directory and fellowship details.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              id="open-add-cell-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors border-b-2 border-amber-500 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Register New Cell</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cell name, leader, venue, or zone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
        >
          <option value="All Zones">All Zones</option>
          {zones.map(z => (
            <option key={z.id} value={z.name}>{z.name}</option>
          ))}
        </select>
      </div>

      {/* Cells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCells.map(cell => (
          <div 
            key={cell.id} 
            className="bg-white border border-slate-200 hover:border-amber-500/50 p-5 rounded-xl shadow-sm transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block truncate max-w-full">
                    {cell.zone.replace(/Zone \d+ - /, '')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5 font-['Outfit'] group-hover:text-amber-700 transition-colors">
                    {cell.name}
                  </h3>
                </div>

                {/* Edit & Delete Action Buttons (Admin Only) */}
                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(cell)}
                      title="Edit Cell Name & Info"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCell(cell)}
                      title="Remove Cell"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Leader Info */}
              <div className="mt-3.5 space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold text-slate-900">{cell.leaderName}</span>
                  </div>
                </div>
                {cell.leaderPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-600">{cell.leaderPhone}</span>
                  </div>
                )}
                {cell.venue && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-500 line-clamp-1">{cell.venue}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500">{cell.meetingDay}s at {cell.meetingTime}</span>
                </div>
              </div>
            </div>

            {/* Target Attendance & Souls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Attendance Target</span>
                  <span className="font-black text-slate-900">{cell.targetAttendance}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-800 block">Souls Target</span>
                  <span className="font-black text-amber-700">{cell.targetSouls}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => openEditModal(cell)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                )}
                {cell.leaderPhone && (
                  <a
                    href={`https://wa.me/${cell.leaderPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Contact
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Cell Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b-2 border-amber-500 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Edit Cell Information
                </h3>
                <p className="text-[11px] text-amber-400">Update cell name, location, leaders, or ministry targets</p>
              </div>
              <button 
                onClick={() => setEditingCell(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCell} className="p-5 sm:p-6 space-y-4 bg-slate-50">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cell Unit Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Victorious Dominion Youth Cell"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Zone <span className="text-amber-600">*</span>
                  </label>
                  <select
                    value={editZone}
                    onChange={(e) => setEditZone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Leader Full Name
                  </label>
                  <input
                    type="text"
                    value={editLeaderName}
                    onChange={(e) => setEditLeaderName(e.target.value)}
                    placeholder="Brother / Sister Name"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Leader Phone
                  </label>
                  <input
                    type="tel"
                    value={editLeaderPhone}
                    onChange={(e) => setEditLeaderPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Leader Email
                  </label>
                  <input
                    type="email"
                    value={editLeaderEmail}
                    onChange={(e) => setEditLeaderEmail(e.target.value)}
                    placeholder="leader@prolificchurch.ce"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting Venue / Address
                </label>
                <input
                  type="text"
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  placeholder="Street address or Fellowship Center"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Meeting Day</label>
                  <select
                    value={editMeetingDay}
                    onChange={(e) => setEditMeetingDay(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                  >
                    <option value="Saturday">Saturday</option>
                    <option value="Friday">Friday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Wednesday">Wednesday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={editMeetingTime}
                    onChange={(e) => setEditMeetingTime(e.target.value)}
                    placeholder="4:00 PM"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Attend. Target</label>
                  <input
                    type="number"
                    value={editTargetAttendance}
                    onChange={(e) => setEditTargetAttendance(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-1">Souls Target</label>
                  <input
                    type="number"
                    value={editTargetSouls}
                    onChange={(e) => setEditTargetSouls(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-xs text-amber-700 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors border-b-2 border-amber-500 shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Cell Confirmation Modal */}
      {deletingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b-2 border-rose-500 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Remove Cell Unit
                </h3>
              </div>
              <button 
                onClick={() => setDeletingCell(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 bg-slate-50">
              <p className="text-xs text-slate-700 leading-relaxed">
                Are you sure you want to remove the fellowship unit <strong>"{deletingCell.name}"</strong> ({deletingCell.zone})?
              </p>
              <p className="text-[11px] text-slate-500">
                This action will delete the cell from the directory. Past submitted reports will remain in the historical archive.
              </p>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingCell(null)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Removing...' : 'Confirm Remove Cell'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Cell Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b-2 border-amber-500 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="text-lg font-bold text-white font-['Outfit']">
                Register New Church Cell
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCell} className="p-5 sm:p-6 space-y-4 bg-slate-50">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cell Unit Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Victorious Dominion Youth Cell"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Zone <span className="text-amber-600">*</span>
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Leader Full Name
                  </label>
                  <input
                    type="text"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="Brother / Sister Name"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Leader Phone
                  </label>
                  <input
                    type="tel"
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Leader Email
                  </label>
                  <input
                    type="email"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    placeholder="leader@prolificchurch.ce"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting Venue / Address
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Street address or Fellowship Center"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Meeting Day</label>
                  <select
                    value={meetingDay}
                    onChange={(e) => setMeetingDay(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                  >
                    <option value="Saturday">Saturday</option>
                    <option value="Friday">Friday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Wednesday">Wednesday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    placeholder="4:00 PM"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Attend. Target</label>
                  <input
                    type="number"
                    value={targetAttendance}
                    onChange={(e) => setTargetAttendance(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-1">Souls Target</label>
                  <input
                    type="number"
                    value={targetSouls}
                    onChange={(e) => setTargetSouls(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-xs text-amber-700 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors border-b-2 border-amber-500 shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Cell Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
