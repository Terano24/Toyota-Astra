import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { useAuth } from '../../../contexts/authContext';
import useSalesmanNames from './useSalesmanNames';
import { FiX, FiFilter, FiSearch, FiTrash2, FiCheck } from 'react-icons/fi';
import FilterModal from '../../salesman/FilterModal';
import { useLocation } from 'react-router-dom';


// --- Constants & Helpers ---
const COLORS = { primary: '#E31937', secondary: '#222222', background: '#F8F9FA', text: '#333333', textLight: '#6C757D', white: '#FFFFFF', border: '#E9ECEF' };

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
    } else if (status === 'assigned') {
        mainStatus.text = 'Belum Follow-Up'; // Treat 'assigned' as 'belum-follow-up'
    } else if (status) {
        mainStatus.text = status; // Fallback for any other legacy statuses
        mainStatus.style = 'bg-gray-200 text-gray-800';
    }
    
    return { mainStatus, subStatus: subStatusInfo };
};

const SuccessModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" style={{ borderTop: `6px solid #10B981` }}>
                <div className="p-6 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full animate-pulse">
                        <FiCheck className="w-8 h-8 text-green-600 animate-bounce" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-green-700">
                        Berhasil!
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, inquiryName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" style={{ borderTop: `6px solid ${COLORS.primary}` }}>
                <div className="p-6">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                        <FiTrash2 className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2" style={{ color: COLORS.secondary }}>
                        Konfirmasi Hapus
                    </h3>
                    <p className="text-gray-600 text-center mb-6">
                        Apakah Anda yakin ingin menghapus prospek <strong>"{inquiryName}"</strong>?
                    </p>
                    <p className="text-sm text-red-600 text-center mb-6">
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailModal = ({ inquiry, onClose, salesmanName, onUpdateStatus, userRole }) => {
    const [isFollowedUp, setIsFollowedUp] = useState(false);
    const [subStatus, setSubStatus] = useState(null);

    useEffect(() => {
        if (inquiry) {
            const followedUp = inquiry.status === 'sudah-follow-up';
            setIsFollowedUp(followedUp);
            setSubStatus(followedUp ? inquiry.subStatus : null);
        }
    }, [inquiry]);

    const handleUpdate = () => {
        const newStatus = isFollowedUp ? 'sudah-follow-up' : 'assigned';
        // Only send subStatus if it's relevant
        const newSubStatus = isFollowedUp ? subStatus : null; 
        onUpdateStatus(inquiry.id, { status: newStatus, subStatus: newSubStatus });
        onClose();
    };

    if (!inquiry) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ borderTop: `6px solid ${COLORS.primary}` }}>
                <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: COLORS.border }}>
                    <h2 className="text-xl font-bold" style={{ color: COLORS.secondary }}>Detail Prospek</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors"><FiX size={22} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p><strong>Nama:</strong> {inquiry.name}</p>
                    <p><strong>Telepon:</strong> {inquiry.phone || 'N/A'}</p>
                    <p><strong>Kendaraan:</strong> {inquiry.carInterest || 'N/A'}</p>
                    <p><strong>Rencana Pembelian:</strong> {inquiry.rencanaKebutuhan || 'N/A'}</p>
                    <p><strong>Domisili:</strong> {inquiry.domisili || 'N/A'}</p>
                    <p><strong>Tanggal Masuk:</strong> {inquiry.createdAt?.toDate ? inquiry.createdAt.toDate().toLocaleDateString('id-ID') : 'N/A'}</p>
                                        <p><strong>Ditugaskan kepada:</strong> <span className="font-semibold" style={{ color: COLORS.primary }}>{salesmanName || 'Belum Ditugaskan'}</span></p>

                    {userRole !== 'admin' && (
                        <div className="mt-6 pt-6 border-t" style={{ borderColor: COLORS.border }}>
                            <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.secondary }}>Update Status</h3>
                            
                            {/* Main Status Toggle */}
                            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-gray-50">
                                <span className={`font-semibold text-base ${isFollowedUp ? 'text-blue-700' : 'text-red-700'}`}>
                                    {isFollowedUp ? 'Sudah Follow-Up' : 'Belum Follow-Up'}
                                </span>
                                <button 
                                    onClick={() => setIsFollowedUp(!isFollowedUp)}
                                    className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${isFollowedUp ? 'bg-blue-500 focus:ring-blue-400' : 'bg-red-500 focus:ring-red-400'}`}>
                                    <span className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${isFollowedUp ? 'translate-x-9' : 'translate-x-1'}`}/>
                                </button>
                            </div>

                            {/* Sub-Status Section - Animates based on isFollowedUp */}
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFollowedUp ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="text-md font-semibold mb-3 text-gray-600">Detail Follow-Up:</h4>
                                    <div className="flex justify-around items-center gap-2">
                                        {['Closing', 'Pending', 'Batal'].map(s => {
                                            const lowerCaseStatus = s.toLowerCase();
                                            const colors = {
                                                Closing: { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-500' },
                                                Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-500' },
                                                Batal: { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-500' },
                                            };
                                            const isSelected = subStatus === lowerCaseStatus;
                                            return (
                                                <button 
                                                    key={s}
                                                    onClick={() => setSubStatus(lowerCaseStatus)}
                                                    className={`flex-1 py-2 px-3 text-center font-semibold rounded-lg transition-all duration-200 ${colors[s].bg} ${colors[s].text} ${isSelected ? `ring-2 ${colors[s].ring}` : 'hover:ring-2'}`}>
                                                    {s}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleUpdate}
                                className="w-full mt-8 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-lg text-base"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { currentUser, userRole } = useAuth();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ status: 'all', timeline: 'terbaru', salesman: 'all' });
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [inquiryToDelete, setInquiryToDelete] = useState(null);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const location = useLocation();
    const onSalesmanDashboard = location.pathname.startsWith('/encrypted-dashboard');

            const filteredInquiries = useMemo(() => {
        let filtered = [...inquiries];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(inquiry =>
                inquiry.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (activeFilters.status !== 'all') {
            // Adjust status filter to match data ('assigned' is 'belum-follow-up')
            if (activeFilters.status === 'belum-follow-up') {
                filtered = filtered.filter(i => i.status === 'assigned' || i.status === 'belum-follow-up');
            } else {
                filtered = filtered.filter(i => i.status === activeFilters.status);
            }
        }

        // Salesman filter - Only for admin on admin dashboard
        if (userRole === 'admin' && !onSalesmanDashboard && activeFilters.salesman !== 'all') {
            filtered = filtered.filter(i => 
                i.assignedTo?.id === activeFilters.salesman || 
                i.assignedTo === activeFilters.salesman
            );
        }

        // Timeline sort / filter
        switch (activeFilters.timeline) {
            case 'terbaru':
                filtered.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
                break;
            case 'terlama':
                filtered.sort((a, b) => (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0));
                break;
            case 'hot':
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const getUrgencyDate = (inquiry) => {
                    const baseDate = inquiry.createdAt?.toDate();
                    if (!baseDate) return null;

                    let daysToAdd = 30; // Default for >1 bulan
                    if (inquiry.rencanaKebutuhan === '1-2 minggu') daysToAdd = 10;
                    if (inquiry.rencanaKebutuhan === '2-3 minggu') daysToAdd = 20;

                    const urgencyDate = new Date(baseDate);
                    urgencyDate.setDate(urgencyDate.getDate() + daysToAdd);
                    return urgencyDate;
                };

                filtered = filtered
                    .filter(i => i.subStatus !== 'closing' && i.subStatus !== 'batal')
                    .map(i => ({ ...i, urgencyDate: getUrgencyDate(i) }))
                    .filter(i => i.urgencyDate && i.urgencyDate >= today)
                    .sort((a, b) => a.urgencyDate - b.urgencyDate);
                break;
            default:
                break;
        }

                return filtered;
    }, [inquiries, activeFilters, searchQuery, userRole, onSalesmanDashboard]);

    const salesmanIds = useMemo(() => {
        return [...new Set(inquiries.map(i => i.assignedTo?.id || i.assignedTo).filter(Boolean))];
    }, [inquiries]);

    const salesmanNames = useSalesmanNames(salesmanIds);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const inquiriesCollection = collection(db, 'inquiries');
        let unsubscribe = () => {};

        if (userRole === 'admin' && !onSalesmanDashboard) {
            const q = query(inquiriesCollection);
            unsubscribe = onSnapshot(q, snapshot => {
                setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            });
        } else {
            let inquiries1 = [];
            let inquiries2 = [];

            const combineAndSet = () => {
                const combined = [...inquiries1, ...inquiries2];
                const uniqueInquiries = Array.from(new Set(combined.map(a => a.id)))
                    .map(id => combined.find(a => a.id === id));
                setInquiries(uniqueInquiries);
                setLoading(false);
            };

            const q1 = query(inquiriesCollection, where('assignedTo.id', '==', currentUser.uid));
            const unsub1 = onSnapshot(q1, snapshot => {
                inquiries1 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                combineAndSet();
            });

            const q2 = query(inquiriesCollection, where('assignedSalesperson', '==', currentUser.email));
            const unsub2 = onSnapshot(q2, snapshot => {
                inquiries2 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                combineAndSet();
            });

            unsubscribe = () => {
                unsub1();
                unsub2();
            };
        }

        return () => unsubscribe();
    }, [currentUser, userRole, onSalesmanDashboard]);

    const handleUpdateStatus = async (inquiryId, newStatus) => {
        const inquiryRef = doc(db, 'inquiries', inquiryId);
        try {
            await updateDoc(inquiryRef, newStatus);
            console.log('Status updated successfully');
        } catch (error) {
            console.error('Error updating status: ', error);
        }
    };

    const handleDeleteClick = (inquiry) => {
        setInquiryToDelete(inquiry);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!inquiryToDelete) return;

        try {
            const inquiryRef = doc(db, 'inquiries', inquiryToDelete.id);
            await deleteDoc(inquiryRef);
            console.log('Inquiry deleted successfully');
            
            // Close delete modal and reset state
            setDeleteModalOpen(false);
            setInquiryToDelete(null);
            
            // Show success modal
            setSuccessMessage('Prospek berhasil dihapus!');
            setSuccessModalOpen(true);
        } catch (error) {
            console.error('Error deleting inquiry: ', error);
            setSuccessMessage('Gagal menghapus prospek. Silakan coba lagi.');
            setSuccessModalOpen(true);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setInquiryToDelete(null);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-4 md:p-8 min-h-screen" style={{ backgroundColor: COLORS.background }}>
            {selectedInquiry && (
                <DetailModal 
                    inquiry={selectedInquiry}
                    onClose={() => setSelectedInquiry(null)}
                    salesmanName={salesmanNames[selectedInquiry.assignedTo?.id || selectedInquiry.assignedTo]}
                    onUpdateStatus={handleUpdateStatus}
                    userRole={userRole}
                />
            )}

            <DeleteConfirmationModal 
                isOpen={deleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                inquiryName={inquiryToDelete?.name || ''}
            />

            <SuccessModal 
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                message={successMessage}
            />

            <FilterModal 
                isOpen={isFilterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApplyFilters={setActiveFilters}
                initialFilters={activeFilters}
                salesmanNames={salesmanNames}
                userRole={userRole}
                onSalesmanDashboard={onSalesmanDashboard}
            />

                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold self-start md:self-center" style={{ color: COLORS.secondary }}>Daftar Prospek</h1>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Cari nama prospek..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <button 
                        onClick={() => setFilterModalOpen(true)}
                        className="p-3 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-colors border border-gray-200 flex-shrink-0"
                    >
                        <FiFilter className="text-gray-600" />
                    </button>
                </div>
            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInquiries.map(inquiry => {
                    const statusInfo = getStatusInfo(inquiry);
                    return (
                        <div key={inquiry.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden" style={{ borderTop: `5px solid ${COLORS.primary}` }}>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2 flex-wrap">
                                        <div className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.mainStatus.style} inline-block`}>
                                            {statusInfo.mainStatus.text}
                                        </div>
                                        {statusInfo.subStatus && (
                                            <div className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.subStatus.style} inline-block`}>
                                                {statusInfo.subStatus.text}
                                            </div>
                                        )}
                                    </div>
                                    {userRole === 'admin' && !onSalesmanDashboard && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(inquiry);
                                            }}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                                            title="Hapus Prospek"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold truncate" style={{ color: COLORS.secondary }}>{inquiry.name}</h3>
                                <p className="text-sm text-gray-600 truncate">{inquiry.carInterest || 'N/A'}</p>
                                <p className="text-xs text-gray-500 mt-2">Sales: {salesmanNames[inquiry.assignedTo?.id] || 'N/A'}</p>
                                <p className="text-xs text-gray-500 mt-2">Masuk: {inquiry.createdAt?.toDate ? inquiry.createdAt.toDate().toLocaleDateString('id-ID') : 'N/A'}</p>
                            </div>
                            <button onClick={() => {
                                setSelectedInquiry(inquiry);
                            }} className="w-full text-center bg-gray-100 hover:bg-red-100 p-3 font-semibold text-red-600 transition-colors duration-200">
                                Lihat Detail
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;
