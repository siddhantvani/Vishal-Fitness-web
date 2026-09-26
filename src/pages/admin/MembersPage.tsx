import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, MoreVertical, Edit2, UserX, UserCheck, Eye } from 'lucide-react';
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
  const fetchUsers = async () => {
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
      setError(err.message || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  const handleOpenDetails = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    });
    setIsEditing(false);
    setEditError(null);
    setIsSlideOverOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSaving(true);
    setEditError(null);
    try {
      await api.patch(`/users/${selectedUser.id}`, {
        ...editForm,
        // send undefined if phone is empty so we don't accidentally send empty string instead of null
        phone: editForm.phone || undefined,
      });
      setIsSlideOverOpen(false);
      fetchUsers();
    } catch (err: any) {
      if (err.status === 409) {
        setEditError('This email is already in use.');
      } else {
        setEditError(err.message || 'Failed to update member.');
      }
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
      
      // If the modified user is currently in the slide-over, close it
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Members Management</h1>
          <p className="text-gray-400 mt-1">View, search, and manage all users in the system.</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-500" />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full pl-10 pr-8 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm appearance-none"
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
            className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm appearance-none min-w-[120px]"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-950">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined Date</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                    <p className="mt-4 text-gray-400 text-sm">Loading members...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button onClick={fetchUsers} className="mt-2 text-sm text-red-400 hover:text-red-300">Try again</button>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users size={40} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-sm">No members found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 font-bold uppercase">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenDetails(user)}
                          className="text-gray-400 hover:text-white transition-colors"
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
                            className="text-red-500/70 hover:text-red-500 transition-colors"
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
                            className="text-green-500/70 hover:text-green-500 transition-colors"
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
              // View Mode
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                </div>
                
                <div className="bg-gray-950 border border-gray-800 p-4 rounded-lg space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                    <p className="mt-1 text-white text-lg font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                    <p className="mt-1 text-gray-300">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                    <p className="mt-1 text-gray-300">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</label>
                      <p className="mt-1 text-gray-300">{selectedUser.role}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</label>
                      <p className="mt-1 text-gray-300">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {selectedUser.isActive ? (
                  <button 
                    onClick={() => {
                      setUserToModify({ id: selectedUser.id, action: 'DEACTIVATE' });
                      setIsConfirmModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-500/20 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors font-medium text-sm"
                  >
                    <UserX size={18} /> Deactivate Member
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setUserToModify({ id: selectedUser.id, action: 'ACTIVATE' });
                      setIsConfirmModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-green-500/20 bg-green-500/10 text-green-500 rounded-md hover:bg-green-500/20 transition-colors font-medium text-sm"
                  >
                    <UserCheck size={18} /> Activate Member
                  </button>
                )}
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSaveEdit} className="space-y-4">
                {editError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md">
                    <p className="text-sm text-red-500">{editError}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                    <input 
                      type="text" 
                      required
                      value={editForm.firstName}
                      onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      required
                      value={editForm.lastName}
                      onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                  <select 
                    value={editForm.role}
                    onChange={e => setEditForm({...editForm, role: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
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
                    className="flex-1 py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 disabled:opacity-50 flex justify-center"
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
