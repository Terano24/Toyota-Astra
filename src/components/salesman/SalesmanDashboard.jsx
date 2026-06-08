import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, where, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/authContext';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useSalesmanNames from '../admin/dashboard/useSalesmanNames';

const COLORS = { primary: '#E31937', secondary: '#222222', background: '#F8F9FA', text: '#333333', textLight: '#6C757D', white: '#FFFFFF', border: '#E9ECEF' };

const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <div 
        className={`relative inline-block w-14 h-8 rounded-full transition-colors duration-300 ${disabled ? 'bg-gray-200' : checked ? 'bg-green-500' : 'bg-gray-300'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && onChange()}
    >
        <motion.div
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
            layout
            transition={{ type: 'spring', stiffness: 700, damping: 30 }}
            style={{ x: checked ? '1.5rem' : '0rem' }}
        />
    </div>
);

const DetailModal = ({ inquiry, onClose, onStatusChange, onSubStatusChange, viewed, salesmanName }) => {
    if (!inquiry) return null;

    const isFollowedUp = inquiry.status === 'sudah-follow-up';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative p-8" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <FaTimes size={20} />
                </button>

                <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.secondary }}>{inquiry.name}</h3>
                <div className="space-y-2 text-gray-700">
                    <p><strong>Telepon:</strong> {inquiry.phone || 'N/A'}</p>
                    <p><strong>Kendaraan:</strong> {inquiry.carInterest || 'N/A'}</p>
                    <p><strong>Rencana Pembelian:</strong> {inquiry.rencanaKebutuhan || 'N/A'}</p>
                    <p><strong>Domisili:</strong> {inquiry.domisili || 'N/A'}</p>
                    <p><strong>Sales:</strong> {salesmanName || 'Belum Ditugaskan'}</p>
                    <p><strong>Tanggal Masuk:</strong> {inquiry.createdAt?.toDate ? inquiry.createdAt.toDate().toLocaleDateString('id-ID') : 'N/A'}</p>
                </div>

                <div className="mt-6 pt-6 border-t">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800">Status Prospek</h4>
                    <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isFollowedUp ? 'text-green-600' : 'text-red-600'}`}>
                            {isFollowedUp ? 'Sudah Follow-Up' : 'Belum Follow-Up'}
                        </span>
                        <ToggleSwitch
                            checked={isFollowedUp}
                            onChange={() => onStatusChange(inquiry.id, isFollowedUp ? 'belum-follow-up' : 'sudah-follow-up')}
                            disabled={!viewed}
                        />
                    </div>
                    {!viewed && <p className="text-xs text-gray-500 mt-2">Tombol akan aktif setelah detail dilihat.</p>}

                    <AnimatePresence>
                        {isFollowedUp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="flex items-center justify-around space-x-2"
                            >
                                {['Closing', 'Pending', 'Batal'].map(subStatus => (
                                    <motion.button
                                        key={subStatus}
                                        onClick={() => onSubStatusChange(inquiry.id, subStatus.toLowerCase())}
                                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 border-2 ${inquiry.subStatus === subStatus.toLowerCase() ? 'text-white' : ''}`}
                                        style={{
                                            backgroundColor: inquiry.subStatus === subStatus.toLowerCase() ? 
                                                (subStatus === 'Closing' ? '#10B981' : subStatus === 'Pending' ? '#FBBF24' : '#EF4444') : COLORS.white,
                                            borderColor: subStatus === 'Closing' ? '#10B981' : subStatus === 'Pending' ? '#FBBF24' : '#EF4444',
                                            color: inquiry.subStatus !== subStatus.toLowerCase() ? 
                                                (subStatus === 'Closing' ? '#10B981' : subStatus === 'Pending' ? '#FBBF24' : '#EF4444') : COLORS.white
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {subStatus}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default function SalesmanDashboard() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [viewedInquiries, setViewedInquiries] = useState(new Set());
    const [salesmanProfile, setSalesmanProfile] = useState(null);

    const salesmanIds = useMemo(() => {
        if (!inquiries) return [];
        const ids = inquiries.map(i => i.assignedTo?.id || i.assignedTo).filter(Boolean);
        return [...new Set(ids)];
    }, [inquiries]);

    const salesmanNames = useSalesmanNames(salesmanIds);

    // Fetch salesman profile data
    useEffect(() => {
        const fetchSalesmanProfile = async () => {
            if (!currentUser?.email) return;
            
            try {
                const q = query(collection(db, 'salesmen'), where('email', '==', currentUser.email));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0];
                    setSalesmanProfile({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error('Error fetching salesman profile:', error);
            }
        };
        
        fetchSalesmanProfile();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, 'inquiries'), where('assignedTo.email', '==', currentUser.email));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const inquiriesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                status: doc.data().status === 'assigned' ? 'belum-follow-up' : (doc.data().status || 'belum-follow-up'),
            }));
            
            setInquiries(inquiriesData);
            
            // Use a functional update to avoid stale state in the closure
            setSelectedInquiry(currentInquiry => {
                if (currentInquiry) {
                    return inquiriesData.find(i => i.id === currentInquiry.id) || null;
                }
                return null;
            });

            setLoading(false);
        }, (error) => {
            console.error("Error fetching inquiries: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleStatusChange = async (inquiryId, newStatus) => {
        const inquiryRef = doc(db, 'inquiries', inquiryId);
        const data = { status: newStatus };
        if (newStatus === 'belum-follow-up') {
            data.subStatus = null; // Reset subStatus when toggling off
        }
        await updateDoc(inquiryRef, data);
    };

    const handleSubStatusChange = async (inquiryId, newSubStatus) => {
        const inquiryRef = doc(db, 'inquiries', inquiryId);
        await updateDoc(inquiryRef, { subStatus: newSubStatus });
    };

    const openDetailModal = (inquiry) => {
        setSelectedInquiry(inquiry);
        setViewedInquiries(prev => new Set(prev).add(inquiry.id));
    };

const getStatusInfo = (inquiry) => {
    const { status, subStatus } = inquiry;
    const mainStatus = {
        text: 'Belum Follow-Up',
        style: 'bg-red-100 text-red-800'
    };
    let subStatusInfo = null;

    if (status === 'sudah-follow-up') {
        mainStatus.text = 'Sudah Follow-Up';
        mainStatus.style = 'bg-blue-100 text-blue-800';
        
        switch (subStatus) {
            case 'closing': 
                subStatusInfo = { text: 'Closing', style: 'bg-green-100 text-green-800' };
                break;
            case 'pending': 
                subStatusInfo = { text: 'Pending', style: 'bg-yellow-100 text-yellow-800' };
                break;
            case 'batal': 
                subStatusInfo = { text: 'Batal', style: 'bg-red-100 text-red-800' };
                break;
            default:
                break;
        }
    }
    
    return { mainStatus, subStatus: subStatusInfo };
};

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

        return (
        <div className="p-4 md:p-8 min-h-screen" style={{ backgroundColor: COLORS.background }}>
            {/* Header with Profile Picture */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold" style={{ color: COLORS.secondary }}>Daftar Prospek Anda</h1>
                
                {/* Profile Picture - Mobile Only */}
                {salesmanProfile && (
                    <div 
                        className="md:hidden flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
                        onClick={() => navigate('/encrypted-dashboard/profile')}
                    >
                        {salesmanProfile.photoURL ? (
                            <img 
                                src={salesmanProfile.photoURL} 
                                alt={`${salesmanProfile.firstName} ${salesmanProfile.lastName}`}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                        ) : (
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                {salesmanProfile.firstName?.[0]}{salesmanProfile.lastName?.[0]}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inquiries.map(inquiry => {
                    const statusInfo = getStatusInfo(inquiry);
                    return (
                        <div key={inquiry.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden" style={{ borderTop: `5px solid ${COLORS.primary}` }}>
                            <div className="p-4">
                                <div className="flex items-center mb-3 space-x-2 flex-wrap">
                                    <div className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.mainStatus.style} inline-block`}>
                                        {statusInfo.mainStatus.text}
                                    </div>
                                    {statusInfo.subStatus && (
                                        <div className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.subStatus.style} inline-block`}>
                                            {statusInfo.subStatus.text}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold truncate" style={{ color: COLORS.secondary }}>{inquiry.name}</h3>
                                <p className="text-sm text-gray-600 truncate">{inquiry.carInterest || 'N/A'}</p>
                                <p className="text-xs text-gray-500 mt-2">Masuk: {inquiry.createdAt?.toDate ? inquiry.createdAt.toDate().toLocaleDateString('id-ID') : 'N/A'}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setViewedInquiries(prev => new Set(prev).add(inquiry.id));
                                    openDetailModal(inquiry);
                                }}
                                className="w-full text-center bg-gray-100 hover:bg-red-100 p-3 font-semibold text-red-600 transition-colors duration-200"
                            >
                                Lihat Detail
                            </button>
                        </div>
                    );
                })}
            </div>

            {selectedInquiry && (
                <DetailModal
                    inquiry={selectedInquiry}
                    onClose={() => setSelectedInquiry(null)}
                    onStatusChange={handleStatusChange}
                    onSubStatusChange={handleSubStatusChange}
                    viewed={viewedInquiries.has(selectedInquiry.id)}
                    salesmanName={salesmanNames[selectedInquiry.assignedTo?.id || selectedInquiry.assignedTo] || 'Salesman'}
                />
            )}
        </div>
    );
}
