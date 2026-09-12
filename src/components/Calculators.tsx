import BMICalculator from './BMICalculator';
import WorkoutCalculator from './WorkoutCalculator';

const Calculators = () => {
  return (
    <section id="calculators" className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Tools</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl font-heading">
            Fitness Calculators
          </p>
          <p className="mt-4 text-xl text-slate-500 dark:text-slate-400">
            Understand your body and plan your goals scientifically.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <BMICalculator />
          <WorkoutCalculator />
        </div>
      </div>
    </section>
  );
};

export default Calculators;
