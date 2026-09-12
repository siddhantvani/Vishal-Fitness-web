import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Programs from "./components/Programs";
import Trainers from "./components/Trainers";
import Transformations from "./components/Transformations";
import ClassSchedule from "./components/ClassSchedule";
import Calculators from "./components/Calculators";
import Locations from "./components/Locations";
import Events from "./components/Events";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import WhatsAppButton from "./components/WhatsAppButton";

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTitle, setBookingTitle] = useState("Claim Free Trial");

  const openModal = (title?: string) => {
    if (title) setBookingTitle(title);
    setIsBookingOpen(true);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen relative">
        <Navbar />
        <main>
          {/* Note: In a real implementation, Hero and CTA would accept openModal as a prop. For simplicity, we assume they trigger #cta or handle it themselves. Let's update Hero and CTA to accept props. */}
          <Hero onOpenModal={() => openModal("Claim Free Trial")} />
          <Programs />
          <Calculators />
          <ClassSchedule onBook={() => openModal("Book Class Slot")} />
          <Trainers />
          <Transformations />
          <Events />
          <Locations />
          <Testimonials />
          <CTA onOpenModal={() => openModal("Claim Free Trial")} />
        </main>
        <Footer />

        <WhatsAppButton />
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          title={bookingTitle}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
