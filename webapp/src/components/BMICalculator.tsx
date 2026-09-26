import { useState } from 'react';
import { Calculator } from 'lucide-react';

const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(parseFloat(bmiValue.toFixed(1)));

      if (bmiValue < 18.5) setCategory('Underweight - Focus on Muscle Gain');
      else if (bmiValue >= 18.5 && bmiValue < 24.9) setCategory('Normal - Focus on Maintenance & Toning');
      else if (bmiValue >= 25 && bmiValue < 29.9) setCategory('Overweight - Focus on Fat Loss');
      else setCategory('Obese - Focus on Transformation Program');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 shadow-2xl border border-zinc-200 dark:border-white/5 transition-all hover:border-primary-500/20">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-primary-500/10 text-primary-500 rounded-2xl">
          <Calculator className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold font-heading text-zinc-900 dark:text-white mb-1">BMI Calculator</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Check your body mass index</p>
        </div>
      </div>
      
      <form onSubmit={calculateBMI} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Height (cm)</label>
            <input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required 
              className="w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-black/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" 
              placeholder="175" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Weight (kg)</label>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required 
              className="w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-black/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" 
              placeholder="70" 
            />
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold transition-colors">
          Calculate BMI
        </button>
      </form>

      {bmi !== null && (
        <div className="mt-8 p-6 bg-primary-500/10 dark:bg-primary-500/5 border border-primary-500/20 rounded-2xl text-center animate-fade-in">
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2 uppercase tracking-wide">Your BMI Result</p>
          <p className="text-5xl font-extrabold text-zinc-900 dark:text-white font-heading mb-3">{bmi}</p>
          <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">{category}</p>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
