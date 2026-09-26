import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

const AdminHeader: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 text-white flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <Menu size={24} />
        </button>
        <div className="hidden lg:block text-xl font-semibold">
          Admin Dashboard
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
            <User size={16} className="text-gray-400" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-red-500 font-semibold uppercase tracking-wider">{user?.role}</div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2"
          title="Logout"
        >
          <LogOut size={20} />
          <span className="hidden sm:block text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
