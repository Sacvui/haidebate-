"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, CheckCircle, FileText, Sparkles, ArrowRight, Share2, Award, Zap } from "lucide-react";

const TYPING_TEXT = "Tác động Marketing Xanh vào Hành vi tiêu dùng";

export const HeroDemo = () => {
    const [phase, setPhase] = useState<"INPUT" | "DEBATE" | "RESULT">("INPUT");
    const [typedText, setTypedText] = useState("");
    const [showPhD, setShowPhD] = useState(false);
    const [showISI, setShowISI] = useState(false);

    // Reset loop
    // Animation State Machine
    useEffect(() => {
        let isMounted = true;

        const runLoop = async () => {
            if (!isMounted) return;

            // PHASE 1: INPUT (0s - 5s)
            setPhase("INPUT");
            setTypedText("");
            setShowPhD(false);
            setShowISI(false);

            // Typing effect
            for (let i = 0; i <= TYPING_TEXT.length; i++) {
                if (!isMounted) return;
                setTypedText(TYPING_TEXT.slice(0, i)); // Typewriter
                await new Promise(r => setTimeout(r, 50));
            }

            await new Promise(r => setTimeout(r, 500));
            if (!isMounted) return;
            setShowPhD(true);
            await new Promise(r => setTimeout(r, 500));
            if (!isMounted) return;
            setShowISI(true);
            await new Promise(r => setTimeout(r, 1000));

            if (!isMounted) return;

            // PHASE 2: DEBATE (5s - 10s)
            setPhase("DEBATE");
            await new Promise(r => setTimeout(r, 4500));

            if (!isMounted) return;

            // PHASE 3: RESULT (10s - 18s)
            setPhase("RESULT");
            await new Promise(r => setTimeout(r, 8000));

            if (isMounted) {
                runLoop(); // Recursive call
            }
        };

        runLoop();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="w-full max-w-xl mx-auto h-[500px] relative bg-white/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/40 overflow-hidden flex flex-col">
            {/* Header Bar */}
            <div className="h-8 bg-slate-100/50 border-b border-white/50 flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>

            <div className="flex-1 relative p-6">
                <AnimatePresence mode="wait">

                    {/* PHASE 1: INPUT FORM */}
                    {phase === "INPUT" && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                                <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm flex items-center gap-3">
                                    <div className="flex-1 font-mono text-sm text-slate-700">
                                        {typedText}<span className="animate-pulse">|</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-3 rounded-xl border transition-all duration-500 ${showPhD ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                    <div className="text-xs font-bold uppercase mb-1">Trình độ</div>
                                    <div className="font-bold">Tiến sĩ (PhD)</div>
                                </div>
                                <div className={`p-3 rounded-xl border transition-all duration-500 ${showISI ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                    <div className="text-xs font-bold uppercase mb-1">Tiêu chuẩn</div>
                                    <div className="font-bold">ISI/Scopus</div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="w-full py-3 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg">
                                    <Sparkles size={16} /> Bắt đầu Nghiên cứu
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 2: DEBATE */}
                    {phase === "DEBATE" && (
                        <motion.div
                            key="debate"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col justify-center relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 pointer-events-none"></div>

                            {/* Agent Left */}
                            <motion.div
                                className="absolute left-0 top-10 flex gap-3"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 z-10">
                                    <Bot size={20} className="text-blue-600" />
                                </div>
                                <motion.div
                                    className="bg-white p-3 rounded-2xl rounded-tl-none shadow-md border border-slate-100 text-xs w-48 text-slate-600"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="space-y-1">
                                        <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                                        <div className="h-2 bg-slate-100 rounded w-full"></div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Agent Right */}
                            <motion.div
                                className="absolute right-0 bottom-20 flex flex-row-reverse gap-3"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                            >
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-500 z-10">
                                    <User size={20} className="text-orange-600" />
                                </div>
                                <motion.div
                                    className="bg-orange-50 p-3 rounded-2xl rounded-tr-none shadow-md border border-orange-100 text-xs w-48 text-indigo-900"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="space-y-1">
                                        <div className="h-2 bg-orange-200/50 rounded w-full"></div>
                                        <div className="h-2 bg-orange-200/50 rounded w-2/3"></div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Central Energy */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 rounded-full border-4 border-dashed border-indigo-400/30"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <Zap className="text-yellow-500 fill-yellow-500" size={24} />
                                </motion.div>
                            </div>

                            {/* Speed Lines */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute h-px bg-blue-300 w-20"
                                    initial={{ left: "10%", top: 20 + i * 15 + "%", opacity: 0 }}
                                    animate={{ left: "120%", opacity: [0, 1, 0] }}
                                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                                />
                            ))}
                        </motion.div>
                    )}

                    {/* PHASE 3: RESULT (ISI PAPER STYLE) */}
                    {phase === "RESULT" && (
                        <motion.div
                            key="result"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="h-full overflow-hidden relative group"
                        >
                            {/* Paper Container */}
                            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 h-full w-full overflow-hidden relative font-serif">
                                {/* Scrolling Content */}
                                <motion.div
                                    initial={{ y: 0 }}
                                    animate={{ y: -200 }}
                                    transition={{ delay: 2, duration: 4, ease: "easeInOut" }} // Auto scroll down
                                    className="p-8"
                                >
                                    {/* Header */}
                                    <div className="text-center mb-6">
                                        <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-2">ISI/Scopus Standard Output</div>
                                        <h1 className="text-lg font-bold text-slate-900 leading-tight mb-2">
                                            Tác động của Marketing Xanh đến Hành vi người tiêu dùng tại Việt Nam
                                        </h1>
                                        <div className="text-xs text-slate-600 italic">
                                            Tác giả: Dr. User & AI Research Assistant
                                        </div>
                                    </div>

                                    {/* Abstract */}
                                    <div className="text-xs text-justify text-slate-700 leading-relaxed mb-6 space-y-2 opacity-80">
                                        <p><strong>Tóm tắt:</strong> Nghiên cứu này khám phá mối quan hệ giữa các chiến lược marketing xanh và quyết định mua hàng...</p>
                                        <div className="h-2 bg-slate-100 rounded w-full"></div>
                                        <div className="h-2 bg-slate-100 rounded w-5/6"></div>
                                        <div className="h-2 bg-slate-100 rounded w-full"></div>
                                    </div>

                                    {/* THE "SHINY" SEM MODEL */}
                                    <div className="my-8 p-4 border border-indigo-100 rounded-xl bg-gradient-to-br from-slate-50 to-white shadow-inner relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-1 bg-indigo-600 text-white text-[8px] font-bold font-sans rounded-bl-lg">Figure 1. SEM Model</div>

                                        <div className="flex items-center justify-between relative z-10">
                                            {/* Node 1 */}
                                            <div className="bg-white border-2 border-green-500 p-2 rounded shadow-lg w-20 text-center relative group-hover:scale-105 transition-transform">
                                                <div className="text-[8px] font-bold text-green-700">Green<br />Marketing</div>
                                                <div className="absolute inset-0 bg-green-400/20 blur-xl -z-10 rounded-full"></div>
                                            </div>

                                            {/* Arrows */}
                                            <div className="flex-1 h-0.5 bg-slate-300 relative mx-2">
                                                <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-300 rotate-45"></div>
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-slate-400 font-sans">0.45**</div>
                                            </div>

                                            {/* Node 2 */}
                                            <div className="bg-white border-2 border-blue-500 p-2 rounded shadow-lg w-20 text-center relative group-hover:scale-105 transition-transform delay-100">
                                                <div className="text-[8px] font-bold text-blue-700">Consumer<br />Attitude</div>
                                                <div className="absolute inset-0 bg-blue-400/20 blur-xl -z-10 rounded-full"></div>
                                            </div>

                                            {/* Arrows */}
                                            <div className="flex-1 h-0.5 bg-slate-300 relative mx-2">
                                                <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-300 rotate-45"></div>
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-slate-400 font-sans">0.62***</div>
                                            </div>

                                            {/* Node 3 */}
                                            <div className="bg-white border-2 border-purple-500 p-2 rounded shadow-lg w-20 text-center relative group-hover:scale-105 transition-transform delay-200">
                                                <div className="text-[8px] font-bold text-purple-700">Purchase<br />Behavior</div>
                                                <div className="absolute inset-0 bg-purple-400/20 blur-xl -z-10 rounded-full"></div>
                                            </div>
                                        </div>

                                        {/* Glow Effect */}
                                        <motion.div
                                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                                        />
                                    </div>

                                    {/* Survey Table */}
                                    <div className="mt-6 border-t border-slate-200 pt-4">
                                        <h3 className="text-sm font-bold uppercase mb-3">Appendix: Measures</h3>
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex items-center gap-2 text-[10px] text-slate-600 border-b border-slate-100 pb-1">
                                                    <span className="font-bold text-slate-400">GM{i}</span>
                                                    <span>Sản phẩm này thân thiện với môi trường...</span>
                                                    <div className="ml-auto flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(n => <div key={n} className="w-2 h-2 rounded-full border border-slate-300"></div>)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </motion.div>

                                {/* Overlay Gradient to hide scroll cutoff */}
                                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent z-10"></div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Floating Badges */}
            {phase === "RESULT" && (
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -right-4 top-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-full shadow-lg z-20"
                >
                    <Award size={24} />
                </motion.div>
            )}
        </div>
    );
};
