import React from 'react';
import { motion } from 'framer-motion';

const Transformations = () => {
  return (
    <section className="py-24 bg-zinc-950 text-white overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 className="text-sm text-primary-500 font-bold tracking-widest uppercase mb-3">Transformations</h2>
            <h2 className="text-4xl font-extrabold sm:text-6xl font-heading mb-6 tracking-tight leading-tight">
              Real People. <br/><span className="text-primary-500">Real Results.</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
              Join our Transformation Program and achieve the body you've always wanted. With personalized diet plans and dedicated coaching, your success story is next.
            </p>
            <ul className="space-y-6 mb-10">
              <li className="flex items-center gap-4 text-lg">
                <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />
                </div>
                <span className="font-medium text-zinc-200">Personalized Nutrition Plans</span>
              </li>
              <li className="flex items-center gap-4 text-lg">
                <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />
                </div>
                <span className="font-medium text-zinc-200">Weekly Progress Tracking</span>
              </li>
              <li className="flex items-center gap-4 text-lg">
                <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />
                </div>
                <span className="font-medium text-zinc-200">Dedicated 1-on-1 Coaching</span>
              </li>
            </ul>
          </div>
          <div className="mt-12 lg:mt-0">
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6 pt-12">
                <div className="relative group overflow-hidden rounded-3xl">
                  <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1470&auto=format&fit=crop" alt="Transformation 1" className="w-full h-56 object-cover transform transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className="relative group overflow-hidden rounded-3xl">
                  <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1469&auto=format&fit=crop" alt="Transformation 2" className="w-full h-72 object-cover transform transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="relative group overflow-hidden rounded-3xl">
                  <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" alt="Transformation 3" className="w-full h-72 object-cover transform transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className="relative group overflow-hidden rounded-3xl">
                  <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop" alt="Transformation 4" className="w-full h-56 object-cover transform transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Transformations;
