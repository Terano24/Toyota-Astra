import React, { useState } from 'react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import ProductImageUpload from './ProductImageUpload';

export default function ProductAddForm({ onClose, onProductAdded }) {
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    desc: '', 
    imageUrl: '',
    type: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tempId] = useState(`temp_${Date.now()}`);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (url) => {
    setForm(prev => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!form.name || !form.price || !form.desc || !form.type) {
      setError('Harap isi semua field yang wajib diisi.');
      return;
    }

    if (!form.imageUrl) {
      setError('Harap unggah gambar produk.');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      // Add the product to the products collection
      console.log('Adding product:', form.name);
      const productRef = await addDoc(collection(db, 'products'), {
        name: form.name,
        price: form.price,
        desc: form.desc,
        type: form.type,
        imageUrl: form.imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Product added successfully with ID:', productRef.id);

      // Automatically create a car variety document with the same name
      // Generate a document ID based on the product name (remove spaces and special characters)
      const carVarietyDocId = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
        .substring(0, 20); // Limit to 20 characters
      
      console.log('Generated car variety document ID:', carVarietyDocId);
      
      // Create the car variety document in car_types collection
      try {
        const carVarietyRef = doc(db, 'car_types', carVarietyDocId);
        const carVarietyData = {
          modelName: form.name,
          types: [
            {
              name: `${form.name} Base`,
              price: form.price,
              transmission: 'Manual'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('Creating car variety with data:', carVarietyData);
        await setDoc(carVarietyRef, carVarietyData);
        console.log('✅ Car variety created successfully with ID:', carVarietyDocId);
      } catch (carVarietyError) {
        console.error('❌ Error creating car variety:', carVarietyError);
        // Don't fail the entire operation if car variety creation fails
        alert('Product created successfully, but failed to create car variety. You can create it manually in Car Variety Manager.');
      }
      
      // Reset form and close modal
      setForm({ 
        name: '', 
        price: '', 
        desc: '', 
        imageUrl: '',
        type: ''
      });
      
      onProductAdded();
      onClose(); // Close the modal
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Gagal menambah produk. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tambah Produk Baru</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={saving}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Toyota Innova"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Rp 500.000.000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Mobil</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Tipe Mobil</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="KOMERSIAL">Komersial</option>
                    <option value="SPORTS">Sports</option>
                    <option value="SUV">SUV</option>
                    <option value="HATCHBACK">Hatchback</option>
                    <option value="MPV">MPV</option>
                    <option value="SEDAN">Sedan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    name="desc"
                    value={form.desc}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deskripsi lengkap produk..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <ProductImageUpload
                    productId={tempId}
                    onUploadSuccess={handleImageUpload}
                  />
                  {form.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Preview:</p>
                      <img 
                        src={form.imageUrl} 
                        alt="Preview" 
                        className="max-h-48 w-auto mx-auto border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
