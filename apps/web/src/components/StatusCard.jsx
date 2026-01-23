import React, { useState, useEffect } from 'react';

export default function StatusCard({ checkInTime, checkOutTime, onCheckOut }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };
    return (
        <div className="relative w-full rounded-2xl bg-primary text-white shadow-lg overflow-hidden mt-2 group">
            {/* Background Image Overlay */}
            <div
                className="absolute inset-0 opacity-10 bg-cover bg-center"
                data-alt="Abstract traditional Javanese Batik pattern"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB8ONI4QGgSDs2f8Y-YgGCyDUFCm0xPDceQERMN8MCKJH7Ya0Abd0enCqKpvoeDB6iv6acZlJOMtQeJSp8PgJXnvKqn7_8RVeMiOqgRig-y0CbGx9bxfM8XWocTryuwD-m_eMTS7_0DmbW0S45HImDhN5TWqjwh9C2_7RZA3-uUfCkCHL9ZxDpO5HLbLphsieIn9QhwsW1r02L_bcFeMue4oDD9eJyNDiufDlJbgVpSgMI7eeHDbI1S5L1_tnrOel1XEoByVez2y4I')" }}
            ></div>
            {/* Gold Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#4a1919] opacity-90"></div>

            {/* Decorative Gold Corners */}
            <div className="ornament-corner ornament-tl"></div>
            <div className="ornament-corner ornament-tr"></div>
            <div className="ornament-corner ornament-bl"></div>
            <div className="ornament-corner ornament-br"></div>

            {/* Card Content */}
            <div className="relative z-10 p-6 flex flex-col gap-6 items-center text-center">
                <div className="flex flex-col items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/20 text-accent text-sm font-bold border border-accent/30 backdrop-blur-md">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        Status: {checkInTime ? 'Sudah Presensi' : 'Di Kantor'}
                    </span>
                    <div className="text-accent/80 text-xs uppercase tracking-widest font-semibold mt-2">Waktu Saat Ini</div>
                    <div className="font-serif text-5xl font-medium text-white tracking-wide">{formatTime(time)}</div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>

                <div className="grid grid-cols-2 w-full gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Masuk</span>
                        <span className="text-xl font-bold text-white font-display">{checkInTime || '--:--'}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-white/10">
                        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Keluar</span>
                        <span className="text-xl font-bold text-white font-display">{checkOutTime || '--:--'}</span>
                    </div>
                </div>

                {/* Main Action Button */}
                {!checkOutTime && checkInTime ? (
                    <button
                        onClick={onCheckOut}
                        className="w-full py-3 bg-accent hover:bg-[#c59a45] text-primary font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Check Out Sekarang
                    </button>
                ) : checkOutTime ? (
                    <div className="w-full py-3 bg-white/10 text-white/50 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                        <span className="material-symbols-outlined">check_circle</span>
                        Selesai Hari Ini
                    </div>
                ) : (
                    <button className="w-full py-3 bg-white/10 text-white/50 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                        <span className="material-symbols-outlined">login</span>
                        Belum Presensi Masuk
                    </button>
                )}
            </div>
        </div>
    );
}
