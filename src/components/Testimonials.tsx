import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    content: "Vishal Fitness completely changed my approach to health. The transformation program is intense but the results are incredible.",
    author: "Sneha R.",
    role: "Member for 2 years",
  },
  {
    content: "The best gym in Bhopal, hands down. The trainers are knowledgeable, the equipment is top-notch, and the community is super supportive.",
    author: "Vikram S.",
    role: "CrossFit Enthusiast",
  },
  {
    content: "I love the group classes! They keep me motivated and I've met so many great friends here. The facilities are always spotlessly clean.",
    author: "Anjali M.",
    role: "Yoga Practitioner",
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">
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
              className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl relative"
            >
              <div className="flex text-primary-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic mb-6">"{testimonial.content}"</p>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{testimonial.author}</p>
                <p className="text-sm text-slate-500">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
