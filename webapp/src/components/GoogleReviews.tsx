import React from 'react';
import { Star, ExternalLink, MessageSquarePlus, MapPin, CheckCircle2 } from 'lucide-react';

interface BranchReviewConfig {
  id: string;
  name: string;
  address: string;
  readReviewsUrl: string;
  writeReviewUrl: string;
}

const BRANCHES: BranchReviewConfig[] = [
  {
    id: 'chhatrasal',
    name: 'Chhatrasal Bharat Nagar Branch',
    address: 'Chhatrasal Bharat Nagar, Bhopal, Madhya Pradesh',
    readReviewsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Vishal Fitness Planet, Chhatrasal Bharat Nagar, Bhopal, Madhya Pradesh')}`,
    writeReviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Vishal Fitness Planet, Chhatrasal Bharat Nagar, Bhopal, Madhya Pradesh')}`,
  },
  {
    id: 'link-road',
    name: 'Link Road Branch',
    address: 'Prakash Tarun Pushkar, Link Road, Bhopal, Madhya Pradesh',
    readReviewsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Vishal Fitness Planet, Prakash Tarun Pushkar, Link Road, Bhopal, Madhya Pradesh')}`,
    writeReviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Vishal Fitness Planet, Prakash Tarun Pushkar, Link Road, Bhopal, Madhya Pradesh')}`,
  },
];

// Primary overall listing URLs
const PRIMARY_READ_REVIEWS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Vishal Fitness Planet Bhopal')}`;
const PRIMARY_WRITE_REVIEW_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Vishal Fitness Planet Bhopal')}`;

// Official Google "G" multi-colored vector logo
const GoogleLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GoogleReviews: React.FC = () => {
  return (
    <section 
      id="reviews" 
      className="py-24 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden transition-colors duration-300 border-t border-zinc-200 dark:border-white/5"
    >
      {/* Background ambient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary-500/5 dark:bg-primary-500/10 blur-[140px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading & Subtitle */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 mb-4 shadow-sm dark:shadow-none backdrop-blur-sm">
            <GoogleLogo className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Google Reviews
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white sm:text-5xl font-heading tracking-tight">
            WHAT OUR MEMBERS SAY
          </h2>
          <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            Real experiences. Real progress. Discover what our members say about Vishal Fitness.
          </p>
        </div>

        {/* Google Rating Hero Card */}
        <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-8 sm:p-10 border border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-2xl backdrop-blur-xl mb-12 hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Rating summary */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
              <div className="w-20 h-20 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-inner flex-shrink-0">
                <GoogleLogo className="w-12 h-12" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-heading">
                    Vishal Fitness Planet
                  </span>
                  <CheckCircle2 className="w-6 h-6 text-primary-500 fill-primary-500/20" />
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Google Verified Rating
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Trusted by fitness enthusiasts across Bhopal &bull; Rated highly for expert trainers and top-tier equipment
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 flex-shrink-0">
              <a
                href={PRIMARY_READ_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold transition-all border border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/25 shadow-sm dark:shadow-lg group"
              >
                <span>Read Google Reviews</span>
                <ExternalLink className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              </a>

              <a
                href={PRIMARY_WRITE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 dark:shadow-primary-500/25 hover:shadow-primary-500/40 group"
              >
                <MessageSquarePlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Write a Review</span>
              </a>
            </div>
          </div>
        </div>

        {/* Branch-Specific Review Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {BRANCHES.map((branch) => (
            <div
              key={branch.id}
              className="group bg-white dark:bg-zinc-900/80 rounded-3xl p-8 border border-zinc-200 dark:border-white/5 shadow-md dark:shadow-xl hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20">
                    <GoogleLogo className="w-3.5 h-3.5" />
                    <span>Official Google Listing</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 font-heading group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {branch.name}
                </h3>

                <div className="flex items-start gap-3 text-zinc-600 dark:text-zinc-400 mb-6">
                  <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{branch.address}</p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-4 border border-zinc-200 dark:border-white/5 mb-6">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                    "Read genuine member reviews, ratings, and shared workout experiences directly on Google Maps."
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={branch.readReviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-semibold rounded-xl transition-colors border border-zinc-300 dark:border-white/5 hover:border-zinc-400 dark:hover:border-white/20 text-center group/btn"
                >
                  <span>Read Reviews</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white transition-colors" />
                </a>

                <a
                  href={branch.writeReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3 px-4 bg-primary-50 hover:bg-primary-500 dark:bg-primary-500/10 dark:hover:bg-primary-500 text-primary-600 hover:text-white dark:text-primary-400 dark:hover:text-white text-sm font-semibold rounded-xl transition-colors border border-primary-200 hover:border-primary-500 dark:border-primary-500/20 dark:hover:border-primary-500 text-center transition-all"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Write Review</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
