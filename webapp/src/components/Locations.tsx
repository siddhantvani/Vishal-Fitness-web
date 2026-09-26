import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

const Locations = () => {
  return (
    <section id="locations" className="py-24 bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm text-primary-500 font-bold tracking-widest uppercase mb-3">Our Studios</h2>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl font-heading tracking-tight">
            Find Our Locations
          </h2>
          <p className="mt-6 text-xl text-zinc-400 leading-relaxed">
            Conveniently located premium fitness centers in Bhopal. Experience fitness like never before.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Location 1 */}
          <div className="group bg-zinc-900 rounded-3xl p-10 shadow-2xl border border-white/5 hover:border-primary-500/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500" />
            <h3 className="text-3xl font-bold text-white mb-8 font-heading">Chhatrasal Bharat Nagar</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <div className="pt-2">
                  <p className="text-zinc-300 text-lg">Chhatrasal Bharat Nagar, Bhopal, Madhya Pradesh</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <Phone className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-zinc-300 text-lg">+91 96696 94926</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <Clock className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-zinc-300 text-lg">Mon-Sat: 6:00 AM - 10:00 PM</p>
              </div>
            </div>
            <div className="mt-10">
              <button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors border border-white/5 hover:border-white/20">
                Get Directions
              </button>
            </div>
          </div>

          {/* Location 2 */}
          <div className="group bg-zinc-900 rounded-3xl p-10 shadow-2xl border border-white/5 hover:border-primary-500/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500" />
            <h3 className="text-3xl font-bold text-white mb-8 font-heading">Link Road Branch</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <div className="pt-2">
                  <p className="text-zinc-300 text-lg">Prakash Tarun Pushkar, Link Road, Bhopal</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <Phone className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-zinc-300 text-lg">+91 94250 04711</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <Clock className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-zinc-300 text-lg">Mon-Sat: 6:00 AM - 10:00 PM</p>
              </div>
            </div>
            <div className="mt-10">
              <button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors border border-white/5 hover:border-white/20">
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Locations;
