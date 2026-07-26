'use client'; // 🔥 MUST be the first line

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useTheme } from '@/app/providers';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: session, status } = useSession(); // 🔥 'status', not 'sessionStatus'
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  
  const [isLoading, setIsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);

  // 🔥 Combine both auth sources to prevent redirect loops
  const currentUser = session?.user || user;
  const displayName = currentUser?.name || 'Learner';

  // 🔥 Auth Redirect Check
  useEffect(() => {
    // Use 'status' here, matching the destructured variable
    if (status !== 'loading' && !authLoading) {
      if (!currentUser) {
        router.push('/login');
      }
    }
  }, [currentUser, status, authLoading, router]);

  // 🔥 Fetch Enrollments Data
  useEffect(() => {
    // Safely get session_id
    const sessionId = searchParams ? searchParams.get('session_id') : null;
    
    if (sessionId && currentUser) {
      fetch(`/api/payments/verify?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            fetch('/api/enrollments')
              .then(res => res.json())
              .then(enrollData => {
                setEnrollments(enrollData.enrollments || []);
                setIsLoading(false);
              })
              .catch(() => setIsLoading(false));
          } else {
            setIsLoading(false);
          }
        })
        .catch(() => setIsLoading(false));
    } else if (currentUser) {
      fetch('/api/enrollments')
        .then(res => res.json())
        .then(data => {
          setEnrollments(data.enrollments || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [searchParams, currentUser]);

  // 🔥 Loading State (Removed hardcoded bg-[#F9F3E7] so theme works)
  if (status === 'loading' || authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-inherit dark:bg-black transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600 mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-stone-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // 🔥 Main Render (Removed hardcoded bg-[#F9F3E7] so ThemeBackground handles it)
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        
        {/* Payment Success Banner */}
        {searchParams && searchParams.get('success') === 'true' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold">Payment successful!</p>
              <p className="text-sm">Your course has been unlocked and added to your dashboard.</p>
            </div>
          </div>
        )}
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-white" style={{ fontFamily: "'MedievalSharp', cursive" }}>My Learning Dashboard</h1>
            <p className="text-stone-600 dark:text-stone-400 mt-1">Welcome back, {displayName}! Keep up the great work.</p>
          </div>
          <Link href="/courses" className="px-6 py-3 bg-stone-900 dark:bg-amber-600 text-[#F9F3E7] dark:text-white rounded-xl font-semibold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all shadow-md text-center flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Browse More Courses
          </Link>
        </div>

        {/* Empty State */}
        {enrollments.length === 0 ? (
          <div className="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl p-16 rounded-3xl text-center border border-stone-200/60 dark:border-[#2d2d2d] shadow-sm">
            <div className="w-20 h-20 bg-stone-100 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">No courses yet</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-md mx-auto">Start your learning journey today by exploring our premium courses!</p>
            <Link href="/courses" className="inline-block px-8 py-3 bg-stone-900 dark:bg-amber-600 text-[#F9F3E7] dark:text-white rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-amber-700 transition shadow-lg">
              Explore Courses
            </Link>
          </div>
        ) : (
          /* Enrolled Courses Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const courseId = enrollment.courseId._id || enrollment.courseId.id;
              const totalLessons = enrollment.courseId.modules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0) || 0;
              const completedLessons = enrollment.completedVideos?.length || 0;

              return (
                <div key={enrollment._id} className="group bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-stone-200/60 dark:border-[#2d2d2d] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  
                  {/* Thumbnail */}
                  <Link href={`/learn/${courseId}`} className="relative h-48 overflow-hidden bg-stone-100 dark:bg-[#2d2d2d] block">
                    <img 
                      src={enrollment.courseId.thumbnail} 
                      alt={enrollment.courseId.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                        enrollment.progress === 100 
                          ? 'bg-green-600 text-white' 
                          : 'bg-stone-900/90 dark:bg-amber-600/90 backdrop-blur text-[#F9F3E7]'
                      }`}>
                        {enrollment.progress}% Complete
                      </span>
                    </div>
                  </Link>
                  
                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <Link href={`/learn/${courseId}`} className="block mb-3">
                      <h3 className="font-bold text-lg text-stone-900 dark:text-white line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {enrollment.courseId.title}
                      </h3>
                    </Link>
                    
                    <div className="mt-auto space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400 mb-1.5">
                          <span className="font-medium">Progress</span>
                          <span className={`font-bold ${enrollment.progress === 100 ? 'text-green-600 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                            {enrollment.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-[#2d2d2d] rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                              enrollment.progress === 100 
                                ? 'bg-gradient-to-r from-green-600 to-green-500' 
                                : 'bg-gradient-to-r from-amber-700 to-amber-500'
                            }`} 
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Link 
                          href={`/learn/${courseId}`} 
                          className="flex-1 text-center py-2.5 bg-stone-900 dark:bg-amber-600 text-[#F9F3E7] dark:text-white rounded-xl text-sm font-bold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all flex items-center justify-center gap-1"
                        >
                          {enrollment.progress === 100 ? 'Review Course' : 'Continue Learning'}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                        
                        {enrollment.progress === 100 && (
                          <Link 
                            href={`/certificate/${courseId}`} 
                            className="flex-1 text-center py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl text-sm font-bold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                            Certificate
                          </Link>
                        )}
                      </div>
                      
                      {/* Lesson Count */}
                      <p className="text-xs text-stone-500 dark:text-stone-400 text-center pt-1 border-t border-stone-100 dark:border-[#2d2d2d]">
                        {completedLessons} of {totalLessons} lessons completed
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}