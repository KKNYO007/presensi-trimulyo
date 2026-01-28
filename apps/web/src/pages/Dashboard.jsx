import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as presenceService from '../services/presence.service';
import * as activityService from '../services/activity.service';
import Header from '../components/Header';
import StatusCard from '../components/StatusCard';
import HistoryList from '../components/HistoryList';
import ActivityList from '../components/ActivityList';
import BottomNav from '../components/BottomNav';

export default function Dashboard() {
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [activities, setActivities] = useState([]);
    const [todayPresensi, setTodayPresensi] = useState(null);
    const [presenceHistory, setPresenceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    const toggleFab = () => setIsFabOpen(!isFabOpen);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            // Load today's presence
            const presenceData = await presenceService.getTodayPresence();
            if (presenceData) {
                setTodayPresensi({
                    time: presenceData.checkInTime ? formatTime(presenceData.checkInTime) : null,
                    checkOutTime: presenceData.checkOutTime ? formatTime(presenceData.checkOutTime) : null,
                    date: formatDate(presenceData.date),
                    status: presenceData.status === 'TEPAT_WAKTU' ? 'Tepat Waktu' : 'Terlambat',
                });
            }

            // Load activities
            const activitiesResponse = await activityService.getActivities({ limit: 5 });
            if (activitiesResponse.data) {
                setActivities(activitiesResponse.data.map(activity => ({
                    id: activity.id,
                    date: formatDate(activity.date),
                    time: formatTime(activity.startTime),
                    title: activity.title,
                    description: activity.description,
                    startTime: formatTime(activity.startTime),
                    endTime: formatTime(activity.endTime),
                    photos: activity.photoUrls || [],
                })));
            }

            // Load presence history
            const historyResponse = await presenceService.getPresenceHistory({ limit: 10 });
            if (historyResponse.data) {
                setPresenceHistory(historyResponse.data.map(presence => ({
                    id: presence.id,
                    date: formatDate(presence.date),
                    time: presence.checkInTime ? formatTime(presence.checkInTime) : '--:--',
                    checkOutTime: presence.checkOutTime ? formatTime(presence.checkOutTime) : null,
                    status: presence.status === 'TEPAT_WAKTU' ? 'Tepat Waktu' : 'Terlambat',
                })));
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatTime(timeStr) {
        if (!timeStr) return '--:--';
        // Handle both ISO date and time-only formats
        if (timeStr.includes('T')) {
            return new Date(timeStr).toLocaleTimeString('id-ID', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            }).replace('.', ':');
        }
        // Time-only format (HH:MM:SS)
        return timeStr.substring(0, 5).replace('.', ':');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    const handleCheckout = async () => {
        if (!todayPresensi || todayPresensi.checkOutTime) return;

        try {
            await presenceService.checkOut();

            const now = new Date();
            const checkOutTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            setTodayPresensi(prev => ({
                ...prev,
                checkOutTime: checkOutTime,
                status: 'Selesai'
            }));

            alert('Check-out Berhasil!');
        } catch (error) {
            console.error('Checkout error:', error);
            alert(error.message || 'Gagal melakukan check-out');
        }
    };

    return (
        <div className="relative z-10 flex h-[100dvh] grow flex-col items-center w-full max-w-[1440px] mx-auto overflow-hidden">
            {/* PWA/Mobile Viewport Simulation Container */}
            <div className="w-full max-w-[480px] h-full flex flex-col bg-white/80 dark:bg-[#1e1414]/90 shadow-2xl backdrop-blur-sm border-x border-[#f1eaea] dark:border-white/5 relative">
                <Header userName={user?.name} />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto px-6 pb-6 relative z-10">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="size-8 rounded-full border-4 border-primary border-t-accent animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            <StatusCard
                                checkInTime={todayPresensi?.time}
                                checkOutTime={todayPresensi?.checkOutTime}
                                onCheckOut={handleCheckout}
                            />
                            <ActivityList activities={activities} />
                            <HistoryList presenceHistory={presenceHistory} loading={loading} />
                        </>
                    )}
                </main>

                {/* FAB Overlay */}
                {isFabOpen && (
                    <div className="absolute inset-0 z-40 bg-background-light/50 dark:bg-black/50 backdrop-blur-sm flex flex-col items-center justify-end pb-32" onClick={() => setIsFabOpen(false)}>

                        {/* Log Kegiatan Action */}
                        <div className="relative flex items-center mb-5 group cursor-pointer animate-[fade-in-up_0.3s_ease-out]" onClick={(e) => { e.stopPropagation(); navigate('/log-kegiatan'); }}>
                            <span className="absolute right-[calc(100%+16px)] bg-white dark:bg-[#2a1f1f] text-primary dark:text-accent px-4 py-2 rounded-xl text-sm font-bold shadow-md font-serif border border-primary/10 whitespace-nowrap">
                                Log Kegiatan
                            </span>
                            <button className="size-14 rounded-full bg-accent hover:bg-[#eec575] text-primary flex items-center justify-center shadow-[0_4px_12px_rgba(212,168,83,0.5)] border-4 border-[#fbf9f9] dark:border-[#1e1414] transition-transform hover:scale-110">
                                <span className="material-symbols-outlined text-2xl font-bold">edit_note</span>
                            </button>
                        </div>

                        {/* Presensi Action */}
                        <div className="relative flex items-center mb-2 group cursor-pointer animate-[fade-in-up_0.2s_ease-out]" onClick={(e) => { e.stopPropagation(); navigate('/presensi-masuk'); }}>
                            <span className="absolute right-[calc(100%+16px)] bg-white dark:bg-[#2a1f1f] text-primary dark:text-accent px-4 py-2 rounded-xl text-sm font-bold shadow-md font-serif border border-primary/10 whitespace-nowrap">
                                Presensi
                            </span>
                            <button className="size-14 rounded-full bg-accent hover:bg-[#eec575] text-primary flex items-center justify-center shadow-[0_4px_12px_rgba(212,168,83,0.5)] border-4 border-[#fbf9f9] dark:border-[#1e1414] transition-transform hover:scale-110">
                                <span className="material-symbols-outlined text-2xl font-bold">photo_camera</span>
                            </button>
                        </div>

                    </div>
                )}

                <BottomNav isOpen={isFabOpen} onFabClick={toggleFab} />
            </div>
        </div>
    );
}
