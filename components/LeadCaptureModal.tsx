
import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, CheckCircle, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onSuccess: (data: { email: string; referralCode?: string }) => void;
}

export const LeadCaptureModal = ({ isOpen, onSuccess }: LeadCaptureModalProps) => {
    const [email, setEmail] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [isSubmit, setIsSubmit] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        // Check if user already has access in localStorage
        const savedUser = localStorage.getItem("vietpaper_user");
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            onSuccess(parsed);
            setHasAccess(true);
        }
    }, [onSuccess]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmit(true);

        if (email.length > 5 || referralCode.length > 3) {
            const userData = { email, referralCode };
            localStorage.setItem("vietpaper_user", JSON.stringify(userData));

            setTimeout(() => {
                onSuccess(userData);
                setHasAccess(true);
            }, 800);
        } else {
            setIsSubmit(false);
        }
    };

    const handleOrcidLogin = () => {
        // Simulation of ORCID Login
        const userData = { email: "researcher@orcid.org", referralCode: "ORCID-LOGIN" };
        localStorage.setItem("vietpaper_user", JSON.stringify(userData));
        onSuccess(userData);
        setHasAccess(true);
    };

    if (!isOpen || hasAccess) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                            <Lock className="text-blue-600 w-8 h-8" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chào mừng đến với Hải Debate</h2>
                        <p className="text-slate-500 text-sm">
                            Đăng nhập để bắt đầu hành trình nghiên cứu.
                        </p>
                    </div>

                    {/* ORCID Button */}
                    <button
                        type="button"
                        onClick={handleOrcidLogin}
                        className="w-full py-3 mb-6 flex items-center justify-center gap-2 bg-[#A6CE39]/10 text-[#A6CE39] hover:bg-[#A6CE39]/20 font-bold rounded-xl border border-[#A6CE39]/50 transition-all"
                    >
                        <Globe size={20} /> Đăng nhập nhanh bằng ORCID
                    </button>

                    <div className="relative flex py-2 items-center mb-6">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-slate-400 text-xs">Hoặc dùng Email</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email của bạn..."
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmit}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2"
                        >
                            {isSubmit ? <CheckCircle className="animate-pulse" /> : <>Tiếp tục <ArrowRight size={20} /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
