import React, { useState } from 'react';
import { Download, CheckCircle, FileText, ArrowLeft, Printer, Eye, EyeOff } from 'lucide-react';
import { MermaidChart } from './MermaidChart';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateDocx } from '../lib/docxGenerator';

interface FinalReportProps {
    topic: string;
    goal: string;
    audience: string;
    level: string;
    finalContent?: string; // Optional legacy prop
    modelContent?: string;
    outlineContent?: string;
    surveyContent?: string;
    variableChart?: string;
    onBack: () => void;
}

export const FinalReport = ({ topic, goal, audience, level, finalContent, modelContent, variableChart, surveyContent, outlineContent, onBack }: FinalReportProps) => {
    const [includeChart, setIncludeChart] = useState(true);
    const [showOutlineModal, setShowOutlineModal] = useState(false);

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
                        <button
                            onClick={() => setShowOutlineModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-bold transition-colors shadow"
                        >
                            <FileText size={14} /> Xem Đề Cương Chi Tiết
                        </button>
                        <button
                            onClick={() => generateDocx({
                                topic,
                                level,
                                modelContent: finalContent,
                                outlineContent: outlineContent,
                                surveyContent: surveyContent
                            })}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 rounded-lg text-xs font-bold transition-colors shadow"
                        >
                            <FileText size={14} /> Tải DOCX (APA)
                        </button>
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
                        {/* Section 1: Model & Theory */}
                        {modelContent && (
                            <div className="mb-12">
                                <h2 className="text-xl font-bold uppercase mb-4">I. Cơ Sở Lý Thuyết & Mô Hình</h2>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {modelContent}
                                </ReactMarkdown>
                            </div>
                        )}

                        {/* Section 2: Outline */}
                        {outlineContent && (
                            <div className="mb-12">
                                <h2 className="text-xl font-bold uppercase mb-4">II. Đề Cương Chi Tiết</h2>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {outlineContent}
                                </ReactMarkdown>
                            </div>
                        )}

                        {/* Fallback for legacy Final Content if strictly needed */}
                        {finalContent && !modelContent && !outlineContent && (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {finalContent}
                            </ReactMarkdown>
                        )}
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

            {/* Outline Modal */}
            {showOutlineModal && outlineContent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <FileText size={28} />
                                    Đề Cương Chi Tiết
                                </h2>
                                <p className="text-green-100 text-sm mt-1">Kết quả giai đoạn 3 - Outline</p>
                            </div>
                            <button
                                onClick={() => setShowOutlineModal(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <Eye size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
                            <div className="prose prose-slate max-w-none prose-headings:text-green-700 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {outlineContent}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-100 p-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(outlineContent);
                                    alert('Đã copy đề cương vào clipboard!');
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                                📋 Copy Nội Dung
                            </button>
                            <button
                                onClick={() => setShowOutlineModal(false)}
                                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
