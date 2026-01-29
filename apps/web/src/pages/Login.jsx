import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 flex h-full grow flex-col items-center w-full max-w-[1440px] mx-auto">
            <div className="w-full max-w-[480px] min-h-screen flex flex-col justify-center px-8 bg-white/90 dark:bg-[#1e1414]/95 shadow-2xl backdrop-blur-sm border-x border-[#f1eaea] dark:border-white/5 relative">
                <div className="flex flex-col items-center gap-6 mb-10 w-full">
                    <div className="size-24 rounded-full bg-primary flex items-center justify-center text-accent shadow-xl ring-4 ring-white dark:ring-white/10">
                        <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>temple_buddhist</span>
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="font-serif text-4xl font-bold text-primary dark:text-white tracking-tight leading-tight">
                            Sugeng Rawuh
                        </h1>
                        <p className="font-display text-[#8a5c5c] dark:text-[#a08080] text-sm font-medium tracking-wide uppercase">
                            Sistem Presensi Desa Trimulyo
                        </p>
                    </div>
                </div>
                <div className="relative w-full p-8 pt-10 pb-10 bg-white dark:bg-[#2a1f1f] shadow-lg rounded-2xl group">
                    <div className="ornament-corner ornament-tl"></div>
                    <div className="ornament-corner ornament-tr"></div>
                    <div className="ornament-corner ornament-bl"></div>
                    <div className="ornament-corner ornament-br"></div>
                    <form className="flex flex-col gap-6 relative z-10" onSubmit={handleLogin}>
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="block font-label font-bold text-primary dark:text-accent text-xs uppercase tracking-widest ml-1">
                                Email
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-primary/40 material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
                                <input
                                    className="w-full bg-[#fbf9f9] dark:bg-black/20 border border-primary/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-accent focus:border-accent text-primary dark:text-white outline-none transition-all placeholder:text-primary/30 font-display font-medium"
                                    placeholder="Masukkan email Anda"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block font-label font-bold text-primary dark:text-accent text-xs uppercase tracking-widest ml-1">
                                Kata Sandi
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-primary/40 material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>
                                <input
                                    className="w-full bg-[#fbf9f9] dark:bg-black/20 border border-primary/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-accent focus:border-accent text-primary dark:text-white outline-none transition-all placeholder:text-primary/30 font-display font-medium"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <label className="flex items-center gap-2 cursor-pointer group/chk">
                                <input className="rounded border-primary/30 text-primary focus:ring-accent w-4 h-4 bg-[#fbf9f9]" type="checkbox" />
                                <span className="text-xs text-[#8a5c5c] font-medium group-hover/chk:text-primary transition-colors">Ingat Saya</span>
                            </label>
                            <a className="text-xs font-bold text-primary hover:text-accent transition-colors" href="#">Lupa Sandi?</a>
                        </div>
                        <button
                            className="mt-4 w-full py-4 bg-accent hover:bg-[#c59a45] text-primary font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(212,168,83,0.4)] hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">login</span>
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="mt-12 text-center">
                    <p className="text-primary/30 dark:text-white/20 text-[10px] font-display uppercase tracking-widest font-bold">
                        Pemerintah Kalurahan Trimulyo © 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
