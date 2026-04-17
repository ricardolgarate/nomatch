import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="relative py-24 overflow-hidden bg-bfab-900 text-white">
      <div className="absolute inset-0 bg-hero-radial opacity-60" />
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-bfab-600/30 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-bfab-400/20 blur-3xl" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.32em] text-bfab-200 mb-4">
            Join the BFAB fam
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-medium leading-tight mb-6 text-balance">
            Be the first to <span className="italic text-bfab-200">shop new drops.</span>
          </h2>
          <p className="text-white/75 text-lg mb-10 font-light text-pretty">
            Sign up for first dibs on new arrivals, little secrets, and style tips from Catrice.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full pl-11 pr-4 py-4 rounded-lg bg-white/10 border border-white/20 focus:border-white focus:bg-white/15 focus:outline-none backdrop-blur-sm text-white placeholder-white/50 transition-all"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-bfab-900 font-semibold tracking-[0.2em] text-xs rounded-lg hover:bg-bfab-200 transition-colors"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> SUBSCRIBED
                </>
              ) : (
                <>
                  JOIN <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-white/50 mt-4">No spam — just the good stuff.</p>
        </div>
      </div>
    </section>
  );
}
