"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from "sonner";
import { Play, Bot, User, CheckCircle, ArrowRight, ArrowLeft, FileText, Download, Share2, Home, Save } from 'lucide-react';
import { AgentSession, WorkflowStep, AcademicLevel, ProjectType, AgentMessage } from '@/lib/agents';
import { StepIndicator } from './StepIndicator';
import { ThinkingAnimation } from './ThinkingAnimation';
import { StepReview } from './StepReview';
import { ShareableCard } from './ShareableCard';
import { ExportManager } from './ExportManager';
import { FinalReport } from './FinalReport';
import { MermaidChart } from './MermaidChart';
import { getAllProjects, saveProject, getProject, SavedProject } from '@/lib/projectStorage';
import { cn } from '@/lib/utils';


interface DebateManagerProps {
    topic: string;
    goal: string;
    audience: string;
    level: AcademicLevel;
    language: string;
    projectType: ProjectType;
    apiKey: string;
    apiKeyCritic?: string;
    sessionId?: string;
    userId?: string;
    onExit?: () => void;
    onNewProject?: () => void;
}

export function DebateManager({
    topic,
    goal,
    audience,
    level,
    language,
    projectType,
    apiKey,
    apiKeyCritic,
    sessionId,
    userId,
    onExit,
    onNewProject,
    paperType = 'quant' // Default to quantitative
}: DebateManagerProps & { paperType?: string }) {
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [isDraftReady, setIsDraftReady] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState<string>("");

    const [userFeedbackInput, setUserFeedbackInput] = useState("");

    const [currentStep, setCurrentStep] = useState<WorkflowStep>('1_TOPIC');
    const [isProcessing, setIsProcessing] = useState(false);
    const [stepCompleted, setStepCompleted] = useState(false);
    const [roundCount, setRoundCount] = useState(0);
    const [maxRounds, setMaxRounds] = useState(2);
    const [showReview, setShowReview] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);
    const [roundsConfig, setRoundsConfig] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // State for captured outputs
    const [variableChart, setVariableChart] = useState<string>("");
    const [finalContent, setFinalContent] = useState<string>("");
    const [outlineContent, setOutlineContent] = useState<string>("");
    const [outlineChart, setOutlineChart] = useState<string>("");
    const [gtmContent, setGtmContent] = useState<string>("");
    const [surveyContent, setSurveyContent] = useState<string>("");
    const [litReviewContent, setLitReviewContent] = useState<string>("");
    const [archContent, setArchContent] = useState<string>("");
    const [benchmarkContent, setBenchmarkContent] = useState<string>("");

    const [session] = useState(() => new AgentSession(
        topic, goal, audience, level, language as 'vi' | 'en', projectType, apiKey, apiKeyCritic, sessionId, userId, paperType
    ));

    const bottomRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    // Initial load from storage if sessionId exists
    useEffect(() => {
        if (sessionId && session) {
            const loadData = async () => {
                try {
                    const project = await getProject(sessionId);
                    if (project && project.data) {
                        const data = project.data;
                        // 1. Restore UI state
                        if (data.messages && data.messages.length > 0) setMessages(data.messages);
                        if (project.currentStep) setCurrentStep(project.currentStep);
                        if (data.mermaid) setVariableChart(data.mermaid);
                        if (data.finalContent) setFinalContent(data.finalContent);
                        if (data.outlineContent) setOutlineContent(data.outlineContent);
                        if (data.outlineChart) setOutlineChart(data.outlineChart);
                        if (data.gtmContent) setGtmContent(data.gtmContent);
                        if (data.surveyContent) setSurveyContent(data.surveyContent);
                        if (data.litReviewContent) setLitReviewContent(data.litReviewContent);
                        if (data.archContent) setArchContent(data.archContent);
                        if (data.benchmarkContent) setBenchmarkContent(data.benchmarkContent);

                        // 2. Hydrate underlying session (AgentSession)
                        if (project.topic) session.setFinalizedTopic(project.topic);
                        if (data.finalContent) session.setFinalizedModel(data.finalContent, data.mermaid);
                        if (data.outlineContent) session.setFinalizedOutline(data.outlineContent, data.outlineChart);
                        if (data.gtmContent) session.setFinalizedGTM(data.gtmContent);
                        if (data.surveyContent) session.setFinalizedSurvey(data.surveyContent);
                        if (data.litReviewContent) session.setFinalizedLitReview(data.litReviewContent);
                        if (data.archContent) session.setFinalizedArch(data.archContent);
                        if (data.benchmarkContent) session.setFinalizedBenchmark(data.benchmarkContent);
                    }
                } catch (e) {
                    console.error("Failed to load project data:", e);
                } finally {
                    setIsInitialized(true);
                }
            };
            loadData();
        } else {
            // New session tracking (fire and forget)
            if (!isInitialized) {
                fetch('/api/stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'new_session' })
                }).catch(err => console.error('Tracking failed', err));
            }
            setIsInitialized(true);
        }
    }, [sessionId, session]);

    // Auto-save logic
    useEffect(() => {
        if (sessionId && session) {
            saveToProjectStorage();
        }
    }, [messages, currentStep, stepCompleted, roundCount, variableChart, finalContent, outlineContent, gtmContent, surveyContent, litReviewContent, archContent, benchmarkContent, sessionId, session]);

    const saveToProjectStorage = async () => {
        if (!sessionId || !isInitialized) return;

        try {
            const existing = await getProject(sessionId);

            const updatedData = {
                messages: messages,
                mermaid: variableChart,
                finalContent,
                outlineContent,
                outlineChart,
                gtmContent,
                surveyContent,
                litReviewContent,
                archContent,
                benchmarkContent,
                completedAt: stepCompleted ? new Date().toISOString() : undefined
            };

            if (existing) {
                const updated: SavedProject = {
                    ...existing,
                    currentStep,
                    updatedAt: new Date().toISOString(),
                    data: {
                        ...existing.data,
                        ...updatedData
                    }
                };
                if (currentStep === '1_TOPIC' && session.finalizedTopic) {
                    updated.topic = session.finalizedTopic;
                }
                await saveProject(updated);
            } else {
                // If somehow lost from DB, recreate it to prevent data loss
                console.warn(`Project ${sessionId} not found in DB during save. Re-creating...`);
                const newProj: SavedProject = {
                    id: sessionId,
                    name: topic.substring(0, 50) || 'Dự án khôi phục',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    projectType,
                    level,
                    language: language as 'vi' | 'en',
                    topic,
                    goal,
                    audience,
                    currentStep,
                    steps: {},
                    status: 'in_progress',
                    data: updatedData
                };
                await saveProject(newProj);
            }
            setLastSaved(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } catch (e) {
            console.error("Error in saveToProjectStorage:", e);
        }
    };

    // Warn before unload
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isProcessing || messages.length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isProcessing, messages]);

    // Fetch config
    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoadingConfig(true);
            try {
                const res = await fetch('/api/admin/config');
                const data = await res.json();
                if (data.config) setRoundsConfig(data.config);
            } catch (error) {
                console.error('Failed to fetch config:', error);
            } finally {
                setIsLoadingConfig(false);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const extractMermaidCode = (text: string) => {
        const match = text.match(/```mermaid\s+([\s\S]*?)```/);
        return match ? match[1].trim() : "";
    };

    const addMessage = (role: 'writer' | 'critic', content: string) => {
        setMessages(prev => [...prev, { role, content, timestamp: Date.now(), round: roundCount }]);
    };

        const generateInitialDraft = async () => {
        if (isProcessing || stepCompleted || isDraftReady) return;
        setIsProcessing(true);
        try {
            setRoundCount(1);
            setIsStreaming(true);
            const writerContent = await session.generateWriterTurn(currentStep, undefined, undefined, (text) => setStreamingContent(text));
            setIsStreaming(false);
            setStreamingContent("");
            setMessages(prev => [...prev, { role: 'writer', content: writerContent, timestamp: Date.now(), round: 1 }]);
            
            if (currentStep === '1_LIT_REVIEW') setLitReviewContent(writerContent);
            if (currentStep === '2_ARCH') setArchContent(writerContent);
            if (currentStep === '4_BENCHMARK') setBenchmarkContent(writerContent);
            if (currentStep === '2_MODEL') { const c = extractMermaidCode(writerContent); if (c) setVariableChart(c); }
            if (currentStep === '3_OUTLINE') { setOutlineContent(writerContent); const c = extractMermaidCode(writerContent); if (c) setOutlineChart(c); }
            if (currentStep === '4_SURVEY' || currentStep === '4_BENCHMARK') setSurveyContent(writerContent);
            if (currentStep === '5_GTM') setGtmContent(writerContent);

            setIsDraftReady(true);
        } catch (error) {
            console.error("Error in draft generation:", error);
            toast.error("Hệ thống gặp lỗi kết nối với AI.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCriticReview = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const writerMsg = messages.filter(m => m.role === 'writer').pop();
            const writerContent = writerMsg ? writerMsg.content : "";
            
            setRoundCount(prev => prev + 1);
            const currentRound = roundCount + 1;

            setIsStreaming(true);
            const criticMsg = await session.generateCriticTurn(currentStep, writerContent, (text) => setStreamingContent(text));
            setIsStreaming(false);
            setStreamingContent("");
            setMessages(prev => [...prev, { role: 'critic', content: criticMsg, timestamp: Date.now(), round: currentRound }]);

            setIsStreaming(true);
            const newWriterContent = await session.generateWriterTurn(currentStep, criticMsg, false, (text) => setStreamingContent(text));
            setIsStreaming(false);
            setStreamingContent("");
            setMessages(prev => [...prev, { role: 'writer', content: newWriterContent, timestamp: Date.now(), round: currentRound }]);

            if (currentStep === '1_LIT_REVIEW') setLitReviewContent(newWriterContent);
            if (currentStep === '2_ARCH') setArchContent(newWriterContent);
            if (currentStep === '4_BENCHMARK') setBenchmarkContent(newWriterContent);
            if (currentStep === '2_MODEL') { const c = extractMermaidCode(newWriterContent); if (c) setVariableChart(c); }
            if (currentStep === '3_OUTLINE') { setOutlineContent(newWriterContent); const c = extractMermaidCode(newWriterContent); if (c) setOutlineChart(c); }
            if (currentStep === '4_SURVEY' || currentStep === '4_BENCHMARK') setSurveyContent(newWriterContent);
            if (currentStep === '5_GTM') setGtmContent(newWriterContent);

        } catch (error) {
            console.error("Error in critic review:", error);
            toast.error("Hệ thống gặp lỗi kết nối với AI.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUserReview = async () => {
        if (isProcessing || !userFeedbackInput.trim()) return;
        setIsProcessing(true);
        try {
            setMessages(prev => [...prev, { role: 'critic', content: `Yêu cầu từ người dùng: ${userFeedbackInput}`, timestamp: Date.now(), round: roundCount + 1 }]);
            setRoundCount(prev => prev + 1);
            
            setIsStreaming(true);
            const newWriterContent = await session.generateWriterTurn(currentStep, userFeedbackInput, true, (text) => setStreamingContent(text));
            setIsStreaming(false);
            setStreamingContent("");
            setMessages(prev => [...prev, { role: 'writer', content: newWriterContent, timestamp: Date.now(), round: roundCount + 1 }]);

            if (currentStep === '1_LIT_REVIEW') setLitReviewContent(newWriterContent);
            if (currentStep === '2_ARCH') setArchContent(newWriterContent);
            if (currentStep === '4_BENCHMARK') setBenchmarkContent(newWriterContent);
            if (currentStep === '2_MODEL') { const c = extractMermaidCode(newWriterContent); if (c) setVariableChart(c); }
            if (currentStep === '3_OUTLINE') { setOutlineContent(newWriterContent); const c = extractMermaidCode(newWriterContent); if (c) setOutlineChart(c); }
            if (currentStep === '4_SURVEY' || currentStep === '4_BENCHMARK') setSurveyContent(newWriterContent);
            if (currentStep === '5_GTM') setGtmContent(newWriterContent);
            
            setUserFeedbackInput("");
        } catch (error) {
            console.error("Error in user review:", error);
            toast.error("Hệ thống gặp lỗi kết nối với AI.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApprove = () => {
        setStepCompleted(true);
        setShowReview(true);
    };

    const handleFinalize = async (userFinal: string, note?: string) => {
        try {
            if (currentStep === '1_TOPIC') session.setFinalizedTopic(userFinal);
            else if (currentStep === '1_LIT_REVIEW') session.setFinalizedLitReview(userFinal);
            else if (currentStep === '2_ARCH') session.setFinalizedArch(userFinal);
            else if (currentStep === '4_BENCHMARK') session.setFinalizedBenchmark(userFinal);
            else if (currentStep === '2_MODEL') session.setFinalizedModel(userFinal, variableChart);
            else if (currentStep === '3_OUTLINE') session.setFinalizedOutline(userFinal, outlineChart);
            else if (currentStep === '5_GTM') session.setFinalizedGTM(userFinal);
            else if (currentStep === '4_SURVEY' || currentStep === '4_BENCHMARK') session.setFinalizedSurvey(userFinal);

            handleNextStep();
        } catch (error) {
            console.error('Finalize error:', error);
            toast.error("Lưu kết quả thất bại. Vui lòng thử lại!");
        }
    };

    const handleNextStep = () => {
        if (currentStep === '1_TOPIC' && !showReview) {
            const lastWriter = messages.filter(m => m.role === 'writer').pop();
            if (lastWriter) {
                const match = lastWriter.content.match(/CHỐT ĐỀ TÀI:\s*(.*)/i);
                if (match) session.updateTopic(match[1].trim());
            }
        }

        if (projectType === 'STARTUP') {
            if (currentStep === '1_TOPIC') setCurrentStep('2_MODEL');
            else if (currentStep === '2_MODEL') setCurrentStep('4_SURVEY');
            else if (currentStep === '4_SURVEY') setCurrentStep('5_GTM');
            else if (currentStep === '5_GTM') setCurrentStep('3_OUTLINE');
        } else {
            if (currentStep === '1_TOPIC') setCurrentStep('1_LIT_REVIEW');
            else if (currentStep === '1_LIT_REVIEW') setCurrentStep(paperType === 'software' ? '2_ARCH' : '2_MODEL');
            else if (currentStep === '2_MODEL' || currentStep === '2_ARCH') setCurrentStep(paperType === 'software' ? '4_BENCHMARK' : '4_SURVEY');
            else if (currentStep === '4_SURVEY' || currentStep === '4_BENCHMARK') setCurrentStep('3_OUTLINE');
        }

        setRoundCount(0);
        setStepCompleted(false);
        setShowReview(false);
    };

    const handlePreviousStep = () => {
        if (projectType === 'STARTUP') {
            if (currentStep === '3_OUTLINE') setCurrentStep('5_GTM');
            else if (currentStep === '5_GTM') setCurrentStep('4_SURVEY');
            else if (currentStep === '4_SURVEY') setCurrentStep('2_MODEL');
            else if (currentStep === '2_MODEL') setCurrentStep('1_TOPIC');
        } else {
            if (currentStep === '3_OUTLINE') setCurrentStep(paperType === 'software' ? '4_BENCHMARK' : '4_SURVEY');
            else if (currentStep === '4_SURVEY' || currentStep === '4_BENCHMARK') setCurrentStep(paperType === 'software' ? '2_ARCH' : '2_MODEL');
            else if (currentStep === '2_MODEL' || currentStep === '2_ARCH') setCurrentStep('1_LIT_REVIEW');
            else if (currentStep === '1_LIT_REVIEW') setCurrentStep('1_TOPIC');
        }

        setRoundCount(0);
        setStepCompleted(true);
        setShowReview(true);
    };

    const getStepNumber = (step: WorkflowStep) => {
        if (projectType === 'STARTUP') {
            if (step === '1_TOPIC') return 1;
            if (step === '2_MODEL') return 2;
            if (step === '4_SURVEY') return 3;
            if (step === '5_GTM') return 4;
            if (step === '3_OUTLINE') return 5;
            return 1;
        }
        // Research / Software
        if (step === '1_TOPIC') return 1;
        if (step === '1_LIT_REVIEW') return 2;
        if (step === '2_MODEL' || step === '2_ARCH') return 3;
        if (step === '4_SURVEY' || step === '4_BENCHMARK') return 4;
        if (step === '3_OUTLINE') return 5;
        return 1;
    };

    if (showExport) {
        return (
            <ExportManager
                topic={session.finalizedTopic || topic}
                level={level}
                goal={goal}
                modelContent={session.finalizedModel}
                outlineContent={session.finalizedOutline}
                outlineChart={session.finalizedOutlineChart || outlineChart}
                variableChart={session.finalizedModelChart || variableChart}
                gtmContent={session.finalizedGTM || gtmContent}
                surveyContent={session.finalizedSurvey || surveyContent}
                paperType={paperType}
                onBack={() => setShowExport(false)}
                onViewReport={() => setShowReport(true)}
            />
        );
    }

    if (showReport) {
        return (
            <FinalReport
                topic={session.finalizedTopic || topic}
                goal={goal}
                audience={audience}
                level={level}
                modelContent={session.finalizedModel}
                outlineContent={session.finalizedOutline}
                outlineChart={session.finalizedOutlineChart || outlineChart}
                gtmContent={session.finalizedGTM || gtmContent}
                surveyContent={session.finalizedSurvey || surveyContent}
                variableChart={session.finalizedModelChart || variableChart}
                onBack={() => setShowReport(false)}
                onExportOptions={() => { setShowReport(false); setShowExport(true); }}
            />
        );
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-6 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-foreground">
                        {currentStep === '1_TOPIC' && (projectType === 'STARTUP' ? "Giai Đoạn 1: Thẩm Định Ý Tưởng" : "Giai Đoạn 1: Thẩm Định Đề Tài")}
                        {currentStep === '1_LIT_REVIEW' && "Giai Đoạn 2: Tổng Quan Tài Liệu (Lit Review)"}
                        {currentStep === '2_MODEL' && (projectType === 'STARTUP' ? "Giai Đoạn 2: Lean Canvas" : "Giai Đoạn 3: Xây Dựng Mô Hình")}
                        {currentStep === '2_ARCH' && "Giai Đoạn 3: Kiến Trúc Hệ Thống & Tech Stack"}
                        {currentStep === '4_SURVEY' && (projectType === 'STARTUP' ? "Giai Đoạn 3: Customer Discovery" : "Giai Đoạn 4: Phương pháp Nghiên cứu")}
                        {currentStep === '5_GTM' && "Giai Đoạn 4: Chiến Lược Ra Mắt (GTM)"}
                        {currentStep === '4_BENCHMARK' && "Giai Đoạn 4: Kiểm Thử & Đánh Giá Hiệu Năng"}
                        {currentStep === '3_OUTLINE' && (projectType === 'STARTUP' ? "Giai Đoạn 5: Pitch Deck + Financial Plan" : "Giai Đoạn 5: Hoàn Thiện Đề Cương")}
                    </h2>
                    <div className="flex items-center gap-1">
                        <button onClick={async () => { await saveToProjectStorage(); toast.success("Đã lưu dự án thành công!"); }} className="p-2 text-slate-400 hover:text-green-600 transition-colors" title="Lưu dự án">
                            <Save size={20} />
                        </button>
                        <button onClick={async () => { await saveToProjectStorage(); if (onExit) onExit(); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Về trang chủ">
                            <Home size={20} />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <span className="bg-muted px-3 py-1 rounded-full text-sm">Mục tiêu: {goal}</span>
                        <span className={cn("px-3 py-1 rounded-full text-white text-xs", level === 'UNDERGRAD' ? 'bg-green-500' : 'bg-blue-500')}>Trình độ: {level}</span>
                    </div>
                </div>
                <StepIndicator currentStep={getStepNumber(currentStep)} totalSteps={projectType === 'STARTUP' ? 5 : 4} projectType={projectType} />
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm font-medium text-muted-foreground">
                        Trạng thái: {isProcessing ? "Đang xử lý..." : stepCompleted ? "Đã hoàn thành" : "Sẵn sàng"}
                        {lastSaved && <span className="ml-4 text-[10px] text-muted-foreground italic">Đã lưu: {lastSaved}</span>}
                    </div>
                    {!isProcessing && !stepCompleted && (
                        <div className="flex gap-2">
                            {currentStep !== '1_TOPIC' ? (
                                <button onClick={handlePreviousStep} className="bg-muted hover:bg-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                                    <ArrowLeft size={16} /> Quay lại
                                </button>
                            ) : (
                                <button onClick={async () => { await saveToProjectStorage(); if (onExit) onExit(); }} className="bg-muted hover:bg-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                                    <Home size={16} /> Trang chủ
                                </button>
                            )}
                            {!isDraftReady ? (
                                <button onClick={generateInitialDraft} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                    <Play size={18} /> Bắt Đầu Viết Nháp
                                </button>
                            ) : null}
                        </div>
                    )}
                    {stepCompleted && (
                        <div className="flex gap-2">
                            {currentStep !== '1_TOPIC' ? (
                                <button onClick={handlePreviousStep} className="bg-muted hover:bg-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                                    <ArrowLeft size={16} /> Quay lại
                                </button>
                            ) : (
                                <button onClick={async () => { await saveToProjectStorage(); if (onExit) onExit(); }} className="bg-muted hover:bg-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                                    <Home size={16} /> Trang chủ
                                </button>
                            )}
                            <button onClick={() => setShowReview(true)} className="bg-card border border-border px-4 py-2 rounded-lg">Chỉnh sửa</button>
                            {currentStep === '3_OUTLINE' ? (
                                <button onClick={() => setShowReport(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                                    <FileText size={16} /> Xem Báo Cáo
                                </button>
                            ) : (
                                <button onClick={handleNextStep} className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                                    Tiếp theo <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showReview ? (
                <StepReview
                    step={currentStep}
                    aiOutput={messages.filter(m => m.role === 'writer').pop()?.content || ''}
                    mermaidCode={currentStep === '2_MODEL' ? variableChart : undefined}
                    onFinalize={handleFinalize}
                    onCancel={() => setShowReview(false)}
                    level={level}
                    projectType={projectType}
                />
            ) : (
                <div className="flex-1 bg-muted rounded-xl border border-border p-6 overflow-y-auto min-h-[500px] mb-8 space-y-6">
                    {messages.length === 0 && <div className="text-center text-muted-foreground mt-20"><Bot size={48} className="mx-auto" /><p>Nhấn Bắt Đầu</p></div>}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn("flex gap-4", msg.role === 'writer' ? "justify-start" : "justify-start flex-row-reverse")}>
                            <div className={cn("p-1 rounded-full h-8 w-8 flex-shrink-0", msg.role === 'writer' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600")}>
                                {msg.role === 'writer' ? <Bot size={24} /> : <User size={24} />}
                            </div>
                            <div className={cn("max-w-[80%] p-4 rounded-xl shadow-sm", msg.role === 'writer' ? "bg-card border border-border" : "bg-purple-50 dark:bg-purple-900/15 border-purple-100 dark:border-purple-800/30")}>
                                <div className="prose prose-slate max-w-none text-sm break-words prose-table:border-collapse prose-table:border prose-table:w-full prose-th:border prose-th:bg-slate-100 prose-th:p-2 prose-td:border prose-td:p-2">
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
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>                            </div>
                        </div>
                    ))}
                    
                    
                    {isStreaming && (
                        <div className="flex gap-4 animate-fade-in-up">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-200">
                                <Bot size={20} />
                            </div>
                            <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-blue-100 dark:border-blue-900 shadow-sm relative markdown-content">
                                <div className="text-sm text-gray-500 mb-2 border-b pb-2 flex items-center gap-2">
                                    <span className="font-semibold text-blue-600">AI đang viết...</span>
                                </div>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent || "Đang kết nối..."}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                    {isDraftReady && !stepCompleted && (

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mt-4 shadow-sm animate-fade-in-up">
                            <h4 className="text-sm font-semibold mb-2 text-blue-800 dark:text-blue-300">🎮 Bảng Điều Khiển (Human-in-the-Loop)</h4>
                            <textarea 
                                value={userFeedbackInput}
                                onChange={(e) => setUserFeedbackInput(e.target.value)}
                                placeholder="Gõ yêu cầu sửa đổi của bạn vào đây (VD: Đổi mô hình, bỏ biến A, thêm câu hỏi B...)"
                                className="w-full p-2 border rounded-lg text-sm mb-3 bg-slate-50 dark:bg-slate-900"
                                rows={2}
                            />
                            <div className="flex flex-wrap gap-2">
                                <button onClick={handleUserReview} disabled={isProcessing || !userFeedbackInput.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
                                    <User size={16}/> Yêu Cầu AI Sửa
                                </button>
                                <button onClick={handleCriticReview} disabled={isProcessing} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
                                    <Bot size={16}/> Nhờ AI Tự Soi Lỗi
                                </button>
                                <button onClick={handleApprove} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm ml-auto">
                                    <Check size={16}/> Chốt Kết Quả!
                                </button>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />

                </div>
            )}
            {isProcessing && <div className="fixed bottom-6 left-1/2 -translate-x-1/2"><ThinkingAnimation /></div>}
        </div>
    );
}
