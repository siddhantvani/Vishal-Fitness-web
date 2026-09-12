import React from 'react';
import { motion } from 'framer-motion';

const Transformations = () => {
  return (
    <section className="py-20 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold sm:text-4xl font-heading mb-6">
              Real People. <br/><span className="text-primary-500">Real Results.</span>
            </h2>
            <p className="text-lg text-slate-300 mb-8">
              Join our Transformation Program and achieve the body you've always wanted. With personalized diet plans and dedicated coaching, your success story is next.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span>Personalized Nutrition Plans</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span>Weekly Progress Tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span>Dedicated 1-on-1 Coaching</span>
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
              <div className="space-y-4 pt-12">
                <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1470&auto=format&fit=crop" alt="Transformation 1" className="rounded-2xl shadow-xl w-full h-48 object-cover" />
                <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1469&auto=format&fit=crop" alt="Transformation 2" className="rounded-2xl shadow-xl w-full h-64 object-cover" />
              </div>
              <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" alt="Transformation 3" className="rounded-2xl shadow-xl w-full h-64 object-cover" />
                <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop" alt="Transformation 4" className="rounded-2xl shadow-xl w-full h-48 object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Transformations;
