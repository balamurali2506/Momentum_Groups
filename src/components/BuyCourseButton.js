'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyCourseButton({ courseId, price }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, price })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      
      // Stripe's new recommended way: just redirect to the session URL!
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
      
    } catch (err) {
      alert(err.message);
      setLoading(false);
      // If unauthorized, redirect to login
      if (err.message === 'Unauthorized') {
        router.push('/login');
      }
    }
  };

  return (
    <button 
      onClick={handleCheckout}
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
    >
      {loading ? 'Redirecting to Stripe...' : 'Buy Now'}
    </button>
  );
}