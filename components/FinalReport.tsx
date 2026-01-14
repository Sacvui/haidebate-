import React, { useState } from 'react';
import { Download, CheckCircle, FileText, ArrowLeft, Printer, Eye, EyeOff } from 'lucide-react';
import { MermaidChart } from './MermaidChart';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FinalReportProps {
    topic: string;
    goal: string;
    audience: string;
    finalContent: string;
    variableChart?: string;
    surveyContent?: string; // New Prop
    onBack: () => void;
}

export const FinalReport = ({ topic, goal, audience, finalContent, variableChart, surveyContent, onBack }: FinalReportProps) => {
    const [includeChart, setIncludeChart] = useState(true);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-serif print:bg-white print:py-0">
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl min-h-[297mm] flex flex-col relative print:shadow-none">

                {/* Toolbar - Sticky Top (Screen only) */}
                <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur text-white p-3 flex justify-between items-center print:hidden rounded-t-xl mx-4 mt-4 mb-0 shadow-lg">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition-colors shadow">
                            <Printer size={14} /> Xuất PDF (A4)
                        </button>
                    </div>
                </div>

                {/* PAPER A4 CONTAINER */}
                <div className="p-[25mm] text-justify leading-relaxed text-black">

                    {/* 1. TITLE PAGE HEADER */}
                    <div className="text-center mb-12">
                        <h1 className="text-2xl font-bold uppercase mb-4 font-serif leading-tight">
                            {topic}
                        </h1>
                        <div className="text-lg font-serif mb-6 italic">
                            {goal}
                        </div>
                        <div className="text-base font-serif">
                            <strong>Tác giả:</strong> Nhà Nghiên Cứu AI & Cộng Sự<br />
                            <strong>Ngày:</strong> {new Date().toLocaleDateString('vi-VN')}
                        </div>
                    </div>

                    {/* 2. MAIN CONTENT (Introduction, Lit Review, etc.) */}
                    <div className="prose prose-slate max-w-none font-serif prose-headings:font-bold prose-headings:font-serif prose-headings:uppercase prose-headings:text-base prose-p:indent-8 prose-p:text-justify prose-p:leading-7 text-black">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {finalContent}
                        </ReactMarkdown>
                    </div>

                    {/* 3. FIGURES (SEM Model) - "Kéo xuống mô hình xịn" */}
                    {variableChart && includeChart && (
                        <div className="mt-12 break-inside-avoid">
                            <h3 className="text-center font-bold uppercase mb-6 text-sm">Mô Hình Nghiên Cứu Đề Xuất (SEM)</h3>

                            <div className="border border-slate-300 p-6 rounded-lg bg-white shadow-sm flex justify-center">
                                <MermaidChart chart={variableChart} />
                            </div>
                            <p className="text-center text-sm italic mt-3">
                                <strong>Hình 1.</strong> Mô hình cấu trúc tuyến tính (SEM) đề xuất cho nghiên cứu.
                            </p>
                        </div>
                    )}

                    {/* 4. APPENDIX (Survey) */}
                    {surveyContent && (
                        <div className="mt-12 pt-8 border-t border-black/20 break-before-page">
                            <h3 className="text-center font-bold uppercase mb-6 text-lg">Phụ Lục: Thang Đo & Câu Hỏi Khảo Sát</h3>
                            <div className="prose prose-slate max-w-none font-serif prose-table:border-collapse prose-table:border prose-table:border-black prose-th:border prose-th:border-black prose-th:p-2 prose-td:border prose-td:border-black prose-td:p-2 text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {surveyContent}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Footer Paging (Print) */}
                    <div className="fixed bottom-4 left-0 w-full text-center text-[10px] text-slate-400 print:block hidden">
                        Generated by Hai Debate AI System
                    </div>
                </div>
            </div>
        </div>
    );
};
