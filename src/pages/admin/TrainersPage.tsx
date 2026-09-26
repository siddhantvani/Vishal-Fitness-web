import React, { useState, useEffect } from 'react';
import { Dumbbell, Search, Filter, MoreVertical, Edit2, UserX, UserCheck, Eye, Plus } from 'lucide-react';
import { api } from '../../api/api';
import StatusBadge from '../../components/admin/StatusBadge';
import SlideOver from '../../components/admin/SlideOver';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal';

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  specialization: string | null;
  experience: number | null;
  availability: string | null;
  bio: string | null;
  createdAt: string;
}

const TrainersPage = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Trainer (SlideOver)
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [slideOverMode, setSlideOverMode] = useState<'VIEW' | 'EDIT' | 'ADD'>('VIEW');
  
  // Form State
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    experience: '',
    availability: '',
    bio: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate/Activate Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [trainerToModify, setTrainerToModify] = useState<{ id: string; action: 'DEACTIVATE' | 'ACTIVATE' } | null>(null);
  const [isModifying, setIsModifying] = useState(false);

  // Fetch Trainers
  const fetchTrainers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get(`/trainers`);
      
      // Filter locally since the backend doesn't seem to natively support query params for trainers based on inspection,
      // or if it does, we can just do it here to be safe and match the current state.
      let filtered = data;
      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter((t: Trainer) => 
          t.firstName.toLowerCase().includes(lowerSearch) || 
          t.lastName.toLowerCase().includes(lowerSearch) || 
          t.email.toLowerCase().includes(lowerSearch) ||
          (t.phone && t.phone.includes(search))
        );
      }
      if (statusFilter) {
        const isActiveFilter = statusFilter === 'true';
        filtered = filtered.filter((t: Trainer) => t.isActive === isActiveFilter);
      }

      setTrainers(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load trainers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrainers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleOpenDetails = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setForm({
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      email: trainer.email,
      password: '',
      phone: trainer.phone || '',
      specialization: trainer.specialization || '',
      experience: trainer.experience?.toString() || '',
      availability: trainer.availability || '',
      bio: trainer.bio || '',
    });
    setSlideOverMode('VIEW');
    setFormError(null);
    setIsSlideOverOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedTrainer(null);
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      experience: '',
      availability: '',
      bio: '',
    });
    setSlideOverMode('ADD');
    setFormError(null);
    setIsSlideOverOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    
    try {
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        specialization: form.specialization || undefined,
        experience: form.experience ? parseInt(form.experience) : undefined,
        availability: form.availability || undefined,
        bio: form.bio || undefined,
      };

      if (slideOverMode === 'ADD') {
        if (form.password) payload.password = form.password;
        await api.post(`/trainers`, payload);
      } else if (slideOverMode === 'EDIT' && selectedTrainer) {
        await api.patch(`/trainers/${selectedTrainer.id}`, payload);
      }
      
      setIsSlideOverOpen(false);
      fetchTrainers();
    } catch (err: any) {
      if (err.status === 400 && err.data?.message?.includes('already exists')) {
        setFormError('This email is already in use by another user.');
      } else if (err.status === 409) {
        setFormError('This email is already in use.');
      } else {
        setFormError(err.message || 'Failed to save trainer.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!trainerToModify) return;
    setIsModifying(true);
    try {
      if (trainerToModify.action === 'DEACTIVATE') {
        // Soft deactivate via PATCH
        await api.patch(`/trainers/${trainerToModify.id}`, { isActive: false });
      } else {
        // Soft activate via PATCH
        await api.patch(`/trainers/${trainerToModify.id}`, { isActive: true });
      }
      setIsConfirmModalOpen(false);
      
      if (selectedTrainer?.id === trainerToModify.id) {
        setIsSlideOverOpen(false);
      }
      
      fetchTrainers();
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Trainers Management</h1>
          <p className="text-gray-400 mt-1">View, search, and manage fitness trainers.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
        >
          <Plus size={18} /> Add Trainer
        </button>
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm appearance-none min-w-[150px]"
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
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trainer</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Specialization</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Availability</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
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
                    <p className="mt-4 text-gray-400 text-sm">Loading trainers...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button onClick={fetchTrainers} className="mt-2 text-sm text-red-400 hover:text-red-300">Try again</button>
                  </td>
                </tr>
              ) : trainers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Dumbbell size={40} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-sm">No trainers found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                trainers.map((trainer) => (
                  <tr key={trainer.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 font-bold uppercase">
                            {trainer.firstName[0]}{trainer.lastName[0]}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{trainer.firstName} {trainer.lastName}</div>
                          <div className="text-sm text-gray-500">{trainer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{trainer.specialization || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{trainer.availability || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={trainer.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenDetails(trainer)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {trainer.isActive ? (
                          <button 
                            onClick={() => {
                              setTrainerToModify({ id: trainer.id, action: 'DEACTIVATE' });
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-red-500/70 hover:text-red-500 transition-colors"
                            title="Deactivate Trainer"
                          >
                            <UserX size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              setTrainerToModify({ id: trainer.id, action: 'ACTIVATE' });
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-green-500/70 hover:text-green-500 transition-colors"
                            title="Activate Trainer"
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

      {/* SlideOver for Trainer Details / Edit / Add */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)}
        title={slideOverMode === 'ADD' ? 'Add New Trainer' : slideOverMode === 'EDIT' ? 'Edit Trainer' : 'Trainer Details'}
      >
        <div className="space-y-6 pb-20">
          {slideOverMode === 'VIEW' && selectedTrainer ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedTrainer.isActive ? 'ACTIVE' : 'INACTIVE'} />
                <button 
                  onClick={() => setSlideOverMode('EDIT')}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
                >
                  <Edit2 size={16} /> Edit Trainer
                </button>
              </div>
              
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-lg space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                  <p className="mt-1 text-white text-lg font-medium">{selectedTrainer.firstName} {selectedTrainer.lastName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                  <p className="mt-1 text-gray-300">{selectedTrainer.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                  <p className="mt-1 text-gray-300">{selectedTrainer.phone || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</label>
                    <p className="mt-1 text-gray-300">{selectedTrainer.specialization || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</label>
                    <p className="mt-1 text-gray-300">{selectedTrainer.experience != null ? `${selectedTrainer.experience} years` : '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</label>
                  <p className="mt-1 text-gray-300">{selectedTrainer.availability || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</label>
                  <p className="mt-1 text-gray-300">{selectedTrainer.bio || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Added Date</label>
                  <p className="mt-1 text-gray-300">{new Date(selectedTrainer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedTrainer.isActive ? (
                <button 
                  onClick={() => {
                    setTrainerToModify({ id: selectedTrainer.id, action: 'DEACTIVATE' });
                    setIsConfirmModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-500/20 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors font-medium text-sm"
                >
                  <UserX size={18} /> Deactivate Trainer
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setTrainerToModify({ id: selectedTrainer.id, action: 'ACTIVATE' });
                    setIsConfirmModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-green-500/20 bg-green-500/10 text-green-500 rounded-md hover:bg-green-500/20 transition-colors font-medium text-sm"
                >
                  <UserCheck size={18} /> Activate Trainer
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md">
                  <p className="text-sm text-red-500">{formError}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">First Name *</label>
                  <input 
                    type="text" 
                    required
                    value={form.firstName}
                    onChange={e => setForm({...form, firstName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Last Name *</label>
                  <input 
                    type="text" 
                    required
                    value={form.lastName}
                    onChange={e => setForm({...form, lastName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
                <input 
                  type="email" 
                  required
                  disabled={slideOverMode === 'EDIT'} // Cannot change email after creation per typical security patterns, and our update schema omits it
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                />
              </div>

              {slideOverMode === 'ADD' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Temporary Password</label>
                  <input 
                    type="password" 
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="Defaults to 'defaultPassword123!'"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500 placeholder-gray-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input 
                  type="text" 
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Specialization</label>
                  <input 
                    type="text" 
                    value={form.specialization}
                    onChange={e => setForm({...form, specialization: e.target.value})}
                    placeholder="e.g. Yoga, HIIT"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Experience (Years)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={form.experience}
                    onChange={e => setForm({...form, experience: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Availability Schedule</label>
                <input 
                  type="text" 
                  value={form.availability}
                  onChange={e => setForm({...form, availability: e.target.value})}
                  placeholder="e.g. Mon-Fri 9AM-5PM"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Biography / Notes</label>
                <textarea 
                  rows={3}
                  value={form.bio}
                  onChange={e => setForm({...form, bio: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (slideOverMode === 'EDIT' && selectedTrainer) {
                      setSlideOverMode('VIEW');
                    } else {
                      setIsSlideOverOpen(false);
                    }
                    setFormError(null);
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
                  {isSaving ? 'Saving...' : slideOverMode === 'ADD' ? 'Create Trainer' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </SlideOver>

      {/* Confirmation Modal */}
      <ConfirmActionModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isModifying}
        title={trainerToModify?.action === 'DEACTIVATE' ? 'Deactivate Trainer' : 'Activate Trainer'}
        message={
          trainerToModify?.action === 'DEACTIVATE' 
            ? 'Are you sure you want to deactivate this trainer? They will no longer be able to log in, but their historical records (bookings, schedules, progress) will be preserved safely.' 
            : 'Are you sure you want to activate this trainer? They will regain access to their account immediately.'
        }
        confirmText={trainerToModify?.action === 'DEACTIVATE' ? 'Deactivate' : 'Activate'}
        isDestructive={trainerToModify?.action === 'DEACTIVATE'}
      />
    </div>
  );
};

export default TrainersPage;
