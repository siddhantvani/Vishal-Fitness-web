import React from 'react';
import Calculators from '../components/Calculators';

const CalculatorsPage = () => {
  return (
    <div className="pt-24 pb-12 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center mb-12">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Tools</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl font-heading">
            Fitness Calculators
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 mx-auto">
            Use these free tools to track your progress and understand your body's needs.
          </p>
        </div>
      </div>
      <Calculators />
    </div>
  );
};

export default CalculatorsPage;
