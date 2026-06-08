import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faBrain, faBookOpen, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import logo from '../../logo.svg'; // Assuming logo is in src

const COLORS = {
  background: '#F4F7FC',
  primary: '#D32F2F', // Auto2000 Red
  secondary: '#1E293B', // Dark Blue/Gray
  text: '#334155',
  textLight: '#64748B',
  white: '#FFFFFF',
  border: '#E2E8F0',
};

const ICONS = [faLightbulb, faBrain, faBookOpen];

const SalesGuidesManager = ({ readOnly = false }) => {
  const [guides, setGuides] = useState([]);
  const [editingGuide, setEditingGuide] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', videoUrl: '' });
  const [loading, setLoading] = useState(true);

  const guideIcons = useMemo(() => {
    const icons = {};
    guides.forEach(guide => {
      icons[guide.id] = ICONS[Math.floor(Math.random() * ICONS.length)];
    });
    return icons;
  }, [guides]);

  useEffect(() => {
    const q = query(collection(db, 'salesGuides'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const guidesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGuides(guidesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGuide) {
        await updateDoc(doc(db, 'salesGuides', editingGuide.id), { ...formData, updatedAt: new Date() });
      } else {
        await addDoc(collection(db, 'salesGuides'), { ...formData, createdAt: new Date(), updatedAt: new Date() });
      }
      setFormData({ title: '', description: '', videoUrl: '' });
      setEditingGuide(null);
    } catch (error) {
      console.error('Error saving guide:', error);
      alert('Failed to save guide.');
    }
  };

  const handleEdit = (guide) => {
    setFormData({ title: guide.title || '', description: guide.description || '', videoUrl: guide.videoUrl || '' });
    setEditingGuide(guide);
    setSelectedGuide(null); // Close video view if editing
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this guide?')) {
      try {
        await deleteDoc(doc(db, 'salesGuides', id));
      } catch (error) {
        console.error('Error deleting guide:', error);
        alert('Failed to delete guide.');
      }
    }
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(?:(?:youtu.be\/|v\/|vi?\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  if (loading) {
    return <div style={{ backgroundColor: COLORS.background, color: COLORS.text }} className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (selectedGuide) {
    const videoId = extractVideoId(selectedGuide.videoUrl);
    return (
      <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }} className="p-4 md:p-8">
        <button onClick={() => setSelectedGuide(null)} className="flex items-center mb-6 text-sm font-medium transition" style={{ color: COLORS.primary }}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Courses
        </button>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {videoId ? (
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={selectedGuide.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="p-8 text-center" style={{ color: COLORS.text }}>Invalid video URL.</div>
          )}
          <div className="p-6">
            <h2 className="text-3xl font-bold" style={{ color: COLORS.secondary }}>{selectedGuide.title}</h2>
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 mt-6">
            <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.secondary }}>Deskripsi Video</h3>
            <p className="text-base" style={{ color: COLORS.text, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>{selectedGuide.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <main className="p-4 md:p-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center" style={{ borderLeft: `5px solid ${COLORS.primary}` }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.secondary }}>Selamat Datang di Portal Pembelajaran!</h2>
          <p style={{ color: COLORS.textLight }}>Tingkatkan pengetahuan penjualan Anda melalui video-video pilihan kami. Selamat belajar!</p>
        </div>
        {/* Course Counter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-4xl font-bold" style={{ color: COLORS.primary }}>{guides.length}</p>
            <p className="ml-4 font-semibold" style={{ color: COLORS.text }}>Sales Courses</p>
          </div>
        </div>

        {/* Admin Form */}
        {!readOnly && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">{editingGuide ? 'Edit Guide' : 'Add New Guide'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form Inputs */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
              </div>
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">YouTube Video URL</label>
                <input type="url" id="videoUrl" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" rows="3" value={formData.description} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                {editingGuide && <button type="button" onClick={() => { setEditingGuide(null); setFormData({ title: '', description: '', videoUrl: '' }); }} className="px-4 py-2 rounded-md border bg-white text-sm font-medium">Cancel</button>}
                <button type="submit" className="px-4 py-2 rounded-md border border-transparent text-sm font-medium text-white shadow-sm" style={{ backgroundColor: COLORS.primary }}>{editingGuide ? 'Update Guide' : 'Save Guide'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Guides List */}
        {guides.length === 0 && readOnly ? (
          <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">No Sales Guides Available</h3>
            <p className="text-sm">Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {guides.map((guide) => (
              <div key={guide.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center p-4 cursor-pointer" onClick={() => setSelectedGuide(guide)}>
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                  <FontAwesomeIcon icon={guideIcons[guide.id]} className="text-white text-xl" />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-semibold" style={{ color: COLORS.secondary }}>{guide.title}</h3>
                </div>
                {!readOnly && (
                  <div className="flex space-x-3 ml-4">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(guide); }} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(guide.id); }} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SalesGuidesManager;
