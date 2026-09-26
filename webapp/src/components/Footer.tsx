import React from 'react';
import { Globe, Camera, MessageCircle, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6 text-white">
              <Dumbbell className="h-8 w-8 text-primary-500" />
              <span className="font-heading font-bold text-2xl tracking-tight">Vishal Fitness</span>
            </div>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed pr-4">
              Fitness Ko Banade Apki Aadat... Bhopal's premier destination for health and wellness. Join us and transform your life.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-primary-500 hover:bg-zinc-800 transition-all">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-primary-500 hover:bg-zinc-800 transition-all">
                <Camera className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-primary-500 hover:bg-zinc-800 transition-all">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-heading font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link to="/" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>Home</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>About Us</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>Programs</Link></li>
              <li><Link to="/trainers" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>Trainers</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-heading font-semibold mb-6">Support</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>Contact Us</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>Refund Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold mb-6">Download App</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-3 rounded-xl transition-all border border-white/5 hover:border-primary-500/30 group">
                <span className="font-medium group-hover:text-primary-400 transition-colors">App Store</span>
              </button>
              <button className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-3 rounded-xl transition-all border border-white/5 hover:border-primary-500/30 group">
                <span className="font-medium group-hover:text-primary-400 transition-colors">Google Play</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Vishal Fitness Planet. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed for Champions</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
