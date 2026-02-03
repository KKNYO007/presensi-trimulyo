import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import * as presenceService from '../services/presence.service';
import { useAuth } from '../contexts/AuthContext';

// Fix for Leaflet default icon issues in React
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28]
});

// Custom icon for Office
let OfficeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28]
});

// Component to handle map bounds
function ChangeView({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [bounds, map]);
    return null;
}

L.Marker.prototype.options.icon = DefaultIcon;

const DetailPresensi = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [presence, setPresence] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPresenceDetail();
    }, [id]);

    async function loadPresenceDetail() {
        try {
            setLoading(true);
            setLoading(true);
            const data = await presenceService.getPresenceById(id);
            if (data) {
                setPresence(data);
            }
        } catch (error) {
            console.error('Error loading presence detail:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    function formatTime(timeStr) {
        if (!timeStr) return '--:--';
        if (timeStr.includes('T')) {
            return new Date(timeStr).toLocaleTimeString('id-ID', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            }).replace('.', ':');
        }
        return timeStr.substring(0, 5).replace('.', ':');
    }

    const officePosition = [
        parseFloat(import.meta.env.VITE_OFFICE_LAT || -7.7123),
        parseFloat(import.meta.env.VITE_OFFICE_LNG || 110.3645)
    ]; // Kantor Kelurahan Trimulyo
    const userPosition = presence?.latitude && presence?.longitude
        ? [parseFloat(presence.latitude), parseFloat(presence.longitude)]
        : null;

    const bounds = userPosition ? [officePosition, userPosition] : null;

    const statusDisplay = presence?.status === 'TEPAT_WAKTU' ? 'Tepat Waktu' : 'Terlambat';
    const isOnTime = presence?.status === 'TEPAT_WAKTU';

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#181010] h-[100dvh] flex flex-col overflow-hidden">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-batik-pattern z-0 pointer-events-none opacity-5"></div>

            <div className="relative z-10 flex h-full grow flex-col items-center w-full max-w-[1440px] mx-auto overflow-hidden">
                <div className="w-full max-w-[480px] h-full flex flex-col bg-white/80 dark:bg-[#1e1414]/90 shadow-2xl backdrop-blur-sm border-x border-[#f1eaea] dark:border-white/5 relative">
                    {/* Header */}
                    <header className="flex items-center gap-4 px-6 pt-8 pb-4 bg-[#fbf9f9] dark:bg-background-dark/50 sticky top-0 z-30 backdrop-blur-md border-b border-primary/5">
                        <button
                            onClick={() => navigate(-1)}
                            className="size-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-sm hover:bg-gray-50 transition-colors group border border-primary/5"
                        >
                            <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        </button>
                        <div className="flex-1">
                            <h1 className="font-serif text-2xl font-bold text-primary dark:text-white tracking-tight">Detail Presensi</h1>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="size-8 rounded-full border-4 border-primary border-t-accent animate-spin"></div>
                        </div>
                    ) : presence ? (
                        <>
                            {/* Info Section */}
                            <div className="px-6 py-4 flex items-center justify-between border-b border-dashed border-primary/10 bg-[#fbf9f9]/80">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-[#8a5c5c] font-bold uppercase tracking-widest">Nama Pegawai</span>
                                    <span className="text-base font-serif font-bold text-[#181010] dark:text-white">{user?.name || 'Pegawai'}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-[#8a5c5c] font-bold uppercase tracking-widest">Tanggal</span>
                                    <span className="text-sm font-serif font-medium text-primary dark:text-accent italic">{formatDate(presence.date)}</span>
                                </div>
                            </div>

                            <main className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
                                {/* Status Card */}
                                <div className="relative w-full bg-primary text-white rounded-2xl p-6 shadow-xl mb-8 overflow-hidden border border-primary/20 group transition-transform hover:scale-[1.01] duration-500">
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/batik-pattern.png')]"></div>

                                    {/* Corner accents */}
                                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-accent rounded-tl-lg opacity-80"></div>
                                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-accent rounded-tr-lg opacity-80"></div>
                                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-accent rounded-bl-lg opacity-80"></div>
                                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-accent rounded-br-lg opacity-80"></div>

                                    <div className="relative z-10 flex flex-col gap-6">
                                        <div className="flex items-start justify-between border-b border-white/10 pb-4">
                                            <div>
                                                <p className="text-accent/90 text-[10px] font-bold uppercase tracking-widest mb-1">Jam Masuk</p>
                                                <h2 className="text-4xl font-serif font-medium tracking-wide">{formatTime(presence.checkInTime)}</h2>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <p className="text-accent/90 text-[10px] font-bold uppercase tracking-widest mb-2">Status</p>
                                                <div className={`inline-flex items-center gap-1.5 ${isOnTime ? 'bg-[#4a6c4a]/40 text-[#dcfcdc] border-[#4a6c4a]/50' : 'bg-[#d97736]/40 text-[#fff3e0] border-[#d97736]/50'} px-3 py-1.5 rounded-lg border shadow-sm backdrop-blur-md`}>
                                                    <span className="material-symbols-outlined text-[18px]">{isOnTime ? 'check_circle' : 'schedule'}</span>
                                                    <span className="text-xs font-bold tracking-wide">{statusDisplay}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="mt-0.5 size-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent">
                                                <span className="material-symbols-outlined text-xl">location_on</span>
                                            </div>
                                            <div>
                                                <p className="text-accent/90 text-[10px] font-bold uppercase tracking-widest">Koordinat Presensi</p>
                                                <p className="font-mono text-base text-white/95 mt-0.5 tracking-tight">{presence.latitude}, {presence.longitude}</p>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Photo Evidence */}
                                {presence.selfieUrl && (
                                    <div className="relative w-full mb-8">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background-light dark:bg-[#1e1414] px-4 py-0.5 z-20">
                                            <span className="text-[10px] font-bold text-primary dark:text-accent uppercase tracking-widest">Bukti Foto</span>
                                        </div>
                                        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-[3px] border-accent bg-gray-100 z-10 group">
                                            <img
                                                alt="User Selfie Check-in"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                src={presence.selfieUrl}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Map Location */}
                                <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10 group bg-gray-100">
                                    <div className="absolute top-3 left-3 z-[400] bg-white/90 dark:bg-black/80 px-3 py-1 rounded-md shadow-sm border border-gray-200 dark:border-white/10 backdrop-blur-sm">
                                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            Lokasi Terkini
                                        </span>
                                    </div>

                                    <MapContainer
                                        center={officePosition}
                                        zoom={14}
                                        scrollWheelZoom={false}
                                        style={{ height: '100%', width: '100%' }}
                                        className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 z-0"
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={officePosition} icon={OfficeIcon}>
                                            <Popup>
                                                Kantor Kelurahan Trimulyo
                                            </Popup>
                                        </Marker>
                                        {userPosition && (
                                            <>
                                                <Marker position={userPosition}>
                                                    <Popup>
                                                        Lokasi Anda
                                                    </Popup>
                                                </Marker>
                                                <Polyline
                                                    positions={[officePosition, userPosition]}
                                                    color="#6b2424"
                                                    dashArray="5, 5"
                                                />
                                                <ChangeView bounds={bounds} />
                                            </>
                                        )}
                                    </MapContainer>
                                </div>
                            </main>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-[#8a5c5c]">Data presensi tidak ditemukan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailPresensi;
