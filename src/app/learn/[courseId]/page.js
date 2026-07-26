'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { useSession } from 'next-auth/react';
import { pdf } from '@react-pdf/renderer'; // 🔥 Added for PDF generation
import CertificatePDF from '@/components/CertificatePDF'; // 🔥 Added PDF component

export default function CoursePlayerPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  
  // CRITICAL FIX: Handle both [courseId] and [id] folder naming conventions
  const courseId = params.courseId || params.id;

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Anti-skip tracking states
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const playerRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Fetch course and enrollment data
  useEffect(() => {
    const isLoggedIn = user || (status === 'authenticated' && session?.user);
    
    if (authLoading || status === 'loading') return;

    if (!isLoggedIn) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!courseId) {
      console.error("No courseId found in URL params:", params);
      router.push('/courses');
      return;
    }

    Promise.all([
      fetch(`/api/courses/${courseId}`).then(async (r) => {
        if (!r.ok) throw new Error(`Course API failed: ${r.status}`);
        return r.json();
      }),
      fetch('/api/enrollments').then(async (r) => {
        if (!r.ok) throw new Error(`Enrollments API failed: ${r.status}`);
        return r.json();
      })
    ]).then(([courseData, enrollData]) => {
      if (!courseData.course) {
        router.push('/courses');
        return;
      }

      setCourse(courseData.course);
      const userEnrollment = enrollData.enrollments?.find(e => e.courseId._id === courseId || e.courseId.id === courseId);
      
      if (!userEnrollment) {
        router.push(`/courses/${courseId}`);
      } else {
        setEnrollment(userEnrollment);
        
        let initialVideo = courseData.course.modules[0]?.videos[0];
        if (userEnrollment.lastWatchedVideo) {
          for (const mod of courseData.course.modules) {
            const found = mod.videos.find(v => v.title === userEnrollment.lastWatchedVideo);
            if (found) {
              initialVideo = found;
              break;
            }
          }
        }
        setActiveVideo(initialVideo);
      }
      setIsLoading(false);
    }).catch((err) => {
      console.error("Failed to load course data:", err);
      setIsLoading(false);
    });
  }, [user, session, status, courseId, authLoading, router]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // Initialize Player when activeVideo changes
  useEffect(() => {
    if (!activeVideo?.videoUrl) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: activeVideo.videoUrl,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          controls: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [activeVideo]);

  const startTracking = () => {
    if (!playerRef.current) return;
    lastTimeRef.current = playerRef.current.getCurrentTime();
    setShowSkipWarning(false);

    checkIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        if (currentTime > lastTimeRef.current + 3) {
          setShowSkipWarning(true);
        }
        lastTimeRef.current = currentTime;
      }
    }, 1000);
  };

  const stopTracking = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  };

  const onPlayerReady = (event) => {
    // Player is ready
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      startTracking();
    } else {
      stopTracking();
    }

    if (event.data === window.YT.PlayerState.ENDED) {
      if (showSkipWarning) {
        playerRef.current.seekTo(0);
        setShowSkipWarning(false);
      } else {
        handleToggleComplete();
      }
    }
  };

  const handleToggleComplete = async () => {
    if (!activeVideo || isUpdating) return;
    setIsUpdating(true);

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, videoTitle: activeVideo.title })
      });

      const data = await res.json();
      if (data.success) {
        setEnrollment(prev => ({
          ...prev,
          progress: data.progress,
          completedVideos: data.isCompleted 
            ? [...prev.completedVideos, activeVideo.title]
            : prev.completedVideos.filter(v => v !== activeVideo.title)
        }));
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // 🔥 PDF Download Function
  const downloadCertificate = async () => {
    try {
      const doc = (
        <CertificatePDF 
          userName={displayName} 
          courseTitle={course.title} 
          date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} 
        />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${course.title.replace(/\s+/g, '_')}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate certificate. Please try again.');
    }
  };

  const isVideoCompleted = enrollment?.completedVideos?.includes(activeVideo?.title);
  const isCourseCompleted = enrollment?.progress === 100;
  const displayName = session?.user?.name || user?.name || 'Student';

  if (authLoading || status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F3E7] dark:bg-black transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  if (!course || !enrollment) return null;

  return (
    <div className="min-h-screen bg-[#F9F3E7] dark:bg-black flex flex-col p-4 lg:p-6 gap-6 transition-colors">
      
      {/* Premium Floating Header */}
      <header className="bg-white/70 dark:bg-[#1e1e1e]/70 backdrop-blur-2xl border border-white/60 dark:border-[#2d2d2d] rounded-3xl px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition group">
            <div className="w-9 h-9 rounded-2xl border border-stone-200 dark:border-[#3d3d3d] flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white group-hover:border-stone-900 transition-all duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </div>
            <span className="text-sm font-bold hidden sm:block tracking-wide">Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-stone-300 dark:bg-[#3d3d3d] hidden sm:block"></div>
          <h1 className="font-bold text-stone-900 dark:text-white text-lg truncate max-w-xs sm:max-w-md">{course.title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest">Progress</div>
            <div className="text-sm font-extrabold text-amber-700 dark:text-amber-400">{enrollment.progress}%</div>
          </div>
          <div className="w-32 sm:w-48 bg-stone-200/60 dark:bg-[#2d2d2d] rounded-full h-3 p-0.5">
            <div 
              className="bg-gradient-to-r from-amber-600 to-amber-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(217,119,6,0.5)]" 
              style={{ width: `${enrollment.progress}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
        
        {/* Left: Video Player Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="w-full bg-stone-950 rounded-3xl overflow-hidden shadow-2xl shadow-stone-900/40 border border-stone-800 relative">
            <div className="aspect-video w-full relative bg-black">
              {activeVideo?.videoUrl ? (
                <>
                  <div id="youtube-player" className="absolute top-0 left-0 w-full h-full"></div>
                  
                  {showSkipWarning && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-600/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-red-400/50 animate-in fade-in slide-in-from-top-4">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <span className="font-bold text-sm">Skipping detected! Video restarted. Watch continuously to earn progress.</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-24 h-24 mb-6 bg-stone-800/50 backdrop-blur rounded-3xl flex items-center justify-center border border-stone-700">
                    <svg className="w-12 h-12 text-stone-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{activeVideo?.title || 'Select a Lesson'}</h2>
                  <p className="text-stone-400 max-w-md">Video URL missing. Add a YouTube ID to the database to enable playback.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-white/70 dark:bg-[#1e1e1e]/70 backdrop-blur-xl border border-white/60 dark:border-[#2d2d2d] rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-3">{activeVideo?.title || 'Course Overview'}</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-base">{course.description}</p>
          </div>

          {/* UNLOCKABLE CERTIFICATE SECTION (Strictly 100% Progress) */}
          {isCourseCompleted && (
            <div className="mt-6 bg-gradient-to-br from-amber-50 to-stone-50 dark:from-amber-900/20 dark:to-stone-900/20 border-2 border-amber-200/60 dark:border-amber-800/60 rounded-3xl p-8 sm:p-10 text-center shadow-lg">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Course Completed!</h3>
              <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-lg mx-auto">
                You have successfully watched all content in <strong>{course.title}</strong> without skipping. You are now eligible to download your official certificate.
              </p>
              <button 
                onClick={downloadCertificate}
                className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 dark:bg-amber-600 text-[#F9F3E7] dark:text-white rounded-2xl font-bold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Certificate (PDF)
              </button>
            </div>
          )}
        </div>

        {/* Right: Sidebar Curriculum */}
        <aside className="w-full lg:w-[400px] bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-2xl border border-white/60 dark:border-[#2d2d2d] rounded-3xl shadow-xl flex flex-col overflow-hidden h-[50vh] lg:h-auto">
          <div className="p-6 border-b border-stone-100 dark:border-[#2d2d2d] sticky top-0 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-xl z-10">
            <h3 className="font-bold text-lg text-stone-900 dark:text-white tracking-tight">Course Content</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">{course.modules?.length} modules - {enrollment.progress}% complete</p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {course.modules?.map((module, mIndex) => (
              <div key={mIndex} className="bg-stone-50/80 dark:bg-[#2d2d2d]/50 rounded-2xl border border-stone-100 dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-4 font-bold text-xs text-stone-500 dark:text-stone-400 uppercase tracking-widest border-b border-stone-100/50 dark:border-[#3d3d3d]/50">
                  Module {mIndex + 1}
                  <span className="block text-stone-800 dark:text-stone-200 normal-case tracking-normal mt-1 text-sm">{module.title}</span>
                </div>
                <div className="divide-y divide-stone-100/50 dark:divide-[#3d3d3d]/50">
                  {module.videos?.map((video, vIndex) => {
                    const isActive = activeVideo?.title === video.title;
                    const isCompleted = enrollment?.completedVideos?.includes(video.title);
                    
                    return (
                      <button
                        key={vIndex}
                        onClick={() => {
                          setActiveVideo(video);
                          setShowSkipWarning(false);
                          // Optional: Save last watched video
                        }}
                        className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-all duration-200 ${
                          isActive ? 'bg-amber-50/80 dark:bg-amber-900/20' : 'hover:bg-stone-100/50 dark:hover:bg-[#3d3d3d]/50'
                        }`}
                      >
                        <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/30' 
                            : isActive 
                              ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-500 text-amber-600 dark:text-amber-400' 
                              : 'border-stone-300 dark:border-[#4d4d4d] text-transparent'
                        }`}>
                          {isCompleted && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-snug truncate ${isActive ? 'text-amber-900 dark:text-amber-400' : 'text-stone-700 dark:text-stone-300'}`}>
                            {vIndex + 1}. {video.title}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 flex items-center gap-1.5 font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {video.duration} min
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}