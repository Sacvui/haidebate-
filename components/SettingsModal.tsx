
import React, { useState, useEffect } from 'react';
import { X, Key, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    const [apiKey, setApiKey] = useState("");

    useEffect(() => {
        const savedKey = localStorage.getItem("gemini_api_key");
        if (savedKey) setApiKey(savedKey);
    }, [isOpen]);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem("gemini_api_key", apiKey.trim());
            alert("Đã lưu API Key thành công!");
            onClose();
            window.location.reload(); // Reload to apply key
        }
    };

    const handleClear = () => {
        localStorage.removeItem("gemini_api_key");
        setApiKey("");
        alert("Đã xóa API Key cá nhân. Hệ thống sẽ dùng Key mặc định.");
        onClose();
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Key className="text-slate-500" size={20} /> Cài đặt API Key
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gemini API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Nhập Key riêng của bạn để đảm bảo tốc độ và không bị giới hạn.
                            Key được lưu trên trình duyệt của bạn.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                            <Save size={16} /> Lưu Cài Đặt
                        </button>
                        {apiKey && (
                            <button
                                onClick={handleClear}
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={16} /> Xóa
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
