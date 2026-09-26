import React from 'react';
import Hero from '../components/Hero';
import Programs from '../components/Programs';
import Transformations from '../components/Transformations';
import Locations from '../components/Locations';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import { useOutletContext } from 'react-router-dom';

const Home = () => {
  const { openModal } = useOutletContext<{ openModal: (title?: string) => void }>();

  return (
    <>
      <Hero onOpenModal={() => openModal("Claim Free Trial")} />
      <Programs />
      <Transformations />
      <Testimonials />
      <Locations />
      <CTA onOpenModal={() => openModal("Claim Free Trial")} />
    </>
  );
};

export default Home;
