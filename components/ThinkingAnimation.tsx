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
            {/* Brain/Processing Icon with Particles */}
            <div className="relative">
                {/* Orbiting Particles */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{
                            top: "50%",
                            left: "50%",
                        }}
                        animate={{
                            x: [
                                Math.cos((i * Math.PI * 2) / 8) * 40,
                                Math.cos((i * Math.PI * 2) / 8 + Math.PI) * 40,
                            ],
                            y: [
                                Math.sin((i * Math.PI * 2) / 8) * 40,
                                Math.sin((i * Math.PI * 2) / 8 + Math.PI) * 40,
                            ],
                            opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut",
                        }}
                    />
                ))}

                {/* Center Icon */}
                <motion.div
                    className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl"
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    }}
                >
                    <motion.div
                        className="text-3xl font-black text-white"
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

                {/* Glow Effect */}
                <motion.div
                    className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl -z-10"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                />
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

            {/* Progress Bar */}
            <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    animate={{
                        x: ["-100%", "100%"],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>
        </div>
    );
};
