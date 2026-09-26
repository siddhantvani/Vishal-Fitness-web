import React from 'react';
import { motion } from 'framer-motion';
import { programs } from '../data/mockData';

const Programs = () => {
  return (
    <section id="programs" className="py-24 bg-zinc-50 dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-sm text-primary-500 font-bold tracking-widest uppercase mb-3">Our Programs</h2>
          <p className="text-3xl leading-tight font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl font-heading">
            A Better Way to Train
          </p>
          <p className="mt-6 text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Choose from our specialized programs designed for every fitness level and goal.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((program, index) => {
              const Icon = program.icon;
              return (
                <motion.div
                  key={program.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="group bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-zinc-200 dark:border-white/5 hover:shadow-2xl hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all duration-500 flex flex-col items-start"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 font-heading">{program.name}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed flex-grow">{program.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs;
