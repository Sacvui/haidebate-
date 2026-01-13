'use client';

import { useState } from 'react';
import { X, Share2, CheckCircle, AlertCircle } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    // @ts-ignore
    user?: any; // Allow passing full user object
    onSuccess: () => void;
}

export function ShareModal({ isOpen, onClose, userId, user, onSuccess }: ShareModalProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const referralLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${user?.referralCode || 'CODE'}` : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (existing logic)
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/verify-share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, postUrl: url })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setMessage({ type: 'success', text: data.message });
            setTimeout(() => {
                onSuccess();
                onClose();
                setUrl('');
                setMessage(null);
            }, 2000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Share2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold">Giới thiệu & Nhận điểm</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Referral Section */}
                        {user?.referralCode && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Mã giới thiệu của bạn</h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg font-mono text-sm text-slate-600 truncate">
                                        {referralLink}
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shrink-0"
                                    >
                                        {copied ? "Đã copy" : "Copy"}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Gửi link này cho bạn bè. Khi họ đăng ký, cả hai sẽ nhận được <strong>300 điểm</strong>!
                                </p>
                            </div>
                        )}

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-slate-100"></div>
                            <span className="flex-shrink mx-4 text-slate-300 text-xs font-bold uppercase">Hoặc</span>
                            <div className="flex-grow border-t border-slate-100"></div>
                        </div>

                        {/* Share Task Section */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-2">Làm nhiệm vụ: Chia sẻ MXH</h3>
                            <p className="text-xs text-slate-500 mb-3">Copy link bài viết công khai của bạn để nhận thêm 30 điểm/ngày.</p>

                            <form onSubmit={handleSubmit}>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="Link bài viết facebook..."
                                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {loading ? '...' : 'Gửi'}
                                    </button>
                                </div>
                            </form>
                            {message && (
                                <div className={`mt-3 p-2 rounded text-xs flex items-center gap-1 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                    {message.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
