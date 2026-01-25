import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as activityService from '../services/activity.service';
import TimePicker from '../components/TimePicker';
import BottomNav from '../components/BottomNav';

const LogKegiatan = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [photos, setPhotos] = useState([]);
    const [photoBlobs, setPhotoBlobs] = useState([]);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const toggleFab = () => setIsFabOpen(!isFabOpen);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Stop camera stream when component unmounts or camera closes
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    const startCamera = async () => {
        if (photos.length >= 3) {
            alert('Maksimal 3 foto');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setCameraStream(stream);
            setIsCameraOpen(true);
            // Wait for video element to be ready
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to base64 for preview
            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            setPhotos(prev => [...prev, photoData]);

            // Also store blob for upload
            canvas.toBlob((blob) => {
                setPhotoBlobs(prev => [...prev, blob]);
            }, 'image/jpeg', 0.8);

            stopCamera();
        }
    };

    const handleDeletePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoBlobs(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title || !description || !startTime || !endTime) {
            alert('Mohon lengkapi semua field termasuk jam mulai dan selesai');
            return;
        }

        setLoading(true);

        try {
            await activityService.createActivity({
                title,
                description,
                startTime,
                endTime,
            }, photoBlobs);

            alert('Kegiatan berhasil disimpan!');
            navigate(-1);
        } catch (error) {
            console.error('Error saving activity:', error);
            alert(error.message || 'Gagal menyimpan kegiatan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 flex h-[100dvh] grow flex-col items-center w-full max-w-[1440px] mx-auto overflow-hidden">
            {/* Camera Overlay */}
            {isCameraOpen && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    ></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>

                    <button
                        onClick={stopCamera}
                        className="absolute top-6 right-6 text-white p-2 bg-black/50 rounded-full"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>

                    <div className="absolute bottom-10 w-full flex justify-center">
                        <button
                            onClick={capturePhoto}
                            className="size-20 bg-white rounded-full border-4 border-gray-300 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <div className="size-16 bg-white rounded-full border-2 border-black"></div>
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full max-w-[480px] h-full flex flex-col bg-white/80 dark:bg-[#1e1414]/90 shadow-2xl backdrop-blur-sm border-x border-[#f1eaea] dark:border-white/5 relative">
                <header className="flex items-center gap-4 px-6 pt-8 pb-4 bg-[#fbf9f9] dark:bg-background-dark/50 sticky top-0 z-20 backdrop-blur-md">
                    <button
                        onClick={() => navigate(-1)}
                        className="size-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/5 transition-colors -ml-2"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <h1 className="font-serif text-2xl font-bold text-primary dark:text-white tracking-tight">Log Kegiatan</h1>
                </header>

                <main className="flex-1 overflow-y-auto pb-32">
                    <form className="flex flex-col gap-6 px-6 mt-2">
                        <div className="flex flex-col gap-2 group">
                            <label className="text-primary dark:text-accent font-serif font-bold text-lg">Judul Kegiatan</label>
                            <input
                                className="w-full bg-white dark:bg-white/5 border border-primary/30 rounded-xl p-4 text-[#181010] dark:text-white placeholder-primary/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:shadow-[0_0_15px_rgba(212,168,83,0.15)] transition-all font-display"
                                placeholder="Masukkan judul kegiatan..."
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <TimePicker
                                label="Jam Mulai"
                                value={startTime}
                                onChange={setStartTime}
                            />
                            <TimePicker
                                label="Jam Selesai"
                                value={endTime}
                                onChange={setEndTime}
                            />
                        </div>

                        <div className="flex flex-col gap-2 group">
                            <label className="text-primary dark:text-accent font-serif font-bold text-lg">Deskripsi</label>
                            <textarea
                                className="w-full bg-white dark:bg-white/5 border border-primary/30 rounded-xl p-4 text-[#181010] dark:text-white placeholder-primary/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:shadow-[0_0_15px_rgba(212,168,83,0.15)] transition-all font-display resize-none"
                                placeholder="Jelaskan detail kegiatan yang dilakukan..."
                                rows="5"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                            ></textarea>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end">
                                <label className="text-primary dark:text-accent font-serif font-bold text-lg">Foto Kegiatan</label>
                                <span className="text-xs font-serif italic text-primary/60 dark:text-accent/60">max 3 foto</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {photos.map((photo, index) => (
                                    <div key={index} className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative border border-primary/20 group shadow-sm">
                                        <img
                                            alt={`Preview foto ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            src={photo}
                                        />
                                        <button
                                            className="absolute top-1 right-1 size-6 flex items-center justify-center bg-white/90 rounded-full text-primary shadow-sm hover:bg-red-50 hover:text-red-600 z-10"
                                            type="button"
                                            onClick={() => handleDeletePhoto(index)}
                                            disabled={loading}
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4">
                                            <p className="text-[10px] text-white font-medium text-center">foto {index + 1}</p>
                                        </div>
                                    </div>
                                ))}

                                {photos.length < 3 && (
                                    <button
                                        className="aspect-square rounded-xl border border-dashed border-primary/40 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors text-primary gap-1 group relative overflow-hidden disabled:opacity-50"
                                        type="button"
                                        onClick={startCamera}
                                        disabled={loading}
                                    >
                                        <div className="absolute inset-0 bg-accent/5 scale-0 group-hover:scale-100 rounded-xl transition-transform origin-center"></div>
                                        <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform relative z-10">photo_camera</span>
                                        <span className="text-[10px] font-medium uppercase tracking-wide opacity-70 relative z-10">Kamera</span>
                                    </button>
                                )}

                                {/* Placeholder to maintain grid if needed, or just let grid flow */}
                                {photos.length < 2 && <div className="aspect-square rounded-xl border border-dashed border-primary/10 bg-gray-50/30 dark:bg-white/5"></div>}
                                {photos.length === 0 && <div className="aspect-square rounded-xl border border-dashed border-primary/10 bg-gray-50/30 dark:bg-white/5"></div>}
                            </div>
                        </div>

                        <div className="mt-4 pb-6">
                            <button
                                className="w-full py-4 bg-gradient-to-r from-[#b88a32] via-accent to-[#eec575] hover:from-[#a67c2d] hover:to-[#d4a853] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="size-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Simpan Kegiatan</span>
                                        <span className="material-symbols-outlined">save</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </main>

                {/* FAB Overlay */}
                {isFabOpen && (
                    <div className="absolute inset-0 z-40 bg-background-light/50 dark:bg-black/50 backdrop-blur-sm flex flex-col items-center justify-end pb-32" onClick={() => setIsFabOpen(false)}>

                        {/* Log Kegiatan Action */}
                        <div className="relative flex items-center mb-5 group cursor-pointer animate-[fade-in-up_0.3s_ease-out]" onClick={(e) => { e.stopPropagation(); setIsFabOpen(false); }}>
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
};

export default LogKegiatan;
