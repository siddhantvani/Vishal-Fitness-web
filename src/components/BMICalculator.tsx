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
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-xl">
          <Calculator className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">BMI Calculator</h3>
      </div>
      
      <form onSubmit={calculateBMI} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
            <input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" 
              placeholder="175" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" 
              placeholder="70" 
            />
          </div>
        </div>
        <button type="submit" className="w-full py-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors">
          Calculate BMI
        </button>
      </form>

      {bmi !== null && (
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-center animate-fade-in">
          <p className="text-sm text-slate-500 dark:text-slate-400">Your BMI Result</p>
          <p className="text-4xl font-bold text-primary-500 font-heading my-2">{bmi}</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{category}</p>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
