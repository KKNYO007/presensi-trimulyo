import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import * as authService from '../services/auth.service';

const DataDiri = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    // Local state for form fields
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    if (!user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Update phone number if changed
            if (phone !== user.phoneNumber) {
                const updatedUser = await authService.updateProfile(phone);
                updateUser(updatedUser);
            }

            // Update password if provided
            if (currentPassword && newPassword) {
                if (newPassword.length < 6) {
                    setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
                    setLoading(false);
                    return;
                }
                await authService.updatePassword(currentPassword, newPassword);
                setCurrentPassword('');
                setNewPassword('');
            }

            setMessage({ type: 'success', text: 'Perubahan berhasil disimpan!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Gagal menyimpan perubahan' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#181010] h-[100dvh] flex flex-col overflow-hidden">
            <div className="fixed inset-0 bg-batik-pattern z-0 pointer-events-none"></div>
            <div className="relative z-10 flex h-full grow flex-col items-center w-full max-w-[1440px] mx-auto">
                <div className="w-full max-w-[480px] h-full flex flex-col bg-white/80 dark:bg-[#1e1414]/90 shadow-2xl backdrop-blur-sm border-x border-[#f1eaea] dark:border-white/5 relative">

                    <header className="flex items-center gap-4 px-6 pt-8 pb-6 bg-[#fbf9f9] dark:bg-background-dark/50 sticky top-0 z-20 backdrop-blur-md">
                        <button
                            onClick={() => navigate(-1)}
                            className="size-10 rounded-full bg-white dark:bg-primary/20 flex items-center justify-center text-primary shadow-sm hover:bg-gray-50 hover:shadow-md transition-all group border border-gray-100 dark:border-white/10"
                        >
                            <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        </button>
                        <h1 className="font-serif text-2xl font-bold leading-tight text-primary dark:text-white tracking-tight">
                            Data Diri
                        </h1>
                    </header>

                    <main className="flex-1 overflow-y-auto px-6 pb-32 pt-2">
                        <div className="flex justify-center mb-8 mt-2">
                            <div className="relative group cursor-pointer">
                                <div className="h-28 w-28 rounded-full border-4 border-accent overflow-hidden shadow-xl bg-white/10 relative z-0">
                                    <img
                                        alt={user.name}
                                        className="h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                    />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white">camera_alt</span>
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-accent rounded-full text-primary shadow-[0_2px_8px_rgba(0,0,0,0.2)] border-2 border-[#fbf9f9] hover:bg-[#eec575] hover:scale-105 transition-all z-20">
                                    <span className="material-symbols-outlined text-lg font-bold">edit</span>
                                </button>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                {message.text}
                            </div>
                        )}

                        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-primary/70 dark:text-white/70 text-sm font-sans font-medium uppercase tracking-wider pl-1">Nama Lengkap</label>
                                    <div className="w-full px-4 py-3 bg-primary/5 dark:bg-white/5 border border-primary/10 rounded-xl text-primary/80 dark:text-white/80 font-sans font-medium flex items-center gap-3 select-none">
                                        <span className="material-symbols-outlined text-[20px] opacity-60">badge</span>
                                        {user.name}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-primary/70 dark:text-white/70 text-sm font-sans font-medium uppercase tracking-wider pl-1">Jabatan</label>
                                    <div className="w-full px-4 py-3 bg-primary/5 dark:bg-white/5 border border-primary/10 rounded-xl text-primary/80 dark:text-white/80 font-sans font-medium flex items-center gap-3 select-none">
                                        <span className="material-symbols-outlined text-[20px] opacity-60">work</span>
                                        {user.jabatan}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 my-2">
                                <div className="h-px bg-primary/10 flex-1"></div>
                                <span className="text-xs font-serif text-accent italic">Edit Informasi</span>
                                <div className="h-px bg-primary/10 flex-1"></div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2 group">
                                    <label className="text-primary dark:text-white text-sm font-sans font-bold uppercase tracking-wider pl-1 group-focus-within:text-accent transition-colors">Nomor HP</label>
                                    <div className="relative">
                                        <input
                                            className="w-full px-4 py-3.5 pl-11 bg-white dark:bg-white/5 border border-primary/30 rounded-xl text-primary dark:text-white font-sans font-medium focus:border-accent focus:ring-1 focus:ring-accent outline-none shadow-sm transition-all placeholder:text-gray-400 group-hover:border-primary/50"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Masukkan nomor HP"
                                            disabled={loading}
                                        />
                                        <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-primary/40 group-focus-within:text-accent transition-colors">call</span>
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-primary dark:text-white text-sm font-sans font-bold uppercase tracking-wider pl-1 group-focus-within:text-accent transition-colors">Password Saat Ini</label>
                                    <div className="relative">
                                        <input
                                            className="w-full px-4 py-3.5 pl-11 bg-white dark:bg-white/5 border border-primary/30 rounded-xl text-primary dark:text-white font-sans font-medium focus:border-accent focus:ring-1 focus:ring-accent outline-none shadow-sm transition-all placeholder:text-gray-400 group-hover:border-primary/50"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Kosongkan jika tidak ingin mengubah"
                                            disabled={loading}
                                        />
                                        <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-primary/40 group-focus-within:text-accent transition-colors">lock</span>
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-primary dark:text-white text-sm font-sans font-bold uppercase tracking-wider pl-1 group-focus-within:text-accent transition-colors">Password Baru</label>
                                    <div className="relative">
                                        <input
                                            className="w-full px-4 py-3.5 pl-11 bg-white dark:bg-white/5 border border-primary/30 rounded-xl text-primary dark:text-white font-sans font-medium focus:border-accent focus:ring-1 focus:ring-accent outline-none shadow-sm transition-all placeholder:text-gray-400 group-hover:border-primary/50"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            disabled={loading}
                                        />
                                        <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-primary/40 group-focus-within:text-accent transition-colors">lock_reset</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-accent via-[#eec575] to-accent hover:bg-pos-100 bg-[length:200%_auto] text-primary text-base font-bold font-serif rounded-xl shadow-[0_4px_14px_rgba(212,168,83,0.3)] hover:shadow-[0_6px_20px_rgba(212,168,83,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">save</span>
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </main>

                    <BottomNav />
                </div>
            </div>
        </div>
    );
};

export default DataDiri;
