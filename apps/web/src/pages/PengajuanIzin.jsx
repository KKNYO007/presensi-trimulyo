import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import leaveService from '../services/leave.service';

export default function PengajuanIzin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: '',
        startDate: '',
        endDate: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess(false);

        // Validation
        if (!formData.type || !formData.startDate || !formData.endDate) {
            setError('Mohon lengkapi semua field yang wajib diisi.');
            return;
        }

        try {
            setLoading(true);
            await leaveService.createLeaveRequest({
                type: formData.type,
                startDate: formData.startDate,
                endDate: formData.endDate,
                notes: formData.notes,
            });

            // Show success notification
            setSuccess(true);

            // Navigate to history page after a short delay
            setTimeout(() => {
                navigate('/riwayat-izin');
            }, 1500);
        } catch (err) {
            console.error('Error submitting leave request:', err);
            setError(err.message || err.response?.data?.message || 'Gagal mengajukan permohonan. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#181010] h-[100dvh] flex flex-col overflow-hidden">
            <div className="fixed inset-0 bg-batik-pattern z-0 pointer-events-none opacity-5"></div>
            <div className="relative z-10 flex h-full grow flex-col items-center w-full max-w-[1440px] mx-auto overflow-hidden">
                <div className="w-full max-w-[480px] h-full flex flex-col bg-white/80 dark:bg-[#1e1414]/90 shadow-2xl backdrop-blur-sm border-x border-[#f1eaea] dark:border-white/5 relative">

                    {/* Header */}
                    <header className="flex items-center justify-between px-6 pt-8 pb-4 bg-[#fbf9f9] dark:bg-background-dark/50 z-20">
                        <button
                            onClick={() => navigate(-1)}
                            className="size-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-sm border border-primary/5 hover:bg-gray-50 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="font-serif text-xl font-bold text-primary dark:text-white tracking-tight">Pengajuan Izin</h1>
                        <div className="size-10"></div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto px-6 pb-32 flex flex-col pt-6">
                        <div className="relative flex flex-col gap-5 p-6 mt-4 w-full">
                            {/* Ornaments */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent rounded-tl-lg pointer-events-none"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent rounded-tr-lg pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent rounded-bl-lg pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent rounded-br-lg pointer-events-none"></div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                    Pengajuan izin berhasil dikirim! Mengalihkan...
                                </div>
                            )}

                            {/* Form Fields */}
                            <div className="flex flex-col gap-2">
                                <label className="font-serif text-sm font-bold text-primary dark:text-accent ml-1">Tipe Izin</label>
                                <div className="group flex items-center gap-3 p-4 bg-white dark:bg-[#2a1f1f] rounded-xl shadow-sm border border-primary/20 dark:border-white/10 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20 transition-all">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary/70 dark:bg-primary/20">
                                        <span className="material-symbols-outlined text-[18px]">category</span>
                                    </div>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-none p-0 text-gray-700 dark:text-gray-200 font-tech focus:ring-0 cursor-pointer text-sm outline-none"
                                    >
                                        <option value="" disabled>Pilih salah satu</option>
                                        <option value="SAKIT">Sakit</option>
                                        <option value="IZIN">Izin Penting</option>
                                        <option value="CUTI">Cuti Tahunan</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-serif text-sm font-bold text-primary dark:text-accent ml-1">Dari Tanggal</label>
                                <div className="group flex items-center gap-3 p-4 bg-white dark:bg-[#2a1f1f] rounded-xl shadow-sm border border-primary/20 dark:border-white/10 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20 transition-all">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary/70 dark:bg-primary/20">
                                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                    </div>
                                    <input
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-none p-0 text-gray-700 dark:text-gray-200 font-tech focus:ring-0 cursor-pointer text-sm outline-none"
                                        placeholder="Select date"
                                        type="date"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-serif text-sm font-bold text-primary dark:text-accent ml-1">Sampai Tanggal</label>
                                <div className="group flex items-center gap-3 p-4 bg-white dark:bg-[#2a1f1f] rounded-xl shadow-sm border border-primary/20 dark:border-white/10 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20 transition-all">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary/70 dark:bg-primary/20">
                                        <span className="material-symbols-outlined text-[18px]">event_available</span>
                                    </div>
                                    <input
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-none p-0 text-gray-700 dark:text-gray-200 font-tech focus:ring-0 cursor-pointer text-sm outline-none"
                                        placeholder="Select date"
                                        type="date"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 h-full">
                                <label className="font-serif text-sm font-bold text-primary dark:text-accent ml-1">Keterangan</label>
                                <div className="group flex items-start gap-3 p-4 bg-white dark:bg-[#2a1f1f] rounded-xl shadow-sm border border-primary/20 dark:border-white/10 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20 transition-all h-28">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary/70 dark:bg-primary/20 mt-1">
                                        <span className="material-symbols-outlined text-[18px]">description</span>
                                    </div>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="w-full h-full bg-transparent border-none p-0 text-gray-700 dark:text-gray-200 font-tech focus:ring-0 cursor-text text-sm outline-none resize-none pt-1"
                                        placeholder="Tuliskan keterangan izin anda..."
                                    ></textarea>
                                </div>
                            </div>

                        </div>

                        <div className="mt-auto pt-8">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-4 bg-accent hover:bg-[#c59a45] text-primary rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined relative z-10">send</span>
                                        <span className="font-medium text-base relative z-10 tracking-[0.2em] font-display">AJUKAN PERMOHONAN</span>
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3 font-tech italic">
                                * Menunggu approval admin
                            </p>
                        </div>
                    </main>

                    <BottomNav />
                </div>
            </div>
        </div>
    );
}
