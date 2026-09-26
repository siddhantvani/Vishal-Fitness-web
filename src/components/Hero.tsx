import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface HeroProps {
  onOpenModal: () => void;
}

const Hero = ({ onOpenModal }: HeroProps) => {
  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-primary-500/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl tracking-tight font-heading font-extrabold text-zinc-900 dark:text-white sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl">
                <span className="block xl:inline">Transform Your Body.</span>{' '}
                <span className="block text-primary-500 xl:inline mt-2">Elevate Your Life.</span>
              </h1>
              <p className="mt-6 text-lg text-zinc-500 dark:text-zinc-400 sm:max-w-xl sm:mx-auto md:text-xl lg:mx-0 leading-relaxed">
                Join Bhopal's most premium fitness studio. Expert trainers, state-of-the-art equipment, and a community dedicated to your success.
              </p>
              <div className="mt-10 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={onOpenModal} className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-zinc-900 bg-primary-500 hover:bg-primary-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:-translate-y-1">
                  Start Free Trial
                </button>
                <a href="#programs" className="inline-flex items-center justify-center px-8 py-4 border border-zinc-200 dark:border-white/10 text-lg font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-white/5 transition-all group">
                  Explore Programs <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              
              {/* Trust & Features */}
              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-zinc-200 dark:border-white/5 pt-8">
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Premium</div>
                  <div className="text-sm text-zinc-500 font-medium mt-1">Facilities</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Expert</div>
                  <div className="text-sm text-zinc-500 font-medium mt-1">Trainers</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Proven</div>
                  <div className="text-sm text-zinc-500 font-medium mt-1">Results</div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="mt-16 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <motion.div 
              className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md perspective-1000"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="relative block w-full bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80 z-10" />
                <img
                  className="w-full object-cover h-[450px] lg:h-[600px] transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                  alt="Gym workout"
                />
                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 rounded-2xl p-6 border border-white/20 text-white shadow-xl">
                    <div className="font-heading font-bold text-2xl mb-1">3D Body Scanning</div>
                    <div className="text-sm text-zinc-300 font-medium leading-relaxed">First time in India. Track your progress with pinpoint precision.</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
