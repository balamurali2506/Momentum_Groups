'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/wishlist')
        .then(res => res.json())
        .then(data => {
          setWishlist(data.wishlist || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load wishlist:', err);
          setLoading(false);
        });
    }
  }, [session, status, router]);

  const handleRemoveFromWishlist = async (courseId) => {
    try {
      const res = await fetch(`/api/wishlist?courseId=${courseId}`, { method: 'DELETE' });
      if (res.ok) {
        setWishlist(wishlist.filter(item => item.courseId._id !== courseId));
      }
    } catch (err) {
      console.error('Failed to remove from wishlist');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F9F3E7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F3E7]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'MedievalSharp', cursive" }}>
            My Wishlist
          </h1>
          <p className="text-stone-600 text-lg">
            Courses you've saved for later
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 p-16 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Your wishlist is empty</h2>
            <p className="text-stone-600 mb-8 max-w-md mx-auto">
              Browse courses and click the heart icon to save them for later
            </p>
            <Link href="/courses" className="inline-block px-8 py-3 bg-stone-900 text-[#F9F3E7] rounded-xl font-bold hover:bg-stone-800 transition shadow-lg">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item._id} className="group bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Link href={`/courses/${item.courseId._id}`} className="relative h-48 overflow-hidden bg-stone-100 block">
                  <img 
                    src={item.courseId.thumbnail} 
                    alt={item.courseId.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-stone-900/90 backdrop-blur text-[#F9F3E7] text-xs font-bold rounded-full">
                      {item.courseId.category}
                    </span>
                  </div>
                </Link>
                
                <div className="p-5">
                  <Link href={`/courses/${item.courseId._id}`} className="block mb-3">
                    <h3 className="font-bold text-lg text-stone-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {item.courseId.title}
                    </h3>
                  </Link>
                  
                  <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                    {item.courseId.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {item.courseId.tutorName.charAt(0)}
                      </div>
                      <span className="text-sm text-stone-600">{item.courseId.tutorName}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                    <div className="text-2xl font-bold text-amber-700">
                      ${item.courseId.price}
                    </div>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.courseId._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}