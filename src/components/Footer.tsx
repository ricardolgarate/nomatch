import { Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-radial opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 pt-20 pb-10 relative">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-24 h-24 rounded-full bg-white p-2 flex items-center justify-center mb-5 shadow-soft">
            <img
              src="/BFAB-Logo.jpg"
              alt="Beauty For Ashes Boutique"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="font-display text-2xl mb-1">Beauty For Ashes Boutique</p>
          <div className="divider-ornament w-full max-w-xs mx-auto mt-3 mb-4 text-bfab-300">
            <span>✦</span>
          </div>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-bfab-200 hover:text-white font-medium transition-colors inline-flex items-center gap-2"
          >
            <Instagram className="w-4 h-4" />
            @bfab
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-5xl mx-auto border-t border-white/10 pt-12 text-sm">
          <div>
            <h3 className="text-[11px] font-semibold text-bfab-200 mb-4 tracking-[0.3em] uppercase">
              Shop
            </h3>
            <ul className="space-y-2.5 text-white/75">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">All</Link></li>
              <li><Link to="/shop/shoes" className="hover:text-white transition-colors">Shoes</Link></li>
              <li><Link to="/shop/clothing" className="hover:text-white transition-colors">Clothing</Link></li>
              <li><Link to="/shop/accessories" className="hover:text-white transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-bfab-200 mb-4 tracking-[0.3em] uppercase">
              About
            </h3>
            <ul className="space-y-2.5 text-white/75">
              <li><Link to="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-bfab-200 mb-4 tracking-[0.3em] uppercase">
              Help
            </h3>
            <ul className="space-y-2.5 text-white/75">
              <li><a href="#returns" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Terms &amp; Conditions</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-bfab-200 mb-4 tracking-[0.3em] uppercase">
              Reach Out
            </h3>
            <div className="space-y-3 text-white/75">
              <a
                href="mailto:support@bfab.com"
                className="inline-flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" /> support@bfab.com
              </a>
              <br />
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Beauty For Ashes Boutique. All rights reserved.</p>
          <p className="tracking-widest uppercase">Crafted with ♥</p>
        </div>
      </div>
    </footer>
  );
}
