import React from 'react';
import { motion } from 'framer-motion';

export const ThinkingAnimation = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative flex items-center justify-center">
                {/* Soft Glow Behind */}
                <motion.div
                    className="absolute w-12 h-12 bg-blue-500/20 rounded-full blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* The Stylized 'H' Logo */}
                <motion.img
                    src="/favicon.ico"
                    alt="Hải Debate Logo"
                    className="w-10 h-10 relative z-10 drop-shadow-md"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-500">AI đang phân tích...</span>
            </div>
        </div>
    );
};
