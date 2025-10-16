import { Instagram } from 'lucide-react';

const instagramPosts = [
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3755708/pexels-photo-3755708.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export default function Footer() {
  return (
    <footer className="bg-pink-50">
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-serif font-medium text-center text-gray-900 mb-12">
          Follow Us
        </h2>

        {/* Instagram Profile Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-full bg-pink-50 p-1 flex items-center justify-center">
                <img 
                  src="/Logo-NoMatch.webp" 
                  alt="NOMATCH Logo" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold text-gray-900">nomatch.us</p>
            <a
              href="https://www.instagram.com/nomatch.us/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              View on Instagram
            </a>
          </div>
        </div>

        {/* Instagram Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
            {instagramPosts.map((image, index) => (
              <a
                key={index}
                href="https://www.instagram.com/nomatch.us/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-100"
              >
                <img
                  src={image}
                  alt={`NoMatch Instagram post ${index + 1}`}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto border-t border-pink-200 pt-12">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">
              MENU
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                <a href="/" className="hover:text-purple-600 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/shop/shoes" className="hover:text-purple-600 transition-colors">
                  Shoes
                </a>
              </li>
              <li>
                <a href="/shop" className="hover:text-purple-600 transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a href="/shop/accessories" className="hover:text-purple-600 transition-colors">
                  Accessories
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-purple-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-purple-600 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">
              HELP
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                <a href="#tracking" className="hover:text-purple-600 transition-colors">
                  Order Tracking
                </a>
              </li>
              <li>
                <a href="#returns" className="hover:text-purple-600 transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-purple-600 transition-colors">
                  Terms and Conditions
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-purple-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">
              CONTACT
            </h3>
            <div className="space-y-2 text-gray-700">
              <p>E-mail: support@nomatch.us</p>
              <p>Order support at +1 (214) 876-6501</p>
              <a
                href="https://www.instagram.com/nomatch.us/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span>@nomatch.us</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>NoMatch © 2025. Developed by Netcommerce.</p>
        </div>
      </div>
    </footer>
  );
}
