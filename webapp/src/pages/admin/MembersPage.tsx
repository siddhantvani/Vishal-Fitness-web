import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Filter, Edit2, UserX, UserCheck, Eye } from 'lucide-react';
import { api } from '../../api/api';
import StatusBadge from '../../components/admin/StatusBadge';
import SlideOver from '../../components/admin/SlideOver';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const MembersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected User (SlideOver)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate/Activate Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToModify, setUserToModify] = useState<{ id: string; action: 'DEACTIVATE' | 'ACTIVATE' } | null>(null);
  const [isModifying, setIsModifying] = useState(false);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('isActive', statusFilter);

      const data = await api.get(`/users?${params.toString()}`);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleOpenDetails = (user: User) => {
    setSelectedUser(user);
    setIsEditing(false);
    setEditError(null);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    });
    setIsSlideOverOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSaving(true);
    setEditError(null);
    try {
      const updatedUser = await api.patch(`/users/${selectedUser.id}`, editForm);
      setSelectedUser(updatedUser);
      setIsEditing(false);
      fetchUsers();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!userToModify) return;

    setIsModifying(true);
    try {
      if (userToModify.action === 'DEACTIVATE') {
        await api.delete(`/users/${userToModify.id}`);
      } else {
        await api.patch(`/users/${userToModify.id}`, { isActive: true });
      }
      setIsConfirmModalOpen(false);
      
      if (selectedUser?.id === userToModify.id) {
        setIsSlideOverOpen(false);
      }
      
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsModifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-heading">
            Members Management
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
            View, search, and manage registered gym athletes.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
          />
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-zinc-400" />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full pl-9 pr-8 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm appearance-none cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="MEMBER">Member</option>
              <option value="TRAINER">Trainer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm appearance-none min-w-[120px] cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-950/60">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Member</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Joined Date</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                    <p className="mt-4 text-zinc-500 text-sm">Loading members...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-rose-500 text-sm">{error}</p>
                    <button onClick={fetchUsers} className="mt-2 text-sm text-primary-500 hover:text-primary-600 font-semibold">Try again</button>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users size={40} className="mx-auto text-zinc-400 mb-4" />
                    <p className="text-zinc-500 text-sm">No members found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 font-bold uppercase text-sm">
                            {user.firstName[0]}{user.lastName ? user.lastName[0] : ''}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-zinc-900 dark:text-white">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-zinc-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenDetails(user)}
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors p-1"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {user.isActive ? (
                          <button 
                            onClick={() => {
                              setUserToModify({ id: user.id, action: 'DEACTIVATE' });
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-rose-500/70 hover:text-rose-500 transition-colors p-1"
                            title="Deactivate Member"
                          >
                            <UserX size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              setUserToModify({ id: user.id, action: 'ACTIVATE' });
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-emerald-500/70 hover:text-emerald-500 transition-colors p-1"
                            title="Activate Member"
                          >
                            <UserCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SlideOver for Member Details / Edit */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)}
        title={isEditing ? "Edit Member" : "Member Details"}
      >
        {selectedUser && (
          <div className="space-y-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-xl uppercase">
                    {selectedUser.firstName[0]}{selectedUser.lastName ? selectedUser.lastName[0] : ''}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-xs text-zinc-500">{selectedUser.email}</p>
                    <div className="mt-2 flex gap-2">
                      <StatusBadge status={selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase">Phone Number</label>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase">Member Since</label>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Edit2 size={16} />
                    <span>Edit Profile</span>
                  </button>
                  {selectedUser.isActive ? (
                    <button
                      onClick={() => {
                        setUserToModify({ id: selectedUser.id, action: 'DEACTIVATE' });
                        setIsConfirmModalOpen(true);
                      }}
                      className="py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setUserToModify({ id: selectedUser.id, action: 'ACTIVATE' });
                        setIsConfirmModalOpen(true);
                      }}
                      className="py-2.5 px-4 rounded-xl text-xs font-semibold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editError && (
                  <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-500">
                    {editError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">First Name</label>
                    <input 
                      type="text" 
                      required
                      value={editForm.firstName}
                      onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      required
                      value={editForm.lastName}
                      onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Role</label>
                  <select 
                    value={editForm.role}
                    onChange={e => setEditForm({...editForm, role: e.target.value})}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="TRAINER">Trainer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditError(null);
                    }}
                    className="flex-1 py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex justify-center shadow-sm"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </SlideOver>

      {/* Confirmation Modal */}
      <ConfirmActionModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isModifying}
        title={userToModify?.action === 'DEACTIVATE' ? 'Deactivate Member' : 'Activate Member'}
        message={
          userToModify?.action === 'DEACTIVATE' 
            ? 'Are you sure you want to deactivate this member? They will no longer be able to log in, but their historical records (bookings, progress) will be preserved safely.' 
            : 'Are you sure you want to activate this member? They will regain access to their account immediately.'
        }
        confirmText={userToModify?.action === 'DEACTIVATE' ? 'Deactivate' : 'Activate'}
        isDestructive={userToModify?.action === 'DEACTIVATE'}
      />
    </div>
  );
};

export default MembersPage;
