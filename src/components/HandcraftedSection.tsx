import { Link } from 'react-router-dom';

export default function HandcraftedSection() {
  return (
    <section className="bg-pink-50 py-20">
      <div className="container mx-auto px-6 text-center max-w-5xl">
        <p className="text-pink-500 text-sm font-semibold tracking-widest mb-4">
          HANDCRAFTED SNEAKERS
        </p>
        <h2 className="text-5xl font-serif font-medium text-purple-600 mb-8">
          DESIGNED TO BE DIFFERENT
        </h2>

        <div className="space-y-6 text-gray-900 text-lg leading-relaxed">
          <p>
            At <span className="font-bold">NoMatch</span>, we believe confidence comes from embracing what makes you different. Our sneakers aren't made to blend in—they're made to remind you that you don't have to fit a certain mold to stand out.
          </p>

          <p>
            Every pair is mismatched by design—from the playful patterns and UV-activated embroidery to the signature pink-and-purple soles.
          </p>

          <p>
            Handmade in small batches with 100% premium leather and embroidery, NoMatch sneakers are crafted to turn heads while giving you all-day comfort.
          </p>
        </div>

        <Link 
          to="/about"
          className="inline-block mt-10 px-10 py-4 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 font-medium tracking-wider text-sm transform hover:scale-105 hover:shadow-lg active:scale-95"
        >
          ABOUT US
        </Link>
      </div>
    </section>
  );
}
