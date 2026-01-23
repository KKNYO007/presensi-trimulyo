import React, { useState, useEffect, useRef } from 'react';

const TimePicker = ({ label, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState('00');
    const [selectedMinute, setSelectedMinute] = useState('00');
    const containerRef = useRef(null);

    // Initialize state from value prop
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            setSelectedHour(h);
            setSelectedMinute(m);
        } else {
            // Default to current time if no value
            const now = new Date();
            setSelectedHour(now.getHours().toString().padStart(2, '0'));
            setSelectedMinute(now.getMinutes().toString().padStart(2, '0'));
        }
    }, [value]);

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const handleSelect = (h, m) => {
        const timeString = `${h}:${m}`;
        onChange(timeString);
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-2 group relative" ref={containerRef}>
            <label className="text-primary dark:text-accent font-serif font-bold text-lg">{label}</label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white dark:bg-white/5 border ${isOpen ? 'border-accent ring-1 ring-accent' : 'border-primary/30'} rounded-xl p-4 text-left text-[#181010] dark:text-white transition-all font-display flex justify-between items-center`}
            >
                <span>{value || 'Pilih Jam'}</span>
                <span className="material-symbols-outlined text-primary/60 dark:text-accent/60">schedule</span>
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-[#2a1f1f] border border-primary/10 rounded-xl shadow-xl z-30 p-4 animate-[fade-in-up_0.2s_ease-out]">
                    <div className="flex gap-4 h-48">
                        {/* Hours Column */}
                        <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar scroll-smooth">
                            <div className="text-xs font-bold text-center text-primary/50 dark:text-accent/50 sticky top-0 bg-white dark:bg-[#2a1f1f] py-1">JAM</div>
                            {hours.map(hour => (
                                <button
                                    key={`h-${hour}`}
                                    type="button"
                                    onClick={() => {
                                        setSelectedHour(hour);
                                        // Don't close yet, just update selection visual or immediate value?
                                        // Let's implement immediate update or "Set" button. 
                                        // For UX, sticking to selection = update but keeping modal open might be annoying if they want to scroll both.
                                        // Let's keep internal state until manually confirmed or auto-saving?
                                        // Simpler: Just update internal state, and have a "Selesai" button.
                                    }}
                                    className={`py-2 rounded-lg text-center font-bold transition-colors ${selectedHour === hour ? 'bg-primary text-white dark:bg-accent dark:text-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}
                                >
                                    {hour}
                                </button>
                            ))}
                        </div>

                        {/* Separator */}
                        <div className="flex items-center justify-center font-bold text-primary dark:text-accent">:</div>

                        {/* Minutes Column */}
                        <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar scroll-smooth">
                            <div className="text-xs font-bold text-center text-primary/50 dark:text-accent/50 sticky top-0 bg-white dark:bg-[#2a1f1f] py-1">MENIT</div>
                            {minutes.map(minute => (
                                <button
                                    key={`m-${minute}`}
                                    type="button"
                                    onClick={() => setSelectedMinute(minute)}
                                    className={`py-2 rounded-lg text-center font-bold transition-colors ${selectedMinute === minute ? 'bg-primary text-white dark:bg-accent dark:text-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}
                                >
                                    {minute}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleSelect(selectedHour, selectedMinute)}
                        className="w-full mt-4 py-2 bg-accent text-primary font-bold rounded-lg hover:bg-[#eec575] transition-colors"
                    >
                        Pilih
                    </button>
                </div>
            )}
        </div>
    );
};

export default TimePicker;
