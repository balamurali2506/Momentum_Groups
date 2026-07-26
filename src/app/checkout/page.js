'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      <div className="min-h-screen bg-[#F9F3E7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F3E7]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-8" style={{ fontFamily: "'MedievalSharp', cursive" }}>
            Complete Your Enrollment
          </h1>
          
          {/* Course Summary */}
          <div className="flex gap-6 mb-8 pb-8 border-b-2 border-stone-200">
            <img src={course.thumbnail} alt={course.title} className="w-40 h-28 object-cover rounded-xl shadow-lg" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">{course.title}</h2>
              <p className="text-stone-600 text-sm mb-3">{course.tutorName}</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-amber-700">${course.price}</span>
                <span className="text-stone-400 line-through">${Math.round(course.price * 1.5)}</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                  {Math.round((1 - course.price / (course.price * 1.5)) * 100)}% OFF
                </span>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-stone-900 mb-4">What's included:</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Full lifetime access',
                'Access on mobile and TV',
                'Certificate of completion',
                'Downloadable resources',
                'Lifetime updates',
                '30-day money-back guarantee'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-stone-700">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-stone-50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-stone-600">
                <span>Course price</span>
                <span>${course.price}.00</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-stone-900 pt-4 border-t-2 border-stone-200">
                <span>Total</span>
                <span>${course.price}.00</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-8">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-4">
              <h3 className="text-lg font-bold text-stone-900 mb-3">Terms and Conditions</h3>
              <div className="text-sm text-stone-600 space-y-2 max-h-48 overflow-y-auto p-4 bg-white rounded-xl border border-amber-200">
                <p><strong>1. License to Use:</strong> By purchasing this course, you are granted a lifetime, non-transferable license to access the course materials for personal use only.</p>
                <p><strong>2. Copyright:</strong> All course materials are copyrighted. You may not share, distribute, or resell any course content.</p>
                <p><strong>3. Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</p>
                <p><strong>4. Course Access:</strong> You will have lifetime access to the course, including all future updates.</p>
                <p><strong>5. Certificate:</strong> Upon completion, you will receive a certificate of completion.</p>
                <p><strong>6. Prohibited Use:</strong> You may not use the course materials for commercial purposes or create derivative works.</p>
              </div>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-stone-700">
                I have read and agree to the <span className="font-bold text-amber-800">Terms and Conditions</span> and <span className="font-bold text-amber-800">Privacy Policy</span>. I understand that I am purchasing a lifetime license to this course for personal use only.
              </span>
            </label>
          </div>

          {/* Proceed to Payment Button */}
          <button
            onClick={handleProceedToPayment}
            disabled={!agreedToTerms || processing}
            className="w-full py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-[#F9F3E7] rounded-xl font-bold text-lg hover:from-stone-800 hover:to-stone-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Proceed to Payment
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <p className="text-center text-xs text-stone-500 mt-4 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure payment processing. Your information is protected.
          </p>
        </div>
      </div>
    </div>
  );
}