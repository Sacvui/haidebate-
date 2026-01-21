"use client";

import React, { useState, useEffect } from 'react';
import { X, Key, Save, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    const [apiKey, setApiKey] = useState("");
    const [apiKeyCritic, setApiKeyCritic] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            const savedKey = localStorage.getItem("gemini_api_key");
            if (savedKey) setApiKey(savedKey);
            const savedKeyCritic = localStorage.getItem("gemini_api_key_critic");
            if (savedKeyCritic) setApiKeyCritic(savedKeyCritic);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem("gemini_api_key", apiKey.trim());
            if (apiKeyCritic.trim()) localStorage.setItem("gemini_api_key_critic", apiKeyCritic.trim());
            alert("✅ Đã lưu cấu hình API Key!\n\nHệ thống sẽ dùng quota của bạn thay vì key chung.");
            onClose();
            window.location.reload(); // Reload to apply changes
        } else {
            // Clear if empty
            localStorage.removeItem("gemini_api_key");
            localStorage.removeItem("gemini_api_key_critic");
            alert("ℹ️ Đã xóa API Key riêng. Hệ thống sẽ dùng key chung.\n\nLưu ý: Model Pro có thể không khả dụng với key chung.");
            onClose();
            window.location.reload();
        }
    };

    const handleClear = () => {
        localStorage.removeItem("gemini_api_key");
        localStorage.removeItem("gemini_api_key_critic");
        setApiKey("");
        setApiKeyCritic("");
        alert("🔄 Đã chuyển về dùng API Key chung của hệ thống.\n\nLưu ý: Key chung có giới hạn quota.");
        onClose();
        window.location.reload();
    };

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Key className="text-slate-500" size={20} /> Cài đặt API Key
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Info Banner */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                                <p className="text-blue-900 font-medium mb-1">ℹ️ Tùy chọn API Key</p>
                                <p className="text-blue-700 text-xs">
                                    • <b>Để trống:</b> Dùng API key chung của hệ thống (có giới hạn quota)<br />
                                    • <b>Nhập key riêng:</b> Dùng quota của bạn, không giới hạn
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    API Key 1: Writer AI (Người Viết)
                                    <span className="text-slate-400 font-normal ml-1">(Tùy chọn)</span>
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="AIzaSy... (để trống nếu dùng key chung)"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    API Key 2: Critic AI (Người Phản Biện)
                                    <span className="text-slate-400 font-normal ml-1">(Tùy chọn)</span>
                                </label>
                                <input
                                    type="password"
                                    value={apiKeyCritic}
                                    onChange={(e) => setApiKeyCritic(e.target.value)}
                                    placeholder="AIzaSy... (để trống nếu dùng key chung)"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    💡 <b>Mẹo:</b> Dùng 2 tài khoản Google khác nhau cho 2 Key để gấp đôi giới hạn (Quota) và tránh lỗi quá tải.
                                </p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Lưu Cấu Hình
                                </button>
                                {(apiKey || apiKeyCritic) && (
                                    <button
                                        onClick={handleClear}
                                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={16} /> Xóa
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
