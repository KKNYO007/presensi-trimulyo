import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function EksporKegiatan() {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#181010] min-h-screen flex flex-col overflow-hidden">
            <div className="fixed inset-0 bg-batik-pattern z-0 pointer-events-none opacity-5"></div>
            <div className="relative z-10 flex h-full grow flex-col items-center w-full max-w-[1440px] mx-auto">
                <div className="w-full max-w-[480px] min-h-screen flex flex-col bg-white/80 dark:bg-[#1e1414]/90 shadow-2xl backdrop-blur-sm border-x border-[#f1eaea] dark:border-white/5 relative">

                    {/* Header */}
                    <header className="flex items-center justify-between px-6 pt-8 pb-4 bg-[#fbf9f9] dark:bg-background-dark/50 z-20">
                        <button
                            onClick={() => navigate(-1)}
                            className="size-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-sm border border-primary/5 hover:bg-gray-50 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="font-serif text-xl font-bold text-primary dark:text-white tracking-tight">Ekspor Kegiatan</h1>
                        <div className="size-10"></div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto px-6 pb-32 flex flex-col gap-8 pt-6">
                        <div className="relative w-full bg-white dark:bg-[#2a1f1f] rounded-2xl shadow-xl overflow-hidden group shrink-0 border border-primary/5">
                            {/* Ornaments */}
                            <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-accent rounded-tl-lg pointer-events-none z-20"></div>
                            <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-accent rounded-tr-lg pointer-events-none z-20"></div>
                            <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-accent rounded-bl-lg pointer-events-none z-20"></div>
                            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-accent rounded-br-lg pointer-events-none z-20"></div>

                            <div className="p-8 pt-10 flex flex-col gap-6 relative z-10">
                                <h2 className="font-serif text-lg text-center text-primary dark:text-accent font-medium italic mb-2">Pilih Rentang Waktu</h2>
                                <div className="flex flex-col gap-2">
                                    <label className="font-serif font-bold text-primary dark:text-white text-base pl-1">Tanggal Mulai</label>
                                    <div className="relative group/input">
                                        <input className="w-full pl-12 pr-4 py-4 rounded-xl border border-primary/10 focus:border-accent focus:ring-1 focus:ring-accent bg-background-light dark:bg-white/5 text-primary dark:text-white font-tech outline-none transition-all cursor-pointer shadow-sm hover:bg-white dark:hover:bg-white/10" type="date" />
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within/input:text-accent transition-colors">calendar_month</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-serif font-bold text-primary dark:text-white text-base pl-1">Tanggal Selesai</label>
                                    <div className="relative group/input">
                                        <input className="w-full pl-12 pr-4 py-4 rounded-xl border border-primary/10 focus:border-accent focus:ring-1 focus:ring-accent bg-background-light dark:bg-white/5 text-primary dark:text-white font-tech outline-none transition-all cursor-pointer shadow-sm hover:bg-white dark:hover:bg-white/10" type="date" />
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within/input:text-accent transition-colors">event_available</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1"></div>

                        <div className="flex flex-col gap-2">
                            <button className="w-full py-4 bg-accent hover:bg-[#c59a45] text-primary font-bold rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="material-symbols-outlined relative z-10 text-[24px]">download</span>
                                <span className="font-bold text-lg relative z-10 tracking-wide font-display">UNDUH FILE</span>
                            </button>
                            <p className="text-center font-serif text-primary dark:text-white/60 italic text-xs tracking-wide mt-2">* File otomatis terunduh</p>
                        </div>
                    </main>

                    <BottomNav />
                </div>
            </div>
        </div>
    );
}
