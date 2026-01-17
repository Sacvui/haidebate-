import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { extractDOIs } from '@/lib/citationUtils';
import { verifyAllDOIs, getVerificationSummary, type DOIVerificationResult } from '@/lib/doiVerifier';

interface CitationCheckerProps {
    content: string;
    onVerificationComplete?: (results: DOIVerificationResult[]) => void;
}

export function CitationChecker({ content, onVerificationComplete }: CitationCheckerProps) {
    const [dois, setDois] = useState<string[]>([]);
    const [verifying, setVerifying] = useState(false);
    const [results, setResults] = useState<DOIVerificationResult[]>([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        const extracted = extractDOIs(content);
        setDois(extracted);
        setResults([]); // Reset results when content changes
    }, [content]);

    const handleVerify = async () => {
        if (dois.length === 0) return;

        setVerifying(true);
        setProgress({ current: 0, total: dois.length });

        try {
            const verified = await verifyAllDOIs(dois, (current, total) => {
                setProgress({ current, total });
            });

            setResults(verified);
            onVerificationComplete?.(verified);
        } catch (error) {
            console.error('Verification error:', error);
            alert('Lỗi khi verify citations. Vui lòng thử lại.');
        } finally {
            setVerifying(false);
        }
    };

    const summary = results.length > 0 ? getVerificationSummary(results) : null;
    const hasFakeDOIs = summary && summary.invalid > 0;

    return (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        📚 Kiểm tra trích dẫn
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
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
                            Đang verify {progress.current}/{progress.total}...
                        </>
                    ) : (
                        'Verify Citations'
                    )}
                </button>
            </div>

            {dois.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    <AlertTriangle size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Không tìm thấy DOI nào trong nội dung</p>
                    <p className="text-xs mt-1">DOI có format: 10.xxxx/xxxxx</p>
                </div>
            )}

            {dois.length > 0 && results.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Tìm thấy {dois.length} DOI.</strong> Click "Verify Citations" để kiểm tra.
                    </p>
                </div>
            )}

            {summary && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                            <CheckCircle className="text-green-600 mx-auto mb-1" size={24} />
                            <div className="text-2xl font-bold text-green-700">{summary.valid}</div>
                            <div className="text-xs text-green-600">Verified</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                            <XCircle className="text-red-600 mx-auto mb-1" size={24} />
                            <div className="text-2xl font-bold text-red-700">{summary.invalid}</div>
                            <div className="text-xs text-red-600">Fake DOI</div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-slate-700">{summary.total}</div>
                            <div className="text-xs text-slate-600">Total DOIs</div>
                        </div>
                    </div>

                    {/* Warning if fake DOIs found */}
                    {hasFakeDOIs && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <div className="flex gap-2">
                                <XCircle className="text-red-600 flex-shrink-0" size={20} />
                                <div>
                                    <strong className="text-red-800">⚠️ Phát hiện {summary.invalid} DOI giả!</strong>
                                    <p className="text-sm text-red-700 mt-1">
                                        Vui lòng xóa hoặc sửa lại các DOI không hợp lệ trước khi tiếp tục.
                                        DOI giả vi phạm đạo đức nghiên cứu và sẽ bị GVHD từ chối.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed Results */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {results.map((result, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-lg border-l-4 ${result.valid
                                        ? 'bg-green-50 border-green-500'
                                        : 'bg-red-50 border-red-500'
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            {result.valid ? (
                                                <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                                            ) : (
                                                <XCircle className="text-red-600 flex-shrink-0" size={18} />
                                            )}
                                            <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded font-mono">
                                                {result.doi}
                                            </code>
                                        </div>

                                        {result.valid ? (
                                            <>
                                                <div className="font-semibold text-sm text-slate-800 mb-1 line-clamp-2">
                                                    {result.title}
                                                </div>
                                                <div className="text-xs text-slate-600">
                                                    {result.authors && result.authors.length > 0 ? (
                                                        <span>{result.authors.slice(0, 3).join(', ')}
                                                            {result.authors.length > 3 && ` et al.`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">No authors</span>
                                                    )}
                                                    {result.year && ` (${result.year})`}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    📖 {result.journal}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-red-700 font-semibold text-sm">
                                                ❌ FAKE DOI - {result.error}
                                            </div>
                                        )}
                                    </div>

                                    {result.valid && result.url && (
                                        <a
                                            href={result.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                                            title="Mở DOI"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
