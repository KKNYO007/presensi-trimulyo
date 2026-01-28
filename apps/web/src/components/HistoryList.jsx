import React from 'react';
import { useNavigate } from 'react-router-dom';

const HistoryItem = ({ id, date, time, status, statusColor, borderClass }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/detail-presensi/${id}`)} className={`group relative flex items-center justify-between p-4 bg-white dark:bg-[#2a1f1f] rounded-xl shadow-sm border-l-4 ${borderClass} hover:shadow-md transition-shadow overflow-hidden cursor-pointer`}>
            <div className="absolute right-0 top-0 bottom-0 w-16 opacity-5 bg-[url('https://placeholder.pics/svg/50')] bg-repeat-y" data-alt="Subtle vertical decorative pattern"></div>
            <div className="flex items-center gap-4 z-10">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${statusColor === 'text-batik-green' ? 'bg-[#f4fbf4] dark:bg-batik-green/20' : 'bg-[#fdf6f2] dark:bg-batik-orange/20'} ${statusColor}`}>
                    <span className="material-symbols-outlined">{statusColor === 'text-batik-green' ? 'calendar_month' : 'history'}</span>
                </div>
                <div className="flex flex-col">
                    <p className="text-[#181010] dark:text-white font-bold text-base font-serif">{date}</p>
                    <p className="text-[#8a5c5c] text-xs font-medium mt-0.5">{time} • <span className={`${statusColor} font-bold`}>{status}</span></p>
                </div>
            </div>
            <div className="text-accent shrink-0 z-10">
                <span className="material-symbols-outlined">chevron_right</span>
            </div>
        </div>
    );
};

export default function HistoryList({ presenceHistory = [], loading = false }) {
    if (loading) {
        return (
            <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-primary dark:text-white text-lg font-bold font-serif tracking-tight">Riwayat Kehadiran</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="size-6 rounded-full border-4 border-primary border-t-accent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-primary dark:text-white text-lg font-bold font-serif tracking-tight">Riwayat Kehadiran</h3>
                <a className="text-xs font-bold text-[#8a5c5c] hover:text-primary transition-colors" href="#">Lihat Semua</a>
            </div>
            <div className="flex flex-col gap-3">
                {presenceHistory.length === 0 ? (
                    <p className="text-center text-[#8a5c5c] text-sm py-4">Belum ada riwayat kehadiran</p>
                ) : (
                    presenceHistory.map((entry) => (
                        <HistoryItem
                            key={entry.id}
                            id={entry.id}
                            date={entry.date}
                            time={`${entry.time} - ${entry.checkOutTime || '--:--'}`}
                            status={entry.status}
                            statusColor={entry.status === 'Tepat Waktu' ? 'text-batik-green' : 'text-batik-orange'}
                            borderClass={entry.status === 'Tepat Waktu' ? 'border-batik-green' : 'border-batik-orange'}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
