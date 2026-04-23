import { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import AdSlot from '../components/AdSlot';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    const { error: dbErr } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (dbErr) {
      setError('Something went wrong. Please try again later.');
      return;
    }
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <SEOHead
        title="Contact Us — BiographyHub"
        description="Get in touch with the BiographyHub team. Send us a message for corrections, suggestions, press inquiries, or advertising questions."
      />

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-28 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Contact Us</h1>
          <p className="text-slate-300 text-lg">We'd love to hear from you. Send us a message and we'll respond promptly.</p>
        </div>
      </div>

      <AdSlot type="leaderboard" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Get in Touch</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Whether you have a correction to report, a biography suggestion, a press inquiry, or an advertising question, we want to hear from you.
              </p>
            </div>
            {[
              { icon: <Mail size={18} />, title: 'Email', value: 'contact@biographyhub.com' },
              { icon: <MapPin size={18} />, title: 'Location', value: 'Online — worldwide readership' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <div className="text-amber-500 flex-shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{item.title}</p>
                  <p className="text-slate-800 text-sm">{item.value}</p>
                </div>
              </div>
            ))}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
              <strong>Response time:</strong> We typically respond within 1–2 business days.
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle size={52} className="text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500 text-sm">Thank you for reaching out. We'll get back to you within 1–2 business days.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-amber-600 text-sm font-medium hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject *</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                    >
                      <option value="">Select a subject</option>
                      <option value="Biography Correction">Biography Correction</option>
                      <option value="Biography Suggestion">Biography Suggestion</option>
                      <option value="Press Inquiry">Press Inquiry</option>
                      <option value="Advertising">Advertising</option>
                      <option value="General Question">General Question</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Your message..."
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                    />
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
