import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import presenceService from '../services/presence.service';
import { useState } from 'react';

export default function EksporPresensi() {
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const [year, month] = selectedMonth.split('-');

            // Start date: 1st of month
            const startDate = `${year}-${month}-01`;

            // End date: last day of month
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${year}-${month}-${lastDay}`;

            const blob = await presenceService.exportPresence({ startDate, endDate });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = blob.fileName || `Presensi_${startDate}_${endDate}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
            alert(`Gagal mengunduh data presensi. Error: ${error.status || 'Unknown'} - ${error.message || ''}`);
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
                        <h1 className="font-serif text-xl font-bold text-primary dark:text-white tracking-tight">Ekspor Presensi</h1>
                        <div className="size-10"></div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto px-6 pb-32 flex flex-col pt-6">
                        <div className="relative flex flex-col gap-5 p-6 mt-4 w-full">
                            {/* Ornaments - Slightly different style than Kegiatan */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent rounded-tl-lg pointer-events-none"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent rounded-tr-lg pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent rounded-bl-lg pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent rounded-br-lg pointer-events-none"></div>

                            <div className="flex flex-col gap-2">
                                <label className="font-serif text-sm font-bold text-primary dark:text-accent ml-1">Pilih Bulan</label>
                                <div className="relative group/input">
                                    <input
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-primary/10 focus:border-accent focus:ring-1 focus:ring-accent bg-background-light dark:bg-white/5 text-primary dark:text-white font-tech outline-none transition-all cursor-pointer shadow-sm hover:bg-white dark:hover:bg-white/10"
                                        type="month"
                                    />
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within/input:text-accent transition-colors">calendar_month</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8">
                            <button
                                onClick={handleExport}
                                disabled={loading}
                                className="w-full py-4 bg-accent hover:bg-[#c59a45] text-primary rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="material-symbols-outlined relative z-10">{loading ? 'hourglass_top' : 'download'}</span>
                                <span className="font-medium text-base relative z-10 tracking-[0.2em] font-display">{loading ? 'MENGUNDUH...' : 'UNDUH FILE'}</span>
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3 font-tech italic">
                                * File Excel (.xlsx) otomatis terunduh
                            </p>
                        </div>
                    </main>

                    <BottomNav />
                </div>
            </div>
        </div>
    );
}
