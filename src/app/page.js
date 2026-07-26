'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// Intersection Observer Hook for scroll animations
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView();

  useEffect(() => {
    if (!isInView) return;
    
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// 🔥 Extracted Course Card Component to obey Rules of Hooks
function CourseCard({ course, index }) {
  const courseRef = useRef(null);
  const [courseInView, setCourseInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setCourseInView(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });

    if (courseRef.current) observer.observe(courseRef.current);
    return () => observer.disconnect();
  }, []);

  const courseId = course._id || course.id;
  const rating = course.rating || 0;
  const reviewCount = course.reviewCount || 0;

  return (
    <Link
      href={`/courses/${courseId}`}
      ref={courseRef}
      className={`group bg-white dark:bg-[#1e1e1e] rounded-3xl overflow-hidden border border-stone-200 dark:border-[#2d2d2d] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ${courseInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.thumbnail || '/images/placeholder-course.png'} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 dark:bg-black/90 backdrop-blur rounded-full text-xs font-bold text-stone-900 dark:text-white">
            {course.category || 'Course'}
          </span>
        </div>
        
        {rating > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-amber-500 rounded-full shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-xs font-bold">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-stone-600 dark:text-stone-400 text-sm mb-4">
          by {course.instructor || 'Expert Instructor'}
        </p>
        
        {rating > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star} 
                  className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-amber-500' : 'text-stone-300 dark:text-stone-600'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              ({reviewCount} reviews)
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-[#2d2d2d]">
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            ₹{course.price || 0}
          </span>
          <span className="text-sm font-semibold text-stone-600 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
            Enroll Now
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

// Popular Courses Component
function PopularCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        const sortedCourses = (data.courses || []).sort((a, b) => {
          if (a.rating && b.rating) return b.rating - a.rating;
          if (a.rating && !b.rating) return -1;
          if (!a.rating && b.rating) return 1;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        
        setCourses(sortedCourses.slice(0, 6));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load courses:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-3xl overflow-hidden border border-stone-200 dark:border-[#2d2d2d] animate-pulse">
            <div className="h-48 bg-stone-200 dark:bg-[#2d2d2d]"></div>
            <div className="p-6 space-y-3">
              <div className="h-6 bg-stone-200 dark:bg-[#2d2d2d] rounded w-3/4"></div>
              <div className="h-4 bg-stone-200 dark:bg-[#2d2d2d] rounded w-1/2"></div>
              <div className="flex justify-between pt-4">
                <div className="h-8 bg-stone-200 dark:bg-[#2d2d2d] rounded w-20"></div>
                <div className="h-8 bg-stone-200 dark:bg-[#2d2d2d] rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d]">
        <div className="w-20 h-20 bg-stone-100 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">No courses available yet</h3>
        <p className="text-stone-600 dark:text-stone-400 mb-6">Check back soon as we add more courses to our platform!</p>
        <Link href="/courses" className="inline-block px-6 py-3 bg-stone-900 dark:bg-amber-600 text-white rounded-xl font-semibold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all">
          Browse All Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course, i) => (
        <CourseCard key={course._id || course.id} course={course} index={i} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features = [
    {
      title: 'Expert-Led Courses',
      desc: 'Learn from industry professionals with years of real-world experience.',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />,
      color: 'from-amber-500 to-amber-700'
    },
    {
      title: 'Lifetime Access',
      desc: 'Pay once, learn forever. Get unlimited access to all course materials.',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      color: 'from-stone-700 to-stone-900'
    },
    {
      title: 'Verified Certificates',
      desc: 'Earn recognized certificates to boost your resume and career.',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
      color: 'from-amber-600 to-amber-800'
    },
    {
      title: 'Flexible Learning',
      desc: 'Study at your own pace, anytime, anywhere, on any device.',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />,
      color: 'from-stone-600 to-stone-800'
    }
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Software Developer', text: 'Momentum transformed my career. The courses are practical and the mentors are incredible!', avatar: 'P' },
    { name: 'Rahul Verma', role: 'UX Designer', text: 'Best investment I ever made. The certificate helped me land my dream job.', avatar: 'R' },
    { name: 'Ananya Patel', role: 'Marketing Manager', text: 'Flexible learning at its best. I completed the course while working full-time.', avatar: 'A' }
  ];

  return (
    <div className="min-h-screen bg-[#F9F3E7] dark:bg-black transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div 
          className="absolute top-20 left-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
        ></div>
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s', transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)` }}
        ></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full border border-amber-200 dark:border-amber-800 animate-fade-in-up">
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-400">New courses added weekly</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-stone-900 dark:text-white leading-tight">
                <span className="block animate-fade-in-up">Master New</span>
                <span className="block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Skills with{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600">
                      Momentum
                    </span>
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-amber-400/30 -z-0 animate-scale-x"></span>
                  </span>
                </span>
              </h1>

              <p className="text-xl text-stone-600 dark:text-stone-400 leading-relaxed max-w-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Join thousands of learners advancing their careers with expert-led courses, hands-on projects, and verified certificates.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <Link href="/courses" className="group px-8 py-4 bg-stone-900 dark:bg-amber-600 text-[#F9F3E7] dark:text-white rounded-2xl font-bold text-lg hover:bg-stone-800 dark:hover:bg-amber-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                  Explore Courses
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/about" className="px-8 py-4 bg-white dark:bg-stone-800 text-stone-900 dark:text-white border-2 border-stone-200 dark:border-stone-700 rounded-2xl font-bold text-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-all hover:-translate-y-1">
                  Learn More
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <div className="flex -space-x-3">
                  {['A', 'B', 'C', 'D'].map((letter, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-[#F9F3E7] dark:border-black flex items-center justify-center text-white text-xs font-bold">
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                    <span className="font-bold text-stone-900 dark:text-white">4.9/5</span> from 2,000+ reviews
                  </p>
                </div>
              </div>
            </div>

            <div className="relative" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
              <div className="relative animate-float">
                <img 
                  src="/images/hero-learning.png" 
                  alt="Students learning online" 
                  className="rounded-3xl shadow-2xl w-full"
                />
                <div className="absolute -top-6 -left-6 bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 shadow-xl animate-bounce-slow border border-stone-200 dark:border-[#2d2d2d]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Course Completed</p>
                      <p className="font-bold text-stone-900 dark:text-white text-sm">React Mastery</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 shadow-xl animate-bounce-slow border border-stone-200 dark:border-[#2d2d2d]" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Learning Time</p>
                      <p className="font-bold text-stone-900 dark:text-white text-sm">42h this week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-16 px-4 bg-white dark:bg-[#1e1e1e] border-y border-stone-200 dark:border-[#2d2d2d]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 10000, suffix: '+', label: 'Active Students' },
              { value: 50, suffix: '+', label: 'Expert Courses' },
              { value: 94, suffix: '%', label: 'Completion Rate' },
              { value: 49, suffix: '/5', label: 'Average Rating', displayAs: '4.9' }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {stat.displayAs ? (
                    <span>{stat.displayAs}{stat.suffix}</span>
                  ) : (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  )}
                </p>
                <p className="text-stone-600 dark:text-stone-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-sm font-bold mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white mb-4">
              Everything You Need to <span className="text-amber-600">Succeed</span>
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              We provide the tools, resources, and support to help you achieve your learning goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const { ref, isInView } = useInView();
              return (
                <div
                  key={i}
                  ref={ref}
                  className={`group bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 border border-stone-200 dark:border-[#2d2d2d] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - SPLIT SECTION */}
      <section className="py-24 px-4 bg-white dark:bg-[#1e1e1e]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="/images/brain-network.png" 
                alt="Smart learning" 
                className="rounded-3xl shadow-2xl w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/20 to-transparent rounded-3xl"></div>
            </div>

            <div className="space-y-6">
              <span className="inline-block px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-sm font-bold">
                SMART LEARNING
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white leading-tight">
                Learn Smarter, <span className="text-amber-600">Not Harder</span>
              </h2>
              <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
                Our AI-powered platform adapts to your learning style, helping you retain information better and achieve your goals faster.
              </p>

              <div className="space-y-4">
                {[
                  { title: 'Personalized Learning Paths', desc: 'Courses tailored to your skill level and goals' },
                  { title: 'Progress Tracking', desc: 'Detailed analytics on your learning journey' },
                  { title: 'Interactive Assessments', desc: 'Test your knowledge with real-world projects' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 transition-colors">
                      <svg className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 dark:text-white mb-1">{item.title}</h3>
                      <p className="text-stone-600 dark:text-stone-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR COURSES */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="inline-block px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-sm font-bold mb-4">
                POPULAR COURSES
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white">
                Start Learning <span className="text-amber-600">Today</span>
              </h2>
            </div>
            <Link href="/courses" className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-2">
              View All Courses
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <PopularCourses />
        </div>
      </section>

      {/* MENTOR SECTION */}
      <section className="py-24 px-4 bg-white dark:bg-[#1e1e1e]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <span className="inline-block px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-sm font-bold">
                EXPERT MENTORS
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white leading-tight">
                Learn from the <span className="text-amber-600">Best</span>
              </h2>
              <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
                Our mentors are industry leaders with years of experience. Get personalized guidance and real-world insights that you won't find in textbooks.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="bg-[#F9F3E7] dark:bg-[#2d2d2d] rounded-2xl p-6">
                  <p className="text-3xl font-bold text-amber-600 mb-1">50+</p>
                  <p className="text-stone-600 dark:text-stone-400 text-sm">Expert Mentors</p>
                </div>
                <div className="bg-[#F9F3E7] dark:bg-[#2d2d2d] rounded-2xl p-6">
                  <p className="text-3xl font-bold text-amber-600 mb-1">10k+</p>
                  <p className="text-stone-600 dark:text-stone-400 text-sm">Students Mentored</p>
                </div>
              </div>

              <Link href="/mentors" className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 dark:bg-amber-600 text-[#F9F3E7] dark:text-white rounded-2xl font-bold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                Meet Our Mentors
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            <div className="order-1 lg:order-2 relative">
              <img 
                src="/images/mentor-teaching.png" 
                alt="Mentor teaching online" 
                className="rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-sm font-bold mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white mb-4">
              What Our <span className="text-amber-600">Students</span> Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => {
              const { ref, isInView } = useInView();
              return (
                <div
                  key={i}
                  ref={ref}
                  className={`bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 border border-stone-200 dark:border-[#2d2d2d] hover:shadow-xl transition-all duration-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="flex items-center gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-stone-600 dark:text-stone-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 dark:from-[#1e1e1e] dark:to-[#2d2d2d] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-stone-300 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are already upgrading their skills and advancing their careers with Momentum.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  Get Started Free
                </Link>
                <Link href="/courses" className="px-8 py-4 bg-white/10 backdrop-blur text-white border-2 border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-900 dark:bg-black text-white py-16 px-4 border-t border-stone-800 dark:border-[#2d2d2d]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl" style={{ fontFamily: "'MedievalSharp', cursive" }}>M</span>
                </div>
                <span className="text-xl font-bold" style={{ fontFamily: "'MedievalSharp', cursive" }}>Momentum</span>
              </div>
              <p className="text-stone-400 text-sm">Empowering minds, building futures through quality education.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><Link href="/courses" className="hover:text-amber-400 transition-colors">Courses</Link></li>
                <li><Link href="/mentors" className="hover:text-amber-400 transition-colors">Mentors</Link></li>
                </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><Link href="/about" className="hover:text-amber-400 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 dark:border-[#2d2d2d] text-center text-sm text-stone-400">
            © 2024 Momentum Learning. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}