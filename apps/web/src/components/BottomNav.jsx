import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav({ isOpen, onFabClick }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="w-full bg-primary text-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-2xl z-50 shrink-0">
            <div className="flex justify-around items-center h-20 px-2 relative">
                {/* Nav Item: Home */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`flex flex-col items-center justify-center w-16 gap-1 group ${isActive('/dashboard') ? 'text-accent' : 'text-white/60'}`}
                >
                    <span className={`material-symbols-outlined text-3xl transition-transform ${isActive('/dashboard') ? 'text-accent scale-110' : 'text-white/60 group-hover:text-accent group-hover:scale-110'}`}>home</span>
                    <span className={`text-[10px] font-medium tracking-wide uppercase ${isActive('/dashboard') ? 'text-accent' : 'text-white/60 group-hover:text-accent'}`}>Beranda</span>
                </button>

                {/* Nav Item: Action (Floating Center) */}
                <div className="relative -top-8">
                    <button
                        onClick={onFabClick}
                        className={`flex items-center justify-center size-16 rounded-full bg-accent text-primary shadow-[0_4px_10px_rgba(212,168,83,0.4)] hover:bg-[#eec575] transition-all border-4 border-[#fbf9f9] dark:border-[#1e1414] ${isOpen ? 'bg-red-500 text-white hover:bg-red-600' : 'hover:-translate-y-1'}`}
                    >
                        <span className="material-symbols-outlined text-4xl">add_location_alt</span>
                    </button>
                </div>

                {/* Nav Item: Profile */}
                <button
                    onClick={() => navigate('/profil')}
                    className={`flex flex-col items-center justify-center w-16 gap-1 group ${isActive('/profil') ? 'text-accent' : 'text-white/60'}`}
                >
                    <span className={`material-symbols-outlined text-3xl transition-all ${isActive('/profil') ? 'text-accent scale-110' : 'text-white/60 group-hover:text-accent group-hover:scale-110'}`}>person</span>
                    <span className={`text-[10px] font-medium tracking-wide uppercase ${isActive('/profil') ? 'text-accent' : 'text-white/60 group-hover:text-accent'}`}>Profil</span>
                </button>
            </div>
        </nav>
    );
}
