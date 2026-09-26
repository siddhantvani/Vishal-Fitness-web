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
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 shadow-2xl border border-zinc-200 dark:border-white/5 transition-all hover:border-primary-500/20">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-primary-500/10 text-primary-500 rounded-2xl">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold font-heading text-zinc-900 dark:text-white mb-1">Calorie Calculator</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Calculate your daily calorie needs</p>
        </div>
      </div>
      
      <form onSubmit={calculateTDEE} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required className="w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-black/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="25" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-black/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-black/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="70" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required className="w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-black/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="175" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Activity Level</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full px-5 py-3 rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-black/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all">
            <option value="1.2">Sedentary (Little/No Exercise)</option>
            <option value="1.375">Lightly Active (1-3 days/week)</option>
            <option value="1.55">Moderately Active (3-5 days/week)</option>
            <option value="1.725">Very Active (6-7 days/week)</option>
          </select>
        </div>
        <button type="submit" className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40">
          Calculate Calories
        </button>
      </form>

      {tdee !== null && (
        <div className="mt-8 p-6 bg-primary-500/10 dark:bg-primary-500/5 border border-primary-500/20 rounded-2xl text-center animate-fade-in">
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2 uppercase tracking-wide">Daily Maintenance Calories</p>
          <p className="text-5xl font-extrabold text-zinc-900 dark:text-white font-heading mb-4">{tdee} <span className="text-2xl text-zinc-500 font-normal">kcal</span></p>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-primary-500/20">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">For Fat Loss</p>
              <p className="font-bold text-lg text-zinc-900 dark:text-white">{tdee - 500} kcal</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">For Muscle Gain</p>
              <p className="font-bold text-lg text-zinc-900 dark:text-white">{tdee + 300} kcal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCalculator;
