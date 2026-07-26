'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    fetch('/api/mentors')
      .then(res => res.json())
      .then(data => setMentors(data.mentors || []))
      .catch(err => console.error('Failed to load mentors:', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F3E7] dark:bg-black transition-colors">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white mb-6 tracking-tight">
            Empowering Minds, <span className="text-amber-600">Building Futures</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
            Momentum is more than just a learning platform. We are a community dedicated to providing world-class education, practical skills, and verified certifications.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-4 mb-20">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 border border-stone-200 dark:border-[#2d2d2d] shadow-sm">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              To democratize access to high-quality education by providing affordable, industry-relevant courses taught by experienced professionals, enabling learners worldwide to achieve their career goals.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 border border-stone-200 dark:border-[#2d2d2d] shadow-sm">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              To become the world's most trusted and impactful online learning ecosystem, where curiosity meets opportunity, and every learner has the tools to shape their own future.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-6xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4 tracking-tight">Why Choose Momentum?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Expert Instructors', desc: 'Learn directly from industry leaders who bring real-world experience to every lesson.' },
            { title: 'Lifetime Access', desc: 'Pay once, learn forever. Get unlimited access to course materials and all future updates.' },
            { title: 'Verified Certificates', desc: 'Earn recognized certificates upon completion to boost your resume and LinkedIn profile.' }
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 border border-stone-200 dark:border-[#2d2d2d] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-stone-600 dark:text-stone-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 mb-24">
        <div className="bg-stone-900 dark:bg-[#1e1e1e] rounded-3xl p-8 md:p-12 border border-stone-800 dark:border-[#2d2d2d]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { label: 'Active Students', value: '10,000+' },
              { label: 'Expert-Led Courses', value: '50+' },
              { label: 'Completion Rate', value: '94%' }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl md:text-5xl font-bold text-amber-500 mb-2">{stat.value}</p>
                <p className="text-stone-300 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Mentors */}
      {mentors.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4 tracking-tight">Meet Our Expert Mentors</h2>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Learn from industry professionals who are passionate about teaching and sharing their knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.slice(0, 6).map((mentor) => (
              <div key={mentor._id} className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-stone-200 dark:border-[#2d2d2d] flex items-center gap-4">
                {mentor.image ? (
                  <img src={mentor.image} alt={mentor.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-stone-100 dark:border-[#2d2d2d]" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {mentor.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-stone-900 dark:text-white">{mentor.name}</h3>
                  <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold">{mentor.role}</p>
                  <p className="text-stone-500 dark:text-stone-400 text-xs mt-1 line-clamp-2">{mentor.bio}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/mentors" className="inline-block px-6 py-3 bg-stone-900 dark:bg-amber-600 text-white rounded-xl font-semibold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all">
              View All Mentors
            </Link>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-stone-900 dark:bg-[#1e1e1e] text-white py-20 px-4 border-t border-stone-800 dark:border-[#2d2d2d]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Ready to Start Your Journey?</h2>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already upgrading their skills and advancing their careers with Momentum.
          </p>
          <Link href="/courses" className="inline-block px-8 py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 transition-all shadow-lg hover:shadow-amber-600/20">
            Explore Our Courses
          </Link>
        </div>
      </div>
    </div>
  );
}