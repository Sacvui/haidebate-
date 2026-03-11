"use client";

import React, { useState } from 'react';
import { BookOpen, GraduationCap, HelpCircle, Sparkles, Info, Rocket } from 'lucide-react';
import { AcademicLevel, ProjectType } from '@/lib/agents';
import { GOAL_OPTIONS, ACADEMIC_LEVELS, PROJECT_TYPES, AUDIENCE_OPTIONS } from '@/lib/constants';

interface ResearchFormProps {
    onStart: (data: { topic: string; level: AcademicLevel; goal: string; audience: string; language: 'vi' | 'en'; projectType: ProjectType; paperType?: string }) => void;
    onOpenGuidelines: () => void;
    // Visual props for Preview Mode
    isPreview?: boolean;
    apiKeyPresent?: boolean;
}

import { GuideModal } from './GuideModal';

export const ResearchForm = ({ onStart, onOpenGuidelines, isPreview = false, apiKeyPresent = true }: ResearchFormProps) => {
    const [topic, setTopic] = useState("");
    const [goal, setGoal] = useState<string>(GOAL_OPTIONS.MASTER_THESIS); // Default
    const [audience, setAudience] = useState("Chuyên gia/Nhà nghiên cứu");
    const [level, setLevel] = useState<AcademicLevel>("MASTER");
    const [language, setLanguage] = useState<'vi' | 'en'>('vi');
    const [projectType, setProjectType] = useState<ProjectType>('RESEARCH');
    const [paperType, setPaperType] = useState<string>('quant');
    const [showGuide, setShowGuide] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (topic.trim()) {
            setIsSubmitting(true);
            onStart({ topic, level, goal, audience, language, projectType, paperType });
            // Reset after a delay in case the parent doesn't unmount immediately
            setTimeout(() => setIsSubmitting(false), 2000);
        }
    };

    const handleLevelSelect = (lvl: AcademicLevel) => {
        setLevel(lvl);
        // Reset project type when level changes
        if (lvl !== 'UNDERGRAD') {
            setProjectType('RESEARCH');
        }
        if (lvl === 'UNDERGRAD') setGoal(projectType === 'STARTUP' ? GOAL_OPTIONS.STARTUP_PLAN : GOAL_OPTIONS.UNDERGRAD_RESEARCH);
        if (lvl === 'MASTER') setGoal(GOAL_OPTIONS.MASTER_THESIS);
        if (lvl === 'PHD') setGoal(GOAL_OPTIONS.PHD_DISSERTATION);
    };

    const handleProjectTypeSelect = (type: ProjectType) => {
        setProjectType(type);
        if (type === 'STARTUP') {
            setGoal(GOAL_OPTIONS.STARTUP_PLAN);
            setAudience("Nhà đầu tư / Quỹ Khởi nghiệp");
        } else {
            setGoal(GOAL_OPTIONS.UNDERGRAD_RESEARCH);
            setAudience("Giảng viên hướng dẫn");
        }
    };

    return (
        <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ${isPreview ? 'opacity-80 pointer-events-none grayscale-[0.3]' : ''}`}>
            <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

            <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                    Quy Trình Nghiên Cứu <br />
                    <span className="text-blue-600">3 Bước Chuyên Sâu</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Từ ý tưởng đến đề cương chi tiết chuẩn APA 7 với sự hỗ trợ của AI Phản Biện.
                </p>

                <div className="flex justify-center gap-2 text-sm font-semibold text-slate-500 mt-2">
                    <span className="px-3 py-1 bg-card border border-border rounded-full flex items-center gap-1"><BookOpen size={14} /> Topic Check</span>
                    <span className="px-3 py-1 bg-card border border-border rounded-full flex items-center gap-1"><BookOpen size={14} /> Model Builder</span>
                    <span className="px-3 py-1 bg-card border border-border rounded-full flex items-center gap-1"><BookOpen size={14} /> Outline</span>
                    <span className="px-3 py-1 bg-card border border-border rounded-full flex items-center gap-1"><BookOpen size={14} /> Survey Builder</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl shadow-xl shadow-border/30 border border-border space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Chủ đề nghiên cứu sơ khởi</label>
                    <textarea
                        required={!isPreview}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ví dụ: Tác động của ESG đến hiệu quả tài chính doanh nghiệp..."
                        className="w-full h-32 px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-1 bg-muted rounded-xl">
                        {ACADEMIC_LEVELS.map((lvl) => (
                            <button
                                key={lvl.value}
                                type="button"
                                onClick={() => handleLevelSelect(lvl.value)}
                                className={`py-2 rounded-lg text-xs font-bold transition-all ${level === lvl.value
                                    ? 'bg-card text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {lvl.label}
                            </button>
                        ))}
                    </div>

                    {/* Startup Project Toggle - Only show when UNDERGRAD is selected */}
                    {level === 'UNDERGRAD' && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold text-orange-700 mb-2 block">
                                Chọn loại dự án
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {PROJECT_TYPES.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleProjectTypeSelect(type.value)}
                                        className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${projectType === type.value
                                            ? (type.value === 'STARTUP'
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md ring-2 ring-orange-400'
                                                : 'bg-white text-blue-700 shadow-md ring-2 ring-blue-500')
                                            : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-700'
                                            }`}
                                    >
                                        {type.value === 'STARTUP' ? <Rocket size={14} /> : <BookOpen size={14} />}
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                            {projectType === 'STARTUP' && (
                                <p className="text-xs text-orange-600 mt-2 flex items-start gap-1">
                                    <Sparkles size={12} className="mt-0.5 flex-shrink-0" />
                                    Workflow: Ý tưởng → Lean Canvas → Pitch Deck + Kế hoạch Tài chính/Marketing → Customer Discovery
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center h-6">
                            <label className="text-sm font-semibold text-foreground">Loại hình bài viết</label>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="text-xs text-muted-foreground font-medium flex items-center gap-1 hover:text-blue-600 transition-colors whitespace-nowrap"
                            >
                                <Info size={12} /> Hướng dẫn
                            </button>
                        </div>

                        <select
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-blue-500 outline-none text-foreground"
                        >
                            {Object.values(GOAL_OPTIONS).map(opt => (
                                <option key={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Paper Methodology Selector - New Feature */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center h-6">
                            <label className="text-sm font-semibold text-foreground">Phương pháp / Loại bài báo</label>
                        </div>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-blue-500 outline-none text-foreground"
                            value={paperType}
                            onChange={(e) => setPaperType(e.target.value)}
                        >
                            <option value="quant">Original Research (Quantitative)</option>
                            <option value="software">Software / Tool Publication (New)</option>
                            <option value="qual" disabled>Qualitative Research (Coming Soon)</option>
                            <option value="review" disabled>Systematic Review (Coming Soon)</option>
                            <option value="method" disabled>Methodological Paper (Coming Soon)</option>
                        </select>
                        <p className="text-[10px] text-slate-400 italic px-1">
                            *Chọn "Software" nếu bài viết về công cụ, phần mềm, hoặc giải pháp kỹ thuật
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center h-6">
                            <label className="text-sm font-semibold text-foreground">Đối tượng độc giả</label>
                        </div>
                        <select
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-blue-500 outline-none text-foreground"
                        >
                            {AUDIENCE_OPTIONS.map(opt => (
                                <option key={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center h-6">
                            <label className="text-sm font-semibold text-foreground">Ngôn ngữ đầu ra</label>
                        </div>
                        <div className="flex bg-muted p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setLanguage('vi')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${language === 'vi' ? 'bg-card text-blue-700 dark:text-blue-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                🇻🇳 Tiếng Việt
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${language === 'en' ? 'bg-card text-blue-700 dark:text-blue-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                🇺🇸 English
                            </button>
                        </div>
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
                    disabled={isSubmitting || isPreview || !apiKeyPresent}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative"
                    title={!apiKeyPresent ? 'Vui lòng nhập API Key ở phía trên trước' : ''}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Vui lòng chờ...
                        </span>
                    ) : !apiKeyPresent ? (
                        <span className="flex items-center justify-center gap-2">
                            Vui lòng nhập API Key trước
                        </span>
                    ) : (
                        "Bắt đầu quy trình nghiên cứu"
                    )}
                </button>
            </form>
        </div>
    );
};
