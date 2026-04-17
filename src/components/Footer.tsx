import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.5 7.2a6.3 6.3 0 0 1-3.7-1.2A6.2 6.2 0 0 1 13.6 2h-3v13.2a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.6a5.7 5.7 0 1 0 4.8 5.6V9c1.5 1 3.2 1.6 5 1.6V7.2z" />
    </svg>
  );
}

function PoshmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.3 12.4H11V18H8.6V7.8H13c2.3 0 3.9 1.4 3.9 3.3s-1.6 3.3-3.6 3.3zm-.2-4.7H11v2.8h2c1.1 0 1.8-.6 1.8-1.4s-.7-1.4-1.7-1.4z" />
    </svg>
  );
}

const socials = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/',
    icon: Instagram,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/',
    icon: Facebook,
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/',
    icon: TikTokIcon,
  },
  {
    name: 'Poshmark',
    href: 'https://poshmark.com/',
    icon: PoshmarkIcon,
  },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-radial opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 pt-20 pb-10 relative">
        <div className="flex flex-col items-center text-center mb-14">
          <img
            src="/BFABLOGO.png"
            alt="Beauty For Ashes Boutique"
            className="w-64 md:w-80 h-auto object-contain mb-5"
          />
          <p className="text-white/70 font-light max-w-md">
            A small boutique in Desoto, Texas. Hand-picked pieces for every
            shape, every shade, every story.
          </p>

          <div className="flex items-center gap-3 mt-8">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-white/20 hover:border-white hover:bg-white hover:text-bfab-900 transition-all flex items-center justify-center"
                aria-label={s.name}
              >
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
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
                href="mailto:shopbfabllc@gmail.com"
                className="flex items-center gap-2 hover:text-white transition-colors break-all"
              >
                <Mail className="w-4 h-4 shrink-0" />
                shopbfabllc@gmail.com
              </a>
              <a
                href="tel:+14692976359"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                (469) 297-6359
              </a>
              <div className="flex items-start gap-2 text-white/60">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Desoto, Texas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Beauty For Ashes Boutique LLC. All rights reserved.</p>
          <p className="tracking-widest uppercase">Made with ♥ in Texas</p>
        </div>
      </div>
    </footer>
  );
}
