import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as presenceService from '../services/presence.service';
import BottomNav from '../components/BottomNav';

const PresensiMasuk = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [distanceToOffice, setDistanceToOffice] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [retryTrigger, setRetryTrigger] = useState(0);

    // Kantor Kelurahan Trimulyo Coordinates
    const OFFICE_COORDS = { lat: -7.682067371531455, lng: 110.35755937948723 };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const toggleFab = () => setIsFabOpen(!isFabOpen);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.8);
        });
    };

    const handleCheckIn = async () => {
        if (!currentLocation) {
            alert('Lokasi belum tersedia. Silakan tunggu.');
            return;
        }

        // Distance Check
        if (distanceToOffice !== null && distanceToOffice > 1.0) {
            const confirmCheckIn = window.confirm(`Anda berada ${distanceToOffice.toFixed(2)}km dari kantor kalurahan. Lanjutkan presensi?`);
            if (!confirmCheckIn) return;
        }

        setLoading(true);

        try {
            // Capture photo from video
            const photoBlob = await capturePhoto();

            if (!photoBlob) {
                alert('Gagal mengambil foto. Silakan coba lagi.');
                setLoading(false);
                return;
            }

            // Call API
            await presenceService.checkIn(
                currentLocation.lat,
                currentLocation.lng,
                photoBlob
            );

            alert('Presensi Berhasil!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Check-in error:', error);
            alert(error.message || 'Gagal melakukan presensi. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check if already present today
        async function checkTodayPresence() {
            try {
                const presence = await presenceService.getTodayPresence();
                if (presence && presence.checkInTime) {
                    setAlreadyCheckedIn(true);
                    alert("Anda sudah melakukan presensi masuk hari ini!");
                    navigate('/dashboard');
                }
            } catch (error) {
                // No presence today, that's fine
                console.log('No presence today');
            }
        }
        checkTodayPresence();

        // Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });

                    const dist = calculateDistance(latitude, longitude, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
                    setDistanceToOffice(dist);
                },
                (error) => {
                    console.error("Error getting location:", error.message, error.code);
                    let errorMessage = "Gagal mendapatkan lokasi.";
                    switch (error.code) {
                        case 1: // PERMISSION_DENIED
                            errorMessage = "Izin lokasi ditolak. Mohon aktifkan izin lokasi di browser Anda.";
                            break;
                        case 2: // POSITION_UNAVAILABLE
                            errorMessage = "Informasi lokasi tidak tersedia. Pastikan GPS aktif.";
                            break;
                        case 3: // TIMEOUT
                            errorMessage = "Waktu permintaan lokasi habis. Coba lagi.";
                            break;
                        default:
                            errorMessage = `Terjadi kesalahan: ${error.message}`;
                    }
                    alert(errorMessage);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            alert("Geolocation tidak didukung oleh browser ini.");
        }

        let stream = null;
        let isMounted = true;
        let retryCount = 0;
        const MAX_RETRIES = 3;

        const startCamera = async () => {
            setCameraError(null);

            // Ensure any previous stream is stopped before starting a new one
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }

            // Short delay to let the hardware release the camera
            // Wait longer if we are retrying manually
            await new Promise(r => setTimeout(r, 500));
            if (!isMounted) return;

            try {
                // Try user facing mode first
                let newStream;
                try {
                    newStream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'user' }
                    });
                } catch (err) {
                    // Fallback: Try any video source if 'user' mode fails
                    console.warn("Retrying with fallback constraints...", err);
                    newStream = await navigator.mediaDevices.getUserMedia({
                        video: true
                    });
                }

                if (!isMounted) {
                    // Component unmounted while waiting for camera, stop it immediately
                    newStream.getTracks().forEach(track => track.stop());
                    return;
                }

                stream = newStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error accessing camera:", err);

                // Handle AbortError specifically with auto-retry
                if (err.name === 'AbortError' || err.message.includes('Starting videoinput failed')) {
                    if (retryCount < MAX_RETRIES) {
                        console.log(`AbortError encountered. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
                        retryCount++;
                        setTimeout(startCamera, 1000); // Wait 1s and retry
                        return;
                    }
                }

                // Log available devices for debugging help
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    console.log("Available devices:", devices.map(d => `${d.kind}: ${d.label}`));
                } catch (e) {
                    console.error("Could not enumerate devices:", e);
                }

                let msg = err.message || "Unknown error";
                let name = err.name || "Error";

                setCameraError(`${name}: ${msg}`);

                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    alert("Izin kamera ditolak. Mohon izinkan akses kamera untuk melakukan presensi.");
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    alert("Kamera tidak ditemukan.");
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    alert("Kamera tidak dapat diakses (NotReadableError). Kemungkinan sedang digunakan aplikasi lain atau driver bermasalah. Coba restart browser atau device.");
                } else {
                    if (err.name !== 'AbortError') {
                        alert("Gagal mengakses kamera: " + msg);
                    }
                }
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            // Stop local stream variable if it was set
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            // Also stop stream in video element if it exists
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [retryTrigger]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (alreadyCheckedIn) {
        return null;
    }

    return (
        <div className="relative z-10 flex h-[100dvh] grow flex-col items-center w-full max-w-[1440px] mx-auto overflow-hidden">
            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden"></canvas>

            {/* Main Container */}
            <div className="w-full max-w-[480px] h-full flex flex-col bg-white/80 dark:bg-[#1e1414]/90 shadow-2xl backdrop-blur-sm border-x border-[#f1eaea] dark:border-white/5 relative">

                {/* Header */}
                <header className="flex items-center justify-between px-6 pt-8 pb-4 bg-[#fbf9f9] dark:bg-background-dark/50 z-20">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="size-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-sm border border-primary/5 hover:bg-gray-50 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="font-serif text-xl font-bold text-primary dark:text-white tracking-tight">Presensi Masuk</h1>
                    <button className="size-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-sm border border-primary/5 hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto px-6 pb-32 flex flex-col gap-6 pt-2">
                    {/* Camera Preview */}
                    <div className="relative w-full aspect-[3/4] rounded-2xl bg-primary text-white shadow-xl overflow-hidden group shrink-0">
                        <div className="ornament-corner ornament-tl"></div>
                        <div className="ornament-corner ornament-tr"></div>
                        <div className="ornament-corner ornament-bl"></div>
                        <div className="ornament-corner ornament-br"></div>

                        <div className="absolute inset-[3px] rounded-xl overflow-hidden bg-black/50">
                            {cameraError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80 z-50">
                                    <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                                    <p className="text-white font-bold mb-1">Gagal Memuat Kamera</p>
                                    <p className="text-sm text-gray-300 font-mono mb-4 break-words w-full">{cameraError}</p>
                                    <button
                                        onClick={() => setRetryTrigger(prev => prev + 1)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors text-white border border-white/20"
                                    >
                                        Coba Lagi
                                    </button>
                                </div>
                            ) : null}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="w-48 h-48 border border-white/30 rounded-full relative">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent"></div>
                                </div>
                            </div>
                            <div className="scan-line"></div>
                        </div>

                        <div className="absolute top-6 left-0 right-0 flex justify-center z-30">
                            {/* "Deteksi Wajah Aktif" removed as requested */}
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="flex flex-col gap-4">
                        {/* Location Card */}
                        <div className="flex items-start gap-4 p-4 bg-white dark:bg-[#2a1f1f] rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary dark:bg-primary/20 border border-primary/10">
                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-serif text-base font-bold text-primary dark:text-white">Lokasi Terkini</h3>
                                    <span className={`px-2 py-0.5 rounded ${distanceToOffice !== null && distanceToOffice <= 1.0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border text-[10px] font-bold font-tech tracking-wide uppercase`}>
                                        {distanceToOffice !== null ? (distanceToOffice <= 1.0 ? 'Akurat' : 'Diluar Jangkauan') : 'Mencari...'}
                                    </span>
                                </div>
                                <p className="font-tech text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {currentLocation ? `Jarak: ${distanceToOffice.toFixed(2)}km dari Kantor` : 'Sedang mendeteksi lokasi...'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-gray-400 font-tech font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                                        {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : '...'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Time Card */}
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-[#2a1f1f] rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent dark:bg-accent/20 border border-accent/20">
                                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-serif text-sm font-bold text-primary dark:text-white">Waktu Sekarang</h3>
                                    <p className="font-tech text-xs text-gray-500">
                                        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-2xl font-bold font-tech text-primary dark:text-accent tracking-tight">
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace('.', ':').replace('.', ':')}
                            </div>
                        </div>
                    </div>

                    {/* Check-in Button */}
                    <button
                        onClick={handleCheckIn}
                        disabled={loading || !currentLocation}
                        className="w-full py-4 bg-accent hover:bg-[#c59a45] text-primary font-bold rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        {loading ? (
                            <>
                                <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin relative z-10"></div>
                                <span className="font-bold text-lg relative z-10 tracking-wide">Memproses...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined relative z-10">fingerprint</span>
                                <span className="font-bold text-lg relative z-10 tracking-wide">CHECK-IN</span>
                            </>
                        )}
                    </button>
                </main>

                {/* Bottom Navigation */}
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
                        <div className="relative flex items-center mb-2 group cursor-pointer animate-[fade-in-up_0.2s_ease-out]" onClick={(e) => { e.stopPropagation(); setIsFabOpen(false); }}>
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
};

export default PresensiMasuk;
