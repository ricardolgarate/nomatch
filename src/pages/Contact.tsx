import { useState } from 'react';
import { Instagram, Facebook, Mail, MapPin, Phone, Send } from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.5 7.2a6.3 6.3 0 0 1-3.7-1.2A6.2 6.2 0 0 1 13.6 2h-3v13.2a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.6a5.7 5.7 0 1 0 4.8 5.6V9c1.5 1 3.2 1.6 5 1.6V7.2z" />
    </svg>
  );
}

function PoshmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.3 12.4H11V18H8.6V7.8H13c2.3 0 3.9 1.4 3.9 3.3s-1.6 3.3-3.6 3.3zm-.2-4.7H11v2.8h2c1.1 0 1.8-.6 1.8-1.4s-.7-1.4-1.7-1.4z" />
    </svg>
  );
}

const socials = [
  { name: 'Instagram', href: 'https://www.instagram.com/', Icon: Instagram },
  { name: 'Facebook', href: 'https://www.facebook.com/', Icon: Facebook },
  { name: 'TikTok', href: 'https://www.tiktok.com/', Icon: TikTokIcon },
  { name: 'Poshmark', href: 'https://poshmark.com/', Icon: PoshmarkIcon },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="eyebrow mb-4">Let's talk</span>
          <h1 className="font-display text-6xl md:text-7xl font-medium text-black mt-3 leading-[1.05]">
            <span className="italic text-bfab-600">Contact</span> Us
          </h1>
          <p className="text-black/65 mt-5 text-lg font-light max-w-lg mx-auto">
            Questions, styling help, or just saying hi — we would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 max-w-6xl mx-auto">
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold tracking-[0.2em] uppercase text-black mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-base"
                  placeholder="Your name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold tracking-[0.2em] uppercase text-black mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-base"
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold tracking-[0.2em] uppercase text-black mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-base"
                    placeholder="(optional)"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold tracking-[0.2em] uppercase text-black mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={7}
                  className="input-base resize-none"
                  placeholder="Tell us how we can help you…"
                />
              </div>

              <button type="submit" className="btn-primary">
                <Send className="w-4 h-4" />
                {submitted ? 'Message Sent' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-black/5 bg-bfab-50/60 p-8 space-y-6">
              <div>
                <h2 className="font-display text-2xl text-black mb-1">Say hello</h2>
                <p className="text-sm text-black/60">
                  We usually reply within 24–48 hours.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <a
                  href="mailto:shopbfabllc@gmail.com"
                  className="flex items-center gap-3 text-black hover:text-bfab-600 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center group-hover:bg-bfab-600 group-hover:border-bfab-600 transition-colors">
                    <Mail className="w-4 h-4 text-bfab-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="break-all">shopbfabllc@gmail.com</span>
                </a>

                <a
                  href="tel:+14692976359"
                  className="flex items-center gap-3 text-black hover:text-bfab-600 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center group-hover:bg-bfab-600 group-hover:border-bfab-600 transition-colors">
                    <Phone className="w-4 h-4 text-bfab-600 group-hover:text-white transition-colors" />
                  </div>
                  <span>(469) 297-6359</span>
                </a>

                <div className="flex items-start gap-3 text-black/70">
                  <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-bfab-600" />
                  </div>
                  <div>
                    <p className="text-black">Desoto, Texas</p>
                    <p className="text-xs">Online boutique — shipping nationwide</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-black/5">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-black mb-3">
                  Follow Along
                </p>
                <div className="flex items-center gap-2">
                  {socials.map(({ name, href, Icon }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      className="w-10 h-10 rounded-full border border-black/10 text-bfab-600 hover:bg-bfab-600 hover:border-bfab-600 hover:text-white transition-colors flex items-center justify-center"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
