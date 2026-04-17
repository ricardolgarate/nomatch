import HeroCarousel from '../components/HeroCarousel';
import HandcraftedSection from '../components/HandcraftedSection';
import ProductGrid from '../components/ProductGrid';
import ColorChangingSection from '../components/ColorChangingSection';
import CategorySection from '../components/CategorySection';
import ExperienceSection from '../components/ExperienceSection';
import NewsletterSection from '../components/NewsletterSection';

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <HandcraftedSection />
      <ProductGrid />
      <ColorChangingSection />
      <CategorySection />
      <ExperienceSection />
      <NewsletterSection />
    </>
  );
}
