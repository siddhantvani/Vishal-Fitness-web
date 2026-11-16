import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[80] backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl ${isDestructive ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'} mb-4`}>
                <AlertTriangle size={24} />
              </div>
              <button onClick={onClose} disabled={isLoading} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white disabled:opacity-50">
                <X size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold font-heading text-zinc-900 dark:text-white mb-2">{title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{message}</p>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-4 flex gap-3 justify-end border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center justify-center min-w-[100px] transition-colors disabled:opacity-50 ${
                isDestructive 
                  ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' 
                  : 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmActionModal;
