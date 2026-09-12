import { useState } from 'react';
import { Activity } from 'lucide-react';

const WorkoutCalculator = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('1.2');
  const [tdee, setTdee] = useState<number | null>(null);

  const calculateTDEE = (e: React.FormEvent) => {
    e.preventDefault();
    if (age && weight && height) {
      const w = parseFloat(weight);
      const h = parseFloat(height);
      const a = parseInt(age);
      
      // Mifflin-St Jeor Equation
      let bmr = (10 * w) + (6.25 * h) - (5 * a);
      bmr = gender === 'male' ? bmr + 5 : bmr - 161;
      
      const totalCalories = bmr * parseFloat(activity);
      setTdee(Math.round(totalCalories));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-xl">
          <Activity className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Calorie Calculator</h3>
      </div>
      
      <form onSubmit={calculateTDEE} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none" placeholder="25" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none" placeholder="70" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none" placeholder="175" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Activity Level</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none">
            <option value="1.2">Sedentary (Little/No Exercise)</option>
            <option value="1.375">Lightly Active (Exercise 1-3 days/week)</option>
            <option value="1.55">Moderately Active (Exercise 3-5 days/week)</option>
            <option value="1.725">Very Active (Exercise 6-7 days/week)</option>
          </select>
        </div>
        <button type="submit" className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors mt-2">
          Calculate Calories
        </button>
      </form>

      {tdee !== null && (
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-center animate-fade-in">
          <p className="text-sm text-slate-500 dark:text-slate-400">Daily Maintenance Calories</p>
          <p className="text-4xl font-bold text-primary-500 font-heading my-2">{tdee} kcal</p>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-sm text-slate-500">For Fat Loss</p>
              <p className="font-semibold text-slate-900 dark:text-white">{tdee - 500} kcal</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">For Muscle Gain</p>
              <p className="font-semibold text-slate-900 dark:text-white">{tdee + 300} kcal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCalculator;
