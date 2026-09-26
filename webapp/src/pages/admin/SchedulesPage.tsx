import React, { useState, useEffect } from 'react';
import { CalendarClock, Search, Filter, Eye, Edit2, Play, Square, Plus } from 'lucide-react';
import { api } from '../../api/api';
import StatusBadge from '../../components/admin/StatusBadge';
import SlideOver from '../../components/admin/SlideOver';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal';

interface ClassItem {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
}

interface TrainerItem {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface ScheduleItem {
  id: string;
  classId: string;
  class: { name: string; type: string; duration: number; capacity: number };
  trainerId: string;
  trainer: { firstName: string; lastName: string; profileImage: string | null };
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Utility to format DateTime string for input[type="datetime-local"]
const formatForDateTimeInput = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Get local timezone offset to correctly format the HTML datetime-local
  const tzOffset = date.getTimezoneOffset() * 60000; 
  const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
  return localISOTime;
};

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [trainers, setTrainers] = useState<TrainerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Schedule (SlideOver)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [slideOverMode, setSlideOverMode] = useState<'VIEW' | 'EDIT' | 'ADD'>('VIEW');
  
  // Form State
  const [form, setForm] = useState({
    classId: '',
    trainerId: '',
    startTime: '',
    endTime: '',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate/Activate Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [scheduleToModify, setScheduleToModify] = useState<{ id: string; action: 'CANCELLED' | 'ACTIVE' } | null>(null);
  const [isModifying, setIsModifying] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [schedulesData, classesData, trainersData] = await Promise.all([
        api.get(`/schedules`),
        api.get(`/classes`),
        api.get(`/trainers`)
      ]);
      
      let filtered = schedulesData;
      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter((s: ScheduleItem) => 
          s.class.name.toLowerCase().includes(lowerSearch) || 
          s.trainer.firstName.toLowerCase().includes(lowerSearch) ||
          s.trainer.lastName.toLowerCase().includes(lowerSearch)
        );
      }
      if (statusFilter) {
        filtered = filtered.filter((s: ScheduleItem) => s.status === statusFilter);
      }

      // Sort by date descending natively to show most relevant first
      filtered.sort((a: ScheduleItem, b: ScheduleItem) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

      setSchedules(filtered);
      setClasses(classesData);
      setTrainers(trainersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedules');
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

  const handleOpenDetails = (scheduleItem: ScheduleItem) => {
    setSelectedSchedule(scheduleItem);
    setForm({
      classId: scheduleItem.classId,
      trainerId: scheduleItem.trainerId,
      startTime: formatForDateTimeInput(scheduleItem.startTime),
      endTime: formatForDateTimeInput(scheduleItem.endTime),
      status: scheduleItem.status,
    });
    setSlideOverMode('VIEW');
    setFormError(null);
    setIsSlideOverOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedSchedule(null);
    setForm({
      classId: '',
      trainerId: '',
      startTime: '',
      endTime: '',
      status: 'ACTIVE',
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
      const start = new Date(form.startTime);
      const end = new Date(form.endTime);

      if (end <= start) {
        throw new Error('End time must be strictly after start time.');
      }

      const dayString = start.toLocaleDateString('en-US', { weekday: 'long' });

      const payload: any = {
        classId: form.classId,
        trainerId: form.trainerId,
        date: start.toISOString(),
        day: dayString,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: form.status,
      };

      if (slideOverMode === 'ADD') {
        await api.post(`/schedules`, payload);
      } else if (slideOverMode === 'EDIT' && selectedSchedule) {
        await api.patch(`/schedules/${selectedSchedule.id}`, payload);
      }
      
      setIsSlideOverOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || err.data?.message || 'Failed to save schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!scheduleToModify) return;
    setIsModifying(true);
    try {
      await api.patch(`/schedules/${scheduleToModify.id}`, { status: scheduleToModify.action });
      setIsConfirmModalOpen(false);
      
      if (selectedSchedule?.id === scheduleToModify.id) {
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Schedules Management</h1>
          <p className="text-gray-400 mt-1">View, search, and manage class schedules.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
        >
          <Plus size={18} /> Add Schedule
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
            placeholder="Search by class or trainer name..."
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
            <option value="ACTIVE">Active</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-950">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Class & Time</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trainer</th>
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
                    <p className="mt-4 text-gray-400 text-sm">Loading schedules...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-red-400 hover:text-red-300">Try again</button>
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <CalendarClock size={40} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-sm">No schedules found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-red-500 font-bold uppercase">
                            <CalendarClock size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{s.class.name}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(s.startTime).toLocaleDateString()} · {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {s.trainer.firstName} {s.trainer.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${s.availableSlots === 0 ? 'text-red-400' : 'text-gray-300'}`}>
                        {s.availableSlots} / {s.class.capacity} slots
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenDetails(s)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {s.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => {
                              setScheduleToModify({ id: s.id, action: 'CANCELLED' });
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-red-500/70 hover:text-red-500 transition-colors"
                            title="Cancel Schedule"
                          >
                            <Square size={16} />
                          </button>
                        ) : s.status === 'CANCELLED' ? (
                          <button 
                            onClick={() => {
                              setScheduleToModify({ id: s.id, action: 'ACTIVE' });
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-green-500/70 hover:text-green-500 transition-colors"
                            title="Reactivate Schedule"
                          >
                            <Play size={16} fill="currentColor" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SlideOver for Schedule Details / Edit / Add */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)}
        title={slideOverMode === 'ADD' ? 'Add New Schedule' : slideOverMode === 'EDIT' ? 'Edit Schedule' : 'Schedule Details'}
      >
        <div className="space-y-6 pb-20">
          {slideOverMode === 'VIEW' && selectedSchedule ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedSchedule.status} />
                <button 
                  onClick={() => setSlideOverMode('EDIT')}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
                >
                  <Edit2 size={16} /> Edit Schedule
                </button>
              </div>
              
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class</label>
                    <p className="mt-1 text-white text-lg font-medium">{selectedSchedule.class.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</label>
                    <p className="mt-1 text-gray-300">{selectedSchedule.trainer.firstName} {selectedSchedule.trainer.lastName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</label>
                    <p className="mt-1 text-gray-300">
                      {new Date(selectedSchedule.startTime).toLocaleDateString()} ({selectedSchedule.day})<br/>
                      {new Date(selectedSchedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSchedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</label>
                    <p className="mt-1 text-gray-300">{selectedSchedule.availableSlots} of {selectedSchedule.class.capacity} slots</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule ID</label>
                  <p className="mt-1 text-gray-300 text-xs break-all">{selectedSchedule.id}</p>
                </div>
              </div>

              {selectedSchedule.status === 'ACTIVE' && (
                <button 
                  onClick={() => {
                    setScheduleToModify({ id: selectedSchedule.id, action: 'CANCELLED' });
                    setIsConfirmModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-500/20 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors font-medium text-sm"
                >
                  <Square size={18} /> Cancel Schedule
                </button>
              )}
              {selectedSchedule.status === 'CANCELLED' && (
                <button 
                  onClick={() => {
                    setScheduleToModify({ id: selectedSchedule.id, action: 'ACTIVE' });
                    setIsConfirmModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-green-500/20 bg-green-500/10 text-green-500 rounded-md hover:bg-green-500/20 transition-colors font-medium text-sm"
                >
                  <Play size={18} fill="currentColor" /> Reactivate Schedule
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Class *</label>
                <select 
                  required
                  value={form.classId}
                  onChange={e => setForm({...form, classId: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                >
                  <option value="" disabled>Select a class</option>
                  {classes
                    .filter(c => c.isActive || c.id === form.classId)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Capacity: {c.capacity}) {!c.isActive ? '(Inactive)' : ''}
                      </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Trainer *</label>
                <select 
                  required
                  value={form.trainerId}
                  onChange={e => setForm({...form, trainerId: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                >
                  <option value="" disabled>Select a trainer</option>
                  {trainers
                    .filter(t => t.isActive || t.id === form.trainerId)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} {!t.isActive ? '(Inactive)' : ''}
                      </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Start Time *</label>
                <input 
                  type="datetime-local" 
                  required
                  value={form.startTime}
                  onChange={e => setForm({...form, startTime: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">End Time *</label>
                <input 
                  type="datetime-local" 
                  required
                  value={form.endTime}
                  onChange={e => setForm({...form, endTime: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select 
                  required
                  value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {slideOverMode === 'EDIT' && (
                <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-md mt-4">
                  <p className="text-xs text-blue-400">
                    <strong>Note:</strong> Modifying schedules will not automatically delete existing member bookings. 
                    Capacity overrides are handled by the core backend logic.
                  </p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (slideOverMode === 'EDIT' && selectedSchedule) {
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
                  {isSaving ? 'Saving...' : slideOverMode === 'ADD' ? 'Create Schedule' : 'Save Changes'}
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
        title={scheduleToModify?.action === 'CANCELLED' ? 'Cancel Schedule' : 'Activate Schedule'}
        message={
          scheduleToModify?.action === 'CANCELLED' 
            ? 'Are you sure you want to cancel this schedule? Existing member bookings will remain in the system for historical purposes but the class will show as cancelled.' 
            : 'Are you sure you want to reactivate this schedule? Members will be able to book it again.'
        }
        confirmText={scheduleToModify?.action === 'CANCELLED' ? 'Cancel Schedule' : 'Reactivate'}
        isDestructive={scheduleToModify?.action === 'CANCELLED'}
      />
    </div>
  );
};

export default SchedulesPage;
