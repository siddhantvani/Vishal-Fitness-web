import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

const Locations = () => {
  return (
    <section id="locations" className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">
            Find Our Studios
          </h2>
          <p className="mt-4 text-xl text-slate-500 dark:text-slate-400">
            Conveniently located premium fitness centers in Bhopal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Location 1 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Chhatrasal Bharat Nagar</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                <p className="text-slate-600 dark:text-slate-300">Chhatrasal Bharat Nagar, Bhopal, Madhya Pradesh</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <p className="text-slate-600 dark:text-slate-300">+91 96696 94926</p>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <p className="text-slate-600 dark:text-slate-300">Mon-Sat: 6:00 AM - 10:00 PM</p>
              </div>
            </div>
          </div>

          {/* Location 2 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Link Road Branch</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                <p className="text-slate-600 dark:text-slate-300">Prakash Tarun Pushkar, Link Road, Bhopal</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <p className="text-slate-600 dark:text-slate-300">+91 94250 04711</p>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <p className="text-slate-600 dark:text-slate-300">Mon-Sat: 6:00 AM - 10:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Locations;
