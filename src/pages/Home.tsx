import { useEffect } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import HandcraftedSection from '../components/HandcraftedSection';
import ProductGrid from '../components/ProductGrid';
import ColorChangingSection from '../components/ColorChangingSection';
import CategorySection from '../components/CategorySection';
import ExperienceSection from '../components/ExperienceSection';
import { trackEvent } from '../firebase/analytics';

export default function Home() {
  useEffect(() => {
    trackEvent('page_visit', { page: 'home' });
  }, []);

  return (
    <>
      <HeroCarousel />
      <HandcraftedSection />
      <ProductGrid />
      <ColorChangingSection />
      <CategorySection />
      <ExperienceSection />
    </>
  );
}

