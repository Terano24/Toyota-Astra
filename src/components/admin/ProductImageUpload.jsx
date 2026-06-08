import React, { useRef, useState } from 'react';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProductImageUpload({ productId, onUploadSuccess, initialImageUrl }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialImageUrl || '');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      setError('File harus JPG, PNG, atau WEBP.');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10MB.');
      return;
    }
    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(initialImageUrl || '');
    setProgress(0);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setProgress(50); // Show some progress
    
    try {
      const ext = file.name.split('.').pop();
      const timestamp = Date.now();
      const storageRef = ref(storage, `products/${productId}_${timestamp}.${ext}`);
      
      console.log('Starting upload to:', storageRef.fullPath);
      
      // Use simple uploadBytes instead of uploadBytesResumable
      const snapshot = await uploadBytes(storageRef, file);
      
      setProgress(90); // Almost done
      
      // Get the download URL
      const url = await getDownloadURL(snapshot.ref);
      
      console.log('Upload successful, URL:', url);
      
      // Call the success callback with the URL
      onUploadSuccess && onUploadSuccess(url);
      
      // Reset the file input
      setFile(null);
      setProgress(100);
      
      // Clear progress after a short delay
      setTimeout(() => setProgress(0), 1000);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage = 'Gagal mengunggah gambar.';
      
      switch (err.code) {
        case 'storage/unauthorized':
          errorMessage = 'Tidak memiliki izin untuk mengunggah file. Pastikan Anda sudah login.';
          break;
        case 'storage/canceled':
          errorMessage = 'Upload dibatalkan.';
          break;
        case 'storage/unknown':
          errorMessage = 'Terjadi kesalahan yang tidak diketahui. Coba lagi nanti.';
          break;
        case 'storage/invalid-format':
          errorMessage = 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.';
          break;
        case 'storage/invalid-argument':
          errorMessage = 'File tidak valid atau rusak.';
          break;
        default:
          errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Upload Gambar Produk</label>
      
      {/* Image Preview */}
      <div className="mb-4">
        {preview ? (
          <div className="flex flex-col items-center">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-48 h-48 object-contain border border-gray-200 rounded-lg bg-white p-2"
            />
            {file && (
              <button 
                type="button" 
                className="mt-2 text-red-600 text-sm underline hover:text-red-800" 
                onClick={handleRemove}
                disabled={uploading}
              >
                Ganti Gambar
              </button>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-1 text-sm text-gray-600">Belum ada gambar yang dipilih</p>
          </div>
        )}
      </div>

      {/* File Input */}
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pilih Gambar
        </label>
        <div className="flex items-center">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={uploading}
          />
          {file && !uploading && (
            <button 
              type="button" 
              onClick={handleUpload}
              className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Format: JPG, PNG, atau WEBP (maks. 10MB)
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Mengunggah...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
