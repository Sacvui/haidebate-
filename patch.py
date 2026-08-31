import re
import os

file_path = r'd:\SE_Project\ncskt\haidebate-\components\DebateManager.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
state_addition = """    const [isDraftReady, setIsDraftReady] = useState(false);
    const [userFeedbackInput, setUserFeedbackInput] = useState("");
"""
content = re.sub(r'(const \[messages, setMessages\] = useState<AgentMessage\[\]>\(\[\]\);)', r'\1\n' + state_addition, content)

# 2. Add icons Check
content = content.replace("import { Home, ArrowRight, ArrowLeft, Bot, User, CheckCircle2, Download, Save, Info, RefreshCw, Send, Play } from 'lucide-react';", 
                          "import { Home, ArrowRight, ArrowLeft, Bot, User, CheckCircle2, Download, Save, Info, RefreshCw, Send, Play, Check } from 'lucide-react';")

# 3. Replace runStepLoop with new functions
runStepLoop_pattern = re.compile(r'const runStepLoop = async \(\) => \{.*?\n    \};\n', re.DOTALL)

new_functions = """    const generateInitialDraft = async () => {
        if (isProcessing || stepCompleted || isDraftReady) return;
        setIsProcessing(true);
        try {
            setRoundCount(1);
            const writerContent = await session.generateWriterTurn(currentStep);
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

            const criticMsg = await session.generateCriticTurn(currentStep, writerContent);
            setMessages(prev => [...prev, { role: 'critic', content: criticMsg, timestamp: Date.now(), round: currentRound }]);

            const newWriterContent = await session.generateWriterTurn(currentStep, criticMsg, false);
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
            
            const newWriterContent = await session.generateWriterTurn(currentStep, userFeedbackInput, true);
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
"""
content = runStepLoop_pattern.sub(new_functions, content)

# 4. In handleNextStep, reset states
reset_str = """
        setIsDraftReady(false);
        setStepCompleted(false);
        setShowReview(false);
        setMessages([]);
        setUserFeedbackInput("");
"""
content = content.replace("setStepCompleted(false);\n        setShowReview(false);\n        setMessages([]);", reset_str)

# 5. UI Updates
content = content.replace("""<button onClick={runStepLoop} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                <Play size={18} /> Bắt Đầu
                            </button>""", """{!isDraftReady ? (
                                <button onClick={generateInitialDraft} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                    <Play size={18} /> Bắt Đầu Viết Nháp
                                </button>
                            ) : null}""")

human_in_loop_ui = """
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
"""
content = content.replace("<div ref={bottomRef} />", human_in_loop_ui)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied successfully.")
