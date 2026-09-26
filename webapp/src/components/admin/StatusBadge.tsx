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
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'INACTIVE':
      case 'CANCELLED':
      case 'ABSENT':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'PENDING':
      case 'LATE':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${getStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
