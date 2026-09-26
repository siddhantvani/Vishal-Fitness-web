import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Search, Eye, Edit2, Plus, Trash2, Save, UserCheck, Clock } from 'lucide-react';
import { api } from '../../api/api';
import StatusBadge from '../../components/admin/StatusBadge';
import SlideOver from '../../components/admin/SlideOver';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal';

interface AttendanceItem {
  id: string;
  bookingId: string;
  memberId: string;
  member: { firstName: string; lastName: string };
  scheduleId: string;
  schedule: { class: { name: string } };
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  checkInTime: string;
  checkOutTime: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BookingItem {
  id: string;
  member: { firstName: string; lastName: string };
  schedule: { class: { name: string }; date: string };
  status: string;
}

// Utility to format DateTime string for input[type="datetime-local"]
const formatForDateTimeInput = (isoString: string | null | undefined) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const tzOffset = date.getTimezoneOffset() * 60000; 
  return (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
};

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Attendance (SlideOver)
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceItem | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [slideOverMode, setSlideOverMode] = useState<'VIEW' | 'EDIT' | 'ADD'>('VIEW');
  
  // Form State
  const [form, setForm] = useState({
    bookingId: '',
    status: 'PRESENT',
    checkInTime: '',
    checkOutTime: '',
    notes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState<string | null>(null);
  const [isModifying, setIsModifying] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [attData, bookingsData] = await Promise.all([
        api.get(`/attendance`),
        api.get(`/bookings`) // for Add dropdown
      ]);
      
      let filtered = attData;
      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter((a: AttendanceItem) => 
          a.member.firstName.toLowerCase().includes(lowerSearch) ||
          a.member.lastName.toLowerCase().includes(lowerSearch) ||
          a.schedule.class.name.toLowerCase().includes(lowerSearch)
        );
      }
      if (statusFilter) {
        filtered = filtered.filter((a: AttendanceItem) => a.status === statusFilter);
      }
      
      setAttendanceData(filtered);
      setBookings(bookingsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance records');
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

  const handleOpenDetails = (item: AttendanceItem) => {
    setSelectedAttendance(item);
    setForm({
      bookingId: item.bookingId,
      status: item.status,
      checkInTime: formatForDateTimeInput(item.checkInTime),
      checkOutTime: formatForDateTimeInput(item.checkOutTime),
      notes: item.notes || '',
    });
    setSlideOverMode('VIEW');
    setFormError(null);
    setIsSlideOverOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedAttendance(null);
    
    // Auto-set checkInTime to now
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; 
    const localIsoString = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);

    setForm({
      bookingId: '',
      status: 'PRESENT',
      checkInTime: localIsoString,
      checkOutTime: '',
      notes: '',
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
        status: form.status,
        checkInTime: form.checkInTime ? new Date(form.checkInTime).toISOString() : undefined,
        checkOutTime: form.checkOutTime ? new Date(form.checkOutTime).toISOString() : undefined,
        notes: form.notes || undefined,
      };

      if (slideOverMode === 'ADD') {
        payload.bookingId = form.bookingId;
        await api.post(`/attendance`, payload);
      } else if (slideOverMode === 'EDIT' && selectedAttendance) {
        await api.patch(`/attendance/${selectedAttendance.id}`, payload);
      }
      
      setIsSlideOverOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || err.data?.message || 'Failed to save attendance record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!attendanceToDelete) return;
    setIsModifying(true);
    try {
      await api.delete(`/attendance/${attendanceToDelete}`);
      setIsConfirmModalOpen(false);
      
      if (selectedAttendance?.id === attendanceToDelete) {
        setIsSlideOverOpen(false);
      }
      
      fetchData();
    } catch (err: any) {
      alert(err.message || err.data?.message || 'Failed to delete record');
    } finally {
      setIsModifying(false);
    }
  };

  // Filter available bookings for creation
  const availableBookings = bookings.filter(b => 
    b.status !== 'CANCELLED' && 
    !attendanceData.some(a => a.bookingId === b.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Management</h1>
          <p className="text-gray-400 mt-1">View, search, and manage member class attendance records.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
        >
          <Plus size={18} /> Record Attendance
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
            placeholder="Search by member or class name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm appearance-none sm:min-w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
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
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Check In</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Check Out</th>
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
                    <p className="mt-4 text-gray-400 text-sm">Loading attendance records...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-red-400 hover:text-red-300">Try again</button>
                  </td>
                </tr>
              ) : attendanceData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <ClipboardCheck size={40} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-sm">No attendance records found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                attendanceData.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-red-500 font-bold uppercase">
                            <UserCheck size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{a.member.firstName} {a.member.lastName}</div>
                          <div className="text-sm text-gray-400">ID: {a.memberId.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-300">{a.schedule.class.name}</div>
                      <div className="text-xs text-gray-500">Sch: {a.scheduleId.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{new Date(a.checkInTime).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {a.checkOutTime ? (
                        <>
                          <div className="text-sm text-white">{new Date(a.checkOutTime).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenDetails(a)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {!a.checkOutTime && (
                          <button 
                            onClick={() => {
                              setSelectedAttendance(a);
                              setForm({
                                bookingId: a.bookingId,
                                status: a.status,
                                checkInTime: formatForDateTimeInput(a.checkInTime),
                                checkOutTime: formatForDateTimeInput(new Date().toISOString()),
                                notes: a.notes || '',
                              });
                              setSlideOverMode('EDIT');
                              setIsSlideOverOpen(true);
                            }}
                            className="text-blue-500/70 hover:text-blue-500 transition-colors"
                            title="Check Out Now"
                          >
                            <Clock size={16} />
                          </button>
                        )}

                        <button 
                          onClick={() => {
                            setAttendanceToDelete(a.id);
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

      {/* SlideOver for Attendance Details / Edit / Add */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)}
        title={slideOverMode === 'ADD' ? 'Record Attendance' : slideOverMode === 'EDIT' ? 'Edit Record' : 'Attendance Details'}
      >
        <div className="space-y-6 pb-20">
          {slideOverMode === 'VIEW' && selectedAttendance ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedAttendance.status} />
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
                    <p className="mt-1 text-white text-lg font-medium">{selectedAttendance.member.firstName} {selectedAttendance.member.lastName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class</label>
                    <p className="mt-1 text-gray-300 font-medium">{selectedAttendance.schedule.class.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Check In Time</label>
                    <p className="mt-1 text-gray-300">
                      {new Date(selectedAttendance.checkInTime).toLocaleDateString()} {new Date(selectedAttendance.checkInTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out Time</label>
                    <p className="mt-1 text-gray-300">
                      {selectedAttendance.checkOutTime 
                        ? `${new Date(selectedAttendance.checkOutTime).toLocaleDateString()} ${new Date(selectedAttendance.checkOutTime).toLocaleTimeString()}` 
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedAttendance.notes && (
                <div className="bg-gray-950 border border-gray-800 p-4 rounded-lg">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</label>
                  <p className="mt-1 text-gray-300 text-sm whitespace-pre-wrap">{selectedAttendance.notes}</p>
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
                {slideOverMode === 'ADD' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Select Booking *</label>
                    <select 
                      required
                      value={form.bookingId}
                      onChange={e => setForm({...form, bookingId: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="" disabled>Select a valid booking</option>
                      {availableBookings.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.member.firstName} {b.member.lastName} - {b.schedule.class.name} ({new Date(b.schedule.date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                    {availableBookings.length === 0 && (
                      <p className="text-xs text-red-400 mt-1">No active bookings available to record attendance for.</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-300">
                      Editing record for: <span className="font-semibold text-white">{selectedAttendance?.member.firstName} {selectedAttendance?.member.lastName}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Class: {selectedAttendance?.schedule.class.name}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status *</label>
                  <select 
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Check In Time *</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={form.checkInTime}
                      onChange={e => setForm({...form, checkInTime: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Check Out Time</label>
                    <input 
                      type="datetime-local" 
                      value={form.checkOutTime}
                      onChange={e => setForm({...form, checkOutTime: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500 text-sm"
                    />
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
                    if (slideOverMode === 'EDIT' && selectedAttendance) {
                      setSlideOverMode('VIEW');
                    } else {
                      setIsSlideOverOpen(false);
                    }
                    setFormError(null);
                  }}
                  className="flex-1 py-2.5 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || (slideOverMode === 'ADD' && availableBookings.length === 0)}
                  className="flex-1 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : slideOverMode === 'ADD' ? 'Record Attendance' : 'Save Changes'}
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
        title="Delete Attendance Record"
        message="Are you sure you want to permanently delete this attendance record? This action cannot be undone."
        confirmText="Delete Record"
        isDestructive={true}
      />
    </div>
  );
};

export default AttendancePage;
