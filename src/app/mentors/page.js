'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useTheme } from '@/app/providers';

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    // 🔥 Safe fetch that prevents the "Unexpected token '<'" crash
    fetch('/api/mentors')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setMentors(data.mentors || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load mentors:', err);
        setMentors([]); // Fallback to empty array
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-inherit dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white mb-6 tracking-tight">
            Learn from <span className="text-amber-600">Industry Experts</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
            Our mentors are seasoned professionals with years of real-world experience, ready to guide you on your learning journey.
          </p>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        {mentors.length === 0 ? (
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d] p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-stone-100 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">No mentors added yet</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">Check back soon, or add mentors from the admin dashboard.</p>
            <Link href="/admin/mentors" className="inline-block px-6 py-3 bg-stone-900 dark:bg-amber-600 text-white rounded-xl font-semibold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all">
              Go to Admin
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mentors.map((mentor) => (
              <div 
                key={mentor._id} 
                className="group bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-100 dark:border-[#2d2d2d] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Avatar & Header */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative mb-4">
                    {mentor.image ? (
                      <img 
                        src={mentor.image} 
                        alt={mentor.name} 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#2d2d2d] shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-3xl font-bold shadow-md group-hover:scale-105 transition-transform duration-300">
                        {mentor.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white dark:border-[#1e1e1e] rounded-full"></div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-1">{mentor.name}</h3>
                  <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm mb-3">{mentor.role}</p>
                  
                  <span className="inline-block px-4 py-1.5 bg-stone-100 dark:bg-[#2d2d2d] text-stone-700 dark:text-stone-300 text-xs font-bold rounded-full uppercase tracking-wide">
                    {mentor.specialty}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-6 text-center flex-1">
                  {mentor.bio}
                </p>

                {/* Stats */}
                <div className="flex justify-center gap-8 pt-6 border-t border-stone-100 dark:border-[#2d2d2d] mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-stone-900 dark:text-white">{mentor.courses || 0}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">Courses</p>
                  </div>
                  <div className="w-px bg-stone-200 dark:bg-[#2d2d2d]"></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-stone-900 dark:text-white">{(mentor.students || 0).toLocaleString()}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">Students</p>
                  </div>
                </div>

                {/* Social Links */}
                {(mentor.socialLinks?.linkedin || mentor.socialLinks?.twitter || mentor.socialLinks?.website) && (
                  <div className="flex justify-center gap-3">
                    {mentor.socialLinks.linkedin && (
                      <a href={mentor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-50 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center text-stone-500 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </a>
                    )}
                    {mentor.socialLinks.twitter && (
                      <a href={mentor.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-50 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center text-stone-500 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                    )}
                    {mentor.socialLinks.website && (
                      <a href={mentor.socialLinks.website} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-50 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center text-stone-500 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-stone-900 dark:bg-black text-white py-20 px-4 border-t border-stone-800 dark:border-[#2d2d2d]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Want to Teach on Momentum?</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            Share your expertise with thousands of eager learners. Join our community of world-class instructors today.
          </p>
          <Link href="/contact" className="inline-block px-8 py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 transition-all shadow-lg hover:shadow-amber-600/20">
            Become a Mentor
          </Link>
        </div>
      </div>
    </div>
  );
}