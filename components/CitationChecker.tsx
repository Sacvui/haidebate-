"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Loader2, Search, RefreshCw, Trash2, ArrowRightLeft } from 'lucide-react';
import { extractDOIs } from '@/lib/citationUtils';
import { verifyAllDOIs, verifyByQuery, searchReplacements, getVerificationSummary, type DOIVerificationResult } from '@/lib/doiVerifier';
import { toast } from 'sonner';

interface ReplacementAction {
    fakeDOI: string;
    action: 'replace' | 'remove';
    replacement?: DOIVerificationResult;
}

interface CitationCheckerProps {
    content: string;
    onVerificationComplete?: (results: DOIVerificationResult[]) => void;
    onReplacementsReady?: (actions: ReplacementAction[]) => void;
}

export function CitationChecker({ content, onVerificationComplete, onReplacementsReady }: CitationCheckerProps) {
    const [dois, setDois] = useState<string[]>([]);
    const [verifying, setVerifying] = useState(false);
    const [results, setResults] = useState<DOIVerificationResult[]>([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [manualQuery, setManualQuery] = useState("");
    const [manualVerifying, setManualVerifying] = useState(false);

    // Replacement state
    const [searchingFor, setSearchingFor] = useState<string | null>(null);
    const [candidates, setCandidates] = useState<Record<string, DOIVerificationResult[]>>({});
    const [actions, setActions] = useState<ReplacementAction[]>([]);

    useEffect(() => {
        const extracted = extractDOIs(content);
        setDois(extracted);
        setResults([]);
        setActions([]);
        setCandidates({});
    }, [content]);

    // Notify parent when actions change  
    useEffect(() => {
        onReplacementsReady?.(actions);
    }, [actions, onReplacementsReady]);

    const handleVerify = async () => {
        if (dois.length === 0) return;

        setVerifying(true);
        setProgress({ current: 0, total: dois.length });
        setActions([]);
        setCandidates({});

        try {
            const verified = await verifyAllDOIs(dois, (current, total) => {
                setProgress({ current, total });
            });

            setResults(verified);
            onVerificationComplete?.(verified);
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Loi khi verify citations. Vui long thu lai.');
        } finally {
            setVerifying(false);
        }
    };

    const handleManualSearch = async () => {
        if (!manualQuery.trim()) return;

        setManualVerifying(true);
        try {
            const result = await verifyByQuery(manualQuery.trim());
            setResults(prev => [result, ...prev]);
            setManualQuery("");
        } catch (error) {
            toast.error('Loi khi tim kiem. Vui long thu lai.');
        } finally {
            setManualVerifying(false);
        }
    };

    const handleSearchReplacements = async (fakeDOI: string) => {
        setSearchingFor(fakeDOI);
        try {
            // Try to extract context around the DOI from the content
            const doiIndex = content.indexOf(fakeDOI);
            let searchQuery = '';

            if (doiIndex >= 0) {
                // Get surrounding text (300 chars before the DOI for context)
                const start = Math.max(0, doiIndex - 300);
                const contextBefore = content.substring(start, doiIndex);

                // Extract the sentence or paragraph containing the DOI
                const sentences = contextBefore.split(/[.!?\n]/);
                const lastSentence = sentences[sentences.length - 1]?.trim();

                if (lastSentence && lastSentence.length > 20) {
                    // Use keywords from the sentence
                    searchQuery = lastSentence
                        .replace(/\([^)]*\)/g, '') // Remove parenthetical citations
                        .replace(/10\.\d{4,9}\/[^\s]+/g, '') // Remove DOIs
                        .replace(/[^\w\sÀ-ỹ]/g, ' ') // Keep only words
                        .trim()
                        .split(/\s+/)
                        .slice(0, 8) // First 8 words
                        .join(' ');
                }
            }

            // Fallback: use the DOI itself as search
            if (!searchQuery) {
                searchQuery = fakeDOI;
            }

            const results = await searchReplacements(searchQuery, 3);
            setCandidates(prev => ({ ...prev, [fakeDOI]: results }));

            if (results.length === 0) {
                toast('Khong tim thay bai bao thay the. Thu tim thu cong.');
            }
        } catch (error) {
            toast.error('Loi khi tim bai bao thay the.');
        } finally {
            setSearchingFor(null);
        }
    };

    const handleSelectReplacement = (fakeDOI: string, replacement: DOIVerificationResult) => {
        setActions(prev => {
            const filtered = prev.filter(a => a.fakeDOI !== fakeDOI);
            return [...filtered, { fakeDOI, action: 'replace', replacement }];
        });
        toast.success(`Da chon thay the: ${replacement.doi}`);
    };

    const handleRemoveDOI = (fakeDOI: string) => {
        setActions(prev => {
            const filtered = prev.filter(a => a.fakeDOI !== fakeDOI);
            return [...filtered, { fakeDOI, action: 'remove' }];
        });
        toast.success('DOI se bi xoa khi ap dung.');
    };

    const handleUndoAction = (fakeDOI: string) => {
        setActions(prev => prev.filter(a => a.fakeDOI !== fakeDOI));
    };

    const getActionForDOI = (doi: string) => actions.find(a => a.fakeDOI === doi);

    const summary = results.length > 0 ? getVerificationSummary(results) : null;
    const hasFakeDOIs = summary && summary.invalid > 0;
    const fakeDOIs = results.filter(r => !r.valid);
    const unresolvedFakes = fakeDOIs.filter(f => !getActionForDOI(f.doi));

    return (
        <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        Kiem tra trich dan
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Verify DOI qua CrossRef database
                    </p>
                </div>
                <button
                    onClick={handleVerify}
                    disabled={verifying || dois.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                    {verifying ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            Dang verify {progress.current}/{progress.total}...
                        </>
                    ) : (
                        'Verify Citations'
                    )}
                </button>
            </div>

            {/* Manual Search Input */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        value={manualQuery}
                        onChange={(e) => setManualQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                        placeholder="Tim bai bao theo tieu de hoac tac gia..."
                        className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-foreground"
                    />
                </div>
                <button
                    onClick={handleManualSearch}
                    disabled={manualVerifying || !manualQuery.trim()}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-border disabled:opacity-50 text-sm font-bold transition-all"
                >
                    {manualVerifying ? <Loader2 className="animate-spin" size={16} /> : 'Tim Paper'}
                </button>
            </div>

            {dois.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Khong tim thay DOI nao trong noi dung</p>
                    <p className="text-xs mt-1">DOI co format: 10.xxxx/xxxxx</p>
                </div>
            )}

            {dois.length > 0 && results.length === 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Tim thay {dois.length} DOI.</strong> Click "Verify Citations" de kiem tra.
                    </p>
                </div>
            )}

            {summary && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg text-center">
                            <CheckCircle className="text-green-600 dark:text-green-400 mx-auto mb-1" size={24} />
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.valid}</div>
                            <div className="text-xs text-green-600 dark:text-green-400">Verified</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-center">
                            <XCircle className="text-red-600 dark:text-red-400 mx-auto mb-1" size={24} />
                            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.invalid}</div>
                            <div className="text-xs text-red-600 dark:text-red-400">Fake DOI</div>
                        </div>
                        <div className="bg-muted border border-border p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-foreground">{summary.total}</div>
                            <div className="text-xs text-muted-foreground">Total DOIs</div>
                        </div>
                    </div>

                    {/* Action Summary for fake DOIs */}
                    {hasFakeDOIs && (
                        <div className={`border-l-4 p-4 rounded-lg ${
                            unresolvedFakes.length === 0
                                ? 'bg-green-50 dark:bg-green-900/15 border-green-500'
                                : 'bg-red-50 dark:bg-red-900/15 border-red-500'
                        }`}>
                            <div className="flex gap-2 items-start">
                                {unresolvedFakes.length === 0 ? (
                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                ) : (
                                    <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                )}
                                <div>
                                    {unresolvedFakes.length === 0 ? (
                                        <>
                                            <strong className="text-green-800 dark:text-green-300">
                                                Tat ca {fakeDOIs.length} DOI gia da duoc xu ly!
                                            </strong>
                                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                                Ban co the xac nhan de ap dung cac thay doi vao noi dung.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <strong className="text-red-800 dark:text-red-300">
                                                Phat hien {summary.invalid} DOI gia — con {unresolvedFakes.length} DOI chua xu ly
                                            </strong>
                                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                                Dung "Tim thay the" de tim paper that, hoac "Xoa DOI" de go bo.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed Results */}
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {results.map((result, idx) => {
                            const action = getActionForDOI(result.doi);
                            const doiCandidates = candidates[result.doi] || [];
                            const isSearching = searchingFor === result.doi;

                            return (
                                <div key={idx} className={`rounded-lg border-l-4 overflow-hidden ${
                                    result.valid
                                        ? 'bg-green-50 dark:bg-green-900/10 border-green-500'
                                        : action
                                            ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500'
                                            : 'bg-red-50 dark:bg-red-900/10 border-red-500'
                                }`}>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {result.valid ? (
                                                        <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                                                    ) : action ? (
                                                        <ArrowRightLeft className="text-amber-600 flex-shrink-0" size={18} />
                                                    ) : (
                                                        <XCircle className="text-red-600 flex-shrink-0" size={18} />
                                                    )}
                                                    <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
                                                        {result.doi}
                                                    </code>
                                                </div>

                                                {result.valid ? (
                                                    <>
                                                        <div className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
                                                            {result.title}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {result.authors && result.authors.length > 0 ? (
                                                                <span>{result.authors.slice(0, 3).join(', ')}
                                                                    {result.authors.length > 3 && ` et al.`}
                                                                </span>
                                                            ) : (
                                                                <span className="opacity-50">No authors</span>
                                                            )}
                                                            {result.year && ` (${result.year})`}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {result.journal}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-red-700 dark:text-red-400 font-semibold text-sm">
                                                        FAKE DOI — {result.error}
                                                    </div>
                                                )}

                                                {/* Action badge */}
                                                {action && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        {action.action === 'replace' ? (
                                                            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-800/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-lg font-medium">
                                                                <ArrowRightLeft size={12} />
                                                                Se thay the bang: {action.replacement?.doi}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-xs bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-lg font-medium">
                                                                <Trash2 size={12} />
                                                                Se bi xoa
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleUndoAction(result.doi)}
                                                            className="text-xs text-muted-foreground hover:text-foreground underline"
                                                        >
                                                            Hoan tac
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions for valid DOIs */}
                                            {result.valid && result.url && (
                                                <a
                                                    href={result.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                                                    title="Mo DOI"
                                                >
                                                    <ExternalLink size={18} />
                                                </a>
                                            )}

                                            {/* Actions for fake DOIs */}
                                            {!result.valid && !action && (
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleSearchReplacements(result.doi)}
                                                        disabled={isSearching}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {isSearching ? (
                                                            <Loader2 className="animate-spin" size={12} />
                                                        ) : (
                                                            <RefreshCw size={12} />
                                                        )}
                                                        Tim thay the
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveDOI(result.doi)}
                                                        className="px-3 py-1.5 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800/50 flex items-center gap-1"
                                                    >
                                                        <Trash2 size={12} />
                                                        Xoa DOI
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Replacement Candidates */}
                                    {!result.valid && doiCandidates.length > 0 && !action && (
                                        <div className="border-t border-border bg-card/50 p-4 space-y-2">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                                Bai bao thay the (chon 1):
                                            </p>
                                            {doiCandidates.map((candidate, cIdx) => (
                                                <div
                                                    key={cIdx}
                                                    className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg hover:border-blue-400 transition-colors group"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-foreground line-clamp-2">
                                                            {candidate.title}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {candidate.authors?.slice(0, 3).join(', ')}
                                                            {(candidate.authors?.length || 0) > 3 && ' et al.'}
                                                            {candidate.year && ` (${candidate.year})`}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {candidate.journal}
                                                        </div>
                                                        <code className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-1 block">
                                                            {candidate.doi}
                                                        </code>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSelectReplacement(result.doi, candidate)}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Dung DOI nay
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
