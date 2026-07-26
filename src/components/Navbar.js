'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/app/providers';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = '/';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔥 STRICT Avatar Validation
  const isValidImage = session?.user?.image && typeof session.user.image === 'string' && session.user.image.length > 5;
  const userInitial = (session?.user?.name || session?.user?.email || 'U').charAt(0).toUpperCase();

  // Reusable Avatar Component
  const Avatar = ({ size = 'w-11 h-11', textSize = 'text-lg' }) => (
    isValidImage ? (
      <img 
        src={session.user.image} 
        alt="Profile" 
        className={`${size} rounded-full object-cover border-2 border-white dark:border-stone-700 shadow-sm`} 
      />
    ) : (
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${textSize} border-2 border-white dark:border-stone-700 shadow-sm`}>
        {userInitial}
      </div>
    )
  );

  // 🔥 Conditional Dashboard Link based on Role
  const dashboardPath = session?.user?.role === 'admin' ? '/admin' : '/dashboard';
  const dashboardLabel = session?.user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard';

  return (
    <nav className="sticky top-4 z-50 w-[calc(100%-2rem)] mx-auto backdrop-blur-2xl bg-white/70 dark:bg-stone-900/70 border border-white/40 dark:border-stone-700/50 rounded-2xl shadow-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0 z-10">
            <div className="w-11 h-11 bg-stone-900 dark:bg-amber-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl" style={{ fontFamily: "'MedievalSharp', cursive" }}>M</span>
            </div>
            <span className="text-xl font-bold text-stone-900 dark:text-white hidden sm:block" style={{ fontFamily: "'MedievalSharp', cursive" }}>
              Momentum
            </span>
          </Link>
          
          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-8">
            <Link href="/" className="text-base font-semibold text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
            <Link href="/courses" className="text-base font-semibold text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Courses</Link>
            <Link href="/mentors" className="text-base font-semibold text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Mentors</Link>
            <Link href="/about" className="text-base font-semibold text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">About</Link>
          </div>

          {/* RIGHT: Auth Buttons OR Profile Dropdown */}
          <div className="hidden md:flex items-center gap-4 z-10">
            {session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 focus:outline-none group">
                  <Avatar />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-xl rounded-2xl border border-stone-200 dark:border-[#2d2d2d] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-stone-100 dark:border-[#2d2d2d] flex items-center gap-3">
                      <Avatar size="w-12 h-12" textSize="text-xl" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{session.user.name || 'User'}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{session.user.email}</p>
                      </div>
                    </div>
                    
                    {/* 🔥 Theme Toggle Inside Dropdown */}
                    <button 
                      onClick={toggleTheme} 
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#2d2d2d] transition-colors text-left"
                    >
                      {theme === 'dark' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                      )}
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    {/* 🔥 Conditional Dashboard Link */}
                    <Link href={dashboardPath} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#2d2d2d] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      {dashboardLabel}
                    </Link>
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#2d2d2d] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      View Profile
                    </Link>
                    
                    <div className="border-t border-stone-100 dark:border-[#2d2d2d] my-1"></div>
                    
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-base font-semibold text-stone-700 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Sign In</Link>
                <Link href="/signup" className="px-5 py-2.5 bg-stone-900 dark:bg-amber-600 text-white text-base font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-amber-700 transition-all shadow-md">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl px-4 pb-6 pt-2 z-50">
          <div className="flex flex-col gap-2">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 rounded-lg text-stone-700 dark:text-stone-200 font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">Home</Link>
            <Link href="/courses" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 rounded-lg text-stone-700 dark:text-stone-200 font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">Courses</Link>
            <Link href="/mentors" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 rounded-lg text-stone-700 dark:text-stone-200 font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">Mentors</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 rounded-lg text-stone-700 dark:text-stone-200 font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">About</Link>
            
            <div className="border-t border-stone-200 dark:border-stone-800 my-2"></div>

            {session?.user ? (
              <>
                <div className="px-4 py-3 flex items-center gap-3">
                  <Avatar size="w-10 h-10" textSize="text-base" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{session.user.name || 'User'}</p>
                    <p className="text-xs text-stone-500 truncate">{session.user.email}</p>
                  </div>
                </div>
                
                {/* 🔥 Mobile Theme Toggle */}
                <button 
                  onClick={() => { toggleTheme(); }} 
                  className="flex items-center gap-3 py-3 px-4 text-stone-700 dark:text-stone-200 font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors rounded-lg text-left"
                >
                  {theme === 'dark' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  )}
                  {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>

                {/* 🔥 Mobile Conditional Dashboard Link */}
                <Link href={dashboardPath} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 text-stone-700 dark:text-stone-200 font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  {dashboardLabel}
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 text-stone-700 dark:text-stone-200 font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  View Profile
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 py-3 px-4 text-left text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 px-4 font-semibold border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">Sign In</Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 px-4 font-semibold rounded-lg bg-stone-900 dark:bg-amber-600 text-white hover:bg-stone-800 dark:hover:bg-amber-700 transition-all">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}