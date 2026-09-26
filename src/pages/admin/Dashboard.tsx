import React from 'react';
import { Users, CalendarDays, BookmarkCheck, Dumbbell, Activity, ClipboardCheck } from 'lucide-react';

const StatCard = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between h-32 hover:border-gray-700 transition-colors">
    <div className="flex items-center justify-between">
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <div className="p-2 bg-gray-800 rounded-lg text-red-500">
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-sm text-gray-500 italic">Data will appear here once connected.</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Welcome to the Vishal Fitness Gym administration panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Members" icon={Users} />
        <StatCard title="Active Trainers" icon={Dumbbell} />
        <StatCard title="Total Classes" icon={CalendarDays} />
        <StatCard title="Pending Bookings" icon={BookmarkCheck} />
        <StatCard title="Active Workouts" icon={Activity} />
        <StatCard title="Attendance Records" icon={ClipboardCheck} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center mt-8">
        <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <Activity size={32} />
        </div>
        <h3 className="text-lg font-medium text-white">Advanced Analytics</h3>
        <p className="text-gray-400 mt-2 max-w-lg mx-auto">
          Detailed backend statistics, trends, and revenue graphs will be connected in future phases. For now, use the sidebar to manage specific entities.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
