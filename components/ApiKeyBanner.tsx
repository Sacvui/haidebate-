"use client";

import React, { useState, useEffect } from 'react';
import { Key, Save, ExternalLink, CheckCircle, ChevronDown, ChevronUp, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiKeyBannerProps {
    apiKey: string;
    onApiKeyChange: (key: string, criticKey?: string) => void;
}

export const ApiKeyBanner = ({ apiKey, onApiKeyChange }: ApiKeyBannerProps) => {
    const [writerKey, setWriterKey] = useState("");
    const [criticKey, setCriticKey] = useState("");
    const [isExpanded, setIsExpanded] = useState(!apiKey);
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedKey = localStorage.getItem("gemini_api_key");
        if (savedKey) setWriterKey(savedKey);
        const savedCriticKey = localStorage.getItem("gemini_api_key_critic");
        if (savedCriticKey) setCriticKey(savedCriticKey);
    }, []);

    const handleSave = () => {
        if (!writerKey.trim()) return;
        setIsSaving(true);

        localStorage.setItem("gemini_api_key", writerKey.trim());
        if (criticKey.trim()) {
            localStorage.setItem("gemini_api_key_critic", criticKey.trim());
        }

        onApiKeyChange(writerKey.trim(), criticKey.trim() || undefined);

        setTimeout(() => {
            setIsSaving(false);
            setIsExpanded(false);
        }, 600);
    };

    if (!mounted) return null;

    // Collapsed state: Key is present
    if (apiKey && !isExpanded) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all group"
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                            API Key đã được cài đặt
                        </span>
                        <span className="text-xs text-emerald-500 dark:text-emerald-500 font-mono">
                            ••••{writerKey.slice(-4)}
                        </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
                </button>
            </motion.div>
        );
    }

    // Expanded state: No key or editing
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className={`rounded-2xl overflow-hidden transition-all ${
                apiKey
                    ? 'border-2 border-border bg-card'
                    : 'border-2 border-amber-400/80 dark:border-amber-500/60 shadow-2xl shadow-amber-300/30 dark:shadow-amber-800/30'
            }`}>

                {/* === HERO HEADER (only when no key) === */}
                {!apiKey && (
                    <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 dark:from-amber-600 dark:via-orange-600 dark:to-red-600 px-6 py-6 text-white overflow-hidden">
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-10 -right-10 w-40 h-40 border-[3px] border-white rounded-full" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 border-[3px] border-white rounded-full" />
                            <div className="absolute top-4 left-1/2 w-24 h-24 border-[2px] border-white rounded-full" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <Zap className="w-7 h-7 text-yellow-200 fill-yellow-200" />
                                </motion.div>
                                <h3 className="text-xl font-extrabold tracking-tight">
                                    Bước bắt buộc: Nhập API Key
                                </h3>
                            </div>
                            <p className="text-white/90 text-sm max-w-md">
                                Hệ thống cần Gemini API Key (miễn phí) để vận hành AI Writer & Critic. Chỉ mất 30 giây!
                            </p>

                            {/* Big CTA button to get API key */}
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-2.5 px-5 py-3 bg-white text-orange-600 font-extrabold rounded-xl shadow-lg hover:shadow-xl hover:bg-orange-50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm"
                            >
                                <img
                                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                                    className="w-5 h-5"
                                    alt="Google"
                                />
                                Lấy API Key miễn phí từ Google
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                )}

                {/* === EDIT HEADER (when key exists) === */}
                {apiKey && (
                    <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                        <div className="flex items-center gap-2">
                            <Key className="w-5 h-5 text-muted-foreground" />
                            <h3 className="text-base font-bold text-foreground">Chỉnh sửa API Key</h3>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1 rounded-lg hover:bg-muted transition-colors"
                        >
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                )}

                {/* === BODY === */}
                <div className={`px-6 py-5 space-y-4 ${!apiKey ? 'bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-900/10 dark:to-card' : 'bg-card'}`}>

                    {/* Quick steps (only when no key) */}
                    {!apiKey && (
                        <div className="flex items-start gap-3 p-3 bg-white/80 dark:bg-card/80 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800 dark:text-amber-300">
                                <strong>3 bước:</strong> Mở link ở trên → Nhấn "Create API Key" → Dán key vào ô bên dưới
                            </div>
                        </div>
                    )}

                    {/* Input Fields */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">
                                API Key — Writer AI
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="password"
                                value={writerKey}
                                onChange={(e) => setWriterKey(e.target.value)}
                                placeholder="Dán API Key vào đây (AIzaSy...)"
                                className={`w-full px-4 py-3.5 rounded-xl border-2 bg-card focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground transition-all ${
                                    !apiKey && !writerKey ? 'border-amber-300 dark:border-amber-700 animate-pulse' : 'border-border'
                                }`}
                                autoFocus={!apiKey}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                API Key — Critic AI (Tùy chọn)
                                <span className="text-xs ml-1 opacity-60">— Dùng key khác để gấp đôi quota</span>
                            </label>
                            <input
                                type="password"
                                value={criticKey}
                                onChange={(e) => setCriticKey(e.target.value)}
                                placeholder="AIzaSy... (để trống nếu dùng cùng key)"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground transition-all"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={!writerKey.trim() || isSaving}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            writerKey.trim()
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transform hover:-translate-y-0.5'
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {apiKey ? 'Cập nhật API Key' : 'Lưu API Key & Bắt đầu nghiên cứu'}
                            </>
                        )}
                    </button>

                    {/* Trust note */}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        API Key chỉ lưu trên trình duyệt, không gửi lên server.
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
