import React from 'react';

export const ThinkingAnimation = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative w-24 h-24">
                {/* Ring 1: Blue - Writer */}
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500/80 border-l-blue-500/80 animate-[spin_2s_linear_infinite]"></div>

                {/* Ring 2: Orange - Critic (Offset and reverse speed) */}
                <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-orange-500/80 border-r-orange-500/80 animate-[spin_3s_linear_infinite_reverse]"></div>

                {/* Core: Intersection */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-indigo-600/50 rounded-full animate-ping"></div>
                </div>

                {/* Orbital Particles */}
                <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
                    <div className="w-2 h-2 bg-blue-400 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
                </div>
                <div className="absolute inset-0 animate-[spin_4s_linear_infinite_reverse]">
                    <div className="w-2 h-2 bg-orange-400 rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2 shadow-[0_0_8px_rgba(251,146,60,0.6)]"></div>
                </div>
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-base font-medium text-slate-800 tracking-wide">AI đang suy luận...</h3>
                <p className="text-xs text-slate-500 font-light animate-pulse">
                    Đang phân tích cấu trúc và luận điểm nghiên cứu
                </p>
            </div>
        </div>
    );
};
