import React, { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { assignInquiry } from '../../utils/inquiryAssignment';

const DOMISILI_OPTIONS = [
  'BANDAR LAMPUNG',
  'LAMPUNG BARAT',
  'LAMPUNG SELATAN',
  'LAMPUNG TENGAH',
  'LAMPUNG TIMUR',
  'LAMPUNG UTARA',
  'MESUJI',
  'METRO',
  'PESAWARAN',
  'PESISIR BARAT',
  'PRINGSEWU',
  'TANGGAMUS',
  'TULANG BAWANG',
  'TULANG BAWANG BARAT',
  'WAY KANAN',
  'NON-LAMPUNG'
];
const RENCANA_KEBUTUHAN_OPTIONS = [
  '1 - 2 minggu',
  '3 - 4 minggu',
  '> 1 bulan'
];

const InquiryModal = ({
  open = true,
  onClose,
  asModal = true,
  models = [],
  onSubmit: onSubmitProp,
  carInterestPrefill = ''
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [model, setModel] = useState(carInterestPrefill);
  const [rencanaKebutuhan, setRencanaKebutuhan] = useState(RENCANA_KEBUTUHAN_OPTIONS[0]);
  const [domisili, setDomisili] = useState(DOMISILI_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState('Kirim Penawaran');
  const [error, setError] = useState('');
  const [modelSearch, setModelSearch] = useState(carInterestPrefill);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const prevOpen = React.useRef(open);
  const modelInputRef = React.useRef(null);

  useEffect(() => {
    if (!prevOpen.current && open) {
      // Reset form when modal opens
      setName('');
      setPhone('');
      setRencanaKebutuhan(RENCANA_KEBUTUHAN_OPTIONS[0]);
      setDomisili(DOMISILI_OPTIONS[0]);
      setSuccess(false);
      setError('');
      setSubmitButtonText('Kirim Penawaran');
    }

    // Always update model when prefill text changes, even if modal is already open
    setModel(carInterestPrefill);
    setModelSearch(carInterestPrefill);

    prevOpen.current = open;
  }, [open, carInterestPrefill]);

  const filteredModels = models.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()));

  if (asModal && !open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitButtonText('Mengirim...');
    setError('');
    try {
      if (!name || !phone || !model || !rencanaKebutuhan || !domisili) {
        throw new Error('Harap isi semua kolom yang wajib diisi');
      }
      const inquiryData = {
        name: name.trim(),
        phone: phone.trim(),
        carInterest: model, // for dashboard compatibility
        model, // keep for clarity
        rencanaKebutuhan,
        domisili,
        status: 'new',
        date: new Date(),
        updatedAt: new Date(),
        source: 'website',
        createdAt: new Date()
      };
      if (onSubmitProp) {
        await onSubmitProp(inquiryData);
      } else {
        const assignedInquiry = await assignInquiry(inquiryData);
        await addDoc(collection(db, 'inquiries'), assignedInquiry);
        // Optionally: log for debug
        // console.log('Submitted inquiry:', assignedInquiry);
      }
      
      // Track Google Ads conversion
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-439726878/YOUR_CONVERSION_LABEL'
        });
      }
      
      setSuccess(true);
      setSubmitButtonText('Terkirim!');
      // Clear all fields after successful submit
      setName('');
      setPhone('');
      setModel('');
      setRencanaKebutuhan(RENCANA_KEBUTUHAN_OPTIONS[0]);
      setDomisili(DOMISILI_OPTIONS[0]);
      setModelSearch('');
      setTimeout(() => {
        setSubmitButtonText('Kirim Penawaran Lainnya');
      }, 5000);
    } catch (err) {
      setError(err.message || 'Gagal mengirim inquiry. Silakan coba lagi.');
      setSubmitButtonText('Gagal Mengirim');
      setTimeout(() => {
        setSubmitButtonText('Coba Lagi');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };


  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e81c34] focus:border-[#e81c34]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e81c34] focus:border-[#e81c34]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Model Mobil</label>
        <div className="relative">
          <input
            type="text"
            ref={modelInputRef}
            value={modelSearch}
            onFocus={() => setShowModelDropdown(true)}
            onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
            onChange={e => {
              setModelSearch(e.target.value);
              setShowModelDropdown(true);
            }}
            placeholder="Cari atau pilih model..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e81c34] focus:border-[#e81c34]"
            autoComplete="off"
            required
          />
          {showModelDropdown && filteredModels.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-200 rounded-md mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
              {filteredModels.map(m => (
                <li
                  key={m}
                  className={`px-3 py-2 cursor-pointer hover:bg-[#e81c34] ${model === m ? 'bg-[#e81c34]' : ''}`}
                  onMouseDown={() => {
                    setModel(m);
                    setModelSearch(m);
                    setShowModelDropdown(false);
                  }}
                >
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Rencana Kebutuhan</label>
        <select
          value={rencanaKebutuhan}
          onChange={e => setRencanaKebutuhan(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e81c34] focus:border-[#e81c34]"
          required
        >
          {RENCANA_KEBUTUHAN_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Domisili</label>
        <select
          value={domisili}
          onChange={e => setDomisili(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e81c34] focus:border-[#e81c34]"
          required
        >
          {DOMISILI_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 rounded-md font-semibold text-white bg-[#e81c34] hover:bg-[#e81c34] disabled:opacity-60 transition"
        disabled={loading}
      >
        {submitButtonText}
      </button>
    </form>
  );

  const innerContent = (
    <div className={`bg-white rounded-lg w-full ${asModal ? 'max-w-md shadow-lg' : 'max-w-xl shadow-2xl border border-gray-100'} relative overflow-hidden`}>
      {asModal && (
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-[#e81c34] z-20 text-4xl font-bold transition focus:outline-none"
          onClick={onClose}
          aria-label="Tutup"
        >
          &times;
        </button>
      )}
      {/* Inquiry Form */}
      <div className="w-full px-4 py-6 md:p-8 flex flex-col justify-center">
        {success ? (
          <div className="text-center py-10">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">Penawaran Terkirim!</h3>
            <p className="text-gray-600 mt-2">Terima kasih! Tim kami akan segera menghubungi Anda.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center text-[#e81c34]">Formulir Penawaran Mobil</h2>
            {error && <div className="text-red-600 text-center mb-2">{error}</div>}
            {formContent}
          </>
        )}
      </div>
    </div>
  );

  if (asModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        {innerContent}
      </div>
    );
  }
  // Section mode
  return (
    <section id="inquiry-form-section" className="w-full py-16 md:py-24 bg-white flex justify-center items-center">
      {innerContent}
    </section>
  );
};

export default InquiryModal;
