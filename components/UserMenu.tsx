"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    LogOut,
    Settings,
    HelpCircle,
    User,
    ChevronDown,
    CreditCard,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserMenuProps {
    user: any;
    onLogout: () => void;
    onOpenSettings: () => void;
    onOpenGuide: () => void;
    onOpenProjects?: () => void;
    onOpenShare?: () => void;
}

export const UserMenu = ({ user, onLogout, onOpenSettings, onOpenGuide, onOpenProjects, onOpenShare }: UserMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const displayName = user.name || (user.email ? user.email.split('@')[0] : 'Người dùng');
    const avatarLetter = displayName.charAt(0).toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-border hover:bg-muted transition-all hover:shadow-sm"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.image ? (
                        <img src={user.image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        avatarLetter
                    )}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-foreground leading-none">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground font-medium leading-none mt-1">{user.points || 0} pts</p>
                </div>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden"
                    >
                        {/* Header Mobile Only */}
                        <div className="md:hidden p-4 border-b border-border bg-muted">
                            <p className="font-bold text-foreground">{displayName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>

                        {/* Points Badge */}
                        <div className="p-3 pb-1">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 p-3 rounded-lg border border-green-100 flex items-center justify-between">
                                <span className="text-xs font-bold flex items-center gap-1">
                                    <Sparkles size={14} className="text-green-500" /> Điểm tích lũy
                                </span>
                                <span className="font-bold font-mono">{user.points || 0}</span>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2 space-y-1">
                            {onOpenShare && (
                                <button
                                    onClick={() => { setIsOpen(false); onOpenShare(); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors text-left"
                                >
                                    <Sparkles size={18} className="text-green-500" />
                                    Nhận Thêm Điểm
                                </button>
                            )}

                            {onOpenProjects && (
                                <button
                                    onClick={() => { setIsOpen(false); onOpenProjects(); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-left"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                                    Quản lý Dự án
                                </button>
                            )}

                            <div className="h-px bg-border mx-2 my-1"></div>
                            <a
                                href="/about"
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                            >
                                <Sparkles size={18} className="text-purple-500" />
                                Giới thiệu
                            </a>

                            <a
                                href="/guide"
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                            >
                                <HelpCircle size={18} className="text-blue-500" />
                                Hướng dẫn sử dụng
                            </a>

                            <div className="h-px bg-border mx-2 my-1"></div>

                            <button
                                onClick={() => { setIsOpen(false); onOpenSettings(); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                            >
                                <Settings size={18} className="text-muted-foreground" />
                                Cài đặt API Key
                            </button>
                        </div>

                        <div className="h-px bg-border mx-3"></div>

                        {/* Logout */}
                        <div className="p-2">
                            <button
                                onClick={() => { setIsOpen(false); onLogout(); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-medium"
                            >
                                <LogOut size={18} />
                                Đăng xuất
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
