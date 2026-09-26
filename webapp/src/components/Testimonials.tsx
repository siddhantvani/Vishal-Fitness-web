import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { testimonials } from '../data/mockData';

const Testimonials = () => {
  return (
    <section className="py-24 bg-zinc-50 dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-sm text-primary-500 font-bold tracking-widest uppercase mb-3">Success Stories</h2>
          <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white sm:text-5xl font-heading tracking-tight">
            What Our Members Say
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-zinc-900 p-10 rounded-3xl relative shadow-xl border border-zinc-200 dark:border-white/5 flex flex-col"
            >
              <div className="absolute top-8 right-10 text-primary-500/10 dark:text-primary-500/5 font-heading text-8xl leading-none" aria-hidden="true">
                "
              </div>
              <div className="flex gap-1 text-primary-500 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 text-lg italic mb-10 flex-grow relative z-10 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold text-xl">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white text-lg">{testimonial.author}</p>
                  <p className="text-sm text-zinc-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
