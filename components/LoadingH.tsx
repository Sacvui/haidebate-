"use client";

import { motion } from "framer-motion";

export const LoadingH = () => {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <motion.div
                className="relative"
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {/* Outer Glow Ring */}
                <motion.div
                    className="absolute inset-0 rounded-2xl blur-xl"
                    animate={{
                        background: [
                            "linear-gradient(45deg, #3b82f6, #8b5cf6)",
                            "linear-gradient(45deg, #8b5cf6, #ec4899)",
                            "linear-gradient(45deg, #ec4899, #3b82f6)",
                        ],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                    }}
                    style={{ width: "120px", height: "120px" }}
                />

                {/* Letter H */}
                <motion.div
                    className="relative z-10 text-8xl font-black"
                    animate={{
                        backgroundImage: [
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                            "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        ],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        textShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
                    }}
                >
                    H
                </motion.div>

                {/* Orbiting Dots */}
                {[0, 120, 240].map((angle, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-blue-500 rounded-full"
                        animate={{
                            rotate: [angle, angle + 360],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        style={{
                            top: "50%",
                            left: "50%",
                            transformOrigin: "0 0",
                            x: "40px",
                        }}
                    />
                ))}
            </motion.div>

            {/* Loading Text */}
            <motion.p
                className="absolute mt-32 text-sm font-medium text-slate-600"
                animate={{
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                }}
            >
                Đang xử lý...
            </motion.p>
        </div>
    );
};
