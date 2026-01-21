"use client";

import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Table, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { AcademicLevel } from '@/lib/agents';
import {
    exportOutlineToWord,
    exportOutlineToPDF,
    exportSurveyToExcel,
    exportSurveyToCSV,
    downloadBlob
} from '@/lib/exportUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExportTemplateSelector, ExportTemplate } from './ExportTemplateSelector';

interface ExportManagerProps {
    topic: string;
    level: AcademicLevel;
    goal: string;
    modelContent?: string;
    outlineContent?: string;
    outlineChart?: string;
    gtmContent?: string;
    surveyContent?: string;
    onBack: () => void;
    onViewReport?: () => void;
}

type ExportType = 'word' | 'pdf' | 'excel' | 'csv';

export function ExportManager({
    topic,
    level,
    goal,
    modelContent = '',
    outlineContent = '',
    outlineChart = '',
    gtmContent = '',
    surveyContent = '',
    onBack,
    onViewReport
}: ExportManagerProps) {
    const [exporting, setExporting] = useState<ExportType | null>(null);
    const [exportedFiles, setExportedFiles] = useState<Set<ExportType>>(new Set());
    const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate>('academic');
    const [isMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        }
        return false;
    });

    const handleExport = async (type: ExportType) => {
        setExporting(type);

        try {
            let blob: Blob;
            let filename: string;

            switch (type) {
                case 'word':
                    await exportOutlineToWord(topic, outlineContent, modelContent, level, gtmContent, surveyContent, outlineChart, selectedTemplate);
                    return; // generateDocx handles download

                case 'pdf':
                    blob = await exportOutlineToPDF(topic, outlineContent, modelContent, level);
                    filename = `De_Cuong_${topic.substring(0, 30).replace(/\s+/g, '_')}.pdf`;
                    break;

                case 'excel':
                    blob = await exportSurveyToExcel(surveyContent, topic);
                    filename = `Survey_${topic.substring(0, 30).replace(/\s+/g, '_')}.xlsx`;
                    break;

                case 'csv':
                    blob = await exportSurveyToCSV(surveyContent, topic);
                    filename = `Survey_Microsoft_Forms_${topic.substring(0, 20).replace(/\s+/g, '_')}.csv`;
                    break;
            }

            downloadBlob(blob, filename);

            // Mark as exported
            setExportedFiles(prev => new Set(prev).add(type));

        } catch (error) {
            console.error(`Export ${type} failed:`, error);

            // Better error messages
            let errorMessage = 'Lỗi không xác định';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            // Show user-friendly error
            alert(`❌ Lỗi khi export ${type.toUpperCase()}:\n\n${errorMessage}\n\nVui lòng thử lại hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp diễn.`);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                            <Download size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-indigo-800">
                                ✅ Bước 5: Export Kết Quả
                            </h2>
                            <p className="text-sm text-indigo-700 mt-1">
                                Tải xuống đề cương và bảng khảo sát dưới nhiều định dạng
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-all"
                        >
                            <ArrowLeft size={18} />
                            Quay lại
                        </button>
                        {onViewReport && (
                            <button
                                onClick={onViewReport}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-medium"
                            >
                                <FileText size={18} />
                                Xem Báo Cáo Tổng Hợp
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Warning */}
            {isMobile && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 text-sm">
                    <div className="flex gap-2">
                        <span className="text-yellow-600 font-bold text-lg">⚠️</span>
                        <div>
                            <strong className="text-yellow-800">Lưu ý cho thiết bị di động:</strong>
                            <p className="text-yellow-700 mt-1">
                                Export trên mobile có thể không ổn định. Khuyến nghị sử dụng máy tính để có trải nghiệm tốt nhất.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selector */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <ExportTemplateSelector
                    selectedTemplate={selectedTemplate}
                    onTemplateSelect={setSelectedTemplate}
                />
            </div>

            {/* Export Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Word Export */}
                <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText size={28} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">
                                Đề cương Word (.docx)
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                File Word đầy đủ, có thể chỉnh sửa tiếp. Bao gồm mô hình và đề cương chi tiết.
                            </p>
                            <button
                                onClick={() => handleExport('word')}
                                disabled={exporting !== null}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exporting === 'word' ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : exportedFiles.has('word') ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Tải lại
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Tải xuống Word
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* PDF Export */}
                <div className="bg-white border-2 border-red-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText size={28} className="text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">
                                Đề cương PDF
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                File PDF để in ấn hoặc gửi email. Định dạng cố định, không chỉnh sửa được.
                            </p>
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={exporting !== null}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exporting === 'pdf' ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : exportedFiles.has('pdf') ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Tải lại
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Tải xuống PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Excel Export */}
                <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileSpreadsheet size={28} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">
                                Bảng khảo sát Excel (.xlsx)
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                File Excel với bảng thang đo đầy đủ. Có thể chỉnh sửa và phân tích dữ liệu.
                            </p>
                            <button
                                onClick={() => handleExport('excel')}
                                disabled={exporting !== null}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exporting === 'excel' ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : exportedFiles.has('excel') ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Tải lại
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Tải xuống Excel
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* CSV Export for Microsoft Forms */}
                <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                            <Table size={28} className="text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">
                                CSV cho Microsoft Forms
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">
                                File CSV định dạng đặc biệt để import trực tiếp vào Microsoft Forms.
                            </p>
                            <button
                                onClick={() => handleExport('csv')}
                                disabled={exporting !== null}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exporting === 'csv' ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : exportedFiles.has('csv') ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Tải lại
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Tải xuống CSV
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Outline Preview */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-blue-600" />
                        Preview: Đề cương
                    </h3>
                    <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto border border-slate-200">
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {outlineContent.substring(0, 1000) + '...'}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Survey Preview */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Table size={20} className="text-green-600" />
                        Preview: Bảng khảo sát
                    </h3>
                    <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto border border-slate-200">
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {surveyContent.substring(0, 1000) + '...'}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>

            {/* GTM Preview - Only for Startup */}
            {gtmContent && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle size={20} className="text-purple-600" />
                        Preview: Chiến lược Ra mắt (GTM Strategy)
                    </h3>
                    <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto border border-slate-200">
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {gtmContent.substring(0, 1000) + '...'}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 text-sm text-amber-800 mt-8">
                <div className="flex gap-2">
                    <span className="text-amber-500 font-bold">💡</span>
                    <div>
                        <strong>Hướng dẫn sử dụng:</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-amber-700">
                            <li><strong>Word/PDF</strong>: Dùng để nộp cho GVHD hoặc in ấn</li>
                            <li><strong>Excel</strong>: Dùng để phân tích dữ liệu sau khi thu thập</li>
                            <li><strong>CSV</strong>: Import vào Microsoft Forms để tạo form khảo sát online tự động</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
