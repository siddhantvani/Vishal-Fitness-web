import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  CalendarDays, 
  CalendarClock, 
  BookmarkCheck, 
  Activity, 
  LineChart, 
  ClipboardCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/members', icon: Users, label: 'Members' },
  { path: '/admin/trainers', icon: Dumbbell, label: 'Trainers' },
  { path: '/admin/classes', icon: CalendarDays, label: 'Classes' },
  { path: '/admin/schedules', icon: CalendarClock, label: 'Schedules' },
  { path: '/admin/bookings', icon: BookmarkCheck, label: 'Bookings' },
  { path: '/admin/workouts', icon: Activity, label: 'Workouts' },
  { path: '/admin/progress', icon: LineChart, label: 'Progress' },
  { path: '/admin/attendance', icon: ClipboardCheck, label: 'Attendance' },
];

const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header Branding */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                <Dumbbell size={20} />
              </div>
              <div>
                <span className="font-heading font-bold text-base tracking-tight text-zinc-900 dark:text-white block leading-none">
                  Vishal Fitness
                </span>
                <span className="text-[10px] font-semibold text-primary-500 uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg"
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 h-[calc(100vh-8.5rem)] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm ${
                      isActive 
                        ? 'bg-primary-500/10 text-primary-500 font-semibold' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>VF Portal v1.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online"></span>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
