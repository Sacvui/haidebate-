"use client";

import React, { useState, useEffect } from 'react';
import { WorkflowStep, AcademicLevel } from '@/lib/agents';
import { CheckCircle, Copy, X, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MermaidChart } from './MermaidChart';
import { CitationChecker } from './CitationChecker';
import { extractDOIs } from '@/lib/citationUtils';
import { validateOutline, getValidationMessage } from '@/lib/outlineValidator';
import type { DOIVerificationResult } from '@/lib/doiVerifier';

interface StepReviewProps {
    step: WorkflowStep;
    aiOutput: string;
    mermaidCode?: string;
    onFinalize: (userFinal: string, note?: string) => void;
    onCancel: () => void;
    level?: AcademicLevel;
    projectType?: string;
}

const getStepName = (step: WorkflowStep, projectType?: string): string => {
    if (projectType === 'STARTUP') {
        switch (step) {
            case '1_TOPIC': return 'Bước 1: Thẩm Định Ý Tưởng';
            case '2_MODEL': return 'Bước 2: Lean Canvas';
            case '3_OUTLINE': return 'Bước 3: Pitch Deck + Financial Plan';
            case '5_GTM': return 'Bước 4: Chiến Lược Ra Mắt (GTM)';
            case '4_SURVEY': return 'Bước 5: Customer Discovery';
            default: return 'Bước không xác định';
        }
    }
    switch (step) {
        case '1_TOPIC': return 'Bước 1: TOPIC (Thẩm định đề tài)';
        case '1_LIT_REVIEW': return 'Bước 2: LIT REVIEW (Tổng quan tài liệu)';
        case '2_MODEL': return 'Bước 3: MODEL (Xây dựng mô hình)';
        case '2_ARCH': return 'Bước 3: ARCHITECTURE (Kiến trúc hệ thống)';
        case '3_OUTLINE': return 'Bước 4: OUTLINE (Hoàn thiện đề cương)';
        case '4_SURVEY': return 'Bước 5: METHODOLOGY (Phương pháp nghiên cứu)';
        case '4_BENCHMARK': return 'Bước 5: BENCHMARK (Kiểm thử hệ thống)';
        case '5_GTM': return 'Bước 4: GTM (Kế hoạch triển khai)';
        default: return 'Bước không xác định';
    }
};

