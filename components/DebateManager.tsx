
import React, { useState, useEffect, useRef } from 'react';
import { AgentSession, AgentMessage, WorkflowStep, AcademicLevel } from '../lib/agents';
import { Bot, User, Play, RotateCw, CheckCircle, ArrowRight, FileText, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepIndicator } from './StepIndicator';
import { MermaidChart } from './MermaidChart';
import { FinalReport } from './FinalReport';
import { ThinkingAnimation } from './ThinkingAnimation';
import { ShareableCard } from './ShareableCard';
import { motion } from 'framer-motion';

interface DebateManagerProps {
    topic: string;
    goal: string;
    audience: string;
    level: AcademicLevel;
    language: 'vi' | 'en';
    apiKey?: string;
}

// Config rounds per step
const ROUNDS_CONFIG = {
    '1_TOPIC': 2,
    '2_MODEL': 3,
    '3_OUTLINE': 3
};

// Helper: Extract Mermaid code
const extractMermaidCode = (text: string) => {
    const match = text.match(/```mermaid([\s\S]*?)```/);
    return match ? match[1].trim() : null;
};

export default function DebateManager({ topic, goal, audience, level, language, apiKey }: DebateManagerProps) {
    const [session] = useState(() => new AgentSession(topic, goal, audience, level, language, apiKey));

    const [currentStep, setCurrentStep] = useState<WorkflowStep>('1_TOPIC');
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [roundCount, setRoundCount] = useState(0);
    const [stepCompleted, setStepCompleted] = useState(false);

    // Phase 3 State
    const [showReport, setShowReport] = useState(false);
    const [variableChart, setVariableChart] = useState<string | undefined>(undefined);
    const [finalContent, setFinalContent] = useState("");

    const bottomRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null); // Ref for the shareable card

    const maxRounds = ROUNDS_CONFIG[currentStep];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (role: 'writer' | 'critic', content: string) => {
        setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
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
            // addMessage('writer', "Đang suy nghĩ..."); // Removed text loading
            writerContent = await session.generateWriterTurn(currentStep);
            setMessages(prev => {
                // const newMsgs = [...prev]; // No longer need to pop
                // newMsgs.pop(); 
                return [...prev, { role: 'writer', content: writerContent, timestamp: Date.now() }];
            });

            // Phase 3: Check for Mermaid chart in Model step
            if (currentStep === '2_MODEL') {
                const extractedChart = extractMermaidCode(writerContent);
                if (extractedChart) setVariableChart(extractedChart);
            }
            if (currentStep === '3_OUTLINE') {
                setFinalContent(prev => prev + "\n" + writerContent);
            }

            // Debate Loop
            while (currentRound < maxRounds) {
                currentRound++;
                setRoundCount(currentRound);

                // Critic Turn
                // addMessage('critic', `Đang phản biện (Vòng ${currentRound}/${maxRounds})...`);
                const criticFeedback = await session.generateCriticTurn(currentStep, writerContent);
                setMessages(prev => {
                    // const newMsgs = [...prev];
                    // newMsgs.pop();
                    return [...prev, { role: 'critic', content: criticFeedback, timestamp: Date.now() }];
                });
                lastCriticFeedback = criticFeedback;

                // Writer Updates (if not last round)
                if (currentRound < maxRounds) {
                    // addMessage('writer', "Đang tiếp thu và chỉnh sửa...");
                    writerContent = await session.generateWriterTurn(currentStep, lastCriticFeedback);
                    setMessages(prev => {
                        // const newMsgs = [...prev];
                        // newMsgs.pop();
                        return [...prev, { role: 'writer', content: writerContent, timestamp: Date.now() }];
                    });

                    if (currentStep === '2_MODEL') {
                        const extractedChart = extractMermaidCode(writerContent);
                        if (extractedChart) setVariableChart(extractedChart);
                    }
                    if (currentStep === '3_OUTLINE') {
                        setFinalContent(writerContent); // Keep latest draft
                    }
                }
            }

            setStepCompleted(true);

        } catch (error) {
            console.error("Error running debate:", error);
            addMessage('critic', "Hệ thống gặp lỗi kết nối. Vui lòng thử lại.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNextStep = () => {
        setMessages([]); // Clear chat for next step
        setRoundCount(0);
        setStepCompleted(false);

        if (currentStep === '1_TOPIC') setCurrentStep('2_MODEL');
        else if (currentStep === '2_MODEL') setCurrentStep('3_OUTLINE');
    };

    const getStepNumber = (step: WorkflowStep) => {
        if (step === '1_TOPIC') return 1;
        if (step === '2_MODEL') return 2;
        return 3;
    };

    if (showReport) {
        return (
            <FinalReport
                topic={topic}
                goal={goal}
                audience={audience}
                finalContent={finalContent}
                variableChart={variableChart}
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
                    </h2>
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

                <StepIndicator currentStep={getStepNumber(currentStep)} totalSteps={3} />

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

                    {stepCompleted && currentStep !== '3_OUTLINE' && (
                        <button
                            onClick={handleNextStep}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95 animate-bounce"
                        >
                            Chuyển Sang Bước Tiếp Theo <ArrowRight size={18} />
                        </button>
                    )}

                    {stepCompleted && currentStep === '3_OUTLINE' && (
                        <button
                            onClick={() => setShowReport(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-200"
                        >
                            <FileText size={18} /> Xem Báo Cáo Tổng Hợp
                        </button>
                    )}
                </div>
            </div>

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
                    const contentWithoutChart = msg.content.replace(/```mermaid[\s\S]*?```/, '');

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className={cn(
                                "flex gap-4 max-w-4xl",
                                msg.role === 'writer' ? "mr-auto" : "ml-auto flex-row-reverse"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                msg.role === 'writer' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                            )}>
                                {msg.role === 'writer' ? <User size={20} /> : <Bot size={20} />}
                            </div>

                            <div className={cn(
                                "p-5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap",
                                msg.role === 'writer' ? "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                                    : "bg-orange-50 text-slate-800 rounded-tr-none border border-orange-100"
                            )}>
                                <div className="font-bold mb-2 uppercase text-xs tracking-wider opacity-70">
                                    {msg.role === 'writer' ? "Người Viết (Writer)" : "Hội Đồng Phản Biện (Critic)"}
                                </div>
                                {contentWithoutChart}

                                {/* Render Mermaid Chart if exits in this message */}
                                {chartCode && (
                                    <div className="mt-4">
                                        <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">Sơ đồ minh họa:</div>
                                        <MermaidChart chart={chartCode} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Thinking Animation Overlay - Sticky Top */}
            {isProcessing && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md px-6 py-4 rounded-full border border-blue-100 shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-3">
                    <ThinkingAnimation />
                    <span className="text-sm font-bold text-slate-600 animate-pulse">AI đang suy luận...</span>
                </div>
            )}

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
        </div >
    );
}
