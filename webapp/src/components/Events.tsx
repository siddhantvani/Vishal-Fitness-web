import { CalendarDays, MapPin } from 'lucide-react';
import { events } from '../data/mockData';

const Events = () => {
  return (
    <section id="events" className="py-24 bg-zinc-950 transition-colors border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm text-primary-500 font-bold tracking-widest uppercase mb-3">Community</h2>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl font-heading tracking-tight">
            Upcoming Events
          </h2>
          <p className="mt-6 text-xl text-zinc-400 leading-relaxed">
            Join the Vishal Fitness community outside the gym. Participate in workshops, runs, and exclusive gatherings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {events.map((event, index) => (
            <div key={index} className="group bg-zinc-900 rounded-3xl overflow-hidden shadow-xl border border-white/5 flex flex-col sm:flex-row hover:border-primary-500/30 transition-all duration-500">
              <div className="sm:w-2/5 relative overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-56 sm:h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="p-8 flex flex-col justify-between sm:w-3/5">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-heading group-hover:text-primary-400 transition-colors">{event.title}</h3>
                  <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{event.description}</p>
                </div>
                <div className="space-y-3 text-sm text-zinc-300 font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;
