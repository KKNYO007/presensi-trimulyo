import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function Profil() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Implement logout logic here if needed (e.g. clearing tokens)
        navigate('/');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#181010] h-[100dvh] flex flex-col overflow-hidden">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-batik-pattern z-0 pointer-events-none opacity-5"></div>

            <div className="relative z-10 flex h-full grow flex-col items-center w-full max-w-[1440px] mx-auto overflow-hidden">
                <div className="w-full max-w-[480px] h-full flex flex-col bg-white/80 dark:bg-[#1e1414]/90 shadow-2xl backdrop-blur-sm border-x border-[#f1eaea] dark:border-white/5 relative">

                    {/* Header */}
                    <header className="flex flex-col gap-4 px-6 pt-8 pb-6 bg-[#fbf9f9] dark:bg-background-dark/50">
                        <div className="flex items-center justify-between">
                            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-accent shadow-md">
                                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>temple_buddhist</span>
                            </div>
                            <h1 className="font-serif text-2xl font-bold leading-tight text-primary dark:text-white tracking-tight">
                                Profil Pegawai
                            </h1>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto px-6 pb-28 pt-2">
                        {/* Profile Card */}
                        <div className="relative w-full rounded-2xl bg-primary text-white shadow-lg overflow-hidden mt-2 group">
                            <div className="absolute inset-0 opacity-10 bg-cover bg-center" data-alt="Abstract traditional Javanese Batik pattern" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB8ONI4QGgSDs2f8Y-YgGCyDUFCm0xPDceQERMN8MCKJH7Ya0Abd0enCqKpvoeDB6iv6acZlJOMtQeJSp8PgJXnvKqn7_8RVeMiOqgRig-y0CbGx9bxfM8XWocTryuwD-m_eMTS7_0DmbW0S45HImDhN5TWqjwh9C2_7RZA3-uUfCkCHL9ZxDpO5HLbLphsieIn9QhwsW1r02L_bcFeMue4oDD9eJyNDiufDlJbgVpSgMI7eeHDbI1S5L1_tnrOel1XEoByVez2y4I')" }}></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#4a1919] opacity-90"></div>

                            {/* Ornaments */}
                            <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-accent rounded-tl-lg pointer-events-none"></div>
                            <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-accent rounded-tr-lg pointer-events-none"></div>
                            <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-accent rounded-bl-lg pointer-events-none"></div>
                            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-accent rounded-br-lg pointer-events-none"></div>

                            <div className="relative z-10 p-8 flex flex-col gap-4 items-center text-center">
                                <div className="relative">
                                    <div className="h-28 w-28 rounded-full border-4 border-accent overflow-hidden shadow-xl bg-white/10">
                                        <img alt="User Avatar" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7rfOnjJxhUpRi5-jweT4okr2eaWA9PYoogqamb3R2ChV936K0AwNmsPTwEU-x2lKh9zwbulMrPj3OevwoQk2SToWppNcF2g2tpqiKyf9FM65mErJKX6OGroIPxtR_Ev7D1KdnJNE7B3ORBZnUi1o0h5IiJImLEk_CsaXnamHgyhF0HdLxXv2DhObxodNgqLvSP37b-gm_lfKkI13wydmKS0H6_IBL6I_GoT1UhgE7Kb6vNFAzf1QbeaCCCAPeKP92Hid3eCNq8o4" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 p-1.5 bg-accent rounded-full text-primary shadow-sm border-2 border-primary">
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1 mt-2">
                                    <h2 className="font-serif text-2xl font-bold text-white tracking-wide">Ahmad Subekti</h2>
                                    <p className="text-accent text-sm font-semibold uppercase tracking-widest">Staf Administrasi</p>
                                    <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/20 text-white/70 text-xs font-medium border border-white/10 backdrop-blur-md">
                                        <span>NIP. 19820312 201001 1 008</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Buttons */}
                        <div className="mt-8 flex flex-col gap-4">
                            <h3 className="text-primary dark:text-white text-lg font-bold font-serif tracking-tight px-1">Menu Utama</h3>
                            <div className="flex flex-col gap-3">
                                <MenuButton
                                    icon="assignment"
                                    title="Pengajuan Izin"
                                    subtitle="Formulir cuti & izin"
                                    accent="primary"
                                    onClick={() => navigate('/pengajuan-izin')}
                                />
                                <MenuButton
                                    icon="bar_chart"
                                    title="Ekspor Kegiatan"
                                    subtitle="Unduh data laporan"
                                    accent="accent"
                                    onClick={() => navigate('/ekspor-kegiatan')}
                                />
                                <MenuButton
                                    icon="calendar_month"
                                    title="Ekspor Presensi"
                                    subtitle="Rekap data absensi"
                                    accent="primary"
                                    onClick={() => navigate('/ekspor-presensi')}
                                />
                                <MenuButton
                                    icon="settings"
                                    title="Pengaturan"
                                    subtitle="Preferensi aplikasi"
                                    accent="accent"
                                />

                                <button
                                    onClick={handleLogout}
                                    className="w-full mt-2 py-3 bg-primary hover:bg-[#5a1e1e] text-white font-bold rounded-xl transition-all border border-primary shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    Keluar Aplikasi
                                </button>
                            </div>
                        </div>
                    </main>

                    {/* Bottom Navigation */}
                    <BottomNav />
                </div>
            </div>
        </div>
    );
}

function MenuButton({ icon, title, subtitle, accent, onClick }) {
    const isAccent = accent === 'accent';
    // Logic for styling based on accent prop
    const borderClass = isAccent ? 'border-accent' : 'border-primary';
    const iconBgClass = isAccent ? 'bg-[#fdfaf2] text-yellow-700 dark:bg-yellow-700/20 dark:text-accent' : 'bg-[#fbf9f9] text-primary dark:bg-primary/20 dark:text-primary';

    return (
        <button
            onClick={onClick}
            className={`group relative flex items-center justify-between p-4 bg-white dark:bg-[#2a1f1f] rounded-xl shadow-sm border-l-4 ${borderClass} hover:shadow-md transition-all active:scale-[0.99] overflow-hidden text-left`}
        >
            <div className="absolute right-0 top-0 bottom-0 w-16 opacity-5 bg-[url('https://placeholder.pics/svg/50')] bg-repeat-y"></div>
            <div className="flex items-center gap-4 z-10">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBgClass}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="flex flex-col">
                    <p className="text-[#181010] dark:text-white font-bold text-base font-serif">{title}</p>
                    <p className="text-[#8a5c5c] text-xs font-medium mt-0.5">{subtitle}</p>
                </div>
            </div>
            <div className="text-accent shrink-0 z-10 group-hover:translate-x-1 transition-transform">
                <span className="material-symbols-outlined">chevron_right</span>
            </div>
        </button>
    )
}
