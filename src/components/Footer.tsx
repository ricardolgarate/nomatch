import { Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-bfab-50/60 text-black relative overflow-hidden border-t border-black/5">
      <div className="absolute inset-0 bg-hero-radial opacity-50 pointer-events-none" />

      <div className="container mx-auto px-6 pt-20 pb-10 relative">
        <div className="flex flex-col items-center text-center mb-16">
          <img
            src="/BFABLOGO.png"
            alt="Beauty For Ashes Boutique"
            className="w-72 md:w-80 h-auto object-contain mb-5"
          />
          <p className="font-display text-2xl mb-1 text-black">
            Beauty For Ashes Boutique
          </p>
          <p className="text-xs tracking-[0.3em] uppercase text-bfab-700 mt-1">
            Made with love in Desoto, Texas
          </p>
          <div className="divider-ornament w-full max-w-xs mx-auto mt-4 mb-4 text-bfab-400">
            <span>✦</span>
          </div>
          <a
            href="https://www.instagram.com/bfabllc/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-bfab-600 hover:text-bfab-700 font-medium transition-colors inline-flex items-center gap-2"
          >
            <Instagram className="w-4 h-4" />
            @bfabllc
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-5xl mx-auto border-t border-black/10 pt-12 text-sm">
          <div>
            <h3 className="text-[11px] font-semibold text-bfab-700 mb-4 tracking-[0.3em] uppercase">
              Shop
            </h3>
            <ul className="space-y-2.5 text-black/75">
              <li><Link to="/" className="hover:text-bfab-600 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-bfab-600 transition-colors">All</Link></li>
              <li><Link to="/shop/shoes" className="hover:text-bfab-600 transition-colors">Shoes</Link></li>
              <li><Link to="/shop/clothing" className="hover:text-bfab-600 transition-colors">Clothing</Link></li>
              <li><Link to="/shop/accessories" className="hover:text-bfab-600 transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-bfab-700 mb-4 tracking-[0.3em] uppercase">
              About
            </h3>
            <ul className="space-y-2.5 text-black/75">
              <li><Link to="/about" className="hover:text-bfab-600 transition-colors">Our Story</Link></li>
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
                <span>(469) 297-6359</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Desoto, Texas</span>
              </div>
              <a
                href="https://www.instagram.com/bfabllc/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-bfab-600 transition-colors"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                <span>@bfabllc</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-black/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-black/50">
          <p>© {new Date().getFullYear()} Beauty For Ashes Boutique. All rights reserved.</p>
          <p className="tracking-widest uppercase">Crafted with ♥</p>
        </div>
      </div>
    </footer>
  );
}
