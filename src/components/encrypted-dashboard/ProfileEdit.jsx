import React, { useState, useRef, Fragment } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { db, storage } from '../../firebase/firebase';
import { doc, updateDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../contexts/authContext';
import { Dialog, Transition } from '@headlessui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import SuccessModal from '../common/SuccessModal';

const ProfileEdit = () => {
    const { currentUser, userProfile } = useAuth();
    const [form, setForm] = useState({
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        email: currentUser?.email || '',
        address: userProfile?.address || '',
        contactNumber: userProfile?.contactNumber || '',
        photoURL: userProfile?.photoURL || '',
    });
    const [uploading, setUploading] = useState(false);
    const [docId, setDocId] = useState('');
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
        const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isSaveSuccessModalOpen, setIsSaveSuccessModalOpen] = useState(false);
    const fileInputRef = useRef();

    React.useEffect(() => {
        if (currentUser?.email) {
            const fetchDoc = async () => {
                const q = query(collection(db, 'salesmen'), where('email', '==', currentUser.email));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const foundDoc = snap.docs[0];
                    setDocId(foundDoc.id);
                    const data = foundDoc.data();
                    setForm(f => ({ ...f, ...data, email: currentUser.email }));
                } else {
                    setDocId('');
                    setForm(f => ({ ...f, email: currentUser.email, firstName: '', lastName: '', address: '', contactNumber: '', photoURL: '' }));
                }
            };
            fetchDoc();
        }
    }, [currentUser]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleResetPassword = async () => {
        try {
            await sendPasswordResetEmail(getAuth(), currentUser.email);
            setIsSuccessModalOpen(true); // Show success modal
        } catch (err) {
            toast.error('Gagal mengirim email pengaturan ulang kata sandi.');
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const toastId = toast.loading('Mengunggah foto profil...');
        try {
            const storageRef = ref(storage, `profile_pics/${currentUser.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setForm((prev) => ({ ...prev, photoURL: url }));
            if (docId) {
                await updateDoc(doc(db, 'salesmen', docId), { photoURL: url });
            }
            toast.update(toastId, { render: "Foto profil berhasil diperbarui!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (err) {
            toast.update(toastId, { render: "Gagal mengunggah foto.", type: "error", isLoading: false, autoClose: 3000 });
        }
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSave = { ...form };
        if (dataToSave.contactNumber && !dataToSave.contactNumber.startsWith('+')) {
            dataToSave.contactNumber = `+${dataToSave.contactNumber}`;
        }
        const toastId = toast.loading('Menyimpan profil...');
        try {
            if (!docId) {
                const docRef = await addDoc(collection(db, 'salesmen'), { ...dataToSave, email: currentUser.email });
                setDocId(docRef.id);
            } else {
                await updateDoc(doc(db, 'salesmen', docId), { ...dataToSave, email: currentUser.email });
            }
                        toast.update(toastId, { render: "Profil berhasil disimpan!", type: "success", isLoading: false, autoClose: 3000 });
            setIsSaveSuccessModalOpen(true);
        } catch (err) {
            toast.update(toastId, { render: "Gagal menyimpan profil.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    return (
        <>
            <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8 flex items-center justify-center">
                <div className="w-full max-w-5xl mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-3xl overflow-hidden">
                        
                        {/* Profile Header Section */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-white">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="relative group" onClick={() => fileInputRef.current.click()}>
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer group-hover:scale-105 transition-transform duration-300">
                                        <img 
                                            src={form.photoURL || `https://ui-avatars.com/api/?name=${form.firstName || 'User'}+${form.lastName || ''}&background=ffffff&color=E31937&size=128`} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
                                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">Ubah Foto</span>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                                </div>
                                
                                <div className="text-center md:text-left flex-1">
                                    <h2 className="text-3xl font-bold mb-2">{form.firstName || 'Nama'} {form.lastName}</h2>
                                    <p className="text-red-100 mb-4">{currentUser?.email}</p>
                                    

                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="p-8">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Informasi Personal</h3>
                                <p className="text-gray-600 text-sm">Perbarui informasi profil Anda di bawah ini</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Nama Depan</label>
                                    <input 
                                        type="text" 
                                        name="firstName" 
                                        value={form.firstName} 
                                        onChange={handleChange} 
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300" 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Nama Belakang</label>
                                    <input 
                                        type="text" 
                                        name="lastName" 
                                        value={form.lastName} 
                                        onChange={handleChange} 
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300" 
                                        required 
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Alamat</label>
                                    <input 
                                        type="text" 
                                        name="address" 
                                        value={form.address} 
                                        onChange={handleChange} 
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300" 
                                        placeholder="Masukkan alamat lengkap Anda"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Nomor Kontak (WhatsApp)</label>
                                    <input 
                                        type="text" 
                                        name="contactNumber" 
                                        value={form.contactNumber} 
                                        onChange={handleChange} 
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300" 
                                        placeholder="+628123456789" 
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                                <button 
                                    type="button" 
                                    onClick={handleResetPassword} 
                                    className="w-full sm:w-auto flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold rounded-xl"
                                >
                                    Atur Ulang Kata Sandi
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={uploading} 
                                    className="w-full sm:w-auto flex-1 py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {uploading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            <Transition appear show={isSuccessModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsSuccessModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center align-middle shadow-xl transition-all">
                                    <FiCheckCircle className="mx-auto h-16 w-16 text-green-500" />
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mt-4">
                                        Terkirim!
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Link untuk mengatur ulang kata sandi Anda telah berhasil dikirim ke email Anda.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 w-full" onClick={() => setIsSuccessModalOpen(false)}>
                                            Tutup
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <SuccessModal 
                isOpen={isSaveSuccessModalOpen}
                onClose={() => setIsSaveSuccessModalOpen(false)}
                message="Perubahan profil Anda telah berhasil disimpan."
            />

            {/* QR Code Modal */}
            <Transition appear show={isQrModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsQrModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 mb-2">
                                        Aktifkan Notifikasi WhatsApp
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-4">
                                            Pindai kode ini dengan kamera ponsel Anda untuk bergabung dengan saluran WhatsApp kami dan langsung menerima pemberitahuan prospek baru.
                                        </p>
                                        <div className="p-2 bg-white rounded-lg inline-block mx-auto w-full flex justify-center">
                                            <img 
                                                src="https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FAuto%20Notifier.png?alt=media&token=b38830fc-b35b-48a0-944d-6626e7008611"
                                                alt="WhatsApp Opt-in QR Code"
                                                className="w-60 h-60"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 w-full" onClick={() => setIsQrModalOpen(false)}>
                                            Tutup
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default ProfileEdit;
