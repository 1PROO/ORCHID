import React from 'react';
import Hero from '../components/Hero';
import ServiceShowcase from '../components/ServiceShowcase';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleBookNow = (categoryId, serviceId) => {
    navigate(`/booking?category=${categoryId}&service=${serviceId}`);
  };

  return (
    <>
      <Hero />
      <ServiceShowcase onBookNow={handleBookNow} />
    </>
  );
};

export default HomePage;
