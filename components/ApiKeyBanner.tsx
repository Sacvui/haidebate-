"use client";

import React, { useState, useEffect } from 'react';
import { Key, Save, ExternalLink, CheckCircle, ChevronDown, ChevronUp, AlertTriangle, Sparkles } from 'lucide-react';
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
            className="mb-6"
        >
            <div className={`rounded-2xl border-2 overflow-hidden transition-all ${
                apiKey
                    ? 'border-border bg-card'
                    : 'border-amber-400 dark:border-amber-500 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/15 dark:to-yellow-900/10 shadow-lg shadow-amber-200/30 dark:shadow-amber-900/20'
            }`}>
                {/* Header */}
                <div className={`px-5 py-4 flex items-start gap-3 ${!apiKey ? '' : 'border-b border-border'}`}>
                    {!apiKey ? (
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Key className="w-5 h-5 text-muted-foreground" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className={`text-base font-bold ${
                                !apiKey ? 'text-amber-800 dark:text-amber-300' : 'text-foreground'
                            }`}>
                                {!apiKey ? '⚡ Cần nhập Gemini API Key' : 'Chỉnh sửa API Key'}
                            </h3>
                            {apiKey && (
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                        <p className={`text-sm mt-1 ${
                            !apiKey ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'
                        }`}>
                            {!apiKey
                                ? 'Bạn cần nhập API Key miễn phí từ Google AI Studio để sử dụng hệ thống nghiên cứu.'
                                : 'Cập nhật hoặc thay đổi API Key của bạn.'
                            }
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-4">
                    {/* Step-by-step guide (only when no key) */}
                    {!apiKey && (
                        <div className="bg-white/70 dark:bg-card/70 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50">
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2">
                                Hướng dẫn lấy API Key miễn phí (30 giây)
                            </p>
                            <ol className="text-sm text-amber-700 dark:text-amber-400 space-y-1.5 list-decimal list-inside">
                                <li>Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" className="font-bold underline hover:text-amber-900 dark:hover:text-amber-200 inline-flex items-center gap-1">Google AI Studio <ExternalLink className="w-3 h-3" /></a></li>
                                <li>Đăng nhập bằng tài khoản Google</li>
                                <li>Nhấn <strong>"Create API Key"</strong> → Copy key</li>
                                <li>Dán vào ô bên dưới</li>
                            </ol>
                        </div>
                    )}

                    {/* Input Fields */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1.5">
                                API Key — Writer AI (Bắt buộc)
                            </label>
                            <input
                                type="password"
                                value={writerKey}
                                onChange={(e) => setWriterKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                API Key — Critic AI (Tùy chọn)
                                <span className="text-xs ml-1 opacity-60">Dùng key khác để gấp đôi quota</span>
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
                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
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
                                {apiKey ? 'Cập nhật API Key' : 'Lưu API Key & Bắt đầu'}
                            </>
                        )}
                    </button>

                    {/* Trust note */}
                    <p className="text-xs text-center text-muted-foreground">
                        🔒 API Key được lưu trên trình duyệt của bạn, không gửi lên server.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
