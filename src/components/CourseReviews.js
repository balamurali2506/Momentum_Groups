'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function CourseReviews({ courseId, initialReviews, averageRating, totalReviews }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, rating, comment })
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Review submitted successfully!');
        setReviews([data.review, ...reviews]);
        setShowReviewForm(false);
        setComment('');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(reviews.filter(r => r._id !== reviewId));
      }
    } catch (err) {
      console.error('Failed to delete review');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-stone-200/60 shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Student Reviews</h2>
          <p className="text-stone-600 mt-1">
            {averageRating.toFixed(1)} average rating • {totalReviews} reviews
          </p>
        </div>
        {session && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl font-bold text-sm hover:bg-amber-200 transition-all"
          >
            Write a Review
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes('successfully') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
          <h3 className="text-lg font-bold text-stone-900 mb-4">Write Your Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-bold text-stone-700 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-3xl transition-colors"
                >
                  <span className={star <= (hoveredRating || rating) ? 'text-amber-500' : 'text-stone-300'}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-stone-700 mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows="4"
              maxLength="500"
              className="w-full px-4 py-3 bg-white border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all resize-none"
              placeholder="Share your experience with this course..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-stone-900 text-[#F9F3E7] rounded-xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-6 py-2 bg-stone-200 text-stone-700 rounded-xl font-bold hover:bg-stone-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-stone-500 py-8">No reviews yet. Be the first to review this course!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-stone-200 pb-6 last:border-0">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center text-white font-bold">
                      {review.userId?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">{review.userId?.name || 'Anonymous'}</p>
                      <p className="text-xs text-stone-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-amber-500 text-lg">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
                {session?.user?.id === review.userId?._id && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
              <p className="text-stone-700 leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}