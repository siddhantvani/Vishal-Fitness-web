import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { schedule } from '../data/mockData';
import { api } from '../api/api';

interface ClassScheduleProps {
  onBook: (scheduleId?: string) => void;
}

const ClassSchedule = ({ onBook }: ClassScheduleProps) => {
  const [realSchedules, setRealSchedules] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await api.get('/schedules');
        setRealSchedules(data);
      } catch (error) {
        console.error('Failed to fetch schedules', error);
      }
    };
    fetchSchedules();
  }, []);

  const getScheduleId = (mockItem: any) => {
    const matched = realSchedules.find(rs => {
      const matchName = rs.class.name.toLowerCase() === mockItem.name.toLowerCase();
      const matchTrainer = `${rs.trainer.firstName} ${rs.trainer.lastName}`.toLowerCase() === mockItem.trainer.toLowerCase();
      // For a robust system, we would map exact dates, but for this demo integration
      // we just try to find a real schedule matching the class name or trainer.
      return matchName || matchTrainer;
    });
    return matched?.id;
  };

  return (
    <section id="schedule" className="py-24 bg-zinc-50 dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm text-primary-500 font-bold tracking-widest uppercase mb-3">Schedule</h2>
          <p className="text-3xl leading-tight font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl font-heading">
            Class Timetable
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-white/5">
                  <th className="p-6 font-semibold text-zinc-900 dark:text-zinc-300">Time</th>
                  <th className="p-6 font-semibold text-zinc-900 dark:text-zinc-300">Class Name</th>
                  <th className="p-6 font-semibold text-zinc-900 dark:text-zinc-300 hidden sm:table-cell">Trainer</th>
                  <th className="p-6 font-semibold text-zinc-900 dark:text-zinc-300 hidden md:table-cell">Intensity</th>
                  <th className="p-6 font-semibold text-zinc-900 dark:text-zinc-300 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                {schedule.map((item, index) => (
                  <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="p-6 whitespace-nowrap text-zinc-900 dark:text-white font-bold">{item.time}</td>
                    <td className="p-6 text-zinc-700 dark:text-zinc-300 font-medium">{item.name}</td>
                    <td className="p-6 text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">{item.trainer}</td>
                    <td className="p-6 hidden md:table-cell">
                      <span className={`inline-flex px-3 py-1 text-xs rounded-full font-bold tracking-wide ${
                        item.intensity === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20' :
                        item.intensity === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20' :
                        'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                      }`}>
                        {item.intensity}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => onBook(getScheduleId(item))}
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-500/10 hover:bg-primary-500 text-primary-600 dark:text-primary-400 hover:text-white text-sm font-semibold rounded-xl transition-all"
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
