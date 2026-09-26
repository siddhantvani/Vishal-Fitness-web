import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  scheduleId?: string;
}

const BookingModal = ({ isOpen, onClose, title = "Book Class", scheduleId }: BookingModalProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  
  const { isAuthenticated } = useAuth();
  
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      scheduleId: scheduleId || '',
      fullName: '',
      phoneNumber: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setIsSubmitted(false);
      if (scheduleId) {
        setValue('scheduleId', scheduleId);
      }
      
      // Fetch schedules in case we need them for a dropdown or context
      api.get('/schedules').then(data => {
        setSchedules(data.filter((s: any) => s.status === 'ACTIVE' && new Date(s.startTime) > new Date()));
      }).catch(console.error);
    }
  }, [isOpen, scheduleId, setValue]);

  const onSubmit = async (data: any) => {
    setSubmitError(null);
    
    if (!isAuthenticated) {
      setSubmitError("Please log in as a member before booking a class.");
      return;
    }

    if (!data.scheduleId) {
      setSubmitError("Please select a class schedule.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/bookings', { scheduleId: data.scheduleId });
      
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        reset();
        onClose();
      }, 3000);
    } catch (error: any) {
      let errorMessage = "An error occurred while booking.";
      if (error.status === 401) errorMessage = "Please log in as a member before booking.";
      else if (error.status === 403) errorMessage = "You are not authorized to make this booking.";
      else if (error.status === 404) errorMessage = "Class or schedule not found.";
      else if (error.status === 409) {
        errorMessage = error.data?.message || "Booking conflict.";
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsSubmitted(false);
    setSubmitError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden border border-zinc-200 dark:border-white/10"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmitted ? (
              <div className="text-center py-10">
                <CheckCircle className="w-20 h-20 text-primary-500 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 font-heading">Class booked successfully.</h3>
                <p className="text-zinc-500 dark:text-zinc-400">Your spot has been reserved!</p>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8">Confirm your class reservation below.</p>
                
                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {!isAuthenticated && (
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">Please log in as a member before booking a class.</p>
                    </div>
                  )}

                  {!scheduleId && (
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Select Class</label>
                      <select 
                        {...register('scheduleId')}
                        className="w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-black/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                      >
                        <option value="">-- Choose a class --</option>
                        {schedules.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.class.name} - {new Date(s.startTime).toLocaleDateString()} {new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting || (!isAuthenticated && !scheduleId)}
                    className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 mt-8"
                  >
                    {isSubmitting ? 'Confirming...' : 'Book Now'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
