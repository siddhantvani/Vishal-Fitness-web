import React, { useState, useEffect } from 'react';
import { CalendarDays, Search, Filter, Eye, Edit2, Play, Square, Plus } from 'lucide-react';
import { api } from '../../api/api';
import StatusBadge from '../../components/admin/StatusBadge';
import SlideOver from '../../components/admin/SlideOver';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal';

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface ClassItem {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  defaultTrainerId: string | null;
  defaultTrainer: {
    id: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  } | null;
}

const ClassesPage = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Class (SlideOver)
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [slideOverMode, setSlideOverMode] = useState<'VIEW' | 'EDIT' | 'ADD'>('VIEW');
  
  // Form State
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: '',
    capacity: '',
    duration: '',
    defaultTrainerId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate/Activate Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [classToModify, setClassToModify] = useState<{ id: string; action: 'DEACTIVATE' | 'ACTIVATE' } | null>(null);
  const [isModifying, setIsModifying] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [classesData, trainersData] = await Promise.all([
        api.get(`/classes`),
        api.get(`/trainers`)
      ]);
      
      let filtered = classesData;
      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter((c: ClassItem) => 
          c.name.toLowerCase().includes(lowerSearch) || 
          c.description.toLowerCase().includes(lowerSearch)
        );
      }
      if (statusFilter) {
        const isActiveFilter = statusFilter === 'true';
        filtered = filtered.filter((c: ClassItem) => c.isActive === isActiveFilter);
      }

      setClasses(filtered);
      setTrainers(trainersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleOpenDetails = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setForm({
      name: classItem.name,
      description: classItem.description,
      type: classItem.type,
      capacity: classItem.capacity.toString(),
      duration: classItem.duration.toString(),
      defaultTrainerId: classItem.defaultTrainerId || '',
    });
    setSlideOverMode('VIEW');
    setFormError(null);
    setIsSlideOverOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedClass(null);
    setForm({
      name: '',
      description: '',
      type: '',
      capacity: '',
      duration: '',
      defaultTrainerId: '',
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
        name: form.name,
        description: form.description,
        type: form.type,
        capacity: parseInt(form.capacity),
        duration: parseInt(form.duration),
        defaultTrainerId: form.defaultTrainerId || null,
      };

      if (slideOverMode === 'ADD') {
        await api.post(`/classes`, payload);
      } else if (slideOverMode === 'EDIT' && selectedClass) {
        await api.patch(`/classes/${selectedClass.id}`, payload);
      }
      
      setIsSlideOverOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || err.data?.message || 'Failed to save class.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!classToModify) return;
    setIsModifying(true);
    try {
      if (classToModify.action === 'DEACTIVATE') {
        await api.patch(`/classes/${classToModify.id}`, { isActive: false });
      } else {
        await api.patch(`/classes/${classToModify.id}`, { isActive: true });
      }
      setIsConfirmModalOpen(false);
      
      if (selectedClass?.id === classToModify.id) {
        setIsSlideOverOpen(false);
      }
      
      fetchData();
    } catch (err: any) {
      alert(err.message || err.data?.message || 'Action failed');
    } finally {
      setIsModifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Classes Management</h1>
          <p className="text-gray-400 mt-1">View, search, and manage fitness classes.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
        >
          <Plus size={18} /> Add Class
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
            placeholder="Search classes by name or description..."
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
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trainer</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Capacity</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                    <p className="mt-4 text-gray-400 text-sm">Loading classes...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-red-400 hover:text-red-300">Try again</button>
                  </td>
                </tr>
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CalendarDays size={40} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-sm">No classes found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                classes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-red-500 font-bold uppercase">
                            <CalendarDays size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{c.name}</div>
                          <div className="text-sm text-gray-500">{c.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {c.defaultTrainer ? `${c.defaultTrainer.firstName} ${c.defaultTrainer.lastName}` : 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{c.duration} mins</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{c.capacity} members</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenDetails(c)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {c.isActive ? (
                          <button 
                            onClick={() => {
                              setClassToModify({ id: c.id, action: 'DEACTIVATE' });
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-red-500/70 hover:text-red-500 transition-colors"
                            title="Deactivate Class"
                          >
                            <Square size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              setClassToModify({ id: c.id, action: 'ACTIVATE' });
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-green-500/70 hover:text-green-500 transition-colors"
                            title="Activate Class"
                          >
                            <Play size={16} fill="currentColor" />
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

      {/* SlideOver for Class Details / Edit / Add */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)}
        title={slideOverMode === 'ADD' ? 'Add New Class' : slideOverMode === 'EDIT' ? 'Edit Class' : 'Class Details'}
      >
        <div className="space-y-6 pb-20">
          {slideOverMode === 'VIEW' && selectedClass ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedClass.isActive ? 'ACTIVE' : 'INACTIVE'} />
                <button 
                  onClick={() => setSlideOverMode('EDIT')}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
                >
                  <Edit2 size={16} /> Edit Class
                </button>
              </div>
              
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-lg space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</label>
                  <p className="mt-1 text-white text-lg font-medium">{selectedClass.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
                  <p className="mt-1 text-gray-300">{selectedClass.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                    <p className="mt-1 text-gray-300">{selectedClass.type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</label>
                    <p className="mt-1 text-gray-300">
                      {selectedClass.defaultTrainer 
                        ? `${selectedClass.defaultTrainer.firstName} ${selectedClass.defaultTrainer.lastName}`
                        : 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</label>
                    <p className="mt-1 text-gray-300">{selectedClass.duration} minutes</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</label>
                    <p className="mt-1 text-gray-300">{selectedClass.capacity} members</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</label>
                  <p className="mt-1 text-gray-300">{new Date(selectedClass.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedClass.isActive ? (
                <button 
                  onClick={() => {
                    setClassToModify({ id: selectedClass.id, action: 'DEACTIVATE' });
                    setIsConfirmModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-500/20 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors font-medium text-sm"
                >
                  <Square size={18} /> Deactivate Class
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setClassToModify({ id: selectedClass.id, action: 'ACTIVATE' });
                    setIsConfirmModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-green-500/20 bg-green-500/10 text-green-500 rounded-md hover:bg-green-500/20 transition-colors font-medium text-sm"
                >
                  <Play size={18} fill="currentColor" /> Activate Class
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
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Class Name *</label>
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                <textarea 
                  required
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Class Type *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Yoga, HIIT, Strength"
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Duration (mins) *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={form.duration}
                    onChange={e => setForm({...form, duration: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Capacity *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={form.capacity}
                    onChange={e => setForm({...form, capacity: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Default Trainer</label>
                <select 
                  value={form.defaultTrainerId}
                  onChange={e => setForm({...form, defaultTrainerId: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Unassigned</option>
                  {trainers
                    .filter(t => t.isActive || t.id === form.defaultTrainerId)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} {!t.isActive ? '(Inactive)' : ''}
                      </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Only active trainers can be assigned to new classes.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (slideOverMode === 'EDIT' && selectedClass) {
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
                  {isSaving ? 'Saving...' : slideOverMode === 'ADD' ? 'Create Class' : 'Save Changes'}
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
        title={classToModify?.action === 'DEACTIVATE' ? 'Deactivate Class' : 'Activate Class'}
        message={
          classToModify?.action === 'DEACTIVATE' 
            ? 'Are you sure you want to deactivate this class? Historical records like past schedules and bookings will be preserved, but no new schedules can be created for an inactive class.' 
            : 'Are you sure you want to activate this class? You will be able to schedule it again.'
        }
        confirmText={classToModify?.action === 'DEACTIVATE' ? 'Deactivate' : 'Activate'}
        isDestructive={classToModify?.action === 'DEACTIVATE'}
      />
    </div>
  );
};

export default ClassesPage;
