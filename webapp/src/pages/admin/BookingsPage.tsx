import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Search, Filter, Eye, AlertCircle } from 'lucide-react';
import { api } from '../../api/api';
import StatusBadge from '../../components/admin/StatusBadge';
import SlideOver from '../../components/admin/SlideOver';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal';

interface Booking {
  id: string;
  scheduleId: string;
  memberId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  member: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    class: {
      name: string;
      type: string;
    };
    trainer: {
      firstName: string;
      lastName: string;
    };
  };
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Booking (SlideOver)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  // Status Update Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<{ id: string; status: string } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get('/bookings');
      setBookings(data);
      applyFilters(data, search, statusFilter);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (data: Booking[], searchTerm: string, status: string) => {
    let filtered = data;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.member.firstName.toLowerCase().includes(lowerSearch) ||
        b.member.lastName.toLowerCase().includes(lowerSearch) ||
        b.member.email.toLowerCase().includes(lowerSearch) ||
        b.schedule.class.name.toLowerCase().includes(lowerSearch) ||
        b.schedule.trainer.firstName.toLowerCase().includes(lowerSearch) ||
        b.schedule.trainer.lastName.toLowerCase().includes(lowerSearch)
      );
    }

    if (status) {
      filtered = filtered.filter(b => b.status === status);
    }

    setFilteredBookings(filtered);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters(bookings, search, statusFilter);
  }, [search, statusFilter, bookings]);

  const handleOpenDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsSlideOverOpen(true);
  };

  const handleStatusChangeRequest = (bookingId: string, newStatus: string) => {
    setStatusToUpdate({ id: bookingId, status: newStatus });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusToUpdate) return;
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/bookings/${statusToUpdate.id}/status`, { status: statusToUpdate.status });
      setIsConfirmModalOpen(false);
      
      // If the modified booking is currently in the slide-over, update it directly or just close it
      if (selectedBooking?.id === statusToUpdate.id) {
        setSelectedBooking(prev => prev ? { ...prev, status: statusToUpdate.status } : null);
      }
      
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bookings Management</h1>
          <p className="text-gray-400 mt-1">View, search, and manage member class reservations.</p>
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
            placeholder="Search member, class, or trainer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative min-w-[160px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-500" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-10 pr-8 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
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
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Schedule</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Booked At</th>
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
                    <p className="mt-4 text-gray-400 text-sm">Loading bookings...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="text-red-500 w-10 h-10 mb-4" />
                      <p className="text-red-500 text-sm">{error}</p>
                      <button onClick={fetchBookings} className="mt-2 text-sm text-red-400 hover:text-red-300">Try again</button>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <BookmarkCheck size={40} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-sm">No bookings found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 font-bold uppercase">
                            {booking.member.firstName[0]}{booking.member.lastName[0]}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{booking.member.firstName} {booking.member.lastName}</div>
                          <div className="text-sm text-gray-500">{booking.member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{booking.schedule.class.name}</div>
                      <div className="text-sm text-gray-500">{booking.schedule.trainer.firstName} {booking.schedule.trainer.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-300">
                        {new Date(booking.schedule.startTime).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.schedule.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell text-sm text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenDetails(booking)}
                          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg"
                        >
                          <Eye size={16} /> Details
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

      {/* SlideOver for Booking Details */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)}
        title="Booking Details"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedBooking.status} />
              
              <div className="flex items-center gap-2">
                {selectedBooking.status !== 'CANCELLED' && (
                  <button 
                    onClick={() => handleStatusChangeRequest(selectedBooking.id, 'CANCELLED')}
                    className="text-xs font-semibold px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors border border-red-500/20"
                  >
                    Cancel Booking
                  </button>
                )}
                {selectedBooking.status === 'CANCELLED' && (
                  <button 
                    onClick={() => handleStatusChangeRequest(selectedBooking.id, 'CONFIRMED')}
                    className="text-xs font-semibold px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-md transition-colors border border-green-500/20"
                  >
                    Restore Booking
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-gray-950 border border-gray-800 p-5 rounded-xl space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Member Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                    <p className="mt-1 text-gray-300 font-medium">{selectedBooking.member.firstName} {selectedBooking.member.lastName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                    <p className="mt-1 text-gray-300">{selectedBooking.member.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                    <p className="mt-1 text-gray-300">{selectedBooking.member.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2 mt-2">Class Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</label>
                    <p className="mt-1 text-gray-300 font-medium">{selectedBooking.schedule.class.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</label>
                    <p className="mt-1 text-gray-300">{selectedBooking.schedule.trainer.firstName} {selectedBooking.schedule.trainer.lastName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</label>
                      <p className="mt-1 text-gray-300">{new Date(selectedBooking.schedule.startTime).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Time</label>
                      <p className="mt-1 text-gray-300">
                        {new Date(selectedBooking.schedule.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(selectedBooking.schedule.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2 mt-2">Booking Records</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Booked On</label>
                    <p className="mt-1 text-gray-300 text-sm">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</label>
                    <p className="mt-1 text-gray-300 text-sm">{new Date(selectedBooking.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Confirmation Modal */}
      <ConfirmActionModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmStatusUpdate}
        isLoading={isUpdatingStatus}
        title={statusToUpdate?.status === 'CANCELLED' ? 'Cancel Booking' : 'Restore Booking'}
        message={
          statusToUpdate?.status === 'CANCELLED' 
            ? 'Are you sure you want to cancel this booking? The slot will become available for other members.' 
            : 'Are you sure you want to restore this booking? Ensure there are still slots available in this class.'
        }
        confirmText={statusToUpdate?.status === 'CANCELLED' ? 'Cancel Booking' : 'Restore Booking'}
        isDestructive={statusToUpdate?.status === 'CANCELLED'}
      />
    </div>
  );
};

export default BookingsPage;
