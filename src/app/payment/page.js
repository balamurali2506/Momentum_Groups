'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const courseId = searchParams.get('courseId');
  
  const [course, setCourse] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/payment?courseId=${courseId}`);
      return;
    }

    if (status === 'authenticated' && courseId) {
      Promise.all([
        fetch(`/api/courses/${courseId}`).then(async (r) => {
          if (!r.ok) throw new Error('Course not found');
          return r.json();
        }),
        fetch('/api/enrollments').then(async (r) => {
          if (!r.ok) throw new Error('Failed to fetch enrollments');
          return r.json();
        })
      ]).then(([courseData, enrollData]) => {
        setCourse(courseData.course);
        
        const isEnrolled = enrollData.enrollments?.some(e => 
          (e.courseId._id === courseId || e.courseId.id === courseId)
        );
        
        if (isEnrolled) {
          setAlreadyEnrolled(true);
          setTimeout(() => router.push(`/learn/${courseId}`), 2000);
        }
      }).catch((err) => {
        console.error('Error loading page:', err);
        router.push('/courses');
      });
    }
  }, [status, courseId, router]);

  const handlePayment = async () => {
    if (!course) return;
    setProcessing(true);

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: course.price,
          courseId: course._id || course.id,
          courseTitle: course.title
        })
      });

      if (!orderRes.ok) throw new Error('Failed to create payment order');
      const orderData = await orderRes.json();
      
      if (!orderData.success) throw new Error(orderData.error || 'Failed to create order');

      // 2. Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Momentum Learning',
          description: course.title,
          order_id: orderData.orderId,
          handler: async function (response) {
            // 3. Verify payment on backend
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  courseId: course._id || course.id
                })
              });

              const verifyData = await verifyRes.json();
              
              if (verifyData.success) {
                router.push(`/learn/${course._id || course.id}?payment=success`);
              } else {
                alert('Payment verification failed. Please contact support.');
                setProcessing(false);
              }
            } catch (err) {
              console.error('Verification error:', err);
              alert('Payment verification failed.');
              setProcessing(false);
            }
          },
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
          },
          theme: {
            color: '#d97706', // Matches your Amber-600 brand color
          },
          modal: {
            ondismiss: function() {
              setProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      
      script.onerror = () => {
        alert('Failed to load payment gateway. Please check your internet connection.');
        setProcessing(false);
      };
      
      document.body.appendChild(script);

    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (status === 'loading' || !course) {
    return (
      <div className="min-h-screen bg-[#F9F3E7] dark:bg-black flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  if (alreadyEnrolled) {
    return (
      <div className="min-h-screen bg-[#F9F3E7] dark:bg-black flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d] shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Already Enrolled!</h2>
          <p className="text-stone-600 dark:text-stone-400 mb-6">You have already purchased this course. Redirecting you...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-stone-200 border-t-amber-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F3E7] dark:bg-black transition-colors">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16 pt-28">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d] shadow-xl p-8">
              <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-6">Payment Details</h1>
              
              <div className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-4">
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-3">Terms and Conditions</h3>
                  <div className="text-sm text-stone-600 dark:text-stone-400 space-y-2 max-h-48 overflow-y-auto p-4 bg-white dark:bg-[#2d2d2d] rounded-xl border border-amber-200 dark:border-amber-800">
                    <p><strong>1. License to Use:</strong> Lifetime, non-transferable access for personal use only.</p>
                    <p><strong>2. Copyright:</strong> You may not share, distribute, or resell any course content.</p>
                    <p><strong>3. Account Security:</strong> You are responsible for your account credentials.</p>
                    <p><strong>4. Course Access:</strong> Lifetime access, including all future updates.</p>
                    <p><strong>5. Certificate:</strong> You will receive a certificate upon 100% completion.</p>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="text-green-800 dark:text-green-400 font-bold text-sm">Secure Payment via Razorpay</p>
                    <p className="text-green-600 dark:text-green-500 text-xs">Supports UPI, Cards, Netbanking, and Wallets</p>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-bold text-lg hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Opening Payment Gateway...
                    </>
                  ) : (
                    <>
                      Pay ₹ {course.price}.00
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d] shadow-xl p-6 sticky top-28">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="flex gap-4 mb-6 pb-6 border-b border-stone-200 dark:border-[#2d2d2d]">
                <img src={course.thumbnail} alt={course.title} className="w-20 h-16 object-cover rounded-lg" />
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-white text-sm mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-amber-700 dark:text-amber-400 font-bold">₹ {course.price}.00</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-stone-600 dark:text-stone-400 text-sm">
                  <span>Subtotal</span>
                  <span>₹ {course.price}.00</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400 text-sm">
                  <span>Tax (GST)</span>
                  <span>₹ 0.00</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-stone-900 dark:text-white pt-4 border-t-2 border-stone-200 dark:border-[#2d2d2d]">
                  <span>Total</span>
                  <span>₹ {course.price}.00</span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <p className="text-xs text-amber-800 dark:text-amber-400 font-medium text-center">
                  Secure payment powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}