import React, { useState } from 'react';

const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    let diffMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle overnight wrap

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) return `${hours} Jam ${minutes > 0 ? `${minutes} Menit` : ''}`;
    return `${minutes} Menit`;
};

const ActivityItem = ({ activity }) => (
    <div className="group relative flex flex-col p-4 bg-white dark:bg-[#2a1f1f] rounded-xl shadow-sm border-l-4 border-accent hover:shadow-md transition-shadow overflow-hidden mb-3">
        <div className="flex items-start justify-between z-10">
            <div className="flex-1">
                <p className="text-[#181010] dark:text-white font-bold text-base font-serif">{activity.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium bg-primary/10 dark:bg-white/10 text-primary dark:text-accent px-2 py-0.5 rounded-full">
                        {activity.date} • {activity.time}
                    </span>
                    {activity.startTime && activity.endTime && (
                        <span className="text-[10px] font-medium bg-accent/20 text-primary dark:text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                            {calculateDuration(activity.startTime, activity.endTime)} ({activity.startTime} - {activity.endTime})
                        </span>
                    )}
                </div>
                <p className="text-[#8a5c5c] text-sm mt-2 line-clamp-2">{activity.description}</p>
            </div>
        </div>

        {activity.photos && activity.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3 z-10">
                {activity.photos.map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={photo} alt="Kegiatan" className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default function ActivityList({ activities = [] }) {
    const [showAll, setShowAll] = useState(false);

    if (!activities || activities.length === 0) return null;

    const displayedActivities = showAll ? activities : activities.slice(0, 3);

    return (
        <div className="mt-8 flex flex-col gap-4 mb-24">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-primary dark:text-white text-lg font-bold font-serif tracking-tight">Log Kegiatan Terbaru</h3>
                {activities.length > 3 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-xs font-bold text-[#8a5c5c] hover:text-primary transition-colors focus:outline-none"
                    >
                        {showAll ? "Tutup" : "Lihat Semua"}
                    </button>
                )}
            </div>
            <div className="flex flex-col">
                {displayedActivities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                ))}
            </div>
        </div>
    );
}
