
import React from 'react';
import { X, GraduationCap, BookOpen, ScrollText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AcademicLevel } from '@/lib/agents';

interface LevelGuidelinesProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLevel: (level: AcademicLevel) => void;
}

export const LevelGuidelines = ({ isOpen, onClose, onSelectLevel }: LevelGuidelinesProps) => {
    if (!isOpen) return null;

    const levels = [
        {
            id: 'UNDERGRAD',
            title: "Tiểu luận Đại học",
            subtitle: "Mô tả & Ứng dụng",
            icon: <BookOpen className="text-teal-600" size={20} />,
            headerColor: "bg-teal-50 border-teal-100",
            accentColor: "text-teal-700",
            buttonClass: "bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50",
            features: [
                "2 - 4 biến chính (Đơn giản)",
                "Quan hệ Tuyến tính (X -> Y)",
                "Không yêu cầu biến trung gian",
                "Phù hợp: Bài tập lớn, Khóa luận"
            ],
            example: "4P Marketing -> Doanh thu trà Atisô.",
            hasDiagram: true
        },
        {
            id: 'MASTER',
            title: "Luận văn Thạc sĩ",
            subtitle: "Giải thích & Tác động",
            icon: <GraduationCap className="text-indigo-600" size={20} />,
            headerColor: "bg-indigo-50 border-indigo-100",
            accentColor: "text-indigo-700",
            buttonClass: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200",
            popular: true,
            features: [
                "5 - 8 biến (Trung bình)",
                "Bắt buộc có Trung gian/Điều tiết",
                "Có căn cứ lý thuyết (TPB, TAM)",
                "Phù hợp: Luận văn, Báo trong nước"
            ],
            example: "Bao bì xanh -> Tin tưởng -> Mua.",
            hasDiagram: true
        },
        {
            id: 'PHD',
            title: "Tiến sĩ / Quốc tế",
            subtitle: "Cơ chế & Lý thuyết",
            icon: <ScrollText className="text-slate-700" size={20} />,
            headerColor: "bg-slate-100 border-slate-200",
            accentColor: "text-slate-800",
            buttonClass: "bg-slate-800 text-white hover:bg-slate-900 shadow-md shadow-slate-300",
            features: [
                "8 - 15+ biến (Phức tạp)",
                "Đa lớp, Đa tầng (Multi-level)",
                "Giải quyết Gap/Mâu thuẫn lý thuyết",
                "Phù hợp: Luận án, ISI/Scopus Q1-Q2"
            ],
            example: "Cơ chế kép: Tin tưởng vs Hoài nghi xanh.",
            hasDiagram: true
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Phân Loại Trình Độ Nghiên Cứu</h2>
                        <p className="text-slate-500 text-sm mt-1">Chọn cấp độ phù hợp để tối ưu hóa sự hỗ trợ của AI.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 bg-slate-50/50 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {levels.map((lvl) => (
                            <div
                                key={lvl.id}
                                className={cn(
                                    "relative group rounded-xl bg-white border border-slate-200 p-0 flex flex-col h-full transition-all duration-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50",
                                    // @ts-ignore
                                    lvl.popular && "ring-2 ring-indigo-500/10 border-indigo-200"
                                )}
                            >
                                {/* Badge for Popular - Changed text to PHỔ BIẾN */}
                                {/* @ts-ignore */}
                                {lvl.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                                        Phổ biến
                                    </div>
                                )}

                                {/* Card Header */}
                                <div className={cn("p-6 border-b border-slate-50 rounded-t-xl", lvl.headerColor)}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white rounded-lg shadow-sm ring-1 ring-black/5">
                                            {lvl.icon}
                                        </div>
                                        <span className={cn("text-xs font-bold uppercase tracking-wider opacity-80", lvl.accentColor)}>
                                            {lvl.subtitle}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">{lvl.title}</h3>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex-1 flex flex-col space-y-6">
                                    {/* Optional Diagram for Master Level */}
                                    {/* @ts-ignore */}
                                    {lvl.hasDiagram && (
                                        <div className="bg-white p-2 rounded-lg border border-slate-100 flex justify-center py-4 shadow-sm min-h-[90px] items-center">
                                            {/* UNDERGRAD: X -> Y */}
                                            {lvl.id === 'UNDERGRAD' && (
                                                <svg width="180" height="40" viewBox="0 0 180 40">
                                                    <rect x="10" y="5" width="50" height="30" rx="4" fill="#F0FDFA" stroke="#0D9488" strokeWidth="1.5" />
                                                    <text x="35" y="25" fontSize="10" textAnchor="middle" fill="#0F766E" fontWeight="bold">IV</text>
                                                    <rect x="120" y="5" width="50" height="30" rx="4" fill="#F0FDFA" stroke="#0D9488" strokeWidth="1.5" />
                                                    <text x="145" y="25" fontSize="10" textAnchor="middle" fill="#0F766E" fontWeight="bold">DV</text>
                                                    <defs>
                                                        <marker id="arrow-teal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                                            <path d="M0,0 L0,6 L6,3 z" fill="#14B8A6" />
                                                        </marker>
                                                    </defs>
                                                    <line x1="60" y1="20" x2="120" y2="20" stroke="#14B8A6" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />
                                                </svg>
                                            )}

                                            {/* MASTER: X -> M -> Y */}
                                            {lvl.id === 'MASTER' && (
                                                <svg width="200" height="50" viewBox="0 0 200 50">
                                                    <rect x="5" y="10" width="45" height="30" rx="4" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="1.5" />
                                                    <text x="27.5" y="29" fontSize="9" textAnchor="middle" fill="#4338ca" fontWeight="bold">IV</text>
                                                    <rect x="77.5" y="10" width="45" height="30" rx="4" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="1.5" strokeDasharray="4" />
                                                    <text x="100" y="29" fontSize="9" textAnchor="middle" fill="#4338ca" fontWeight="bold">Med</text>
                                                    <rect x="150" y="10" width="45" height="30" rx="4" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="1.5" />
                                                    <text x="172.5" y="29" fontSize="9" textAnchor="middle" fill="#4338ca" fontWeight="bold">DV</text>
                                                    <defs>
                                                        <marker id="arrow-indigo" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                                            <path d="M0,0 L0,6 L6,3 z" fill="#6366f1" />
                                                        </marker>
                                                    </defs>
                                                    <line x1="50" y1="25" x2="77.5" y2="25" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#arrow-indigo)" />
                                                    <line x1="122.5" y1="25" x2="150" y2="25" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#arrow-indigo)" />
                                                </svg>
                                            )}

                                            {/* PHD: Complex Moderated Mediation */}
                                            {lvl.id === 'PHD' && (
                                                <svg width="200" height="60" viewBox="0 0 200 60">
                                                    <rect x="5" y="25" width="40" height="25" rx="4" fill="#F1F5F9" stroke="#334155" strokeWidth="1.5" />
                                                    <text x="25" y="41" fontSize="8" textAnchor="middle" fill="#1e293b" fontWeight="bold">IV</text>
                                                    <rect x="75" y="25" width="50" height="25" rx="4" fill="#F1F5F9" stroke="#334155" strokeWidth="1.5" strokeDasharray="3" />
                                                    <text x="100" y="41" fontSize="8" textAnchor="middle" fill="#1e293b" fontWeight="bold">Med</text>
                                                    <rect x="155" y="25" width="40" height="25" rx="4" fill="#F1F5F9" stroke="#334155" strokeWidth="1.5" />
                                                    <text x="175" y="41" fontSize="8" textAnchor="middle" fill="#1e293b" fontWeight="bold">DV</text>

                                                    {/* Moderator */}
                                                    <rect x="80" y="0" width="40" height="20" rx="4" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
                                                    <text x="100" y="14" fontSize="8" textAnchor="middle" fill="#334155" fontWeight="bold">Mod</text>

                                                    <defs>
                                                        <marker id="arrow-slate" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                                            <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
                                                        </marker>
                                                    </defs>
                                                    <line x1="45" y1="37.5" x2="75" y2="37.5" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                                                    <line x1="125" y1="37.5" x2="155" y2="37.5" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                                                    <line x1="100" y1="20" x2="100" y2="25" stroke="#475569" strokeWidth="1" strokeDasharray="2" markerEnd="url(#arrow-slate)" />
                                                </svg>
                                            )}
                                        </div>
                                    )}

                                    <ul className="space-y-3 flex-1">
                                        {lvl.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                                                <CheckCircle2 size={16} className={cn("mt-0.5 shrink-0", lvl.accentColor)} />
                                                <span className="leading-tight">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500 italic">
                                        <strong className="block text-slate-700 not-italic mb-1 text-[10px] uppercase">Ví dụ:</strong>
                                        "{lvl.example}"
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="p-4 pt-0">
                                    <button
                                        onClick={() => {
                                            onSelectLevel(lvl.id as AcademicLevel);
                                            onClose();
                                        }}
                                        className={cn("w-full py-3 rounded-lg text-sm font-bold transition-all transform active:scale-[0.98]", lvl.buttonClass)}
                                    >
                                        Chọn Cấp Độ Này
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
