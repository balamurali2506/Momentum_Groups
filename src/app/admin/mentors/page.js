'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function AdminMentorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    specialty: 'Programming',
    bio: '',
    image: '',
    courses: 0,
    students: 0,
    socialLinks: { linkedin: '', twitter: '', website: '' }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/mentors')
        .then(res => res.json())
        .then(data => {
          setMentors(data.mentors || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load mentors:', err);
          setLoading(false);
        });
    }
  }, [session, status, router]);

  const handleEdit = (mentor) => {
    setEditingMentor(mentor);
    setFormData({
      name: mentor.name,
      role: mentor.role,
      specialty: mentor.specialty,
      bio: mentor.bio,
      image: mentor.image || '',
      courses: mentor.courses || 0,
      students: mentor.students || 0,
      socialLinks: mentor.socialLinks || { linkedin: '', twitter: '', website: '' }
    });
    setShowForm(true);
  };

  const handleDelete = async (mentorId, mentorName) => {
    if (!confirm(`Are you sure you want to remove "${mentorName}"?`)) return;

    try {
      const res = await fetch(`/api/mentors?id=${mentorId}`, { method: 'DELETE' });
      if (res.ok) {
        setMentors(mentors.filter(m => m._id !== mentorId));
        setMessage('Mentor removed successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to remove mentor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const url = '/api/mentors';
      const method = editingMentor ? 'PUT' : 'POST';
      const body = editingMentor 
        ? { mentorId: editingMentor._id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        setMessage(editingMentor ? 'Mentor updated successfully!' : 'Mentor added successfully!');
        setShowForm(false);
        setEditingMentor(null);
        setFormData({ name: '', role: '', specialty: 'Programming', bio: '', image: '', courses: 0, students: 0, socialLinks: { linkedin: '', twitter: '', website: '' } });
        
        const refreshRes = await fetch('/api/mentors');
        const refreshData = await refreshRes.json();
        setMentors(refreshData.mentors || []);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error: ' + data.error);
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-inherit dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-white">Manage Mentors</h1>
            <p className="text-stone-600 dark:text-stone-400 mt-1">Add, edit, or remove mentors from your platform</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="px-4 py-2 bg-white dark:bg-[#1e1e1e] border-2 border-stone-300 dark:border-[#2d2d2d] text-stone-700 dark:text-stone-300 rounded-xl font-semibold hover:bg-stone-50 dark:hover:bg-[#2d2d2d] transition-all">
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingMentor(null);
                setFormData({ name: '', role: '', specialty: 'Programming', bio: '', image: '', courses: 0, students: 0, socialLinks: { linkedin: '', twitter: '', website: '' } });
              }}
              className="px-6 py-2 bg-stone-900 dark:bg-amber-600 text-white rounded-xl font-semibold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Mentor
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes('successfully') ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
            {message}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-[#2d2d2d]">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-stone-900 dark:text-white">{editingMentor ? 'Edit Mentor' : 'Add New Mentor'}</h2>
                  <button onClick={() => { setShowForm(false); setEditingMentor(null); }} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#2d2d2d] rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wider">Full Name *</label>
                      <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-600 outline-none transition-all text-stone-900 dark:text-white" placeholder="e.g. Sarah Jenkins" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wider">Role/Title *</label>
                      <input required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-600 outline-none transition-all text-stone-900 dark:text-white" placeholder="e.g. Senior Web Developer" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wider">Specialty *</label>
                      <select value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-600 outline-none transition-all text-stone-900 dark:text-white">
                        <option>Programming</option><option>Marketing</option><option>Design</option><option>Business</option><option>Data Science</option><option>Photography</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wider">Profile Image URL</label>
                      <input value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-600 outline-none transition-all text-stone-900 dark:text-white" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wider">Number of Courses</label>
                      <input type="number" value={formData.courses} onChange={(e) => setFormData({...formData, courses: Number(e.target.value)})} className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-600 outline-none transition-all text-stone-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wider">Number of Students</label>
                      <input type="number" value={formData.students} onChange={(e) => setFormData({...formData, students: Number(e.target.value)})} className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-600 outline-none transition-all text-stone-900 dark:text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wider">Bio *</label>
                    <textarea required value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows="4" maxLength="500" className="w-full px-4 py-3 bg-stone-50 dark:bg-[#2d2d2d] border-2 border-stone-200 dark:border-[#3d3d3d] rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-600 outline-none transition-all resize-none text-stone-900 dark:text-white" placeholder="Brief description about the mentor..." />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => { setShowForm(false); setEditingMentor(null); }} className="flex-1 py-3 bg-stone-200 dark:bg-[#2d2d2d] text-stone-700 dark:text-stone-300 rounded-xl font-bold hover:bg-stone-300 dark:hover:bg-[#3d3d3d] transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-stone-900 dark:bg-amber-600 text-white rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all">{editingMentor ? 'Update Mentor' : 'Add Mentor'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Mentors List */}
        {mentors.length === 0 ? (
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl border border-stone-200 dark:border-[#2d2d2d] p-16 text-center">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">No mentors yet</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">Add your first mentor to get started</p>
            <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-stone-900 dark:bg-amber-600 text-white rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-amber-700 transition-all">Add First Mentor</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor._id} className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-stone-200 dark:border-[#2d2d2d] p-6 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {mentor.image ? (
                      <img src={mentor.image} alt={mentor.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">{mentor.name.charAt(0)}</div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-stone-900 dark:text-white">{mentor.name}</h3>
                      <p className="text-amber-700 dark:text-amber-400 text-sm font-semibold">{mentor.role}</p>
                    </div>
                  </div>
                </div>
                <span className="inline-block px-3 py-1 bg-stone-100 dark:bg-[#2d2d2d] text-stone-700 dark:text-stone-300 text-xs font-bold rounded-full mb-3">{mentor.specialty}</span>
                <p className="text-stone-600 dark:text-stone-400 text-sm mb-4 line-clamp-3">{mentor.bio}</p>
                <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400 mb-4 pb-4 border-b border-stone-200 dark:border-[#2d2d2d]">
                  <div className="flex items-center gap-1"><span className="font-bold text-stone-900 dark:text-white">{mentor.courses}</span> Courses</div>
                  <div className="flex items-center gap-1"><span className="font-bold text-stone-900 dark:text-white">{mentor.students}</span> Students</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(mentor)} className="flex-1 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-lg font-semibold text-sm hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all">Edit</button>
                  <button onClick={() => handleDelete(mentor._id, mentor.name)} className="flex-1 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg font-semibold text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-all">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}