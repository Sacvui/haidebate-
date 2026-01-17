'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Copy, RefreshCw, Send, Lock, FileText, Check, MessageSquare, Settings, X, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface HistoryItem {
    role: 'Writer' | 'Critic';
    content: string;
    round: number;
}

export default function PostWriterPage() {
    const [topic, setTopic] = useState('');
    const [writerKey, setWriterKey] = useState('');
    const [criticKey, setCriticKey] = useState('');
    const [result, setResult] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [statusText, setStatusText] = useState('');

    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [writerPrompt, setWriterPrompt] = useState('');
    const [criticPrompt, setCriticPrompt] = useState('');
    const [loadingPrompts, setLoadingPrompts] = useState(false);

    // Initial load prompts when opening settings
    useEffect(() => {
        if (showSettings) {
            fetchPrompts();
        }
    }, [showSettings]);

    const fetchPrompts = async () => {
        setLoadingPrompts(true);
        try {
            const res = await fetch('/api/admin/prompts');
            const data = await res.json();
            if (data.prompts) {
                setWriterPrompt(data.prompts.writer);
                setCriticPrompt(data.prompts.critic);
            }
        } catch (error) {
            toast.error('Không tải được cấu hình Prompts');
        } finally {
            setLoadingPrompts(false);
        }
    };

    const handleSavePrompts = async () => {
        try {
            const res = await fetch('/api/admin/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ writer: writerPrompt, critic: criticPrompt })
            });
            if (res.ok) {
                toast.success('Đã lưu cấu hình Prompt mới!');
                setShowSettings(false);
            } else {
                toast.error('Lỗi khi lưu cấu hình');
            }
        } catch (error) {
            toast.error('Lỗi kết nối');
        }
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error('Vui lòng nhập chủ đề hoặc ý tưởng!');
            return;
        }

        setIsLoading(true);
        setResult('');
        setHistory([]);

        const safeWriterKey = writerKey || '';
        const safeCriticKey = criticKey || '';

        // Helper to call generic step
        const callStep = async (action: string, currentDraft = "", critique = ""): Promise<string> => {
            const res = await fetch('/api/admin/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    writerKey: safeWriterKey,
                    criticKey: safeCriticKey,
                    action,
                    currentDraft,
                    critique
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Lỗi bước ${action}`);
            return data.content;
        };

        try {
            // STEP 1: DRAFT
            setStatusText('Round 1: Writer đang viết nháp...');
            const draft1 = await callStep('draft');
            setHistory(prev => [...prev, { role: 'Writer', content: draft1, round: 1 }]);

            // STEP 2: CRITIQUE 1
            setStatusText('Round 2: Critic đang "sấy" (Roasting)...');
            const critique1 = await callStep('critique', draft1);
            setHistory(prev => [...prev, { role: 'Critic', content: critique1, round: 2 }]);

            // STEP 3: REVISE 1
            setStatusText('Round 2: Writer đang sửa bài theo chỉ đạo...');
            const draft2 = await callStep('revise', draft1, critique1);
            setHistory(prev => [...prev, { role: 'Writer', content: draft2, round: 2 }]);

            // STEP 4: CRITIQUE 2 (FINAL CHECK)
            setStatusText('Round 3: Critic đang kiểm tra lần cuối...');
            const critique2 = await callStep('final_critique', draft2);
            setHistory(prev => [...prev, { role: 'Critic', content: critique2, round: 3 }]);

            // STEP 5: FINAL
            setStatusText('Final: Writer đang hoàn thiện cực phẩm...');
            const finalPost = await callStep('final', draft2, critique2);
            setHistory(prev => [...prev, { role: 'Writer', content: finalPost, round: 3 }]);

            setResult(finalPost);
            toast.success('Đã hoàn thành 3 vòng tranh biện!');

        } catch (error: any) {
            toast.error(`Lỗi: ${error.message}`);
            setStatusText('Lỗi rồi đại vương ơi!');
        } finally {
            setIsLoading(false);
            setStatusText('');
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
        <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col relative">
            <header className="mb-6 flex-none flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
                        <Bot className="w-10 h-10 text-blue-600" />
                        Hải Rong Chơi Writer <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Pro Debate Mode</span>
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Hệ thống tranh luận 3 vòng: Writer (Viết/Sửa) vs Critic (Sấy/Duyệt) để tạo content "Bụi & Đỉnh".
                    </p>
                </div>
                <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Cấu hình Prompt"
                >
                    <Settings size={24} />
                </button>
            </header>

            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                {/* LEFT: INPUT */}
                <div className="col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText size={20} /> Input
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 text-slate-700">Chủ đề / Ý tưởng</label>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="VD: Game Theory trong tán gái..."
                                className="w-full h-32 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">API Keys (Dual-Core)</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium mb-1 text-slate-600 flex items-center gap-1">
                                        <Lock size={12} /> Writer Key
                                    </label>
                                    <input
                                        type="password"
                                        value={writerKey}
                                        onChange={(e) => setWriterKey(e.target.value)}
                                        placeholder="Gemini Key 1"
                                        className="w-full p-2 rounded border border-slate-300 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1 text-slate-600 flex items-center gap-1">
                                        <Lock size={12} /> Critic Key
                                    </label>
                                    <input
                                        type="password"
                                        value={criticKey}
                                        onChange={(e) => setCriticKey(e.target.value)}
                                        placeholder="Gemini Key 2 (Optional)"
                                        className="w-full p-2 rounded border border-slate-300 text-xs"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Dùng 2 key khác nhau để tránh Rate Limit.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center gap-2 mt-4
                                ${isLoading
                                    ? 'bg-slate-700 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                            {isLoading ? 'Đang tranh luận...' : 'Bắt đầu Debate'}
                        </button>

                        {isLoading && (
                            <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200 text-center animate-pulse">
                                {statusText}
                            </div>
                        )}
                    </div>
                </div>

                {/* MIDDLE: DEBATE LOG */}
                <div className="col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col h-full overflow-hidden">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-700">
                        <MessageSquare size={20} /> Diễn biến (Debate Log)
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {history.length === 0 && !isLoading && (
                            <div className="text-center text-slate-400 text-sm mt-10 italic">
                                Chưa có dữ liệu. Bấm nút để xem các AI "chửi nhau".
                            </div>
                        )}
                        {history.map((item, idx) => (
                            <div key={idx} className={`p-3 rounded-lg text-sm border ${item.role === 'Critic' ? 'bg-red-50 border-red-200 ml-4' : 'bg-white border-slate-200 mr-4'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <strong className={`${item.role === 'Critic' ? 'text-red-700' : 'text-blue-700'}`}>
                                        {item.role === 'Critic' ? '👺 Critic' : '✍️ Writer'} (R{item.round})
                                    </strong>
                                </div>
                                <div className="text-slate-700 line-clamp-6 hover:line-clamp-none cursor-pointer transition-all">
                                    <ReactMarkdown>{item.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="p-3 rounded-lg bg-slate-200 animate-pulse h-24"></div>
                        )}
                    </div>
                </div>

                {/* RIGHT: RESULT */}
                <div className="col-span-5 bg-white p-6 rounded-xl border border-slate-200 flex flex-col h-full shadow-lg">
                    <div className="flex justify-between items-center mb-4 flex-none">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                            <Check size={20} /> Kết Quả Cuối Cùng
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

                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-6 overflow-y-auto font-serif text-base leading-relaxed text-slate-800 shadow-inner">
                        {result ? (
                            <div className="whitespace-pre-wrap prose prose-blue max-w-none">
                                <ReactMarkdown>{result}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Bot size={48} className="mb-4 opacity-20" />
                                <p>Bài viết hoàn chỉnh sẽ xuất hiện ở đây...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SETTINGS MODAL */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Settings className="text-slate-600" /> Cấu hình Persona (Hải Rong Chơi)
                            </h2>
                            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6 bg-slate-50">
                            {loadingPrompts ? (
                                <div className="col-span-2 text-center py-20">Loading configuration...</div>
                            ) : (
                                <>
                                    <div className="flex flex-col h-[500px]">
                                        <label className="font-bold mb-2 flex items-center gap-2 text-blue-700">
                                            ✍️ Writer Prompt
                                            <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 rounded">Người viết</span>
                                        </label>
                                        <textarea
                                            value={writerPrompt}
                                            onChange={(e) => setWriterPrompt(e.target.value)}
                                            className="flex-1 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-xs leading-relaxed resize-none"
                                            placeholder="Nhập prompt cho writer..."
                                        />
                                    </div>
                                    <div className="flex flex-col h-[500px]">
                                        <label className="font-bold mb-2 flex items-center gap-2 text-red-700">
                                            👺 Critic Prompt
                                            <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 rounded">Người chửi</span>
                                        </label>
                                        <textarea
                                            value={criticPrompt}
                                            onChange={(e) => setCriticPrompt(e.target.value)}
                                            className="flex-1 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 font-mono text-xs leading-relaxed resize-none"
                                            placeholder="Nhập prompt cho critic..."
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSavePrompts}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95 transition-all"
                            >
                                <Save size={18} /> Lưu Cấu Hình
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
