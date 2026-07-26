'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function EditCoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  const fileInputRef = useRef(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'Programming',
    tutorName: '',
    thumbnail: '',
    modules: []
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Fetch existing course data
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.course) {
          setFormData({
            title: data.course.title || '',
            description: data.course.description || '',
            price: data.course.price || 0,
            category: data.course.category || 'Programming',
            tutorName: data.course.tutorName || '',
            thumbnail: data.course.thumbnail || '',
            modules: data.course.modules || []
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load course:', err);
        setMessage('Failed to load course data');
        setLoading(false);
      });
  }, [session, status, courseId, router]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      const data = await res.json();

      if (data.success) {
        setFormData({ ...formData, thumbnail: data.url });
        setMessage('Image uploaded successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Upload failed: ' + data.error);
      }
    } catch (err) {
      setMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleModuleChange = (index, field, value) => {
    const newModules = [...formData.modules];
    newModules[index][field] = value;
    setFormData({ ...formData, modules: newModules });
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { title: `Module ${formData.modules.length + 1}`, videos: [{ title: '', videoUrl: '', duration: 0 }] }]
    });
  };

  const removeModule = (index) => {
    const newModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: newModules });
  };

  const handleVideoChange = (mIndex, vIndex, field, value) => {
    const newModules = [...formData.modules];
    newModules[mIndex].videos[vIndex][field] = field === 'duration' ? Number(value) : value;
    setFormData({ ...formData, modules: newModules });
  };

  const addVideo = (mIndex) => {
    const newModules = [...formData.modules];
    newModules[mIndex].videos.push({ title: '', videoUrl: '', duration: 0 });
    setFormData({ ...formData, modules: newModules });
  };

  const removeVideo = (mIndex, vIndex) => {
    const newModules = [...formData.modules];
    newModules[mIndex].videos = newModules[mIndex].videos.filter((_, i) => i !== vIndex);
    setFormData({ ...formData, modules: newModules });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, courseId })
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Course updated successfully!');
        setTimeout(() => router.push('/admin'), 2000);
      } else {
        setMessage('Error: ' + data.error);
      }
    } catch (err) {
      setMessage('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F3E7]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-amber-600"></div>
      </div>
    );
  }

  const totalVideos = formData.modules.reduce((sum, m) => sum + m.videos.length, 0);
  const totalDuration = formData.modules.reduce((sum, m) => sum + m.videos.reduce((vSum, v) => vSum + (v.duration || 0), 0), 0);

  return (
    <div className="min-h-screen bg-[#F9F3E7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: "'MedievalSharp', cursive" }}>Edit Course</h1>
            <p className="text-stone-600 text-sm mt-1">Update course details and curriculum</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes('successfully') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 mb-6">Course Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Course Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-[#F9F3E7]/60 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all" placeholder="e.g. Complete Web Development Bootcamp" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="4" className="w-full px-4 py-3 bg-[#F9F3E7]/60 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all resize-none" placeholder="What will students learn?" />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Price ($)</label>
                <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-[#F9F3E7]/60 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-[#F9F3E7]/60 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all">
                  <option>Programming</option>
                  <option>Marketing</option>
                  <option>Design</option>
                  <option>Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Tutor Name</label>
                <input required value={formData.tutorName} onChange={e => setFormData({...formData, tutorName: e.target.value})} className="w-full px-4 py-3 bg-[#F9F3E7]/60 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Course Thumbnail</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-600 hover:bg-amber-50/30 transition-all"
                >
                  {formData.thumbnail ? (
                    <div className="relative">
                      <img src={formData.thumbnail} alt="Thumbnail preview" className="w-full h-48 object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <svg className="w-12 h-12 text-stone-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-stone-600 font-medium mb-1">
                        {uploading ? 'Uploading...' : 'Click to upload thumbnail'}
                      </p>
                      <p className="text-xs text-stone-500">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modules & Videos Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">Curriculum</h2>
                <p className="text-sm text-stone-600 mt-1">{formData.modules.length} modules, {totalVideos} videos, {totalDuration} minutes total</p>
              </div>
              <button type="button" onClick={addModule} className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl font-bold text-sm hover:bg-amber-200 transition-all">+ Add Module</button>
            </div>

            <div className="space-y-6">
              {formData.modules.map((module, mIndex) => (
                <div key={mIndex} className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                  <div className="flex gap-4 mb-4">
                    <input 
                      value={module.title} 
                      onChange={e => handleModuleChange(mIndex, 'title', e.target.value)} 
                      className="flex-1 px-4 py-2 bg-white border border-stone-200 rounded-lg font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      placeholder="Module Title"
                    />
                    {formData.modules.length > 1 && (
                      <button type="button" onClick={() => removeModule(mIndex)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 ml-4 border-l-2 border-stone-200 pl-4">
                    {module.videos.map((video, vIndex) => (
                      <div key={vIndex} className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-stone-100">
                        <input 
                          value={video.title} 
                          onChange={e => handleVideoChange(mIndex, vIndex, 'title', e.target.value)} 
                          className="flex-[2] px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                          placeholder="Video Title"
                        />
                        <input 
                          value={video.videoUrl} 
                          onChange={e => handleVideoChange(mIndex, vIndex, 'videoUrl', e.target.value)} 
                          className="flex-[2] px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                          placeholder="YouTube ID (e.g. dQw4w9WgXcQ)"
                        />
                        <input 
                          type="number"
                          value={video.duration} 
                          onChange={e => handleVideoChange(mIndex, vIndex, 'duration', e.target.value)} 
                          className="w-20 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                          placeholder="Mins"
                        />
                        {module.videos.length > 1 && (
                          <button type="button" onClick={() => removeVideo(mIndex, vIndex)} className="text-red-400 hover:text-red-600 px-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addVideo(mIndex)} className="text-sm text-amber-700 font-bold hover:text-amber-900 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Add Video
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-[#F9F3E7] rounded-2xl font-bold text-lg hover:from-stone-800 hover:to-stone-700 transition-all disabled:opacity-50 shadow-xl"
          >
            {isSubmitting ? 'Updating Course...' : 'Update Course'}
          </button>
        </form>
      </div>
    </div>
  );
}