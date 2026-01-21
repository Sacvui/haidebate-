"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AgentSession, AgentMessage, WorkflowStep, AcademicLevel, ProjectType } from '../lib/agents';
import { Bot, User, Play, RotateCw, CheckCircle, ArrowRight, ArrowLeft, FileText, Camera, Home, Plus, Sparkles } from 'lucide-react';
import { saveProject, getProject, SavedProject } from '@/lib/projectStorage';
import { cn } from '@/lib/utils';
import { StepIndicator } from './StepIndicator';
import { MermaidChart } from './MermaidChart';
import { FinalReport } from './FinalReport';
import { ThinkingAnimation } from './ThinkingAnimation';
import { ShareableCard } from './ShareableCard';
import { StepReview } from './StepReview';
import { ExportManager } from './ExportManager';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RoundsConfig {
    '1_TOPIC': number;
    '2_MODEL': number;
    '3_OUTLINE': number;
    '4_SURVEY': number;
}

export interface DebateManagerProps {
    topic: string;
    goal: string;
    audience: string;
    level: AcademicLevel;
    language: 'vi' | 'en';
    projectType?: ProjectType;
    apiKey?: string;
    apiKeyCritic?: string;
    userId?: string;
    sessionId?: string;
    onExit?: () => void;
    onNewProject?: () => void;
}

// Helper to extract mermaid code from markdown
const extractMermaidCode = (content: string): string => {
    // Try to match code block with mermaid language
    const mermaidMatch = content.match(/```mermaid\s*([\s\S]*?)```/);
    if (mermaidMatch && mermaidMatch[1]) {
        return mermaidMatch[1].trim();
    }
    return "";
};

