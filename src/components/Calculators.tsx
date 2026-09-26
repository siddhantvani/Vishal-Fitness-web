import BMICalculator from './BMICalculator';
import WorkoutCalculator from './WorkoutCalculator';

const Calculators = () => {
  return (
    <section id="calculators" className="py-24 bg-zinc-950 transition-colors border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm text-primary-500 font-bold tracking-widest uppercase mb-3">Tools</h2>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl font-heading tracking-tight">
            Fitness Calculators
          </h2>
          <p className="mt-6 text-xl text-zinc-400 leading-relaxed">
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