export function StepReview({
    step,
    aiOutput,
    mermaidCode,
    onFinalize,
    onCancel,
    projectType
}: StepReviewProps) {
    const [userFinal, setUserFinal] = useState(aiOutput);
    const [note, setNote] = useState("");
    const [copied, setCopied] = useState(false);
    const [verificationResults, setVerificationResults] = useState<DOIVerificationResult[]>([]);

    const handleCopy = () => {
        navigator.clipboard.writeText(aiOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Sanitize input to prevent XSS
    const sanitizeInput = (input: string): string => {
        return input
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
            .trim();
    };

    const handleFinalize = () => {
        const sanitized = sanitizeInput(userFinal);

        if (!sanitized) {
            alert('Vui lòng nhập nội dung trước khi xác nhận!');
            return;
        }

        if (sanitized.length < 10) {
            alert('Nội dung quá ngắn. Vui lòng nhập ít nhất 10 ký tự.');
            return;
        }

        // Extract DOIs from content
        const extractedDOIs = extractDOIs(aiOutput);

        // Check if verification is required but not done
        if (extractedDOIs.length > 0 && verificationResults.length === 0) {
            alert(
                'CẢNH BÁO: Phát hiện DOI trong nội dung!\n\n' +
                `Tìm thấy ${extractedDOIs.length} DOI chưa được verify.\n\n` +
                'Vui lòng click "Verify Citations" để kiểm tra trước khi xác nhận.\n' +
                'Điều này đảm bảo không có DOI giả trong nội dung.'
            );
            return;
        }

        // Check for fake DOIs
        const hasFakeDOIs = verificationResults.some(r => !r.valid);
        if (hasFakeDOIs) {
            const fakeDOIs = verificationResults.filter(r => !r.valid);
            alert(
                `CẢNH BÁO: Phát hiện ${fakeDOIs.length} DOI giả!\n\n` +
                `Các DOI sau không hợp lệ:\n${fakeDOIs.map(r => `- ${r.doi}`).join('\n')}\n\n` +
                `Vui lòng xóa hoặc sửa lại các DOI này trước khi tiếp tục.\n` +
                `DOI giả vi phạm đạo đức nghiên cứu!`
            );
            return;
        }

        // Confirmation dialog
        const confirmed = window.confirm(
            'Bạn có chắc chắn muốn xác nhận?\n\n' +
            'Sau khi xác nhận, bạn không thể quay lại sửa bước này.\n\n' +
            'Hãy đảm bảo nội dung đã được GVHD phê duyệt.'
        );

        if (!confirmed) return;

        const sanitizedNote = note ? sanitizeInput(note) : undefined;
        onFinalize(sanitized, sanitizedNote);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-green-800">
                                Hoàn thành {getStepName(step, projectType)}
                            </h2>
                            <p className="text-sm text-green-700 mt-1">
                                Vui lòng xem xét kết quả và nhập phiên bản cuối cùng sau khi tham khảo GVHD
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Quay lại"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* AI Output (Read-only) */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        KẾT QUẢ TỰ ĐỘNG (AI):
                    </label>
                    <button
                        onClick={handleCopy}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${copied
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                            }`}
                    >
                        <Copy size={14} />
                        {copied ? 'Đã copy!' : 'Copy để gửi GVHD'}
                    </button>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6 max-h-96 overflow-y-auto shadow-inner">
                    <div className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {aiOutput}
                        </ReactMarkdown>
                    </div>

                    {mermaidCode && (
                        <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
                            <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">
                                📊 Sơ đồ minh họa:
                            </div>
                            <MermaidChart chart={mermaidCode} />
                        </div>
                    )}
                </div>
            </div>

            {/* Citation Checker */}
            <CitationChecker
                content={aiOutput}
                onVerificationComplete={setVerificationResults}
            />

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
                <div className="h-px bg-slate-300 flex-1"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Chỉnh sửa theo ý kiến GVHD
                </span>
                <div className="h-px bg-slate-300 flex-1"></div>
            </div>

            {/* User Final Input */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    PHIÊN BẢN CUỐI CÙNG (Sau khi GVHD duyệt):
                </label>
                <textarea
                    value={userFinal}
                    onChange={(e) => setUserFinal(e.target.value)}
                    className="w-full h-80 px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm bg-amber-50/30 text-slate-800 placeholder:text-slate-400 shadow-sm"
                    placeholder="Paste kết quả đã được GVHD phê duyệt vào đây..."
                />

                {/* Optional: Note */}
                <div className="mt-3">
                    <label className="text-xs text-slate-500 font-medium mb-1 block">
                        📝 Ghi chú (tùy chọn):
                    </label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: GVHD yêu cầu thêm từ 'công bố' vào đề tài"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-all"
                >
                    ← Quay lại chỉnh sửa
                </button>
                <button
                    onClick={handleFinalize}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all transform hover:-translate-y-0.5"
                >
                    <CheckCircle size={20} />
                    Xác nhận & Chuyển sang bước tiếp theo
                </button>
            </div>

            {/* Warning */}
            <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4 text-sm text-orange-800">
                <div className="flex gap-2">
                    <span className="text-orange-500 font-bold">!</span>
                    <div>
                        <strong>Lưu ý quan trọng:</strong>
                        <ul className="list-disc ml-5 mt-1 space-y-1 text-orange-700">
                            <li>Bước tiếp theo sẽ sử dụng nội dung bạn nhập ở đây làm cơ sở</li>
                            <li>Sau khi xác nhận, bạn không thể quay lại sửa (trừ khi reset toàn bộ)</li>
                            <li>Hãy đảm bảo nội dung đã được GVHD phê duyệt trước khi tiếp tục</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
