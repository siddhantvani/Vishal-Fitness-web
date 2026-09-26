import React, { useState, useEffect } from 'react';
import { LineChart, Search, Eye, Edit2, Trash2, Save, Ruler } from 'lucide-react';
import { api } from '../../api/api';
import SlideOver from '../../components/admin/SlideOver';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal';

interface ProgressItem {
  id: string;
  memberId: string;
  member: { firstName: string; lastName: string };
  weight: number;
  height: number;
  bodyFatPercentage: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  arms: number | null;
  thighs: number | null;
  notes: string | null;
  recordedAt: string;
  updatedAt: string;
}

// Utility to format DateTime string for input[type="datetime-local"]
const formatForDateTimeInput = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const tzOffset = date.getTimezoneOffset() * 60000; 
  return (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
};

const ProgressPage = () => {
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');

  // Selected Progress (SlideOver)
  const [selectedProgress, setSelectedProgress] = useState<ProgressItem | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [slideOverMode, setSlideOverMode] = useState<'VIEW' | 'EDIT'>('VIEW');
  
  // Form State
  const [form, setForm] = useState({
    weight: '',
    height: '',
    bodyFatPercentage: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    notes: '',
    recordedAt: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate/Activate Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [progressToDelete, setProgressToDelete] = useState<string | null>(null);
  const [isModifying, setIsModifying] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get(`/progress`);
      
      let filtered = data;
      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter((p: ProgressItem) => 
          p.member.firstName.toLowerCase().includes(lowerSearch) ||
          p.member.lastName.toLowerCase().includes(lowerSearch)
        );
      }
      
      setProgressData(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load progress records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenDetails = (item: ProgressItem) => {
    setSelectedProgress(item);
    setForm({
      weight: item.weight?.toString() || '',
      height: item.height?.toString() || '',
      bodyFatPercentage: item.bodyFatPercentage?.toString() || '',
      chest: item.chest?.toString() || '',
      waist: item.waist?.toString() || '',
      hips: item.hips?.toString() || '',
      arms: item.arms?.toString() || '',
      thighs: item.thighs?.toString() || '',
      notes: item.notes || '',
      recordedAt: formatForDateTimeInput(item.recordedAt),
    });
    setSlideOverMode('VIEW');
    setFormError(null);
    setIsSlideOverOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgress) return;
    
    setIsSaving(true);
    setFormError(null);
    
    try {
      const payload: any = {
        weight: parseFloat(form.weight),
        height: parseFloat(form.height),
        bodyFatPercentage: form.bodyFatPercentage ? parseFloat(form.bodyFatPercentage) : undefined,
        chest: form.chest ? parseFloat(form.chest) : undefined,
        waist: form.waist ? parseFloat(form.waist) : undefined,
        hips: form.hips ? parseFloat(form.hips) : undefined,
        arms: form.arms ? parseFloat(form.arms) : undefined,
        thighs: form.thighs ? parseFloat(form.thighs) : undefined,
        notes: form.notes || undefined,
        recordedAt: new Date(form.recordedAt).toISOString(),
      };

      await api.patch(`/progress/${selectedProgress.id}`, payload);
      
      setIsSlideOverOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || err.data?.message || 'Failed to update progress record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!progressToDelete) return;
    setIsModifying(true);
    try {
      await api.delete(`/progress/${progressToDelete}`);
      setIsConfirmModalOpen(false);
      
      if (selectedProgress?.id === progressToDelete) {
        setIsSlideOverOpen(false);
      }
      
      fetchData();
    } catch (err: any) {
      alert(err.message || err.data?.message || 'Failed to delete record');
    } finally {
      setIsModifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Progress Management</h1>
          <p className="text-gray-400 mt-1">View, search, and manage member progress tracking records.</p>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-xl flex items-start gap-3">
        <div className="mt-0.5 text-blue-400"><LineChart size={20} /></div>
        <div>
          <h4 className="text-blue-300 font-medium">Architecture Note</h4>
          <p className="text-sm text-blue-400/80 mt-1">
            By design, new Progress records can only be created by Members via the Member Dashboard. Admins are granted full privileges to view, edit, and delete existing records to ensure data integrity.
          </p>
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
            placeholder="Search by member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-950">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Weight / Height</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Body Fat</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Recorded Date</th>
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
                    <p className="mt-4 text-gray-400 text-sm">Loading records...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-red-400 hover:text-red-300">Try again</button>
                  </td>
                </tr>
              ) : progressData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <LineChart size={40} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-sm">No progress records found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                progressData.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-red-500 font-bold uppercase">
                            <Ruler size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{p.member.firstName} {p.member.lastName}</div>
                          <div className="text-sm text-gray-400">ID: {p.memberId.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {p.weight} kg / {p.height} cm
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {p.bodyFatPercentage ? `${p.bodyFatPercentage}%` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{new Date(p.recordedAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(p.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenDetails(p)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setProgressToDelete(p.id);
                            setIsConfirmModalOpen(true);
                          }}
                          className="text-red-500/70 hover:text-red-500 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SlideOver for Progress Details / Edit */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)}
        title={slideOverMode === 'EDIT' ? 'Edit Progress Record' : 'Progress Details'}
      >
        <div className="space-y-6 pb-20">
          {slideOverMode === 'VIEW' && selectedProgress ? (
            <div className="space-y-6">
              <div className="flex items-center justify-end">
                <button 
                  onClick={() => setSlideOverMode('EDIT')}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
                >
                  <Edit2 size={16} /> Edit Record
                </button>
              </div>
              
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Member</label>
                    <p className="mt-1 text-white text-lg font-medium">{selectedProgress.member.firstName} {selectedProgress.member.lastName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded Date</label>
                    <p className="mt-1 text-gray-300">
                      {new Date(selectedProgress.recordedAt).toLocaleDateString()} {new Date(selectedProgress.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</label>
                    <p className="mt-1 text-gray-300 font-medium">{selectedProgress.weight}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Height (cm)</label>
                    <p className="mt-1 text-gray-300 font-medium">{selectedProgress.height}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Body Fat %</label>
                    <p className="mt-1 text-gray-300 font-medium">{selectedProgress.bodyFatPercentage ?? '-'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 p-4 rounded-lg space-y-4">
                <h4 className="text-sm font-semibold text-white border-b border-gray-800 pb-2">Measurements (cm)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Chest</label>
                    <p className="mt-1 text-gray-300">{selectedProgress.chest ?? '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Waist</label>
                    <p className="mt-1 text-gray-300">{selectedProgress.waist ?? '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hips</label>
                    <p className="mt-1 text-gray-300">{selectedProgress.hips ?? '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Arms</label>
                    <p className="mt-1 text-gray-300">{selectedProgress.arms ?? '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Thighs</label>
                    <p className="mt-1 text-gray-300">{selectedProgress.thighs ?? '-'}</p>
                  </div>
                </div>
              </div>

              {selectedProgress.notes && (
                <div className="bg-gray-950 border border-gray-800 p-4 rounded-lg">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</label>
                  <p className="mt-1 text-gray-300 text-sm whitespace-pre-wrap">{selectedProgress.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md">
                  <p className="text-sm text-red-500">{formError}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-300 mb-4">
                    Editing record for: <span className="font-semibold text-white">{selectedProgress?.member.firstName} {selectedProgress?.member.lastName}</span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Weight (kg) *</label>
                      <input 
                        type="number" step="0.1" min="1" required
                        value={form.weight}
                        onChange={e => setForm({...form, weight: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Height (cm) *</label>
                      <input 
                        type="number" step="0.1" min="1" required
                        value={form.height}
                        onChange={e => setForm({...form, height: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Body Fat %</label>
                      <input 
                        type="number" step="0.1" min="0" max="100"
                        value={form.bodyFatPercentage}
                        onChange={e => setForm({...form, bodyFatPercentage: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Recorded Date *</label>
                      <input 
                        type="datetime-local" required
                        value={form.recordedAt}
                        onChange={e => setForm({...form, recordedAt: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg space-y-4">
                  <h4 className="text-sm font-semibold text-white border-b border-gray-800 pb-2">Measurements (cm)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Chest</label>
                      <input 
                        type="number" step="0.1" min="0"
                        value={form.chest}
                        onChange={e => setForm({...form, chest: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Waist</label>
                      <input 
                        type="number" step="0.1" min="0"
                        value={form.waist}
                        onChange={e => setForm({...form, waist: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Hips</label>
                      <input 
                        type="number" step="0.1" min="0"
                        value={form.hips}
                        onChange={e => setForm({...form, hips: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Arms</label>
                      <input 
                        type="number" step="0.1" min="0"
                        value={form.arms}
                        onChange={e => setForm({...form, arms: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Thighs</label>
                      <input 
                        type="number" step="0.1" min="0"
                        value={form.thighs}
                        onChange={e => setForm({...form, thighs: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                  <textarea 
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setSlideOverMode('VIEW');
                    setFormError(null);
                  }}
                  className="flex-1 py-2.5 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
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
        onConfirm={handleDelete}
        isLoading={isModifying}
        title="Delete Progress Record"
        message="Are you sure you want to permanently delete this progress record? This action cannot be undone."
        confirmText="Delete Record"
        isDestructive={true}
      />
    </div>
  );
};

export default ProgressPage;
