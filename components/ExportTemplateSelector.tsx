"use client";

import React from 'react';
import { FileText, Layout, Type, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExportTemplate = 'academic' | 'business' | 'creative' | 'minimal';

interface ExportTemplateSelectorProps {
    selectedTemplate: ExportTemplate;
    onTemplateSelect: (template: ExportTemplate) => void;
}

const templates = [
    {
        id: 'academic',
        name: 'Hàn lâm (Academic)',
        description: 'Chuẩn mực, nghiêm túc. Phù hợp cho bài báo, luận văn.',
        icon: <FileText className="w-5 h-5" />,
        color: 'border-blue-500 bg-blue-50 text-blue-700',
    },
    {
        id: 'business',
        name: 'Kinh doanh (Business)',
        description: 'Chuyên nghiệp, hiện đại. Phù hợp cho Pitch Deck, GTM.',
        icon: <Layout className="w-5 h-5" />,
        color: 'border-indigo-500 bg-indigo-50 text-indigo-700',
    },
    {
        id: 'creative',
        name: 'Sáng tạo (Creative)',
        description: 'Vibrant, năng động. Phù hợp cho Marketing, Startup.',
        icon: <Palette className="w-5 h-5" />,
        color: 'border-pink-500 bg-pink-50 text-pink-700',
    },
    {
        id: 'minimal',
        name: 'Tối giản (Minimal)',
        description: 'Sạch sẽ, tinh tế. Tập trung vào nội dung.',
        icon: <Type className="w-5 h-5" />,
        color: 'border-gray-500 bg-gray-50 text-gray-700',
    }
];

export function ExportTemplateSelector({ selectedTemplate, onTemplateSelect }: ExportTemplateSelectorProps) {
    return (
        <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Chọn mẫu trình bày (Template)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onTemplateSelect(template.id as ExportTemplate)}
                        className={cn(
                            "flex flex-col items-start p-4 border-2 rounded-xl transition-all text-left",
                            selectedTemplate === template.id
                                ? template.color + " ring-2 ring-offset-1 ring-current"
                                : "border-gray-100 hover:border-gray-200 bg-white"
                        )}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                "p-2 rounded-lg",
                                selectedTemplate === template.id ? "bg-white/50" : "bg-gray-100"
                            )}>
                                {template.icon}
                            </div>
                            <span className="font-bold">{template.name}</span>
                        </div>
                        <p className="text-xs opacity-80 leading-relaxed font-medium">
                            {template.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
