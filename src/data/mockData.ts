import { Activity, Dumbbell, Flame, Heart } from 'lucide-react';

export const programs = [
  {
    name: 'General Fitness',
    description: 'Comprehensive workouts designed to build strength, endurance, and overall health.',
    icon: Activity,
  },
  {
    name: 'Personal Training',
    description: '1-on-1 expert guidance tailored exactly to your unique fitness goals and body type.',
    icon: Dumbbell,
  },
  {
    name: 'Transformation',
    description: 'Intensive, result-oriented program designed for dramatic body transformations.',
    icon: Flame,
  },
  {
    name: 'Cross-fit Zone',
    description: 'High-intensity functional training to maximize your athletic performance.',
    icon: Heart,
  },
];

export const schedule = [
  { time: '06:00 AM', name: 'Morning Yoga', trainer: 'Priya Patel', intensity: 'Low' },
  { time: '08:00 AM', name: 'CrossFit WOD', trainer: 'Rahul Verma', intensity: 'High' },
  { time: '10:00 AM', name: 'Zumba Cardio', trainer: 'Neha Singh', intensity: 'Medium' },
  { time: '05:00 PM', name: 'Weightlifting Basics', trainer: 'Amit Sharma', intensity: 'Medium' },
  { time: '07:00 PM', name: 'HIIT Burn', trainer: 'Rahul Verma', intensity: 'High' },
];

export const testimonials = [
  {
    content: "Vishal Fitness completely changed my approach to health. The transformation program is intense but the results are incredible.",
    author: "Sneha R.",
    role: "Member for 2 years",
  },
  {
    content: "The best gym in Bhopal, hands down. The trainers are knowledgeable, the equipment is top-notch, and the community is super supportive.",
    author: "Vikram S.",
    role: "CrossFit Enthusiast",
  },
  {
    content: "I love the group classes! They keep me motivated and I've met so many great friends here. The facilities are always spotlessly clean.",
    author: "Anjali M.",
    role: "Yoga Practitioner",
  }
];

export const trainers = [
  {
    name: 'Amit Sharma',
    role: 'Head Trainer',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=687&auto=format&fit=crop',
  },
  {
    name: 'Priya Patel',
    role: 'Yoga & Pilates',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1470&auto=format&fit=crop',
  },
  {
    name: 'Rahul Verma',
    role: 'CrossFit Expert',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop',
  },
];

export const events = [
  {
    title: "Sunday Morning Marathon",
    date: "Oct 15, 2026",
    time: "06:00 AM",
    location: "Bhopal Lake View",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop",
    description: "Join us for a 10K community run. Open for all fitness levels!"
  },
  {
    title: "Powerlifting Workshop",
    date: "Nov 02, 2026",
    time: "04:00 PM",
    location: "Chhatrasal Branch",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1470&auto=format&fit=crop",
    description: "Learn proper deadlift and squat techniques from our head trainer."
  },
];
