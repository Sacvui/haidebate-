'use client';

import { useState } from 'react';
import { X, Share2, CheckCircle, AlertCircle } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess: () => void;
}

export function ShareModal({ isOpen, onClose, userId, onSuccess }: ShareModalProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
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
                            <h2 className="text-xl font-bold">Chia sẻ để nhận điểm</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                            <p className="font-semibold mb-1">Cách nhận 30 điểm:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Chia sẻ Hải Debate lên MXH (Facebook, Zalo...)</li>
                                <li>Đặt chế độ <strong>Công khai</strong> (Public)</li>
                                <li>Copy link bài viết và dán vào bên dưới</li>
                            </ol>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Link bài viết công khai
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://facebook.com/..."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                                required
                            />

                            {message && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                            >
                                {loading ? 'Đang kiểm tra...' : 'Gửi xác nhận'}
                            </button>
                        </form>
                    </div>

                    <p className="text-xs text-center text-gray-500">
                        *Lưu ý: Hệ thống sẽ kiểm tra ngẫu nhiên. Nếu phát hiện link ảo, tài khoản sẽ bị khóa vĩnh viễn.
                    </p>
                </div>
            </div>
        </div>
    );
}
