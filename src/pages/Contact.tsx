import { useState } from 'react';
import { Instagram, Mail, MapPin, Send } from 'lucide-react';

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
            Questions, collabs, or just saying hi — we'd love to hear from you.
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
                  href="mailto:support@bfab.com"
                  className="flex items-center gap-3 text-black hover:text-bfab-600 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center group-hover:bg-bfab-600 group-hover:border-bfab-600 transition-colors">
                    <Mail className="w-4 h-4 text-bfab-600 group-hover:text-white transition-colors" />
                  </div>
                  <span>support@bfab.com</span>
                </a>

                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-black hover:text-bfab-600 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center group-hover:bg-bfab-600 group-hover:border-bfab-600 transition-colors">
                    <Instagram className="w-4 h-4 text-bfab-600 group-hover:text-white transition-colors" />
                  </div>
                  <span>@bfab</span>
                </a>

                <div className="flex items-start gap-3 text-black/70">
                  <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-bfab-600" />
                  </div>
                  <div>
                    <p className="text-black">Online Boutique</p>
                    <p className="text-xs">Serving customers nationwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
