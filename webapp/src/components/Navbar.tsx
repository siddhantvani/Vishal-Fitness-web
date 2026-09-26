import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, X, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenModal: () => void;
}

const Navbar = ({ onOpenModal }: NavbarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary-500" />
            <span className="font-heading font-bold text-xl tracking-tight">Vishal Fitness</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link to="/" className={`font-medium transition-colors ${isActive('/') ? 'text-primary-500' : 'text-zinc-600 dark:text-zinc-300 hover:text-primary-500 dark:hover:text-primary-400'}`}>Home</Link>
              <Link to="/classes" className={`font-medium transition-colors ${isActive('/classes') ? 'text-primary-500' : 'text-zinc-600 dark:text-zinc-300 hover:text-primary-500 dark:hover:text-primary-400'}`}>Classes</Link>
              <Link to="/trainers" className={`font-medium transition-colors ${isActive('/trainers') ? 'text-primary-500' : 'text-zinc-600 dark:text-zinc-300 hover:text-primary-500 dark:hover:text-primary-400'}`}>Trainers</Link>
              <Link to="/calculators" className={`font-medium transition-colors ${isActive('/calculators') ? 'text-primary-500' : 'text-zinc-600 dark:text-zinc-300 hover:text-primary-500 dark:hover:text-primary-400'}`}>Calculators</Link>
              
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors border border-transparent dark:border-white/5"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium border-l border-zinc-200 dark:border-white/10 pl-6">
                    Hi, {user?.firstName}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors text-sm font-medium"
                  >
                    Logout
                  </button>
                  <button onClick={onOpenModal} className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-full font-semibold transition-colors cursor-pointer border-none outline-none shadow-lg shadow-primary-500/20">
                    Book Now
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4 border-l border-zinc-200 dark:border-white/10 pl-6">
                  <Link 
                    to="/login"
                    className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-5 py-2.5 rounded-full font-semibold transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-transparent dark:border-white/5"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link to="/" onClick={() => setIsOpen(false)} className={`block px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/') ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white'}`}>Home</Link>
              <Link to="/classes" onClick={() => setIsOpen(false)} className={`block px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/classes') ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white'}`}>Classes</Link>
              <Link to="/trainers" onClick={() => setIsOpen(false)} className={`block px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/trainers') ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white'}`}>Trainers</Link>
              <Link to="/calculators" onClick={() => setIsOpen(false)} className={`block px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/calculators') ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white'}`}>Calculators</Link>
              
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 border-t border-zinc-200 dark:border-white/10 mt-2">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Signed in as <span className="font-medium text-zinc-900 dark:text-white">{user?.firstName}</span></p>
                    <button 
                      onClick={() => { setIsOpen(false); handleLogout(); }} 
                      className="w-full text-left py-2 font-medium text-red-600 dark:text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                  <button onClick={() => { setIsOpen(false); onOpenModal(); }} className="w-full block px-4 py-3 mt-2 text-center rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold cursor-pointer border-none outline-none transition-colors">Book Now</button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-white/10">
                  <Link 
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2.5 text-center rounded-lg border border-zinc-200 dark:border-white/10 font-medium text-zinc-900 dark:text-white"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2.5 text-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
