
interface CTAProps {
  onOpenModal: () => void;
}

const CTA = ({ onOpenModal }: CTAProps) => {
  return (
    <section id="cta" className="relative py-24 bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl font-heading mb-6">
          Ready to Start Your Journey?
        </h2>
        <p className="max-w-2xl mx-auto text-xl text-primary-100 mb-10">
          Claim your 3-day free trial today. Experience our premium facilities, meet our trainers, and see why we are Bhopal's best fitness studio.
        </p>
        <div className="flex justify-center">
          <button onClick={onOpenModal} className="px-8 py-4 bg-primary-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-primary-600 transition-colors transform hover:-translate-y-1">
            Claim Free Trial
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
