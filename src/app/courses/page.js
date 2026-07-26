'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function CoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['all', 'Programming', 'Marketing', 'Design', 'Business'];
  
  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Free', value: '0-0' },
    { label: '$0 - $50', value: '0-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100+', value: '100-99999' }
  ];

  const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Most Popular', value: 'popular' }
  ];

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setFilteredCourses(data.courses || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setLoading(false);
      });
  }, []);

  // Fetch user's wishlist
  useEffect(() => {
    if (session?.user) {
      fetch('/api/wishlist')
        .then(res => res.json())
        .then(data => {
          const ids = (data.wishlist || []).map(item => item.courseId._id || item.courseId.id);
          setWishlistIds(ids);
        })
        .catch(err => console.error('Failed to fetch wishlist:', err));
    }
  }, [session]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, priceRange, sortBy, courses]);

  const applyFilters = () => {
    let filtered = [...courses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tutorName.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(course => course.price >= min && course.price <= max);
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredCourses(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('newest');
  };

  const handleToggleWishlist = async (courseId) => {
    if (!session?.user) {
      alert('Please log in to add courses to your wishlist');
      return;
    }

    const isInWishlist = wishlistIds.includes(courseId);

    try {
      if (isInWishlist) {
        const res = await fetch(`/api/wishlist?courseId=${courseId}`, { method: 'DELETE' });
        if (res.ok) {
          setWishlistIds(wishlistIds.filter(id => id !== courseId));
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId })
        });
        if (res.ok) {
          setWishlistIds([...wishlistIds, courseId]);
        }
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F3E7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'', cursive" }}>
            Explore Courses
          </h1>
          <p className="text-stone-600 text-lg">
            Discover world-class courses taught by industry experts
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm p-6 mb-8">
          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by title, topic, or tutor..."
              className="w-full px-5 py-4 pl-12 bg-[#F9F3E7]/60 border-2 border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all text-stone-900 placeholder-stone-400"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9F3E7]/60 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9F3E7]/60 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9F3E7]/60 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-stone-200">
            <p className="text-sm text-stone-600">
              Showing <span className="font-bold text-stone-900">{filteredCourses.length}</span> of <span className="font-bold text-stone-900">{courses.length}</span> courses
            </p>
            {(searchQuery || selectedCategory !== 'all' || priceRange !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 p-16 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">No courses found</h2>
            <p className="text-stone-600 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-stone-900 text-[#F9F3E7] rounded-xl font-bold hover:bg-stone-800 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              // Safely get the ID (handles both _id and id formats)
              const courseId = course._id || course.id;
              const isInWishlist = wishlistIds.includes(courseId);
              
              return (
                <div
                  key={courseId} 
                  className="group bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail Area */}
                  <div className="relative h-48 overflow-hidden bg-stone-100">
                    {/* Image is clickable */}
                    <Link href={`/courses/${courseId}`} className="block w-full h-full">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-stone-900/90 backdrop-blur text-[#F9F3E7] text-xs font-bold rounded-full">
                        {course.category}
                      </span>
                    </div>
                    
                    {/* Wishlist Button - Completely isolated from the Link above */}
                    {session?.user && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleWishlist(courseId);
                        }}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg z-10"
                        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <svg 
                          className={`w-5 h-5 transition-colors ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-stone-600'}`} 
                          fill={isInWishlist ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Content Area - Wrapped in a single Link for the whole text block */}
                  <Link href={`/courses/${courseId}`} className="block p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-stone-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {course.title}
                    </h3>
                    
                    <p className="text-stone-600 text-sm mb-4 line-clamp-2 flex-1">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {course.tutorName?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm text-stone-600">{course.tutorName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {course.modules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0) || 0} lessons
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-amber-700">
                        ₹{course.price}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}