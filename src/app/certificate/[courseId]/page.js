'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function CertificatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId;

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }

    if (user && courseId) {
      Promise.all([
        fetch(`/api/courses/${courseId}`).then(r => r.json()),
        fetch('/api/enrollments').then(r => r.json())
      ]).then(([courseData, enrollData]) => {
        setCourse(courseData.course);
        const userEnrollment = enrollData.enrollments?.find(e => e.courseId._id === courseId);
        setEnrollment(userEnrollment);
        setIsLoading(false);
      });
    }
  }, [user, courseId, authLoading, router]);

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9F3E7]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div></div>;
  }

  if (!enrollment || enrollment.progress !== 100) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F3E7] p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Certificate Locked</h2>
          <p className="text-stone-600 mb-6">You must complete 100% of this course to view the certificate.</p>
          <Link href="/dashboard" className="px-6 py-3 bg-stone-900 text-[#F9F3E7] rounded-xl font-bold hover:bg-stone-800 transition-all">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F3E7] flex flex-col items-center py-12 px-4">
      {/* Top Actions */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </Link>
        <button 
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-[#F9F3E7] rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download PDF
        </button>
      </div>

      {/* 🖨️ THE CERTIFICATE (Visible on screen AND print) */}
      <div className="w-full max-w-4xl bg-white border-[16px] border-double border-amber-700 p-12 text-center relative shadow-2xl">
        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-700"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-700"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-700"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-700"></div>

        <div className="mb-8">
          <span className="text-6xl" style={{ fontFamily: "'MedievalSharp', cursive" }}>M</span>
        </div>
        
        <h1 className="text-5xl font-bold text-stone-900 mb-2 uppercase tracking-widest" style={{ fontFamily: "'MedievalSharp', cursive" }}>
          Certificate of Completion
        </h1>
        <div className="w-32 h-1 bg-amber-600 mx-auto mb-8"></div>
        
        <p className="text-xl text-stone-600 mb-8">This is to certify that</p>
        
        <h2 className="text-4xl font-bold text-amber-800 mb-8 border-b-2 border-stone-200 inline-block pb-2 px-8" style={{ fontFamily: "'MedievalSharp', cursive" }}>
          {user?.name}
        </h2>
        
        <p className="text-xl text-stone-600 mb-2">has successfully completed the course</p>
        <h3 className="text-3xl font-bold text-stone-900 mb-8">{course.title}</h3>
        
        <div className="flex justify-between items-end mt-16 px-12">
          <div className="text-center">
            <div className="w-48 border-b-2 border-stone-400 mb-2 mx-auto"></div>
            <p className="text-sm text-stone-500 font-semibold uppercase tracking-wider">Date</p>
            <p className="text-stone-800 font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-sm text-stone-500 font-semibold uppercase tracking-wider">Momentum</p>
            <p className="text-stone-800 font-medium">Official Seal</p>
          </div>
        </div>
        
        <p className="text-xs text-stone-400 mt-12">Certificate ID: {course._id}-{user?._id}</p>
      </div>
    </div>
  );
}