import { Link } from 'react-router-dom';

export default function ColorChangingSection() {
  return (
    <section className="bg-pink-50 py-20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-5xl font-serif font-medium text-purple-600 mb-6 leading-tight">
              COLOR-CHANGING<br />SNEAKERS
            </h2>

            <div className="space-y-4 text-gray-900 text-lg">
              <p>
                Discover a style that evolves with your every move. Indoors, the embroidery is white; step outside, and watch it transform with sun-activated colors.
              </p>

              <p>
                Handmade in small batches with 100% premium leather and embroidery, NoMatch sneakers are crafted to turn heads while giving you all-day comfort.
              </p>
            </div>

            <Link 
              to="/shop/uv"
              className="inline-block mt-8 px-10 py-4 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 font-medium tracking-wider text-sm transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              SHOP NOW
            </Link>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative transform transition-transform duration-500 hover:scale-105">
              <img
                src="https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Color Changing Sneaker"
                className="w-full rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
