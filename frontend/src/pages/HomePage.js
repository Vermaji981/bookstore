import React from 'react';
import HeroSection from '../components/home/HeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import FeaturedSection from '../components/home/FeaturedSection';
import SmartRecommendationsSection from '../components/home/SmartRecommendationsSection';
import SpecialDealSection from '../components/home/SpecialDealSection';
import RecentlyViewedSection from '../components/common/RecentlyViewedSection';
import TestimonialsSection from '../components/home/TestimonialsSection';

const HomePage = () => {
  return (
    <div className="home-page animate-fade-in">
      <HeroSection />
      <CategoriesSection />
      <FeaturedSection />
      <SmartRecommendationsSection />
      <SpecialDealSection />
      <RecentlyViewedSection />
      <TestimonialsSection />
    </div>
  );
};

export default HomePage;
