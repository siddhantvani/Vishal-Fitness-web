import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, X, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary-500" />
            <span className="font-heading font-bold text-xl tracking-tight">Vishal Fitness</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <a href="#home" className="hover:text-primary-500 transition-colors">Home</a>
              <a href="#programs" className="hover:text-primary-500 transition-colors">Programs</a>
              <a href="#trainers" className="hover:text-primary-500 transition-colors">Trainers</a>
              <a href="#locations" className="hover:text-primary-500 transition-colors">Locations</a>
              
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <a href="#cta" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full font-medium transition-colors">
                Join Now
              </a>
            </div>
          </div>
          
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
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
            className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a href="#home" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Home</a>
              <a href="#programs" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Programs</a>
              <a href="#trainers" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Trainers</a>
              <a href="#locations" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">Locations</a>
              <a href="#cta" onClick={() => setIsOpen(false)} className="block px-4 py-3 mt-4 text-center rounded-lg bg-primary-500 text-white font-medium">Join Now</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
