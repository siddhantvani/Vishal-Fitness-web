import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'PRESENT':
      case 'CONFIRMED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'INACTIVE':
      case 'CANCELLED':
      case 'ABSENT':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'PENDING':
      case 'LATE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border uppercase tracking-wider inline-flex items-center gap-1 ${getStyles()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
