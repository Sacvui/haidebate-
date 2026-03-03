"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, FolderOpen, Settings, BookOpen, LogOut, Share2, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface MobileMenuProps {
    user: any;
    apiKey: string;
    onToggleProjects: () => void;
    onToggleSettings: () => void;
    onToggleGuide: () => void;
    onToggleShare: () => void;
    onLogout: () => void;
}

export function MobileMenu({
    user,
    apiKey,
    onToggleProjects,
    onToggleSettings,
    onToggleGuide,
    onToggleShare,
    onLogout
}: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    const handleAction = (action: () => void) => {
        setIsOpen(false);
        action();
    };

    return (
        <div className="md:hidden relative" ref={menuRef}>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-muted hover:bg-border transition-colors"
                aria-label="Menu"
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-foreground" />
                ) : (
                    <Menu className="w-5 h-5 text-foreground" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200 z-[100]">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border bg-muted/50">
                        <p className="font-bold text-sm text-foreground truncate">{user.name || user.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <button
                            onClick={() => handleAction(onToggleShare)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 dark:text-green-400 hover:bg-muted transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            <span className="font-medium">Nhận Điểm</span>
                            <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </button>

                        <button
                            onClick={() => handleAction(onToggleProjects)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                            <FolderOpen className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Dự án</span>
                        </button>

                        <button
                            onClick={() => handleAction(onToggleSettings)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors ${!apiKey ? 'text-red-500' : 'text-foreground'
                                }`}
                        >
                            <Settings className={`w-4 h-4 ${!apiKey ? 'text-red-500' : 'text-muted-foreground'}`} />
                            <span className="font-medium">{!apiKey ? 'Nhập API Key' : 'Cài đặt'}</span>
                            {!apiKey && <span className="ml-auto text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">Cần thiết</span>}
                        </button>

                        <button
                            onClick={() => handleAction(onToggleGuide)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Hướng dẫn</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => { toggleTheme(); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-4 h-4 text-yellow-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{theme === 'dark' ? 'Sáng' : 'Tối'}</span>
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-border py-2">
                        <button
                            onClick={() => handleAction(onLogout)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
