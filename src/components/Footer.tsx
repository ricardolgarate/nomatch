import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#fbf8ff] text-black border-t border-bfab-100">
      <div className="absolute inset-0 bg-hero-radial opacity-60 pointer-events-none" />

      <div className="container mx-auto px-6 pt-20 pb-10 relative">
        <div className="mx-auto mb-14 flex max-w-4xl flex-col items-center rounded-[2rem] border border-bfab-100 bg-white/85 px-6 py-10 text-center shadow-card">
          <img
            src="/BFABLOGO.png"
            alt="Beauty For Ashes Boutique"
            className="w-72 md:w-80 h-auto object-contain mb-5"
          />
          <p className="font-display text-2xl mb-1 text-black">
            Beauty For Ashes Boutique
          </p>
          <p className="text-xs tracking-[0.3em] uppercase text-bfab-700 mt-1">
            Handpicked with love in Dallas, Texas
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-black/60">
            Faith-rooted fashion for every version of you, inspired by beauty,
            restoration, and confidence.
          </p>
          <div className="divider-ornament w-full max-w-xs mx-auto mt-4 mb-4 text-bfab-400">
            <span>✦</span>
          </div>
          <SocialLinks variant="inline" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-5xl mx-auto border-t border-bfab-100 pt-12 text-sm">
          <div>
            <h3 className="text-[11px] font-semibold text-bfab-700 mb-4 tracking-[0.3em] uppercase">
              Shop
            </h3>
            <ul className="space-y-2.5 text-black/75">
              <li><Link to="/" className="hover:text-bfab-600 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-bfab-600 transition-colors">All</Link></li>
              <li><Link to="/shop/womens-clothing" className="hover:text-bfab-600 transition-colors">Women's Clothing</Link></li>
              <li><Link to="/shop/shoes" className="hover:text-bfab-600 transition-colors">Shoes</Link></li>
              <li><Link to="/shop/accessories" className="hover:text-bfab-600 transition-colors">Accessories</Link></li>
              <li><Link to="/shop/mens" className="hover:text-bfab-600 transition-colors">Men's</Link></li>
              <li><Link to="/shop/kids" className="hover:text-bfab-600 transition-colors">Kids</Link></li>
              <li><Link to="/shop/giftables" className="hover:text-bfab-600 transition-colors">Giftables</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-bfab-700 mb-4 tracking-[0.3em] uppercase">
              About
            </h3>
            <ul className="space-y-2.5 text-black/75">
              <li><Link to="/about#our-story" className="hover:text-bfab-600 transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-bfab-600 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-bfab-700 mb-4 tracking-[0.3em] uppercase">
              Help
            </h3>
            <ul className="space-y-2.5 text-black/75">
              <li><a href="#returns" className="hover:text-bfab-600 transition-colors">Returns</a></li>
              <li><a href="#terms" className="hover:text-bfab-600 transition-colors">Terms &amp; Conditions</a></li>
              <li><a href="#privacy" className="hover:text-bfab-600 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-bfab-700 mb-4 tracking-[0.3em] uppercase">
              Reach Out
            </h3>
            <div className="space-y-3 text-black/75">
              <a
                href="mailto:shopbfabllc@gmail.com"
                className="flex items-center gap-2 hover:text-bfab-600 transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span className="break-all">shopbfabllc@gmail.com</span>
              </a>
              <a
                href="tel:+14692976359"
                className="flex items-center gap-2 hover:text-bfab-600 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>(469)297-6359</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Dallas, Texas</span>
              </div>
              <SocialLinks variant="footer-list" />
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-bfab-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-black/50">
          <p>© {new Date().getFullYear()} Beauty For Ashes Boutique. All rights reserved.</p>
          <p className="tracking-widest uppercase">Styled with love</p>
        </div>
      </div>
    </footer>
  );
}
