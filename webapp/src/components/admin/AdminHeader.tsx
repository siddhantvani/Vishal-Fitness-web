import React from 'react';
import { Menu, LogOut, User, Globe, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

const AdminHeader: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white flex items-center justify-between px-4 lg:px-8 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white p-1 rounded-lg"
          aria-label="Open Sidebar"
        >
          <Menu size={22} />
        </button>
        <div className="hidden lg:block text-lg font-bold font-heading">
          Admin Portal
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Quick link to live public site */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 transition-colors shadow-sm"
          title="Open Public Website in New Tab"
        >
          <Globe size={14} className="text-primary-500" />
          <span className="hidden sm:inline">View Website</span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700/60 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-zinc-600" />}
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 flex-shrink-0">
            <User size={16} className="text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
              {user?.firstName || 'Admin'} {user?.lastName || ''}
            </div>
            <div className="text-[10px] text-primary-500 font-bold uppercase tracking-wider">
              {user?.role || 'ADMIN'}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="text-zinc-400 hover:text-rose-500 transition-colors flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Sign out of Admin Portal"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline text-xs font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
