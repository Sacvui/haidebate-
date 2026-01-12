import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const ThinkingAnimation = () => {
    return (
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Soft Glowing Orbs (Pulse) */}
                <motion.div
                    className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Rotating Rings (Elegant & Thin) */}
                <motion.div
                    className="absolute inset-0 border border-blue-300/50 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-1 border border-orange-300/50 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />

                {/* Center Icon (Floating) */}
                <motion.div
                    className="relative z-10 bg-white p-2 rounded-full shadow-sm border border-slate-100"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Sparkles size={16} className="text-indigo-600" />
                </motion.div>
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">AI đang phân tích</h3>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Tổng hợp dữ liệu</span>
                    <span className="text-slate-300">•</span>
                    <span>Phản biện đa chiều</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                </div>
            </div>
        </div>
    );
};
