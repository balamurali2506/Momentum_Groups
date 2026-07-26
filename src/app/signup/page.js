'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading } = useAuth();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup(formData.name, formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#F9F3E7] dark:bg-black transition-colors duration-300">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="absolute top-6 left-6 flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors font-medium group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d] p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-2" style={{ fontFamily: ", cursive" }}>Create Account</h1>
            <p className="text-stone-600 dark:text-stone-400">Join Momentum and start learning today</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400"
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400"
                placeholder="Create a secure password"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-stone-900 dark:bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-stone-800 dark:hover:bg-amber-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200 dark:border-[#2d2d2d]"></div></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-[#1e1e1e] text-stone-500 dark:text-stone-400">Or sign up with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 bg-white dark:bg-[#2d2d2d] border border-stone-200 dark:border-[#3d3d3d] text-stone-700 dark:text-stone-200 rounded-xl font-bold text-base hover:bg-stone-50 dark:hover:bg-[#3d3d3d] transition-all shadow-sm flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-stone-600 dark:text-stone-400 mt-8 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}