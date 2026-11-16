import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarDays, 
  BookmarkCheck, 
  Dumbbell, 
  Activity, 
  ClipboardCheck, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api';

interface DashboardStats {
  totalMembers: number;
  activeTrainers: number;
  totalClasses: number;
  pendingBookings: number;
  activeWorkouts: number;
  attendanceRecords: number;
}

const StatCard = ({ 
  title, 
  value, 
  subtext,
  icon: Icon, 
  link,
  isLoading 
}: { 
  title: string; 
  value: number | string; 
  subtext?: string;
  icon: any; 
  link?: string;
  isLoading?: boolean;
}) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-primary-500/40 dark:hover:border-primary-500/40 hover:shadow-md transition-all group">
    <div className="flex items-center justify-between">
      <h3 className="text-zinc-600 dark:text-zinc-400 text-sm font-semibold">{title}</h3>
      <div className="p-2.5 bg-primary-500/10 text-primary-500 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
    </div>
    
    <div className="mt-4">
      {isLoading ? (
        <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      ) : (
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-heading">
            {value}
          </span>
          {link && (
            <Link 
              to={link} 
              className="text-xs font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span>Manage</span>
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      )}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        {subtext || 'Live synchronized data'}
      </p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeTrainers: 0,
    totalClasses: 0,
    pendingBookings: 0,
    activeWorkouts: 0,
    attendanceRecords: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Parallel fetch for speed & resilience
      const [usersRes, trainersRes, classesRes, bookingsRes, workoutsRes, attendanceRes] = await Promise.allSettled([
        api.get('/users'),
        api.get('/trainers'),
        api.get('/classes'),
        api.get('/bookings'),
        api.get('/workouts'),
        api.get('/attendance')
      ]);

      const users = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : [];
      const trainers = trainersRes.status === 'fulfilled' && Array.isArray(trainersRes.value) ? trainersRes.value : [];
      const classes = classesRes.status === 'fulfilled' && Array.isArray(classesRes.value) ? classesRes.value : [];
      const bookings = bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value) ? bookingsRes.value : [];
      const workouts = workoutsRes.status === 'fulfilled' && Array.isArray(workoutsRes.value) ? workoutsRes.value : [];
      const attendance = attendanceRes.status === 'fulfilled' && Array.isArray(attendanceRes.value) ? attendanceRes.value : [];

      const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING').length;

      setStats({
        totalMembers: users.length || 0,
        activeTrainers: trainers.length || 0,
        totalClasses: classes.length || 0,
        pendingBookings: pendingBookings || bookings.length || 0,
        activeWorkouts: workouts.length || 0,
        attendanceRecords: attendance.length || 0,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-heading">
            Dashboard Overview
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
            Welcome to Vishal Fitness Gym Management System &bull; Live Operations Center
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 hidden md:inline">
            Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={fetchDashboardStats}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            title="Refresh live data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-primary-500' : 'text-zinc-400'} />
            <span>Sync Stats</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Members" 
          value={stats.totalMembers} 
          subtext="Registered Athletes"
          icon={Users} 
          link="/admin/members"
          isLoading={isLoading}
        />
        <StatCard 
          title="Active Trainers" 
          value={stats.activeTrainers} 
          subtext="Certified Fitness Coaches"
          icon={Dumbbell} 
          link="/admin/trainers"
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Classes" 
          value={stats.totalClasses} 
          subtext="CrossFit, HIIT, Yoga & More"
          icon={CalendarDays} 
          link="/admin/classes"
          isLoading={isLoading}
        />
        <StatCard 
          title="Pending Bookings" 
          value={stats.pendingBookings} 
          subtext="Requires Review / Confirmation"
          icon={BookmarkCheck} 
          link="/admin/bookings"
          isLoading={isLoading}
        />
        <StatCard 
          title="Active Workouts" 
          value={stats.activeWorkouts} 
          subtext="Workout Routines Assigned"
          icon={Activity} 
          link="/admin/workouts"
          isLoading={isLoading}
        />
        <StatCard 
          title="Attendance Records" 
          value={stats.attendanceRecords} 
          subtext="Total Member Check-ins"
          icon={ClipboardCheck} 
          link="/admin/attendance"
          isLoading={isLoading}
        />
      </div>

      {/* System Status & Quick Actions Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
                Operational Highlights
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Vishal Fitness studio management is active across both Bhopal branches.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-zinc-700 dark:text-zinc-300">Chhatrasal Bharat Nagar</span>
                <span className="text-emerald-500 uppercase text-[10px] font-bold">Online</span>
              </div>
              <p className="text-xs text-zinc-500">6:00 AM - 10:00 PM &bull; +91 96696 94926</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-zinc-700 dark:text-zinc-300">Link Road Branch</span>
                <span className="text-emerald-500 uppercase text-[10px] font-bold">Online</span>
              </div>
              <p className="text-xs text-zinc-500">6:00 AM - 10:00 PM &bull; +91 94250 04711</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={20} className="text-primary-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-heading">
                Quick Shortcuts
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Frequently accessed management tools.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/admin/members"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 transition-colors"
            >
              <span>Manage Member Roster</span>
              <ArrowUpRight size={14} className="text-primary-500" />
            </Link>
            <Link
              to="/admin/schedules"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 transition-colors"
            >
              <span>View Class Timetables</span>
              <ArrowUpRight size={14} className="text-primary-500" />
            </Link>
            <Link
              to="/admin/bookings"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 transition-colors"
            >
              <span>Review Trial Bookings</span>
              <ArrowUpRight size={14} className="text-primary-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
