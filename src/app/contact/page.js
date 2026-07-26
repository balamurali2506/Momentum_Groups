'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function ContactPage() {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    subject: '', 
    message: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send message' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-[#F9F3E7] to-amber-50 dark:from-stone-900 dark:via-black dark:to-stone-900 transition-colors">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side - Contact Info */}
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full border border-amber-200 dark:border-amber-800 mb-6">
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-400">We're here to help</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-extrabold text-stone-900 dark:text-white mb-4 leading-tight">
                Let's Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600">Touch</span>
              </h1>
              <p className="text-xl text-stone-600 dark:text-stone-400">
                Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <a href="mailto:momentumgroups2506@gmail.com" className="group flex items-center gap-4 p-5 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl rounded-2xl border border-stone-200 dark:border-[#2d2d2d] hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Email Us</p>
                  <p className="text-stone-900 dark:text-white font-bold text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">hello@momentum.com</p>
                </div>
                <svg className="w-6 h-6 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>

              {/* Phone */}
              <a href="tel:+919790443502" className="group flex items-center gap-4 p-5 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl rounded-2xl border border-stone-200 dark:border-[#2d2d2d] hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Call Us</p>
                  <p className="text-stone-900 dark:text-white font-bold text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">+91 9790443502</p>
                </div>
                <svg className="w-6 h-6 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            </div>

            {/* Social Media */}
            <div className="pt-8 border-t border-stone-200 dark:border-[#2d2d2d]">
              <p className="text-sm font-bold text-stone-900 dark:text-white mb-4 uppercase tracking-wider">Follow us on</p>
              <div className="flex gap-3">
                {['twitter', 'linkedin', 'instagram', 'youtube'].map((social) => (
                  <a
                    key={social}
                    href={`https://${social}.com/momentum`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white dark:bg-[#1e1e1e] rounded-xl border-2 border-stone-200 dark:border-[#2d2d2d] flex items-center justify-center hover:border-amber-500 dark:hover:border-amber-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <span className="sr-only">{social}</span>
                    {social === 'twitter' && <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>}
                    {social === 'linkedin' && <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>}
                    {social === 'instagram' && <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" strokeWidth="2" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" /></svg>}
                    {social === 'youtube' && <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" /></svg>}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-2xl rounded-3xl border border-stone-200 dark:border-[#2d2d2d] p-8 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-6">Send us a Message</h2>
            
            {message && (
              <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
              }`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {message.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400 ${
                      errors.name ? 'border-red-500' : 'border-stone-200 dark:border-[#3d3d3d]'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400 ${
                      errors.email ? 'border-red-500' : 'border-stone-200 dark:border-[#3d3d3d]'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400"
                    placeholder="+91 XXX XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400"
                    placeholder="How can we help?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className={`w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400 resize-none ${
                    errors.message ? 'border-red-500' : 'border-stone-200 dark:border-[#3d3d3d]'
                  }`}
                  placeholder="Tell us more about your inquiry..."
                />
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
                By submitting this form, you agree to our{' '}
                <a href="/privacy" className="text-amber-600 dark:text-amber-400 hover:underline font-semibold">
                  Privacy Policy
                </a>
                . We respect your privacy and will never share your information.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}