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

                    {/* PHASE 3: RESULT (PREMIUM JOURNAL LAYOUT) */}
                    {phase === "RESULT" && (
                        <motion.div
                            key="result"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="h-full overflow-hidden relative group"
                        >
                            {/* Paper Container */}
                            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 h-full w-full overflow-hidden relative font-serif text-slate-900">

                                {/* Journal Header (Sticky) */}
                                <div className="absolute top-0 left-0 w-full h-8 bg-slate-900 flex items-center justify-between px-4 z-20">
                                    <div className="text-[8px] text-white uppercase tracking-widest font-sans font-bold">International Journal of Green Growth</div>
                                    <div className="text-[8px] text-slate-400 font-sans">Vol. 12, No. 4, 2025</div>
                                </div>

                                {/* Scrolling Content */}
                                <motion.div
                                    initial={{ y: 0 }}
                                    animate={{ y: -220 }}
                                    transition={{ delay: 2, duration: 5, ease: "easeInOut" }}
                                    className="p-8 pt-12"
                                >
                                    {/* Paper Title Area */}
                                    <div className="text-center mb-6 border-b border-slate-200 pb-4">
                                        <h1 className="text-xl font-bold leading-tight mb-2">
                                            The Impact of Green Marketing on Consumer Purchase Behavior in Vietnam
                                        </h1>
                                        <div className="text-xs italic text-slate-600 mb-2">
                                            <span className="font-bold text-slate-900">Nguyen Van A.</span><sup>1</sup>,
                                            <span className="ml-2">Tran Thi B.</span><sup>2</sup> &
                                            <span className="ml-2 text-blue-600">AI Assistant</span><sup>3</sup>
                                        </div>
                                        <div className="text-[8px] text-slate-500">
                                            <sup>1,2</sup>University of Economics, <sup>3</sup>Hai Debate AI System
                                        </div>
                                    </div>

                                    {/* Abstract */}
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-6 text-justify">
                                        <p className="text-[9px] leading-relaxed text-slate-700">
                                            <strong className="uppercase text-slate-900">Abstract:</strong> This research investigates the structural relationship between green marketing awareness and consumer purchase intentions. Utilizing a Structural Equation Modeling (SEM) approach, we analyze data from 400 respondents...
                                        </p>
                                    </div>

                                    {/* 2-Column Body */}
                                    <div className="grid grid-cols-2 gap-4 text-[9px] leading-relaxed text-justify relative">
                                        <div>
                                            <h3 className="font-bold uppercase mb-1 text-[10px]">1. Introduction</h3>
                                            <p className="mb-2">Environmental concerns have shifted consumer paradigms globally. In Vietnam, rapid urbanization has led to increased demand for sustainable products.</p>
                                            <p>This study bridges the gap by applying the Theory of Planned Behavior (TPB) to the context of eco-labels.</p>

                                            <h3 className="font-bold uppercase mb-1 mt-3 text-[10px]">2. Methodology</h3>
                                            <p>We employed a quantitative approach with surveys distributed in Hanoi and HCMC.</p>
                                        </div>
                                        <div>
                                            <h3 className="font-bold uppercase mb-1 text-[10px]">3. Results</h3>
                                            <p className="mb-2">The measurement model exhibited satisfactory reliability (Cronbach&apos;s Alpha &gt; 0.7).</p>
                                            <p className="text-blue-700 font-bold italic">See Figure 1 for the structural path analysis.</p>
                                        </div>
                                    </div>

                                    {/* FIGURE 1: SHINY SEM MODEL (Spanning Cols) */}
                                    <div className="mt-6 mb-6">
                                        <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm group-hover:shadow-md transition-shadow">
                                            <div className="absolute top-0 left-0 bg-slate-900 text-white text-[8px] px-2 py-0.5 font-sans font-bold">Fig 1. SEM Analysis</div>

                                            <div className="flex items-center justify-between relative mt-2 px-2">
                                                {/* Node 1 */}
                                                <div className="bg-white border border-green-600 shadow-lg p-2 w-20 text-center rounded relative z-10">
                                                    <div className="text-[8px] font-bold text-green-800 uppercase">Green<br />Marketing</div>
                                                </div>
                                                {/* Node 2 */}
                                                <div className="bg-white border border-blue-600 shadow-lg p-2 w-20 text-center rounded relative z-10">
                                                    <div className="text-[8px] font-bold text-blue-800 uppercase">Attitude</div>
                                                </div>
                                                {/* Node 3 */}
                                                <div className="bg-white border border-purple-600 shadow-lg p-2 w-20 text-center rounded relative z-10">
                                                    <div className="text-[8px] font-bold text-purple-800 uppercase">Behavior</div>
                                                </div>

                                                {/* Connecting Lines (Absolute for demo) */}
                                                <div className="absolute top-1/2 left-20 right-20 h-0.5 bg-slate-300 -translate-y-1/2 -z-0"></div>

                                                {/* Floating Badges */}
                                                <div className="absolute top-0 left-1/3 -translate-y-2 bg-white px-1 border border-slate-200 text-[8px] font-bold text-slate-500 rounded">0.45**</div>
                                                <div className="absolute top-0 right-1/3 -translate-y-2 bg-white px-1 border border-slate-200 text-[8px] font-bold text-slate-500 rounded">0.72***</div>
                                            </div>

                                            {/* Shine effect */}
                                            <motion.div
                                                animate={{ x: ["-100%", "200%"] }}
                                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 pointer-events-none"
                                            />
                                        </div>
                                        <div className="text-center text-[8px] italic text-slate-500 mt-1">
                                            Note: *** p &lt; 0.001. Model Fit: CFI=0.98, RMSEA=0.04.
                                        </div>
                                    </div>

                                    {/* Conclusion / Survey Short */}
                                    <div className="text-[9px] leading-relaxed text-justify border-t border-slate-200 pt-3">
                                        <h3 className="font-bold uppercase mb-1 text-[10px]">4. Conclusion</h3>
                                        <p>The findings confirm that perceived green value significantly mediates the relationship between packaging and behavioral intention.</p>
                                    </div>

                                </motion.div>

                                {/* Bottom Fog */}
                                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white/80 to-transparent z-10"></div>
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
