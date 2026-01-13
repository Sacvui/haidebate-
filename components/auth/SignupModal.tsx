'use client';

import { useState, useEffect } from 'react';

interface SignupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function SignupModal({ isOpen, onClose, onSuccess }: SignupModalProps) {
    const [email, setEmail] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [needsReferral, setNeedsReferral] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkSignupStatus();
    }, []);

    const checkSignupStatus = async () => {
        const response = await fetch('/api/total-users');
        const { total } = await response.json();
        setNeedsReferral(total >= 100);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Get referral code from URL if not entered
            const urlParams = new URLSearchParams(window.location.search);
            const refFromUrl = urlParams.get('ref');
            const finalRefCode = referralCode || refFromUrl;

            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    referralCode: finalRefCode
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Đăng ký thất bại');
            }

            const user = await response.json();
            localStorage.setItem('userId', user.id);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Đăng ký Hải Debate</h2>

                {needsReferral && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                        ⚠️ Hải Debate hiện chỉ mở cho người được mời
                    </div>
                )}

                <form onSubmit={handleSignup}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>

                    {needsReferral && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Mã giới thiệu (bắt buộc)
                            </label>
                            <input
                                type="text"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="VD: ABC123"
                                required
                            />
                        </div>
                    )}

                    {/* ... previous error ... */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <div className="mb-4 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                            onClick={() => alert("Tính năng Google Login đang phát triển!")}
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                            onClick={() => alert("Tính năng ORCID Login đang phát triển!")}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/06/ORCID_iD.svg" className="w-5 h-5" alt="ORCID" />
                            ORCID
                        </button>
                    </div>

                    <div className="relative flex py-2 items-center mb-4">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">Hoặc Email</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký (Nhận 200 điểm)'}
                    </button>
                </form>

                <button
                    onClick={onClose}
                    className="mt-4 w-full text-gray-600 hover:text-gray-800"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
}
