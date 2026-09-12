import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Dumbbell, Flame, Heart } from 'lucide-react';

const programs = [
  {
    name: 'General Fitness',
    description: 'Comprehensive workouts designed to build strength, endurance, and overall health.',
    icon: Activity,
  },
  {
    name: 'Personal Training',
    description: '1-on-1 expert guidance tailored exactly to your unique fitness goals and body type.',
    icon: Dumbbell,
  },
  {
    name: 'Transformation',
    description: 'Intensive, result-oriented program designed for dramatic body transformations.',
    icon: Flame,
  },
  {
    name: 'Cross-fit Zone',
    description: 'High-intensity functional training to maximize your athletic performance.',
    icon: Heart,
  },
];

const Programs = () => {
  return (
    <section id="programs" className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Programs</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl font-heading">
            A Better Way to Train
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 mx-auto">
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
                  className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 transform"
                >
                  <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20 mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{program.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-base">{program.description}</p>
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
