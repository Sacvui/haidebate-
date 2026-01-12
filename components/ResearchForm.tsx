
import React, { useState } from 'react';
import { BookOpen, GraduationCap, HelpCircle, Sparkles, Info } from 'lucide-react';
import { AcademicLevel } from '@/lib/agents';

interface ResearchFormProps {
    onStart: (data: { topic: string; level: AcademicLevel; goal: string; audience: string }) => void;
    onOpenGuidelines: () => void;
    // Visual props for Preview Mode
    isPreview?: boolean;
}

import { GuideModal } from './GuideModal';

export const ResearchForm = ({ onStart, onOpenGuidelines, isPreview = false }: ResearchFormProps) => {
    const [topic, setTopic] = useState("");
    const [goal, setGoal] = useState("Nghiên cứu khoa học/Đăng báo");
    const [audience, setAudience] = useState("Chuyên gia/Nhà nghiên cứu");
    const [level, setLevel] = useState<AcademicLevel>("MASTER");
    const [showGuide, setShowGuide] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            onStart({ topic, level, goal, audience });
        }
    };

    const handleLevelSelect = (lvl: AcademicLevel) => {
        setLevel(lvl);
        if (lvl === 'UNDERGRAD') setGoal("Tiểu luận Đại học/Khóa luận");
        if (lvl === 'MASTER') setGoal("Luận văn Thạc sĩ");
        if (lvl === 'PHD') setGoal("Bài báo quốc tế (ISI/Scopus) / Đề án Tiến sĩ");
    };

    return (
        <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ${isPreview ? 'opacity-80 pointer-events-none grayscale-[0.3]' : ''}`}>
            <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

            <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                    Quy Trình Nghiên Cứu <br />
                    <span className="text-blue-600">3 Bước Chuyên Sâu</span>
                </h2>
                <p className="text-lg text-slate-600 max-w-md mx-auto">
                    Từ ý tưởng đến đề cương chi tiết chuẩn APA 7 với sự hỗ trợ của AI Phản Biện.
                </p>

                <div className="flex justify-center gap-2 text-sm font-semibold text-slate-500 mt-2">
                    <span className="px-3 py-1 bg-white border rounded-full flex items-center gap-1"><BookOpen size={14} /> Topic Check</span>
                    <span className="px-3 py-1 bg-white border rounded-full flex items-center gap-1"><BookOpen size={14} /> Model Builder</span>
                    <span className="px-3 py-1 bg-white border rounded-full flex items-center gap-1"><BookOpen size={14} /> Outline</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Chủ đề nghiên cứu sơ khởi</label>
                    <textarea
                        required={!isPreview}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ví dụ: Tác động của ESG đến hiệu quả tài chính doanh nghiệp..."
                        className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <GraduationCap size={16} /> Trình độ bài viết
                        </label>
                        <button
                            type="button"
                            onClick={onOpenGuidelines}
                            className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"
                        >
                            <HelpCircle size={14} /> Hướng dẫn chọn cấp độ?
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                        {(['UNDERGRAD', 'MASTER', 'PHD'] as AcademicLevel[]).map((lvl) => (
                            <button
                                key={lvl}
                                type="button"
                                onClick={() => handleLevelSelect(lvl)}
                                className={`py-2 rounded-lg text-xs font-bold transition-all ${level === lvl
                                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {lvl === 'UNDERGRAD' && "Sinh Viên"}
                                {lvl === 'MASTER' && "Thạc Sĩ"}
                                {lvl === 'PHD' && "Tiến Sĩ / Công Bố"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-slate-700">Loại hình bài viết</label>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="text-xs text-slate-400 font-medium flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                                <Info size={12} /> Hướng dẫn: Output & Độc giả
                            </button>
                        </div>

                        <select
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                        >
                            <option>Tiểu luận Đại học/Khóa luận</option>
                            <option>Luận văn Thạc sĩ</option>
                            <option>Bài báo quốc tế (ISI/Scopus) / Đề án Tiến sĩ</option>
                            <option>Nghiên cứu khoa học/Đăng báo trong nước</option>
                            <option>Đề xuất dự án (Grant Proposal)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Đối tượng độc giả</label>
                        <select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                        >
                            <option>Hội đồng phản biện chuyên môn</option>
                            <option>Tạp chí Quốc tế (ISI/Scopus)</option>
                            <option>Giảng viên hướng dẫn</option>
                            <option>Cộng đồng học thuật</option>
                        </select>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                    <strong>Quy định hệ thống:</strong>
                    <ul className="list-disc ml-5 mt-1 space-y-1 text-blue-700/80">
                        <li>Định dạng chuẩn APA 7th Edition.</li>
                        <li>Kiểm tra tính xác thực (Anti-Hallucination).</li>
                        <li>Tổng cộng: ~8 vòng phản biện qua 3 giai đoạn.</li>
                    </ul>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all text-lg"
                >
                    Bắt đầu quy trình nghiên cứu
                </button>
            </form>
        </div>
    );
};
