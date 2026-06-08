import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";

export default function AdminProductEdit() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [adminEmails, setAdminEmails] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    desc: "",
    imageUrl: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch admin emails from Firestore
  useEffect(() => {
    async function fetchAdmins() {
      const adminDoc = await getDoc(doc(db, "site_content", "admins"));
      if (adminDoc.exists()) {
        setAdminEmails(adminDoc.data().email || []);
      }
    }
    fetchAdmins();
  }, []);

  // Check authorization
  useEffect(() => {
    if (currentUser && Array.isArray(adminEmails) && adminEmails.length > 0) {
      setAuthorized(adminEmails.includes(currentUser.email));
    }
  }, [currentUser, adminEmails]);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      const productDoc = await getDoc(doc(db, "site_content", "main_product"));
      if (productDoc.exists()) {
        setForm(productDoc.data());
      } else {
        console.log('[DEBUG] main_product doc missing or empty:', productDoc.data());
      }
    }
    fetchProduct();
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await setDoc(doc(db, "site_content", "main_product"), form);
    } catch (err) {
      setError("Failed to save: " + err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (currentUser === null) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        Please <a href="/login" className="underline text-blue-600">log in</a> as an admin to access this page.
      </div>
    );
  }
  if (!authorized)
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        You are not authorized to access this page.
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Product</h2>
        <form className="w-full" onSubmit={handleSave}>
          <label className="block mb-2 text-gray-700 dark:text-gray-200">Product Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="mb-4 w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-100" required />
          <label className="block mb-2 text-gray-700 dark:text-gray-200">Price</label>
          <input name="price" value={form.price} onChange={handleChange} className="mb-4 w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-100" required />
          <label className="block mb-2 text-gray-700 dark:text-gray-200">Description</label>
          <textarea name="desc" value={form.desc} onChange={handleChange} className="mb-4 w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-100" rows={3} required />
          <label className="block mb-2 text-gray-700 dark:text-gray-200">Image URL (from /public or external)</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="mb-4 w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-100" required />
          {error && <div className="mb-2 text-red-600 dark:text-red-400">{error}</div>}
          <button type="submit" disabled={saving} className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
