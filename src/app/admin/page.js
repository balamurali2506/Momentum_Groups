'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session) {
      Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/courses').then(r => r.json()),
        fetch('/api/admin/students').then(r => r.json()),
        fetch('/api/admin/enrollments').then(r => r.json())
      ]).then(([statsData, coursesData, studentsData, enrollmentsData]) => {
        setStats(statsData);
        setCourses(coursesData.courses || []);
        setStudents(studentsData.students || []);
        setEnrollments(enrollmentsData.enrollments || []);
      }).catch(err => {
        setError('Failed to load dashboard data');
        console.error(err);
      });
    }
  }, [session, status, router]);

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This will also remove all enrollments.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses?id=${courseId}`, { method: 'DELETE' });
      if (res.ok) {
        setCourses(courses.filter(c => c._id !== courseId));
        alert('Course deleted successfully');
      }
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  if (status === 'loading' || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F3E7]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F3E7] p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <Link href="/" className="px-6 py-3 bg-stone-900 text-[#F9F3E7] rounded-xl font-bold hover:bg-stone-800 transition-all">Go Home</Link>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Courses', value: stats.totalCourses, color: 'from-amber-500 to-amber-700', change: '+12%' },
    { label: 'Total Students', value: stats.totalStudents, color: 'from-stone-700 to-stone-900', change: '+8%' },
    { label: 'Enrollments', value: stats.totalEnrollments, color: 'from-green-600 to-green-800', change: '+15%' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue}`, color: 'from-blue-600 to-blue-800', change: '+22%' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses' },
    { id: 'students', label: 'Students' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F3E7] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: ", cursive" }}>Admin Dashboard</h1>
            <p className="text-stone-600 mt-1">Welcome back, {session?.user?.name}</p>
          </div>
          <Link href="/admin/create" className="px-6 py-3 bg-stone-900 text-[#F9F3E7] rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create New Course
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-3xl p-6 text-white shadow-xl transform hover:-translate-y-1 transition-all duration-300`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">{stat.change}</span>
              </div>
              <p className="text-sm font-medium opacity-80 mb-1">{stat.label}</p>
              <p className="text-4xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm mb-8">
          <div className="flex border-b border-stone-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-amber-700 border-b-2 border-amber-700 bg-amber-50/50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-stone-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-stone-900 mb-4">Revenue Overview</h3>
                  <div className="flex items-end justify-between h-48 gap-2">
                    {[65, 45, 78, 52, 89, 67, 95].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all hover:from-amber-700 hover:to-amber-500"
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-xs text-stone-500">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Enrollments */}
                <div className="bg-stone-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-stone-900 mb-4">Recent Enrollments</h3>
                  <div className="space-y-3">
                    {enrollments.slice(0, 5).map((enrollment, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-bold">
                            {enrollment.userId?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900 text-sm">{enrollment.userId?.name || 'Unknown'}</p>
                            <p className="text-xs text-stone-500">{enrollment.courseId?.title || 'Unknown Course'}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-600">${enrollment.courseId?.price || 0}</span>
                      </div>
                    ))}
                    {enrollments.length === 0 && (
                      <p className="text-center text-stone-500 py-8">No enrollments yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Course</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Price</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Students</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Completion</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course._id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img src={course.thumbnail} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <p className="font-semibold text-stone-900">{course.title}</p>
                              <p className="text-xs text-stone-500">{course.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-stone-900">${course.price}</td>
                        <td className="py-4 px-4 text-stone-700">{course.enrollmentCount}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-stone-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                style={{ width: `${course.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-stone-600">{course.completionRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Link 
                              href={`/admin/edit/${course._id}`}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </Link>
                            <button 
                              onClick={() => handleDeleteCourse(course._id, course.title)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {courses.length === 0 && (
                  <p className="text-center text-stone-500 py-12">No courses yet. Create your first course!</p>
                )}
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Student</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Courses</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Completed</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student._id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center text-white font-bold">
                              {student.name?.charAt(0) || '?'}
                            </div>
                            <span className="font-semibold text-stone-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-stone-600">{student.email}</td>
                        <td className="py-4 px-4 text-stone-700">{student.courseCount}</td>
                        <td className="py-4 px-4 text-stone-700">{student.completedCount}</td>
                        <td className="py-4 px-4 text-stone-500 text-sm">{new Date(student.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {students.length === 0 && (
                  <p className="text-center text-stone-500 py-12">No students yet</p>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-stone-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-stone-900 mb-4">Top Performing Courses</h3>
                  <div className="space-y-4">
                    {courses
                      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
                      .slice(0, 5)
                      .map((course, i) => (
                        <div key={course._id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-amber-600">#{i + 1}</span>
                            <div>
                              <p className="font-semibold text-stone-900">{course.title}</p>
                              <p className="text-xs text-stone-500">{course.enrollmentCount} students</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-green-600">${course.price * course.enrollmentCount}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-stone-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-stone-900 mb-4">Platform Insights</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-stone-600">Average Course Price</span>
                      <span className="text-xl font-bold text-stone-900">
                        ${courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.price, 0) / courses.length) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-stone-600">Average Completion Rate</span>
                      <span className="text-xl font-bold text-stone-900">
                        {courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.completionRate, 0) / courses.length) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-stone-600">Revenue per Student</span>
                      <span className="text-xl font-bold text-stone-900">
                        ${stats.totalStudents > 0 ? Math.round(stats.totalRevenue / stats.totalStudents) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}