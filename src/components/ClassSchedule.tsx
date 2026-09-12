import { Calendar } from 'lucide-react';

interface ClassScheduleProps {
  onBook: () => void;
}

const schedule = [
  { time: '06:00 AM', name: 'Morning Yoga', trainer: 'Priya Patel', intensity: 'Low' },
  { time: '08:00 AM', name: 'CrossFit WOD', trainer: 'Rahul Verma', intensity: 'High' },
  { time: '10:00 AM', name: 'Zumba Cardio', trainer: 'Neha Singh', intensity: 'Medium' },
  { time: '05:00 PM', name: 'Weightlifting Basics', trainer: 'Amit Sharma', intensity: 'Medium' },
  { time: '07:00 PM', name: 'HIIT Burn', trainer: 'Rahul Verma', intensity: 'High' },
];

const ClassSchedule = ({ onBook }: ClassScheduleProps) => {
  return (
    <section id="schedule" className="py-20 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Schedule</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl font-heading">
            Class Timetable
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 font-semibold text-slate-900 dark:text-white">Time</th>
                  <th className="p-4 font-semibold text-slate-900 dark:text-white">Class Name</th>
                  <th className="p-4 font-semibold text-slate-900 dark:text-white hidden sm:table-cell">Trainer</th>
                  <th className="p-4 font-semibold text-slate-900 dark:text-white hidden md:table-cell">Intensity</th>
                  <th className="p-4 font-semibold text-slate-900 dark:text-white text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {schedule.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 whitespace-nowrap text-slate-900 dark:text-white font-medium">{item.time}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{item.name}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{item.trainer}</td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        item.intensity === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        item.intensity === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {item.intensity}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={onBook}
                        className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                      >
                        <Calendar className="w-4 h-4 mr-2" /> Book Slot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassSchedule;
