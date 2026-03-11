import React from 'react';
import { MermaidChart } from '@/components/MermaidChart';

export const markdownComponents = {
    code({node, inline, className, children, ...props}: any) {
        const match = /language-(\w+)/.exec(className || '');
        if (!inline && match && match[1] === 'mermaid') {
            return (
                <div className="my-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                        📊 Sơ đồ minh họa (AI đề xuất):
                    </div>
                    <MermaidChart chart={String(children).replace(/\n$/, '')} />
                </div>
            );
        }
        return <code className={className} {...props}>{children}</code>;
    }
};
