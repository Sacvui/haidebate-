'use client';

import React, { useState } from 'react';
import { Bot, Copy, RefreshCw, Send, Lock, FileText, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function PostWriterPage() {
    const [topic, setTopic] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error('Vui lòng nhập chủ đề hoặc ý tưởng!');
            return;
        }

        setIsLoading(true);
        setResult(''); // Clear previous result

        try {
            const response = await fetch('/api/admin/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, apiKey })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Có lỗi xảy ra');
            }

            setResult(data.content);
            toast.success('Đã viết xong! Hãy kiểm tra hàng.');
        } catch (error: any) {
            toast.error(`Lỗi: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setIsCopied(true);
        toast.success('Đã copy bài viết!');
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
                    <Bot className="w-10 h-10 text-blue-600" />
                    Hải Rong Chơi Writer
                </h1>
                <p className="text-slate-500 mt-2">
                    Công cụ viết content Facebook chuyên biệt với phong cách "Bụi bặm - Học thuật".
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
                {/* LEFT: INPUT */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText size={20} /> Input
                    </h2>

                    <div className="space-y-4 flex-1 flex flex-col">
                        <div className="flex-1 flex flex-col">
                            <label className="text-sm font-medium mb-2 text-slate-700">Chủ đề / Ý tưởng / Từ khóa</label>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Ví dụ: Tại sao sinh viên hay rớt môn Nghiên cứu khoa học? Hãy dùng ẩn dụ đi tán gái..."
                                className="w-full flex-1 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-sans text-base"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 text-slate-700 flex items-center gap-2">
                                <Lock size={14} /> API Key (Optional nếu đã cấu hình Server)
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Nhập Gemini API Key nếu cần..."
                                className="w-full p-2 rounded-lg border border-slate-300 text-sm"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center gap-2
                                ${isLoading
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="animate-spin" size={20} /> Đang viết (suy nghĩ hệ thống 2)...
                                </>
                            ) : (
                                <>
                                    <Send size={20} /> Viết Bài Ngay
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* RIGHT: OUTPUT */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Bot size={20} /> Kết Quả
                        </h2>
                        {result && (
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border
                                    ${isCopied
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                    }`}
                            >
                                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                {isCopied ? "Đã chép" : "Copy"}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 bg-white border border-slate-200 rounded-lg p-6 overflow-y-auto font-serif text-base leading-relaxed text-slate-800 shadow-sm">
                        {result ? (
                            <div className="whitespace-pre-wrap prose prose-blue max-w-none">
                                <ReactMarkdown>
                                    {result}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Bot size={48} className="mb-4 opacity-20" />
                                <p>Kết quả sẽ hiện ở đây...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
