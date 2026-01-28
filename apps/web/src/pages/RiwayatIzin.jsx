import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import leaveService from '../services/leave.service';

export default function RiwayatIzin() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await leaveService.getLeaveRequests({ limit: 50 });
            console.log('Leave requests response:', response);
            // Handle different response structures
            const data = response.data || response;
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    label: 'Menunggu',
                    bgColor: 'bg-orange-50',
                    textColor: 'text-orange-600',
                    borderColor: 'border-orange-200',
                    indicatorColor: 'bg-orange-500',
                    lineColor: 'bg-accent',
                    icon: null,
                    pulse: true
                };
            case 'APPROVED':
                return {
                    label: 'Disetujui',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-700',
                    borderColor: 'border-green-200',
                    indicatorColor: 'bg-green-500',
                    lineColor: 'bg-batik-green',
                    icon: 'check',
                    pulse: false
                };
            case 'REJECTED':
                return {
                    label: 'Ditolak',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-700',
                    borderColor: 'border-red-200',
                    indicatorColor: 'bg-red-500',
                    lineColor: 'bg-red-600',
                    icon: 'close',
                    pulse: false
                };
            default:
                return {
                    label: status,
                    bgColor: 'bg-gray-50',
                    textColor: 'text-gray-600',
                    borderColor: 'border-gray-200',
                    indicatorColor: 'bg-gray-500',
                    lineColor: 'bg-gray-400',
                    icon: null,
                    pulse: false
                };
        }
    };

    const getLeaveTypeLabel = (type) => {
        const types = {
            'SAKIT': 'Cuti Sakit',
            'IZIN': 'Izin Penting',
            'CUTI': 'Cuti Tahunan'
        };
        return types[type] || type;
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#181010] h-[100dvh] flex flex-col overflow-hidden">
            <div className="fixed inset-0 bg-batik-pattern z-0 pointer-events-none opacity-5"></div>
            <div className="relative z-10 flex h-full grow flex-col items-center w-full max-w-[1440px] mx-auto overflow-hidden">
                <div className="w-full max-w-[480px] h-full flex flex-col bg-white/80 dark:bg-[#1e1414]/90 shadow-2xl backdrop-blur-sm border-x border-[#f1eaea] dark:border-white/5 relative">

                    {/* Header */}
                    <header className="flex flex-col gap-4 px-6 pt-8 pb-6 bg-[#fbf9f9] dark:bg-background-dark/50 sticky top-0 z-20 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="size-10 rounded-full bg-white border border-gray-200 dark:bg-white/10 dark:border-white/10 flex items-center justify-center text-primary dark:text-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all group"
                            >
                                <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                            </button>
                            <h1 className="font-serif text-2xl font-bold leading-tight text-primary dark:text-white tracking-tight">
                                Riwayat Izin
                            </h1>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto px-6 pb-28 pt-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <span className="material-symbols-outlined text-6xl mb-4 opacity-20">history_edu</span>
                                <p className="font-serif italic text-lg">Belum ada riwayat pengajuan</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5">
                                {requests.map((req) => {
                                    const config = getStatusConfig(req.status);
                                    return (
                                        <div key={req.id} className="bg-white dark:bg-[#2a1f1f] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-5 relative overflow-hidden group hover:shadow-md transition-all">
                                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${config.lineColor}`}></div>
                                            <div className="flex justify-between items-start mb-4 pl-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jenis Izin</span>
                                                    <span className="font-serif text-lg font-bold text-primary dark:text-white">
                                                        {getLeaveTypeLabel(req.type)}
                                                    </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bgColor} ${config.textColor} border ${config.borderColor} shadow-sm flex items-center gap-1`}>
                                                    {config.icon ? (
                                                        <span className="material-symbols-outlined text-sm">{config.icon}</span>
                                                    ) : (
                                                        <span className={`size-1.5 rounded-full ${config.indicatorColor} ${config.pulse ? 'animate-pulse' : ''}`}></span>
                                                    )}
                                                    {config.label}
                                                </span>
                                            </div>
                                            <div className="space-y-4 pl-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Tanggal Mulai</p>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-sm text-accent">calendar_today</span>
                                                            {formatDate(req.startDate)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Tanggal Selesai</p>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-sm text-accent">event</span>
                                                            {formatDate(req.endDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="pt-3 border-t border-dashed border-gray-200 dark:border-white/10">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Alasan</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                                        "{req.reason || req.notes || 'Tidak ada keterangan.'}"
                                                    </p>
                                                </div>
                                                {req.rejectedReason && (
                                                    <div className="pt-2">
                                                        <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1">Alasan Penolakan</p>
                                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                            {req.rejectedReason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>

                    {/* Bottom Navigation */}
                    <BottomNav />
                </div>
            </div>
        </div>
    );
}
