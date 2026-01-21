"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Bot, User, CheckCircle, ArrowRight, ArrowLeft, FileText, Download, Share2, Home } from 'lucide-react';
import { AgentSession, WorkflowStep, AcademicLevel, ProjectType, AgentMessage } from '@/lib/agents';
import { StepIndicator } from './StepIndicator';
import { ThinkingAnimation } from './ThinkingAnimation';
import { StepReview } from './StepReview';
import { ShareableCard } from './ShareableCard';
import { ExportManager } from './ExportManager';
import { FinalReport } from './FinalReport';
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
    onNewProject
}: DebateManagerProps) {
    const [messages, setMessages] = useState<AgentMessage[]>([]);
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

    // State for captured outputs
    const [variableChart, setVariableChart] = useState<string>("");
    const [finalContent, setFinalContent] = useState<string>("");
    const [outlineContent, setOutlineContent] = useState<string>("");
    const [outlineChart, setOutlineChart] = useState<string>("");
    const [gtmContent, setGtmContent] = useState<string>("");
    const [surveyContent, setSurveyContent] = useState<string>("");

    const [session] = useState(() => new AgentSession(
        topic, goal, audience, level, language as 'vi' | 'en', projectType, apiKey, apiKeyCritic, sessionId, userId
    ));

    const bottomRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    // Initial load from storage if sessionId exists
    useEffect(() => {
        if (sessionId) {
            const loadData = async () => {
                const project = await getProject(sessionId);
                if (project && project.data) {
                    const data = project.data;
                    if (data.messages) setMessages(data.messages);
                    if (project.currentStep) setCurrentStep(project.currentStep);
                    if (data.mermaid) setVariableChart(data.mermaid);
                    if (data.finalContent) setFinalContent(data.finalContent);
                    if (data.outlineContent) setOutlineContent(data.outlineContent);
                    if (data.outlineChart) setOutlineChart(data.outlineChart);
                    if (data.gtmContent) setGtmContent(data.gtmContent);
                    if (data.surveyContent) setSurveyContent(data.surveyContent);
                }
            };
            loadData();
        }
    }, [sessionId]);

    // Auto-save logic
    useEffect(() => {
        if (sessionId && session) {
            saveToProjectStorage();
        }
    }, [messages, currentStep, stepCompleted, roundCount, variableChart, finalContent, outlineContent, gtmContent, surveyContent, sessionId, session]);

    const saveToProjectStorage = async () => {
        if (!sessionId) return;
        const existing = await getProject(sessionId);
        if (existing) {
            const updated: SavedProject = {
                ...existing,
                currentStep,
                updatedAt: new Date().toISOString(),
                data: {
                    ...existing.data,
                    messages: messages,
                    mermaid: variableChart,
                    outlineContent,
                    outlineChart,
                    gtmContent,
                    surveyContent,
                    completedAt: stepCompleted ? new Date().toISOString() : undefined
                }
            };
            if (currentStep === '1_TOPIC' && session.finalizedTopic) {
                updated.topic = session.finalizedTopic;
            }
            await saveProject(updated);
            setLastSaved(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
            setMessages(prev => [...prev, { role: 'writer', content: writerContent, timestamp: Date.now(), round: 1 }]);

            if (currentStep === '2_MODEL') {
                const chart = extractMermaidCode(writerContent);
                if (chart) setVariableChart(chart);
            }
            if (currentStep === '3_OUTLINE') {
                setOutlineContent(writerContent);
                const chart = extractMermaidCode(writerContent);
                if (chart) setOutlineChart(chart);
            }
            if (currentStep === '4_SURVEY') setSurveyContent(writerContent);
            if (currentStep === '5_GTM') setGtmContent(writerContent);

            // Debate Loop
            while (currentRound < maxRounds) {
                const delayTime = session.isUsingSameKey() ? 4000 : 1000;
                await new Promise(r => setTimeout(r, delayTime));
                currentRound++;
                setRoundCount(currentRound);

                // Critic
                const criticMsg = await session.generateCriticTurn(currentStep, writerContent);
                setMessages(prev => [...prev, { role: 'critic', content: criticMsg, timestamp: Date.now(), round: currentRound }]);
                lastCriticFeedback = criticMsg;

                if (currentRound < maxRounds) {
                    await new Promise(r => setTimeout(r, delayTime));
                    writerContent = await session.generateWriterTurn(currentStep, lastCriticFeedback);
                    setMessages(prev => [...prev, { role: 'writer', content: writerContent, timestamp: Date.now(), round: currentRound + 1 }]);

                    if (currentStep === '2_MODEL') { const c = extractMermaidCode(writerContent); if (c) setVariableChart(c); }
                    if (currentStep === '3_OUTLINE') { setOutlineContent(writerContent); const c = extractMermaidCode(writerContent); if (c) setOutlineChart(c); }
                    if (currentStep === '4_SURVEY') setSurveyContent(writerContent);
                    if (currentStep === '5_GTM') setGtmContent(writerContent);
                }
            }
            setStepCompleted(true);
            setShowReview(true);
        } catch (error) {
            console.error("Error in debate:", error);
            addMessage('critic', "Hệ thống gặp lỗi kết nối. Đang thử lại...");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinalize = async (userFinal: string, note?: string) => {
        if (!userId || !sessionId) return;
        try {
            if (currentStep === '1_TOPIC') session.setFinalizedTopic(userFinal);
            else if (currentStep === '2_MODEL') session.setFinalizedModel(userFinal, variableChart);
            else if (currentStep === '3_OUTLINE') session.setFinalizedOutline(userFinal, outlineChart);
            else if (currentStep === '5_GTM') session.setFinalizedGTM(userFinal);
            else if (currentStep === '4_SURVEY') session.setFinalizedSurvey(userFinal);

            handleNextStep();
        } catch (error) {
            console.error('Finalize error:', error);
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

        if (currentStep === '1_TOPIC') setCurrentStep('2_MODEL');
        else if (currentStep === '2_MODEL') setCurrentStep('3_OUTLINE');
        else if (currentStep === '3_OUTLINE') setCurrentStep(projectType === 'STARTUP' ? '5_GTM' : '4_SURVEY');
        else if (currentStep === '5_GTM') setCurrentStep('4_SURVEY');

        setMessages([]);
        setRoundCount(0);
        setStepCompleted(false);
        setShowReview(false);
    };

    const handlePreviousStep = () => {
        if (currentStep === '2_MODEL') setCurrentStep('1_TOPIC');
        else if (currentStep === '3_OUTLINE') setCurrentStep('2_MODEL');
        else if (currentStep === '5_GTM') setCurrentStep('3_OUTLINE');
        else if (currentStep === '4_SURVEY') setCurrentStep(projectType === 'STARTUP' ? '5_GTM' : '3_OUTLINE');

        setMessages([]);
        setRoundCount(0);
        setStepCompleted(true);
        setShowReview(true);
    };

    const getStepNumber = (step: WorkflowStep) => {
        if (step === '1_TOPIC') return 1;
        if (step === '2_MODEL') return 2;
        if (step === '3_OUTLINE') return 3;
        if (step === '5_GTM') return 4;
        if (step === '4_SURVEY') return projectType === 'STARTUP' ? 5 : 4;
        return 5;
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
                gtmContent={session.finalizedGTM || gtmContent}
                surveyContent={session.finalizedSurvey || surveyContent}
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
            />
        );
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {currentStep === '1_TOPIC' && "Giai Đoạn 1: Thẩm Định Đề Tài"}
                        {currentStep === '2_MODEL' && "Giai Đoạn 2: Xây Dựng Mô Hình"}
                        {currentStep === '3_OUTLINE' && (projectType === 'STARTUP' ? "Giai Đoạn 3: Pitch Deck" : "Giai Đoạn 3: Hoàn Thiện Đề Cương")}
                        {currentStep === '5_GTM' && "Giai Đoạn 4: Chiến lược Ra mắt"}
                        {currentStep === '4_SURVEY' && (projectType === 'STARTUP' ? "Giai Đoạn 5: Customer Discovery" : "Giai Đoạn 4: Xây Dựng Bảng Hỏi")}
                    </h2>
                    <button onClick={() => { saveToProjectStorage(); if (onExit) onExit(); }} className="p-2 text-slate-400 hover:text-blue-600">
                        <Home size={20} />
                    </button>
                    <div className="flex gap-2">
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">Mục tiêu: {goal}</span>
                        <span className={cn("px-3 py-1 rounded-full text-white text-xs", level === 'UNDERGRAD' ? 'bg-green-500' : 'bg-blue-500')}>Trình độ: {level}</span>
                    </div>
                </div>
                <StepIndicator currentStep={getStepNumber(currentStep)} totalSteps={projectType === 'STARTUP' ? 5 : 4} projectType={projectType} />
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm font-medium text-slate-500">
                        Trạng thái: {isProcessing ? "Đang xử lý..." : stepCompleted ? "Đã hoàn thành" : "Sẵn sàng"}
                        {lastSaved && <span className="ml-4 text-[10px] text-slate-400 italic">Đã lưu: {lastSaved}</span>}
                    </div>
                    {!isProcessing && !stepCompleted && (
                        <button onClick={runStepLoop} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                            <Play size={18} /> Bắt Đầu
                        </button>
                    )}
                    {stepCompleted && (
                        <div className="flex gap-2">
                            {currentStep !== '1_TOPIC' && <button onClick={handlePreviousStep} className="bg-slate-100 px-4 py-2 rounded-lg">Quay lại</button>}
                            <button onClick={() => setShowReview(true)} className="bg-white border px-4 py-2 rounded-lg">Chỉnh sửa</button>
                            {currentStep === (projectType === 'STARTUP' ? '4_SURVEY' : '4_SURVEY') ? (
                                <button onClick={() => setShowExport(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Export</button>
                            ) : (
                                <button onClick={handleNextStep} className="bg-green-600 text-white px-6 py-2 rounded-lg">Tiếp theo</button>
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
                />
            ) : (
                <div className="flex-1 bg-slate-50 rounded-xl border p-6 overflow-y-auto min-h-[500px] mb-8 space-y-6">
                    {messages.length === 0 && <div className="text-center text-slate-400 mt-20"><Bot size={48} className="mx-auto" /><p>Nhấn Bắt Đầu</p></div>}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn("flex gap-4", msg.role === 'writer' ? "justify-start" : "justify-start flex-row-reverse")}>
                            <div className={cn("p-1 rounded-full h-8 w-8 flex-shrink-0", msg.role === 'writer' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600")}>
                                {msg.role === 'writer' ? <Bot size={24} /> : <User size={24} />}
                            </div>
                            <div className={cn("max-w-[80%] p-4 rounded-xl shadow-sm", msg.role === 'writer' ? "bg-white border" : "bg-purple-50 border-purple-100")}>
                                <div className="prose prose-slate max-w-none text-sm">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}
            {isProcessing && <div className="fixed bottom-6 left-1/2 -translate-x-1/2"><ThinkingAnimation /></div>}
        </div>
    );
}
