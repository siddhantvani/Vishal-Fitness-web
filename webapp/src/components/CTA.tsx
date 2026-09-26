
interface CTAProps {
  onOpenModal: () => void;
}

const CTA = ({ onOpenModal }: CTAProps) => {
  return (
    <section id="cta" className="relative py-32 bg-primary-600 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-zinc-900 opacity-90" />
      <div className="absolute inset-0 opacity-20">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid-cta" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid-cta)" />
        </svg>
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl font-heading mb-8 drop-shadow-sm">
          Ready to Start Your Journey?
        </h2>
        <p className="max-w-2xl mx-auto text-xl text-primary-100 mb-12 font-medium leading-relaxed">
          Claim your 3-day free trial today. Experience our premium facilities, meet our trainers, and see why we are Bhopal's best fitness studio.
        </p>
        <div className="flex justify-center">
          <button onClick={onOpenModal} className="px-10 py-5 bg-white text-zinc-900 font-bold text-lg rounded-xl shadow-2xl hover:bg-zinc-100 transition-all transform hover:-translate-y-1 hover:shadow-white/20">
            Claim Your Free Trial Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
