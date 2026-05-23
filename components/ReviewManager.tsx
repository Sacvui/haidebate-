"use client";
import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, X, FileBadge } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mammoth from "mammoth";

export function ReviewManager() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'analyzing' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [report, setReport] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setStatus('idle');
            setReport('');
            setErrorMsg('');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) {
            setFile(dropped);
            setStatus('idle');
            setReport('');
            setErrorMsg('');
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // result is "data:application/pdf;base64,JVBERi..."
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const extractTextFromDocx = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    };

    const handleSubmit = async () => {
        if (!file) return;
        setStatus('processing');
        
        let extractedText = "";
        let inlineData: { mimeType: string, data: string } | undefined = undefined;

        try {
            // 1. Process File
            if (file.name.endsWith('.docx')) {
                extractedText = await extractTextFromDocx(file);
            } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
                extractedText = await file.text();
            } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    throw new Error("File PDF quá lớn (Giới hạn 5MB). Vui lòng dùng file DOCX để thay thế.");
                }
                const base64 = await fileToBase64(file);
                inlineData = {
                    mimeType: 'application/pdf',
                    data: base64
                };
            } else {
                throw new Error("Định dạng file không được hỗ trợ. Vui lòng tải lên PDF, DOCX, TXT hoặc MD.");
            }

            setStatus('analyzing');

            // 2. Fetch Prompt
            const { REVIEWER_SYSTEM_PROMPT } = await import('@/lib/agents/reviewerPrompts');
            const apiKey = localStorage.getItem('gemini_api_key') || undefined;

            const prompt = `${REVIEWER_SYSTEM_PROMPT}\n\n${extractedText ? `NỘI DUNG TÀI LIỆU:\n${extractedText}` : 'Tài liệu đã được đính kèm dưới dạng PDF.'}`;

            // 3. Call API
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(apiKey ? {'x-gemini-api-key': apiKey} : {}) },
                body: JSON.stringify({
                    model: 'gemini-3.5-flash',
                    prompt: prompt,
                    inlineData: inlineData,
                    useCustomKey: !!apiKey
                })
            });

            let data;
            try {
                data = JSON.parse(await response.text());
            } catch (e) {
                throw new Error("Lỗi phản hồi từ máy chủ (Timeout hoặc Server Error).");
            }

            if (!response.ok) {
                throw new Error(data?.error?.message || data?.error || "Lỗi khi gọi API Gemini.");
            }

            setReport(data.text);
            setStatus('success');

        } catch (error: any) {
            console.error(error);
            setErrorMsg(error.message || "Đã xảy ra lỗi không xác định.");
            setStatus('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center gap-2">
                    <FileBadge className="w-8 h-8 text-blue-600" />
                    AI Reviewer: Thẩm định Đề cương
                </h2>
                <p className="text-muted-foreground">Tải lên bài nghiên cứu, đề cương (PDF, DOCX) để nhận góp ý từ Chuyên gia phản biện AI. Đặc biệt có khả năng soi xét mô hình, kiểm tra trích dẫn.</p>
            </div>

            {/* Upload Area */}
            <div 
                className={\`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors \${file ? 'border-accent bg-accent/5' : 'border-border hover:border-accent hover:bg-muted'}\`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.txt,.md"
                />
                {!file ? (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Upload className="w-12 h-12" />
                        <div>
                            <p className="font-medium text-foreground">Kéo thả file vào đây hoặc Click để chọn</p>
                            <p className="text-sm">Hỗ trợ: PDF (dưới 5MB), DOCX, TXT</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 text-accent">
                        <FileText className="w-12 h-12" />
                        <div className="flex items-center gap-2">
                            <span className="font-bold">{file.name}</span>
                            <span className="text-sm text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setFile(null); setReport(''); setStatus('idle'); }}
                                className="p-1 hover:bg-accent/20 rounded-full"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions & Status */}
            {file && status !== 'success' && (
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={status === 'processing' || status === 'analyzing'}
                        className="px-8 py-3 bg-accent text-white font-bold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        {(status === 'processing' || status === 'analyzing') ? (
                            <><RefreshCw className="w-5 h-5 animate-spin" /> Đang phân tích...</>
                        ) : (
                            <><CheckCircle className="w-5 h-5" /> Bắt đầu Thẩm định</>
                        )}
                    </button>
                    
                    {status === 'processing' && <p className="text-sm text-muted-foreground">Đang đọc file...</p>}
                    {status === 'analyzing' && <p className="text-sm text-blue-500 animate-pulse">Giáo sư AI đang chấm điểm, soi mô hình và dò references...</p>}
                    
                    {errorMsg && (
                        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg w-full justify-center">
                            <AlertCircle className="w-5 h-5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Results */}
            {status === 'success' && report && (
                <div className="mt-8 bg-card border border-border rounded-xl p-8 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                        <h3 className="text-xl font-bold text-foreground">Báo cáo Thẩm định</h3>
                        <button 
                            onClick={() => { setFile(null); setReport(''); setStatus('idle'); }}
                            className="text-sm text-accent hover:underline"
                        >
                            Thẩm định bài khác
                        </button>
                    </div>
                    <div className="prose prose-blue dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-accent">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {report}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}
