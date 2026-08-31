import re

file_path = r'd:\SE_Project\ncskt\haidebate-\components\DebateManager.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add streaming state
state_addition = """    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState<string>("");
"""
content = re.sub(r'(const \[isDraftReady, setIsDraftReady\] = useState\(false\);)', r'\1\n' + state_addition, content)

# 2. Patch generateInitialDraft
generateInitialDraft_old = re.compile(r'const writerContent = await session\.generateWriterTurn\(currentStep\);', re.DOTALL)
generateInitialDraft_new = """setIsStreaming(true);
            const writerContent = await session.generateWriterTurn(currentStep, undefined, undefined, (text) => setStreamingContent(text));
            setIsStreaming(false);
            setStreamingContent("");"""
content = generateInitialDraft_old.sub(generateInitialDraft_new, content)

# 3. Patch handleCriticReview
criticMsg_old = re.compile(r'const criticMsg = await session\.generateCriticTurn\(currentStep, writerContent\);', re.DOTALL)
criticMsg_new = """setIsStreaming(true);
            const criticMsg = await session.generateCriticTurn(currentStep, writerContent, (text) => setStreamingContent(text));
            setIsStreaming(false);
            setStreamingContent("");"""
content = criticMsg_old.sub(criticMsg_new, content)

writerContent2_old = re.compile(r'const newWriterContent = await session\.generateWriterTurn\(currentStep, criticMsg, false\);', re.DOTALL)
writerContent2_new = """setIsStreaming(true);
            const newWriterContent = await session.generateWriterTurn(currentStep, criticMsg, false, (text) => setStreamingContent(text));
            setIsStreaming(false);
            setStreamingContent("");"""
content = writerContent2_old.sub(writerContent2_new, content)

# 4. Patch handleUserReview
writerContent3_old = re.compile(r'const newWriterContent = await session\.generateWriterTurn\(currentStep, userFeedbackInput, true\);', re.DOTALL)
writerContent3_new = """setIsStreaming(true);
            const newWriterContent = await session.generateWriterTurn(currentStep, userFeedbackInput, true, (text) => setStreamingContent(text));
            setIsStreaming(false);
            setStreamingContent("");"""
content = writerContent3_old.sub(writerContent3_new, content)

# 5. Add UI for streaming
ui_streaming = """
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
"""
content = content.replace("{isDraftReady && !stepCompleted && (", ui_streaming)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch UI applied successfully.")
