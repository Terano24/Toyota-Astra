import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import ProductImageUpload from './ProductImageUpload';

export default function ProductEditForm({ product, onClose, onProductUpdated }) {
  const [form, setForm] = useState({ ...product });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [carVarieties, setCarVarieties] = useState([]);
  const [selectedCarVariety, setSelectedCarVariety] = useState(product.connectedCarVariety || '');

  // Fetch car varieties on component mount
  useEffect(() => {
    const fetchCarVarieties = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'car_types'));
        const varieties = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCarVarieties(varieties);
      } catch (error) {
        console.error('Error fetching car varieties:', error);
      }
    };
    fetchCarVarieties();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Update product with selected car variety connection
      const updatedProduct = {
        ...form,
        connectedCarVariety: selectedCarVariety
      };
      
      await updateDoc(doc(db, 'products', product.id), updatedProduct);
      
      // If a car variety is selected, update the car variety with product connection
      if (selectedCarVariety) {
        await updateDoc(doc(db, 'car_types', selectedCarVariety), {
          productId: product.id,
          modelName: form.name,
          updatedAt: new Date().toISOString()
        });
      }
      
      onProductUpdated();
    } catch (err) {
      setError('Gagal mengupdate produk.');
      console.error('Error updating product:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl text-gray-900 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-red-600">Edit Produk</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col items-center md:items-start">
              <ProductImageUpload
                productId={product.id}
                initialImageUrl={form.imageUrl}
                onUploadSuccess={url => setForm(f => ({ ...f, imageUrl: url }))}
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <select name="type" value={form.type || ''} onChange={handleChange} className="p-2 border rounded text-gray-900 placeholder-gray-500" required>
                <option value="">Pilih Tipe Mobil</option>
                <option value="HYBRID">Hybrid</option>
                <option value="KOMERSIAL">Komersial</option>
                <option value="SPORTS">Sports</option>
                <option value="SUV">SUV</option>
                <option value="HATCHBACK">Hatchback</option>
                <option value="MPV">MPV</option>
                <option value="SEDAN">Sedan</option>
              </select>
              <textarea name="desc" value={form.desc} onChange={handleChange} rows={8} className="w-full p-2 border rounded text-gray-900 placeholder-gray-500 min-h-[120px]" placeholder="Deskripsi" required />
            </div>
          </div>
          <input name="name" value={form.name} onChange={handleChange} className="mb-2 w-full p-2 border rounded text-gray-900 placeholder-gray-500" placeholder="Nama" required />
          <input name="price" value={form.price} onChange={handleChange} className="mb-2 w-full p-2 border rounded text-gray-900 placeholder-gray-500" placeholder="Harga" required />
          
          {/* Car Variety Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hubungkan ke Varietas Mobil
            </label>
            <select 
              value={selectedCarVariety} 
              onChange={(e) => setSelectedCarVariety(e.target.value)}
              className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
            >
              <option value="">Pilih Varietas Mobil (Opsional)</option>
              {carVarieties.map(variety => (
                <option key={variety.id} value={variety.id}>
                  {variety.modelName} (ID: {variety.id})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Pilih varietas mobil yang akan terhubung dengan produk ini. Model name varietas akan otomatis diupdate sesuai nama produk.
            </p>
          </div>
          {error && <div className="mb-2 text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors" onClick={onClose}>Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
