import React from 'react';

export const ThinkingAnimation = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative w-24 h-24">
                {/* Ring 1: Blue - Writer */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-l-blue-500 animate-[spin_2s_linear_infinite] opacity-80"></div>

                {/* Ring 2: Orange - Critic (Offset and reverse speed) */}
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-orange-500 border-r-orange-500 animate-[spin_3s_linear_infinite_reverse] opacity-80"></div>

                {/* Core: Intersection */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full animate-ping opacity-20"></div>
                </div>

                {/* Orbital Particles */}
                <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
                    <div className="w-3 h-3 bg-blue-400 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                </div>
                <div className="absolute inset-0 animate-[spin_4s_linear_infinite_reverse]">
                    <div className="w-3 h-3 bg-orange-400 rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(251,146,60,0.8)]"></div>
                </div>
            </div>

            <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-700">Đang tranh biện...</h3>
                <p className="text-sm text-slate-500 animate-pulse">
                    <span className="text-blue-600 font-medium">Writer</span> và <span className="text-orange-600 font-medium">Critic</span> đang phản biện lẫn nhau
                </p>
            </div>
        </div>
    );
};
