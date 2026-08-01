'use client';

import { useEffect, useState, Suspense } from 'react'; // 🔥 1. Import Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

// 🔥 2. Move all logic into this separate component
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 🔥 Now it's safe to use this
  const { data: session, status } = useSession();
  const courseId = searchParams.get('courseId');
  
  const [course, setCourse] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/checkout?courseId=${courseId}`);
      return;
    }

    if (status === 'authenticated' && courseId) {
      fetch(`/api/courses/${courseId}`)
        .then(res => res.json())
        .then(data => setCourse(data.course))
        .catch(() => router.push('/courses'));
    }
  }, [status, courseId, router]);

  const handleProceedToPayment = () => {
    if (!agreedToTerms) {
      alert('Please agree to the Terms and Conditions to continue');
      return;
    }
    router.push(`/payment?courseId=${courseId}`);
  };

  if (status === 'loading' || !course) {
    return (
      <div className="min-h-screen bg-[#F9F3E7] dark:bg-black flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F3E7] dark:bg-black transition-colors">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 pt-28">
        <div className="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-[#2d2d2d] shadow-xl p-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-8">
            Complete Your Enrollment
          </h1>
          
          <div className="flex gap-6 mb-8 pb-8 border-b-2 border-stone-200 dark:border-[#2d2d2d]">
            <img src={course.thumbnail} alt={course.title} className="w-40 h-28 object-cover rounded-xl shadow-lg" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">{course.title}</h2>
              <p className="text-stone-600 dark:text-stone-400 text-sm mb-3">{course.instructor || 'Expert Instructor'}</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">₹{course.price}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">What's included:</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {['Full lifetime access', 'Access on mobile and TV', 'Certificate of completion', 'Downloadable resources', 'Lifetime updates', '30-day money-back guarantee'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-[#2d2d2d] rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Course price</span>
                <span>₹{course.price}.00</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Tax</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-stone-900 dark:text-white pt-4 border-t-2 border-stone-200 dark:border-[#3d3d3d]">
                <span>Total</span>
                <span>₹{course.price}.00</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-4">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-3">Terms and Conditions</h3>
              <div className="text-sm text-stone-600 dark:text-stone-400 space-y-2 max-h-48 overflow-y-auto p-4 bg-white dark:bg-[#1e1e1e] rounded-xl border border-amber-200 dark:border-amber-800">
                <p><strong>1. License to Use:</strong> Lifetime, non-transferable access for personal use only.</p>
                <p><strong>2. Copyright:</strong> You may not share, distribute, or resell any course content.</p>
                <p><strong>3. Account Security:</strong> You are responsible for your account credentials.</p>
                <p><strong>4. Course Access:</strong> Lifetime access, including all future updates.</p>
                <p><strong>5. Certificate:</strong> You will receive a certificate upon 100% completion.</p>
              </div>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-stone-700 dark:text-stone-300">
                I have read and agree to the <span className="font-bold text-amber-800 dark:text-amber-400">Terms and Conditions</span>.
              </span>
            </label>
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={!agreedToTerms || processing}
            className="w-full py-4 bg-gradient-to-r from-stone-900 to-stone-800 dark:from-amber-600 dark:to-amber-700 text-[#F9F3E7] dark:text-white rounded-xl font-bold text-lg hover:from-stone-800 hover:to-stone-700 dark:hover:from-amber-700 dark:hover:to-amber-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Proceed to Payment
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// 🔥 3. Wrap in Suspense in the main export
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9F3E7] dark:bg-black flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}