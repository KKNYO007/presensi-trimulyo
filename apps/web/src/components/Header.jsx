import React from 'react';

export default function Header({ userName }) {
    return (
        <header className="flex flex-col gap-4 px-6 pt-8 pb-6 bg-[#fbf9f9] dark:bg-background-dark/50">
            <div className="flex items-center justify-between">
                {/* Logo/Brand Icon */}
                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-accent shadow-md">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>temple_buddhist</span>
                </div>
                {/* Notification Bell */}
                <button className="size-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-sm hover:bg-gray-50 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>notifications</span>
                </button>
            </div>
            <div className="mt-2">
                <h1 className="font-serif text-[32px] font-bold leading-tight text-primary dark:text-white tracking-tight">
                    Halo! 👋 <br /> {userName || 'Pengguna'}
                </h1>
                <p className="text-[#8a5c5c] dark:text-[#a08080] text-sm font-medium mt-1 font-serif italic">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
        </header>
    );
}
