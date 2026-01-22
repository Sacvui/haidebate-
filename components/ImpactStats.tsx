"use client";

import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react';

interface Stats {
    users: number;
    debates: number;
    projects: number;
}

const StatItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Simple easing counter animation
        let start = 0;
        // Adjust duration based on value magnitude to keep it snappy
        const duration = 2000;
        const incrementTime = 20;
        const totalSteps = duration / incrementTime;
        const incrementAmount = value / totalSteps;

        const timer = setInterval(() => {
            start += incrementAmount;
            if (start >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="flex flex-col items-center bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all text-center h-full justify-between">
            <div className={`w-10 h-10 rounded-full ${color} bg-opacity-10 flex items-center justify-center mb-2`}>
                <Icon size={20} className={color.replace('bg-', 'text-')} />
            </div>
            <div className="text-xl font-extrabold text-slate-800 mb-1 leading-tight">
                {count.toLocaleString()}+
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-3">
                {label}
            </div>
        </div>
    );
};

export function ImpactStats() {
    const [stats, setStats] = useState<Stats>({
        users: 1200,
        debates: 8500,
        projects: 400
    });

    useEffect(() => {
        // Fetch real stats on mount
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (data.users && data.debates) {
                    setStats(data);
                }
            })
            .catch(err => console.error('Failed to load stats', err));
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 w-full mt-4">
            <div className="grid grid-cols-3 gap-2">
                <StatItem
                    icon={Users}
                    label="Nhà nghiên cứu"
                    value={stats.users}
                    color="bg-blue-600 text-blue-600"
                />
                <StatItem
                    icon={MessageSquare}
                    label="Phiên phản biện"
                    value={stats.debates}
                    color="bg-purple-600 text-purple-600"
                />
                <StatItem
                    icon={CheckCircle}
                    label="Dự án hoàn thành"
                    value={stats.projects}
                    color="bg-green-600 text-green-600"
                />
            </div>
        </div>
    );
}
