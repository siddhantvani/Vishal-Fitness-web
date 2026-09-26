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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <span className="text-xl font-bold text-red-500 tracking-wider uppercase">VG Admin</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 h-[calc(100vh-4rem)] overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-red-500/10 text-red-500 font-medium' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