export default function DebateManager({ topic, goal, audience, level, language, projectType = 'RESEARCH', apiKey, apiKeyCritic, userId, sessionId: propSessionId, onExit, onNewProject }: DebateManagerProps) {
    const [sessionId] = useState(() => propSessionId || `session_${Date.now()}`);
    const [session] = useState(() => new AgentSession(topic, goal, audience, level, language, projectType, apiKey, apiKeyCritic, sessionId, userId));
    const [roundsConfig, setRoundsConfig] = useState<RoundsConfig>({
        '1_TOPIC': 3,
        '2_MODEL': 3,
        '3_OUTLINE': 3,
        '4_SURVEY': 2
    });

    const [currentStep, setCurrentStep] = useState<WorkflowStep>('1_TOPIC');
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [roundCount, setRoundCount] = useState(0);
    const [stepCompleted, setStepCompleted] = useState(false);
    const [showReview, setShowReview] = useState(false);

    // Phase 3 & 4 State
    const [showReport, setShowReport] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [variableChart, setVariableChart] = useState<string | undefined>(undefined);
    const [finalContent, setFinalContent] = useState("");
    const [outlineContent, setOutlineContent] = useState(""); // Step 3 detailed outline
    const [surveyContent, setSurveyContent] = useState(""); // New state for Survey
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    const bottomRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    const maxRounds = roundsConfig[currentStep];

    // Restore state on mount
    useEffect(() => {
        if (sessionId) {
            const savedState = localStorage.getItem(`debate_state_${sessionId}`);
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    if (messages.length === 0 && parsed.messages?.length > 0) {
                        setMessages(parsed.messages);
                        setCurrentStep(parsed.currentStep);
                        setStepCompleted(parsed.stepCompleted);
                        setRoundCount(parsed.roundCount || 0);
                        if (parsed.variableChart) setVariableChart(parsed.variableChart);
                        if (parsed.finalContent) setFinalContent(parsed.finalContent);
                        if (parsed.outlineContent) setOutlineContent(parsed.outlineContent);
                        if (parsed.surveyContent) setSurveyContent(parsed.surveyContent);

                        // Restore session object state
                        if (parsed.sessionState) {
                            if (parsed.sessionState.finalizedTopic) session.setFinalizedTopic(parsed.sessionState.finalizedTopic);
                            if (parsed.sessionState.finalizedModel) session.setFinalizedModel(parsed.sessionState.finalizedModel, parsed.sessionState.finalizedModelChart);
                            if (parsed.sessionState.finalizedOutline) session.setFinalizedOutline(parsed.sessionState.finalizedOutline);
                            if (parsed.sessionState.finalizedSurvey) session.setFinalizedSurvey(parsed.sessionState.finalizedSurvey);
                        }
                    }
                } catch (e) {
                    console.error("Error restoring debate state", e);
                }
            }
        }
    }, [sessionId]);

    // Save state on change
    useEffect(() => {
        if (sessionId && messages.length > 0) {
            const sessionState = {
                finalizedTopic: session.finalizedTopic,
                finalizedModel: session.finalizedModel,
                finalizedModelChart: session.finalizedModelChart,
                finalizedOutline: session.finalizedOutline,
                finalizedSurvey: session.finalizedSurvey
            };

            // 1. Local Debate State (Detailed)
            localStorage.setItem(`debate_state_${sessionId}`, JSON.stringify({
                messages,
                currentStep,
                stepCompleted,
                roundCount,
                variableChart,
                finalContent,
                outlineContent,
                surveyContent,
                sessionState
            }));

            // 2. Global Project List (Summary)
            saveToProjectStorage();
        }
    }, [messages, currentStep, stepCompleted, roundCount, variableChart, finalContent, outlineContent, surveyContent, sessionId, session]);

    const saveToProjectStorage = () => {
        if (!sessionId) return;

        // Get existing project or create partial updates
        const existing = getProject(sessionId);

        // If it doesn't exist yet (e.g. direct start without create), we might skip 
        // OR we can try to reconstruct it. But usually it's created in Home.
        if (existing) {
            const updated: SavedProject = {
                ...existing,
                currentStep,
                updatedAt: new Date().toISOString(),
                // Update specific step data if finalized or in progress
                steps: {
                    ...existing.steps,
                    [currentStep]: {
                        finalized: stepCompleted ? (messages.filter(m => m.role === 'writer').pop()?.content || '') : existing.steps[currentStep]?.finalized || '',
                        messages: messages, // Note: This might get heavy. Maybe store only recent? 
                        // actually projectStorage types messages as AgentMessage[], so it's fine.
                        mermaid: variableChart,
                        completedAt: stepCompleted ? new Date().toISOString() : undefined
                    }
                }
            };

            // Update topic if changed in Step 1
            if (currentStep === '1_TOPIC' && session.finalizedTopic) {
                updated.topic = session.finalizedTopic;
                updated.name = session.finalizedTopic.substring(0, 50);
            }

            saveProject(updated);
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

    // Fetch rounds config from admin API
    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoadingConfig(true);
            try {
                const res = await fetch('/api/admin/config');
                const data = await res.json();
                if (data.config) {
                    setRoundsConfig(data.config);
                }
            } catch (error) {
                console.error('Failed to fetch rounds config:', error);
                // Keep default config
            } finally {
                setIsLoadingConfig(false);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (role: 'writer' | 'critic', content: string) => {
        setMessages(prev => [...prev, { role, content, timestamp: Date.now(), round: roundCount }]);
    };

    const runStepLoop = async () => {
        if (isProcessing || stepCompleted) return;
        setIsProcessing(true);
        setStepCompleted(false);

        try {
            let currentRound = 0;
            let lastCriticFeedback = "";
            let writerContent = "";

            // Initial Writer Turn
            writerContent = await session.generateWriterTurn(currentStep);
            setMessages(prev => {
                return [...prev, { role: 'writer', content: writerContent, timestamp: Date.now(), round: 1 }];
            });

            // Capture specific outputs
            if (currentStep === '2_MODEL') {
                const extractedChart = extractMermaidCode(writerContent);
                if (extractedChart) setVariableChart(extractedChart);
            }
            if (currentStep === '3_OUTLINE') {
                setOutlineContent(writerContent); // Save detailed outline
                setFinalContent(prev => prev + "\n" + writerContent);
            }
            if (currentStep === '4_SURVEY') {
                setSurveyContent(writerContent);
            }

            // Debate Loop
            while (currentRound < maxRounds) {
                const delayTime = session.isUsingSameKey() ? 4000 : 1000;
                await new Promise(resolve => setTimeout(resolve, delayTime));

                currentRound++;
                setRoundCount(currentRound);

                // Critic Turn
                const criticFeedback = await session.generateCriticTurn(currentStep, writerContent);
                setMessages(prev => {
                    return [...prev, { role: 'critic', content: criticFeedback, timestamp: Date.now(), round: currentRound }];
                });
                lastCriticFeedback = criticFeedback;

                // Writer Updates (if not last round)
                if (currentRound < maxRounds) {
                    const delayTime = session.isUsingSameKey() ? 4000 : 1000;
                    await new Promise(resolve => setTimeout(resolve, delayTime));

                    writerContent = await session.generateWriterTurn(currentStep, lastCriticFeedback);
                    setMessages(prev => {
                        return [...prev, { role: 'writer', content: writerContent, timestamp: Date.now(), round: currentRound + 1 }];
                    });

                    if (currentStep === '2_MODEL') {
                        const extractedChart = extractMermaidCode(writerContent);
                        if (extractedChart) setVariableChart(extractedChart);
                    }
                    if (currentStep === '3_OUTLINE') {
                        setFinalContent(writerContent);
                    }
                    if (currentStep === '4_SURVEY') {
                        setSurveyContent(writerContent);
                    }
                }
            }

            setStepCompleted(true);
            setShowReview(true); // ⭐ Trigger review mode

        } catch (error) {
            console.error("Error running debate:", error);
            addMessage('critic', "Hệ thống gặp lỗi kết nối (Rate Limit). Đang thử lại...");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinalize = async (userFinal: string, note?: string) => {
        if (!userId) {
            alert('Lỗi: Không tìm thấy userId');
            return;
        }

        try {
            // Save to database via API
            const response = await fetch('/api/session/save-step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    sessionId,
                    step: currentStep,
                    data: {
                        aiOutput: messages.filter(m => m.role === 'writer').pop()?.content || '',
                        userFinal,
                        mermaidCode: currentStep === '2_MODEL' ? variableChart : undefined,
                        status: 'finalized',
                        editedAt: new Date().toISOString(),
                        note
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save step result');
            }

            // Update session with finalized results
            if (currentStep === '1_TOPIC') {
                session.setFinalizedTopic(userFinal);
            } else if (currentStep === '2_MODEL') {
                session.setFinalizedModel(userFinal, variableChart);
            } else if (currentStep === '3_OUTLINE') {
                session.setFinalizedOutline(userFinal);
            } else if (currentStep === '4_SURVEY') {
                session.setFinalizedSurvey(userFinal);
            }

            // Move to next step
            handleNextStep();
        } catch (error) {
            console.error('Error saving step result:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Lỗi không xác định';
            alert(`Lỗi khi lưu kết quả: ${errorMessage}\n\nVui lòng thử lại hoặc liên hệ admin.`);
        }
    };

    const handleNextStep = () => {
        // Step 1 -> 2: Finalize Topic (only if not from review)
        if (currentStep === '1_TOPIC' && !showReview) {
            const lastWriterMsg = messages.filter(m => m.role === 'writer').pop();
            if (lastWriterMsg) {
                const match = lastWriterMsg.content.match(/CHỐT ĐỀ TÀI:\s*(.*)/i) || lastWriterMsg.content.match(/\*\*CHỐT ĐỀ TÀI:\*\*\s*(.*)/i);
                if (match && match[1]) {
                    const newTopic = match[1].trim();
                    session.updateTopic(newTopic);
                }
            }
        }

        // Transition to next step
        if (currentStep === '1_TOPIC') setCurrentStep('2_MODEL');
        else if (currentStep === '2_MODEL') setCurrentStep('3_OUTLINE');
        else if (currentStep === '3_OUTLINE') setCurrentStep('4_SURVEY');

        setMessages([]);
        setRoundCount(0);
        setStepCompleted(false);
        setShowReview(false);
    };

    const handlePreviousStep = () => {
        // Navigate to previous step
        if (currentStep === '2_MODEL') setCurrentStep('1_TOPIC');
        else if (currentStep === '3_OUTLINE') setCurrentStep('2_MODEL');
        else if (currentStep === '4_SURVEY') setCurrentStep('3_OUTLINE');

        setMessages([]);
        setRoundCount(0);
        setStepCompleted(true); // Mark as completed since we're going back to review
        setShowReview(true); // Automatically open review mode
    };

    const getStepNumber = (step: WorkflowStep) => {
        if (step === '1_TOPIC') return 1;
        if (step === '2_MODEL') return 2;
        if (step === '3_OUTLINE') return 3;
        if (step === '4_SURVEY') return 4;
        return 5; // For future export step
    };

    // Initial loading state
    if (isLoadingConfig) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-600 font-medium">Đang tải cấu hình hệ thống...</p>
            </div>
        );
    }

    if (showExport) {
        return (
            <ExportManager
                topic={session.finalizedTopic || topic}
                level={level}
                goal={goal}
                modelContent={session.finalizedModel}
                outlineContent={session.finalizedOutline}
                surveyContent={session.finalizedSurvey || surveyContent}
                onBack={() => setShowExport(false)}
                onViewReport={() => setShowReport(true)}
            />
        );
    }

    if (showReport) {
        return (
            <FinalReport
                topic={session.finalizedTopic || ""}
                goal={goal}
                audience={audience}
                level={level}
                modelContent={session.finalizedModel}
                outlineContent={session.finalizedOutline}
                surveyContent={session.finalizedSurvey || surveyContent} // Fallback to state if not yet in session
                variableChart={session.finalizedModelChart || variableChart}
                onBack={() => setShowReport(false)}
            />
        );
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto">
            {/* Header & Steps */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 sticky top-0 z-10 transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {currentStep === '1_TOPIC' && "Giai Đoạn 1: Thẩm Định Đề Tài"}
                        {currentStep === '2_MODEL' && "Giai Đoạn 2: Xây Dựng Mô Hình"}
                        {currentStep === '3_OUTLINE' && "Giai Đoạn 3: Hoàn Thiện Đề Cương"}
                        {currentStep === '4_SURVEY' && "Giai Đoạn 4: Xây Dựng Thang Đo (Survey)"}
                    </h2>

                    {/* Home Button */}
                    <button
                        onClick={() => {
                            saveToProjectStorage();
                            if (onExit) onExit();
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors absolute right-6 top-6"
                        title="Về trang chủ & Lưu"
                    >
                        <Home size={20} />
                    </button>

                    <div className="flex gap-2 text-sm text-slate-500">
                        <span className="font-medium bg-slate-100 px-3 py-1 rounded-full">
                            Mục tiêu: {goal}
                        </span>
                        <span className={cn(
                            "font-medium px-3 py-1 rounded-full text-white text-xs",
                            level === 'UNDERGRAD' ? 'bg-green-500' :
                                level === 'MASTER' ? 'bg-blue-500' : 'bg-purple-600'
                        )}>
                            Trình độ: {level}
                        </span>
                    </div>
                </div>

                <StepIndicator currentStep={getStepNumber(currentStep)} totalSteps={5} />

                <div className="flex items-center justify-between mt-2">
                    <div className="text-sm font-medium text-slate-500">
                        Trạng thái:
                        {isProcessing ? <span className="text-blue-600 ml-2 animate-pulse">● Đang xử lý Vòng {roundCount}/{maxRounds}...</span>
                            : stepCompleted ? <span className="text-green-600 ml-2">● Đã hoàn thành giai đoạn này</span>
                                : <span className="text-slate-400 ml-2">● Sẵn sàng</span>}
                    </div>

                    {!isProcessing && !stepCompleted && (
                        <button
                            onClick={runStepLoop}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
                        >
                            <Play size={18} /> Bắt Đầu Giai Đoạn {getStepNumber(currentStep)}
                        </button>
                    )}

                    {stepCompleted && (
                        <div className="flex gap-2">
                            {/* Back Button - only show if not on Step 1 */}
                            {currentStep !== '1_TOPIC' && (
                                <button
                                    onClick={handlePreviousStep}
                                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95"
                                >
                                    <ArrowLeft size={18} /> Quay lại
                                </button>
                            )}

                            <button
                                onClick={() => setShowReview(true)}
                                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95"
                            >
                                <FileText size={18} /> Xem lại & Chỉnh sửa
                            </button>

                            {currentStep !== '4_SURVEY' && (
                                <button
                                    onClick={handleNextStep}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95 animate-bounce"
                                >
                                    Chuyển Sang Bước Tiếp Theo <ArrowRight size={18} />
                                </button>
                            )}

                            {currentStep === '4_SURVEY' && (
                                <button
                                    onClick={() => setShowExport(true)}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-200"
                                >
                                    <FileText size={18} /> Chuyển sang Bước 5: Export
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Mode */}
            {showReview ? (
                <StepReview
                    step={currentStep}
                    aiOutput={messages.filter(m => m.role === 'writer').pop()?.content || ''}
                    mermaidCode={currentStep === '2_MODEL' ? variableChart : undefined}
                    onFinalize={handleFinalize}
                    onCancel={() => setShowReview(false)}
                    level={level}
                />
            ) : (
                <>
                    {/* Chat Area */}
                    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-6 overflow-y-auto min-h-[500px] mb-8 space-y-6">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-400 mt-20">
                                <Bot size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Nhấn "Bắt Đầu" để AI tiến hành công việc.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            const chartCode = extractMermaidCode(msg.content);
                            const contentWithoutChart = msg.content.replace(/```mermaid[\\s\\S]*?```/, '');

                            // Logic to determine if we should show a Divider
                            const showDivider = idx === 0 || (msg.round && messages[idx - 1]?.round !== msg.round);
                            const roundLabel = msg.round ? `Vòng ${msg.round}` : '';

                            return (
                                <React.Fragment key={idx}>
                                    {showDivider && msg.round && (
                                        <div className="flex items-center gap-4 my-6 opacity-30">
                                            <div className="h-px bg-slate-400 flex-1"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{roundLabel}</span>
                                            <div className="h-px bg-slate-400 flex-1"></div>
                                        </div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={cn(
                                            "flex gap-4 max-w-4xl",
                                            msg.role === 'writer' ? "mr-auto" : "ml-auto flex-row-reverse"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                            msg.role === 'writer' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                        )}>
                                            {msg.role === 'writer' ? <User size={18} /> : <Bot size={18} />}
                                        </div>

                                        <div className={cn(
                                            "p-4 md:p-5 rounded-2xl shadow-sm text-sm leading-relaxed max-w-[85vw] md:max-w-none",
                                            msg.role === 'writer' ? "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                                                : "bg-orange-50 text-slate-800 rounded-tr-none border border-orange-100 md:mr-12"
                                        )}>
                                            <div className="font-bold mb-2 uppercase text-xs tracking-wider opacity-70">
                                                {msg.role === 'writer' ? "Người Viết (Writer)" : "Hội Đồng Phản Biện (Critic)"}
                                            </div>
                                            <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 break-words">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {contentWithoutChart}
                                                </ReactMarkdown>
                                            </div>

                                            {/* Render Mermaid Chart if exits in this message */}
                                            {chartCode && (
                                                <div className="mt-4">
                                                    <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">Sơ đồ minh họa:</div>
                                                    <MermaidChart chart={chartCode} />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </React.Fragment>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Thinking Animation Overlay - Sticky Top */}
                    {
                        isProcessing && (
                            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
                                <ThinkingAnimation />
                            </div>
                        )
                    }

                    {/* Hidden Export Card */}
                    <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
                        <ShareableCard
                            ref={exportRef}
                            topic={topic}
                            level={level}
                            goal={goal}
                            content={messages.filter(m => m.role === 'writer').slice(-1)[0]?.content.slice(0, 300) + "..." || "..."}
                        />
                    </div>
                </>
            )}
        </div >
    );
}
