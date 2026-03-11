"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { WorkflowStep, AcademicLevel } from '@/lib/agents';
import { CheckCircle, Copy, X, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MermaidChart } from './MermaidChart';
import { CitationChecker } from './CitationChecker';
import { extractDOIs } from '@/lib/citationUtils';
import { validateOutline, getValidationMessage } from '@/lib/outlineValidator';
import type { DOIVerificationResult } from '@/lib/doiVerifier';

interface ReplacementAction {
    fakeDOI: string;
    action: 'replace' | 'remove';
    replacement?: DOIVerificationResult;
}

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
            case '1_TOPIC': return 'Buoc 1: Tham Dinh Y Tuong';
            case '2_MODEL': return 'Buoc 2: Lean Canvas';
            case '3_OUTLINE': return 'Buoc 3: Pitch Deck + Financial Plan';
            case '5_GTM': return 'Buoc 4: Chien Luoc Ra Mat (GTM)';
            case '4_SURVEY': return 'Buoc 5: Customer Discovery';
            default: return 'Buoc khong xac dinh';
        }
    }
    switch (step) {
        case '1_TOPIC': return 'Buoc 1: TOPIC (Tham dinh de tai)';
        case '1_LIT_REVIEW': return 'Buoc 2: LIT REVIEW (Tong quan tai lieu)';
        case '2_MODEL': return 'Buoc 3: MODEL (Xay dung mo hinh)';
        case '2_ARCH': return 'Buoc 3: ARCHITECTURE (Kien truc he thong)';
        case '3_OUTLINE': return 'Buoc 4: OUTLINE (Hoan thien de cuong)';
        case '4_SURVEY': return 'Buoc 5: METHODOLOGY (Phuong phap nghien cuu)';
        case '4_BENCHMARK': return 'Buoc 5: BENCHMARK (Kiem thu he thong)';
        case '5_GTM': return 'Buoc 4: GTM (Ke hoach trien khai)';
        default: return 'Buoc khong xac dinh';
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
    const [replacementActions, setReplacementActions] = useState<ReplacementAction[]>([]);
    const [replacementsApplied, setReplacementsApplied] = useState(false);

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

    const handleReplacementsReady = useCallback((actions: ReplacementAction[]) => {
        setReplacementActions(actions);
        setReplacementsApplied(false);
    }, []);

    const handleApplyReplacements = () => {
        let updatedContent = userFinal;

        for (const action of replacementActions) {
            if (action.action === 'replace' && action.replacement) {
                // Replace fake DOI with real DOI
                updatedContent = updatedContent.replaceAll(action.fakeDOI, action.replacement.doi);
            } else if (action.action === 'remove') {
                // Remove the fake DOI (replace with empty or a marker)
                // Find the DOI and remove it along with surrounding formatting
                updatedContent = updatedContent.replaceAll(action.fakeDOI, '[DOI DA XOA]');
            }
        }

        setUserFinal(updatedContent);
        setReplacementsApplied(true);
    };

    const handleFinalize = () => {
        const sanitized = sanitizeInput(userFinal);

        if (!sanitized) {
            alert('Vui long nhap noi dung truoc khi xac nhan!');
            return;
        }

        if (sanitized.length < 10) {
            alert('Noi dung qua ngan. Vui long nhap it nhat 10 ky tu.');
            return;
        }

        // Extract DOIs from content
        const extractedDOIs = extractDOIs(aiOutput);

        // Check if verification is required but not done
        if (extractedDOIs.length > 0 && verificationResults.length === 0) {
            alert(
                'CANH BAO: Phat hien DOI trong noi dung!\n\n' +
                `Tim thay ${extractedDOIs.length} DOI chua duoc verify.\n\n` +
                'Vui long click "Verify Citations" de kiem tra truoc khi xac nhan.\n' +
                'Dieu nay dam bao khong co DOI gia trong noi dung.'
            );
            return;
        }

        // Check for fake DOIs
        const fakeDOIs = verificationResults.filter(r => !r.valid);
        if (fakeDOIs.length > 0) {
            // Check if all fakes have been handled
            const unresolvedFakes = fakeDOIs.filter(
                f => !replacementActions.find(a => a.fakeDOI === f.doi)
            );

            if (unresolvedFakes.length > 0) {
                alert(
                    `Con ${unresolvedFakes.length} DOI gia chua duoc xu ly!\n\n` +
                    `Cac DOI sau can duoc thay the hoac xoa:\n${unresolvedFakes.map(r => `- ${r.doi}`).join('\n')}\n\n` +
                    `Dung "Tim thay the" hoac "Xoa DOI" o muc Kiem tra trich dan.`
                );
                return;
            }

            // All fakes handled but not yet applied
            if (!replacementsApplied) {
                alert(
                    'Ban da chon cach xu ly cho tat ca DOI gia.\n\n' +
                    'Vui long click "Ap dung thay doi" de cap nhat noi dung truoc khi xac nhan.'
                );
                return;
            }
        }

        // Confirmation dialog
        const confirmed = window.confirm(
            'Ban co chac chan muon xac nhan?\n\n' +
            'Sau khi xac nhan, ban khong the quay lai sua buoc nay.\n\n' +
            'Hay dam bao noi dung da duoc GVHD phe duyet.'
        );

        if (!confirmed) return;

        const sanitizedNote = note ? sanitizeInput(note) : undefined;
        onFinalize(sanitized, sanitizedNote);
    };

    const fakeDOIs = verificationResults.filter(r => !r.valid);
    const unresolvedFakes = fakeDOIs.filter(
        f => !replacementActions.find(a => a.fakeDOI === f.doi)
    );
    const hasUnappliedChanges = replacementActions.length > 0 && !replacementsApplied;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-green-800 dark:text-green-300">
                                Hoan thanh {getStepName(step, projectType)}
                            </h2>
                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                Vui long xem xet ket qua va nhap phien ban cuoi cung sau khi tham khao GVHD
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Quay lai"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* AI Output (Read-only) */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        KET QUA TU DONG (AI):
                    </label>
                    <button
                        onClick={handleCopy}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${copied
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-700'
                            }`}
                    >
                        <Copy size={14} />
                        {copied ? 'Da copy!' : 'Copy de gui GVHD'}
                    </button>
                </div>

                <div className="bg-muted border-2 border-border rounded-xl p-6 max-h-96 overflow-y-auto shadow-inner">
                    <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground dark:prose-invert">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
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
                            }}
                        >
                            {aiOutput}
                        </ReactMarkdown>
                    </div>

                    {mermaidCode && (
                        <div className="mt-6 p-4 bg-card rounded-lg border border-border">
                            <div className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wide">
                                So do minh hoa:
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
                onReplacementsReady={handleReplacementsReady}
            />

            {/* Apply Replacements Button */}
            {hasUnappliedChanges && unresolvedFakes.length === 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/15 border-2 border-amber-400 dark:border-amber-600 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <ArrowRightLeft className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={24} />
                            <div>
                                <p className="font-bold text-amber-800 dark:text-amber-300">
                                    {replacementActions.length} DOI san sang thay doi
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                    {replacementActions.filter(a => a.action === 'replace').length} thay the,
                                    {' '}{replacementActions.filter(a => a.action === 'remove').length} xoa
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleApplyReplacements}
                            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Ap dung thay doi
                        </button>
                    </div>
                </div>
            )}

            {/* Replacements Applied Confirmation */}
            {replacementsApplied && (
                <div className="bg-green-50 dark:bg-green-900/15 border border-green-300 dark:border-green-700 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Da ap dung {replacementActions.length} thay doi vao noi dung ben duoi. Vui long kiem tra lai truoc khi xac nhan.
                    </p>
                </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Chinh sua theo y kien GVHD
                </span>
                <div className="h-px bg-border flex-1"></div>
            </div>

            {/* User Final Input */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    PHIEN BAN CUOI CUNG (Sau khi GVHD duyet):
                </label>
                <textarea
                    value={userFinal}
                    onChange={(e) => setUserFinal(e.target.value)}
                    className="w-full h-80 px-4 py-3 border-2 border-amber-300 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm bg-amber-50/30 dark:bg-amber-900/10 text-foreground placeholder:text-muted-foreground shadow-sm"
                    placeholder="Paste ket qua da duoc GVHD phe duyet vao day..."
                />

                {/* Optional: Note */}
                <div className="mt-3">
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">
                        Ghi chu (tuy chon):
                    </label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-card text-foreground"
                        placeholder="VD: GVHD yeu cau them tu 'cong bo' vao de tai"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 border-2 border-border text-foreground rounded-xl hover:bg-muted font-medium transition-all"
                >
                    ← Quay lai chinh sua
                </button>
                <button
                    onClick={handleFinalize}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all transform hover:-translate-y-0.5"
                >
                    <CheckCircle size={20} />
                    Xac nhan & Chuyen sang buoc tiep theo
                </button>
            </div>

            {/* Warning */}
            <div className="bg-orange-50 dark:bg-orange-900/15 border-l-4 border-orange-400 rounded-lg p-4 text-sm text-orange-800 dark:text-orange-300">
                <div className="flex gap-2">
                    <span className="text-orange-500 font-bold">!</span>
                    <div>
                        <strong>Luu y quan trong:</strong>
                        <ul className="list-disc ml-5 mt-1 space-y-1 text-orange-700 dark:text-orange-400">
                            <li>Buoc tiep theo se su dung noi dung ban nhap o day lam co so</li>
                            <li>Sau khi xac nhan, ban khong the quay lai sua (tru khi reset toan bo)</li>
                            <li>Hay dam bao noi dung da duoc GVHD phe duyet truoc khi tiep tuc</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
