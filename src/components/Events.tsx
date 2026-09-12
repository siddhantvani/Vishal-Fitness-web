import { CalendarDays, MapPin } from 'lucide-react';

const events = [
  {
    title: "Sunday Morning Marathon",
    date: "Oct 15, 2026",
    time: "06:00 AM",
    location: "Bhopal Lake View",
    image: "https://images.unsplash.com/photo-1552674605-15cff24c00e8?q=80&w=1470&auto=format&fit=crop",
    description: "Join us for a 10K community run. Open for all fitness levels!"
  },
  {
    title: "Powerlifting Workshop",
    date: "Nov 02, 2026",
    time: "04:00 PM",
    location: "Chhatrasal Branch",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
    description: "Learn proper deadlift and squat techniques from our head trainer."
  },
];

const Events = () => {
  return (
    <section id="events" className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">
            Upcoming Events
          </h2>
          <p className="mt-4 text-xl text-slate-500 dark:text-slate-400">
            Join the Vishal Fitness community outside the gym.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {events.map((event, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row hover:shadow-lg transition-shadow">
              <img src={event.image} alt={event.title} className="w-full sm:w-48 h-48 sm:h-auto object-cover" />
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{event.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{event.description}</p>
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary-500" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-500" />
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
