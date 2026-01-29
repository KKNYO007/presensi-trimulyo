import React, { useEffect, useRef, useState } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setLoading(true);
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
        } finally {
            setLoading(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                onCapture(blob);
                stopCamera();
            }
        }, 'image/jpeg', 0.8);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-[#1e1414] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 bg-primary text-white flex justify-between items-center">
                    <h3 className="font-serif font-bold text-lg">Ambil Foto Profil</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="relative aspect-[3/4] bg-black">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined animate-spin text-4xl">restart_alt</span>
                        </div>
                    )}

                    {error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
                            <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                            <p>{error}</p>
                            <button onClick={startCamera} className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm">Coba Lagi</button>
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                        />
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="p-6 bg-white dark:bg-[#1e1414] flex justify-center">
                    <button
                        onClick={handleCapture}
                        disabled={loading || error}
                        className="size-16 rounded-full border-4 border-primary p-1 flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-full h-full bg-primary rounded-full"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraCapture;
