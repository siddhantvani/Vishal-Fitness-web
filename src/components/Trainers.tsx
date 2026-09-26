import React from 'react';
import { motion } from 'framer-motion';
import { trainers } from '../data/mockData';

const Trainers = () => {
  return (
    <section id="trainers" className="py-24 bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm text-primary-500 font-bold tracking-widest uppercase mb-3">Our Elite Team</h2>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl font-heading tracking-tight">
            Meet Our Experts
          </h2>
          <p className="mt-6 text-xl text-zinc-400 leading-relaxed">
            Train with the best. Our certified professionals are here to guide you every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {trainers.map((trainer, index) => (
            <motion.div
              key={trainer.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-w-3 aspect-h-4 overflow-hidden rounded-3xl">
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-full h-[450px] object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent rounded-3xl opacity-90 transition-opacity duration-300" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-4">
                  <h3 className="text-3xl font-bold text-white mb-2 font-heading">{trainer.name}</h3>
                  <p className="text-primary-400 font-medium text-lg">{trainer.role}</p>
                </div>
                
                <div className="absolute bottom-6 left-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <button className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-primary-500 hover:text-white transition-colors">
                    Book Session
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Trainers;
