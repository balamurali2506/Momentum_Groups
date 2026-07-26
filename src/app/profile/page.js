'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

// Professional SVG Icons (Zero Emojis)
const Icons = {
  Book: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Check: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Clock: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Flame: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
  Cap: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
  Trophy: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3h14M5 3a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2M5 3V2a2 2 0 012-2h10a2 2 0 012 2v1M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2" /></svg>,
  Lightning: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Chat: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Brain: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
};

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({ name: '', email: '', image: '', role: 'student' });
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, hoursLearned: 0, currentStreak: 0 });
  const [activityData, setActivityData] = useState([]);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isValidImage = formData.image && typeof formData.image === 'string' && formData.image.length > 5;
  const userInitial = (formData.name || formData.email || 'U').charAt(0).toUpperCase();

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;
      
      try {
        // 1. Fetch Profile Details
        const profileRes = await fetch('/api/users/me');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setFormData({
            name: profileData.user.name || '',
            email: profileData.user.email || '',
            image: profileData.user.image || '',
            role: profileData.user.role || 'student'
          });
        }

        // 2. Fetch Real Stats
        const statsRes = await fetch('/api/profile/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // 3. Fetch Weekly Activity
        const activityRes = await fetch('/api/profile/activity');
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivityData(activityData.activityData.map(item => item.hours));
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: objectUrl });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          image: formData.image 
        })
      });

      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();

      await update({
        ...session,
        user: { ...session.user, name: data.user.name, email: data.user.email, image: data.user.image }
      });

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!session || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F3E7] dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-white" style={{ fontFamily: "'MedievalSharp', cursive" }}>Profile Dashboard</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-2 text-lg">Track your progress, manage your details, and view your achievements.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 font-medium flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Profile Card & Edit Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d] p-6 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                {isValidImage ? (
                  <img src={formData.image} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-stone-100 dark:border-[#2d2d2d] shadow-md mx-auto" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-stone-100 dark:border-[#2d2d2d] shadow-md mx-auto">
                    {userInitial}
                  </div>
                )}
                <label className="absolute bottom-1 right-1 w-9 h-9 bg-amber-600 hover:bg-amber-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">{formData.name || 'Your Name'}</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">{formData.email}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  formData.role === 'admin' 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' 
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                }`}>
                  {formData.role === 'admin' ? 'Admin' : 'Student'}
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-bold rounded-full">Verified</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-[#2d2d2d] border border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-[#2d2d2d] border border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-stone-900 dark:text-white" />
                </div>
                <button type="submit" disabled={isSaving} className="w-full py-3 bg-stone-900 dark:bg-amber-600 text-white rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all shadow-lg disabled:opacity-50 mt-2">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Stats, Activity & Badges */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* REAL STATS GRID FROM DATABASE */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Enrolled', value: stats.enrolled, icon: Icons.Book, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
                { label: 'Completed', value: stats.completed, icon: Icons.Check, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
                { label: 'Hours Learned', value: `${stats.hoursLearned}h`, icon: Icons.Clock, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' },
                { label: 'Current Streak', value: `${stats.currentStreak} Days`, icon: Icons.Flame, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-stone-200 dark:border-[#2d2d2d] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* REAL ACTIVITY CHART FROM DATABASE */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Weekly Study Activity</h3>
                <span className="text-sm text-stone-500 dark:text-stone-400">Last 7 days</span>
              </div>
              <div className="h-48 w-full relative flex items-end justify-between gap-2 px-2">
                {activityData.length > 0 ? (
                  activityData.map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-stone-100 dark:bg-[#2d2d2d] rounded-t-lg relative h-40 flex items-end overflow-hidden">
                        <div 
                          className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all duration-500 group-hover:from-amber-500 group-hover:to-amber-300" 
                          style={{ height: `${Math.min(height, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                    </div>
                  ))
                ) : (
                  // Loading state
                  <div className="w-full h-40 bg-stone-100 dark:bg-[#2d2d2d] rounded-t-lg animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Achievements / Badges */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-6">Achievements & Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'First Steps', desc: 'Completed 1st course', icon: Icons.Cap, unlocked: true },
                  { name: 'Week Warrior', desc: '7-day learning streak', icon: Icons.Flame, unlocked: true },
                  { name: 'Top 10%', desc: 'Scored in top 10%', icon: Icons.Trophy, unlocked: false },
                  { name: 'Speed Learner', desc: 'Finished course in 3 days', icon: Icons.Lightning, unlocked: false },
                  { name: 'Social Butterfly', desc: 'Posted 5 reviews', icon: Icons.Chat, unlocked: false },
                  { name: 'Mastermind', desc: 'Completed 10 courses', icon: Icons.Brain, unlocked: false }
                ].map((badge, i) => (
                  <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${badge.unlocked ? 'bg-stone-50 dark:bg-[#2d2d2d] border-stone-200 dark:border-[#3d3d3d]' : 'bg-stone-50/50 dark:bg-[#1e1e1e] border-stone-100 dark:border-[#2d2d2d] opacity-50 grayscale'}`}>
                    <div className="text-stone-700 dark:text-stone-300">{badge.icon}</div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white text-sm">{badge.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}