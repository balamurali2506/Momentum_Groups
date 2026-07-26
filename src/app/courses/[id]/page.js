'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import CourseReviews from '@/components/CourseReviews';

export default function CourseDetailsPage() {
  // 🔥 ALL HOOKS MUST BE AT THE TOP LEVEL, BEFORE ANY 'if' OR 'return'
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (!courseId) return;

    // Fetch course details
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.course) {
          setCourse(data.course);
        } else {
          router.push('/courses');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch course:', err);
        setLoading(false);
      });

    // Fetch reviews
    fetch(`/api/reviews?courseId=${courseId}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      })
      .catch(err => console.error('Failed to fetch reviews:', err));
  }, [courseId, router]);

  // 🔥 EARLY RETURNS MUST BE AFTER ALL HOOKS
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F3E7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F9F3E7] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Course not found</h2>
          <Link href="/courses" className="px-6 py-3 bg-stone-900 text-[#F9F3E7] rounded-xl font-bold hover:bg-stone-800 transition-all">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const totalVideos = course.modules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0) || 0;
  const totalDuration = course.modules?.reduce((sum, m) => sum + m.videos?.reduce((vSum, v) => vSum + (v.duration || 0), 0), 0) || 0;

  // 🔥 THE MAIN RETURN STATEMENT
  return (
    <div className="min-h-screen bg-[#F9F3E7]">
      <Navbar />
      
      {/* Hero Header */}
      <div className="bg-stone-900 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-amber-700 rounded-md text-sm font-semibold">{course.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 max-w-4xl">{course.title}</h1>
          <p className="text-xl text-stone-300 mb-6 max-w-3xl">{course.description}</p>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold text-lg">{averageRating.toFixed(1)}</span>
              <div className="text-amber-400">
                {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
              </div>
              <span className="text-stone-400 underline">({totalReviews} ratings)</span>
            </div>
            <div>Created by <span className="text-amber-400 font-semibold underline">{course.tutorName}</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-stone-200/60 shadow-sm">
              <h2 className="text-2xl font-bold text-stone-900 mb-4">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {['Master the core concepts from scratch', 'Build real-world portfolio projects', 'Understand industry best practices', 'Get a verified certificate of completion'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-stone-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-2xl font-bold text-stone-900">Course Content</h2>
                <p className="text-stone-600 mt-1">{course.modules?.length || 0} modules • {totalVideos} lectures • {totalDuration} mins total length</p>
              </div>
              <div className="divide-y divide-stone-100">
                {course.modules?.map((mod, i) => (
                  <div key={i} className="p-6 hover:bg-stone-50/50 transition">
                    <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg> 
                      Module {i + 1}: {mod.title}
                    </h3>
                    <ul className="space-y-2 pl-6">
                      {mod.videos?.map((v, j) => (
                        <li key={j} className="flex items-center justify-between text-sm text-stone-600">
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{v.title}</span>
                          </div>
                          <span className="text-stone-400">{v.duration} min</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <CourseReviews courseId={courseId} initialReviews={reviews} averageRating={averageRating} totalReviews={totalReviews} />
          </div>

          {/* Right Column: Sticky Buy Box */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-stone-200/60 sticky top-24">
              <div className="text-4xl font-extrabold text-stone-900 mb-2">₹{course.price}</div>
              <div className="text-stone-500 line-through mb-6 text-lg">₹{Math.round(course.price * 1.5)}</div>
              
              {/* Check if user is enrolled (you can add this state logic if needed, for now it goes to checkout) */}
              <Link 
                href={`/checkout?courseId=${courseId}`} 
                className="block w-full py-3 bg-stone-900 text-[#F9F3E7] rounded-xl font-bold text-center hover:bg-stone-800 transition-all shadow-lg mb-3"
              >
                Enroll Now
              </Link>
              
              <div className="mt-6 pt-6 border-t border-stone-200 space-y-3 text-sm text-stone-600">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Full lifetime access
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                  Certificate of completion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}