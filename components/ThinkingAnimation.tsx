"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const ThinkingAnimation = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
            {/* Simple H with rotation - NO BACKGROUND */}
            <div className="relative">
                {/* Center Icon - Transparent */}
                <motion.div
                    className="relative z-10 w-16 h-16 flex items-center justify-center"
                    animate={{
                        rotate: [0, 360],
                    }}
                    transition={{
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    }}
                >
                    <motion.div
                        className="text-5xl font-black bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent"
                        animate={{
                            opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                        }}
                    >
                        H
                    </motion.div>
                </motion.div>
            </div>

            {/* Typing Text Effect */}
            <div className="flex items-center gap-2">
                <motion.div
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </motion.div>
                <span className="text-sm font-medium text-slate-700">
                    AI đang phân tích{dots}
                </span>
            </div>
        </div>
    );
};
