import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="relative h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1920')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-7xl font-serif text-white font-light tracking-wide">ABOUT US</h1>
        </div>
      </div>

      {/* Our Brand Section */}
      <section className="bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Group of friends wearing NoMatch sneakers"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-5xl font-serif font-medium text-purple-600 mb-8">
                Our Brand
              </h2>
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <p>
                  We believe confidence comes from embracing what makes you different. Our 
                  sneakers aren't made to blend in—they're made to remind you that you don't have 
                  to fit a certain mold to stand out.
                </p>
                <p>
                  At <span className="font-semibold text-purple-600">NoMatch</span>, we set out to create sneakers that look as unique as the women who 
                  wear them. Each pair is mismatched by design—the left is never quite the same as 
                  the right. It's a little twist that makes every pair more fun to wear and style.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-serif font-medium text-pink-500 mb-8">
                Our Process
              </h2>
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <p>
                  NoMatch didn't happen overnight—it took over 2 years of 
                  product development, dozens of samples, and countless design 
                  tweaks to create a sneaker you'll actually want to wear every 
                  day. We set out to make something playful yet premium, bold 
                  yet easy to style, and above all, comfortable enough to enjoy 
                  from day to night.
                </p>
                <p>
                  Every pair is <span className="font-semibold text-pink-500">handmade in small batches</span> with 100% premium 
                  leather, soft leather linings, and durable rubber soles built for 
                  all-day wear. From mismatched soles to UV-activated 
                  embroidery that changes color in the sunlight, each detail was 
                  refined until it felt just right.
                </p>
                <p>
                  From the first sketch to the final packaging, we've obsessed 
                  over the process—because when you slip on a pair of NoMatch 
                  sneakers, we want you to feel the same excitement we felt 
                  bringing them to life. And as we continue to grow, we're excited 
                  to keep adding new colors, patterns, and designs.
                </p>
                <p className="italic text-gray-600">
                  If you're interested in collaborating with us on future designs, 
                  we'd love to hear from you—please reach out through our 
                  contact page.
                </p>
              </div>
              <Link 
                to="/shop" 
                className="mt-8 inline-block px-8 py-3 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 transition-colors"
              >
                SHOP NOW
              </Link>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Customizing NoMatch sneakers"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-purple-100 to-pink-100 py-16">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-serif font-medium text-gray-900 mb-6">
            Ready to Stand Out?
          </h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Join the NoMatch community and discover sneakers that celebrate what makes you unique.
          </p>
          <Link 
            to="/shop" 
            className="inline-block px-10 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
          >
            EXPLORE COLLECTION
          </Link>
        </div>
      </section>
    </div>
  );
}

