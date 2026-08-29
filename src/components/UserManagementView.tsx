import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  CheckCircle2, 
  Clock, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  AlertCircle,
  Edit2,
  Trash2,
  AlertTriangle,
  UserCog,
  LogIn
} from 'lucide-react';
import type { User, Zone, Cell, UserRole } from '../types';

interface UserManagementViewProps {
  users: User[];
  zones: Zone[];
  cells: Cell[];
  currentUser?: User | null;
  onApproveUser: (userId: string) => Promise<void>;
  onAddUser: (userData: Partial<User>) => Promise<void>;
  onEditUser?: (userId: string, updatedData: Partial<User>) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  zones,
  cells,
  currentUser,
  onApproveUser,
  onAddUser,
  onEditUser,
  onDeleteUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('cell_leader');
  const [zone, setZone] = useState('Zone 1 - Kings Court');
  const [cellName, setCellName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit user form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('cell_leader');
  const [editZone, setEditZone] = useState('');
  const [editCellName, setEditCellName] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'pending_approval'>('active');

  const pendingUsers = users.filter(u => u.status === 'pending_approval');

  const filteredUsers = users.filter(user => {
    if (selectedRole !== 'all' && user.role !== selectedRole) return false;
    if (selectedStatus !== 'all' && user.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.includes(q) ||
        user.zone.toLowerCase().includes(q) ||
        (user.cellName && user.cellName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        zone,
        cellName: cellName.trim(),
        status: 'active'
      });
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setCellName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditZone(user.zone || 'Zone 1 - Kings Court');
    setEditCellName(user.cellName || '');
    setEditStatus(user.status);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;

    setIsSubmitting(true);
    try {
      if (onEditUser) {
        await onEditUser(editingUser.id, {
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          role: editRole,
          zone: editZone,
          cellName: editCellName.trim(),
          status: editStatus
        });
      }
      setEditingUser(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRoleChange = async (userId: string, newRole: UserRole) => {
    if (onEditUser) {
      await onEditUser(userId, { role: newRole });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser || !onDeleteUser) return;
    setIsSubmitting(true);
    try {
      await onDeleteUser(deletingUser.id);
      setDeletingUser(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 font-['Outfit']">
              Leadership & User Accounts
            </h2>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {users.length} Registered Leaders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pick and assign Pastor / Admin roles and approve or edit Cell Leader registrations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors border-b-2 border-amber-500 shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>Create New Leader</span>
        </button>
      </div>

      {/* Pending Approvals Notice Banner */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-700" />
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
              Pending Account Approvals ({pendingUsers.length} Leaders Waiting)
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            The following cell leaders registered recently. Review and activate their accounts to grant them official portal access.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {pendingUsers.map(user => (
              <div key={user.id} className="bg-white border border-amber-300/80 p-3.5 rounded-xl shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="text-[10px] text-amber-800 font-medium">{user.cellName || 'Cell Leader'}</div>
                  <div className="text-[10px] text-slate-500">{user.zone} • {user.phone}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    title="Edit details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onApproveUser(user.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, zone, or cell..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Pastor / Admin</option>
          <option value="cell_leader">Cell Leader</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending_approval">Pending Approval</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Leader Name</th>
                <th className="py-3.5 px-4">Assigned Role (Pick to Change)</th>
                <th className="py-3.5 px-4">Zone Assignment</th>
                <th className="py-3.5 px-4">Cell Fellowship</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4 text-center">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const isCurrent = currentUser?.id === user.id;

                return (
                  <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-amber-50/40' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center font-bold text-amber-800 border border-amber-200 shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-slate-900 text-amber-400 font-bold px-1.5 py-0.2 rounded">
                                YOU (Active)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Interactive Role Picker Dropdown */}
                      <select
                        value={user.role}
                        onChange={(e) => handleQuickRoleChange(user.id, e.target.value as UserRole)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
                          user.role === 'admin'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        <option value="admin">Pastor / Admin</option>
                        <option value="cell_leader">Cell Leader</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 font-medium">
                        {user.zone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-amber-800 font-medium">
                        {user.cellName || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{user.email}</div>
                      <div className="text-[11px] text-slate-500">{user.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.status === 'pending_approval' && (
                          <button
                            onClick={() => onApproveUser(user.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg transition-colors shadow-xs cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit leader profile & role"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingUser(user)}
                          title="Delete user account"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b-2 border-amber-500 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Edit Leader / User Account
                </h3>
                <p className="text-[11px] text-amber-400">Change name, contact, zone, or assign Pastor/Admin role</p>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-5 sm:p-6 space-y-4 bg-slate-50">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Brother / Sister Name"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="leader@prolificchurch.ce"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role (Pick Admin / Leader) <span className="text-amber-600">*</span>
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="admin">Pastor / Admin</option>
                    <option value="cell_leader">Cell Leader</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Zone Assignment
                  </label>
                  <select
                    value={editZone}
                    onChange={(e) => setEditZone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="All Zones">All Zones</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cell Fellowship Name
                  </label>
                  <input
                    type="text"
                    value={editCellName}
                    onChange={(e) => setEditCellName(e.target.value)}
                    placeholder="e.g. Dominion Youth Cell"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Active / Approved</option>
                    <option value="pending_approval">Pending Approval</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors border-b-2 border-amber-500 shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b-2 border-rose-500 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Delete Leader Account
                </h3>
              </div>
              <button 
                onClick={() => setDeletingUser(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 bg-slate-50">
              <p className="text-xs text-slate-700 leading-relaxed">
                Are you sure you want to delete the account for <strong>"{deletingUser.name}"</strong> ({deletingUser.role.toUpperCase()})?
              </p>
              <p className="text-[11px] text-slate-500">
                This will remove their login and leader profile from the portal.
              </p>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
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
                  <span>{isSubmitting ? 'Deleting...' : 'Confirm Delete User'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b-2 border-amber-500 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="text-lg font-bold text-white font-['Outfit']">
                Create Leader Account
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 sm:p-6 space-y-4 bg-slate-50">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Brother / Sister Name"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="leader@prolificchurch.ce"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="cell_leader">Cell Leader</option>
                    <option value="admin">Pastor / Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Zone Assignment
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="All Zones">All Zones</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cell Unit Name <span className="text-[10px] text-slate-500">(if cell leader)</span>
                </label>
                <input
                  type="text"
                  value={cellName}
                  onChange={(e) => setCellName(e.target.value)}
                  placeholder="e.g. Dominion Youth Cell"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
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
                  {isSubmitting ? 'Creating...' : 'Create Leader Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
