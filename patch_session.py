import re

file_path = r'd:\SE_Project\ncskt\haidebate-\lib\agents\AgentSession.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update callGeminiAPI signature
content = content.replace("private async callGeminiAPI(model: string, prompt: string, customKey?: string, retries = 3, useFallback = false): Promise<string> {", "private async callGeminiAPI(model: string, prompt: string, customKey?: string, retries = 3, useFallback = false, onProgress?: (text: string) => void): Promise<string> {")

callGeminiAPI_old = re.compile(r'            let data;.*?            return data\.text \|\| "Lỗi: Không có phản hồi từ AI\.";', re.DOTALL)

callGeminiAPI_new = """            if (!response.ok) {
                let data;
                try {
                    const rawText = await response.text();
                    data = JSON.parse(rawText);
                } catch (jsonError) {
                    throw new Error("SERVER_TIMEOUT_OR_502");
                }
                const errorMsg = data?.error || 'Unknown error';

                if (response.status === 429 || response.status === 503) {
                    if (retries > 0 && !useFallback) {
                        await new Promise(resolve => setTimeout(resolve, 10000 * (4 - retries)));
                        return this.callGeminiAPI(model, prompt, customKey, retries - 1, false, onProgress);
                    }
                    if (!useFallback) {
                        return this.callGeminiAPI(model, prompt, customKey, 2, true, onProgress);
                    }
                    throw new Error(`Cả hai model đều hết quota. Vui lòng thử lại sau hoặc dùng API Key riêng.`);
                }
                if (response.status === 401) {
                    throw new Error(`Vui lòng đăng nhập để sử dụng tính năng AI.`);
                }
                throw new Error(errorMsg);
            }

            // Stream reading
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response body");
            
            const decoder = new TextDecoder();
            let fullText = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\\n');
                
                // Keep the last incomplete line in buffer
                buffer = lines.pop() || "";
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.replace('data: ', '').trim();
                        if (jsonStr === '[DONE]') continue;
                        if (!jsonStr) continue;
                        
                        try {
                            const parsed = JSON.parse(jsonStr);
                            const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (chunkText) {
                                fullText += chunkText;
                                if (onProgress) onProgress(fullText);
                            }
                        } catch (e) {
                            // ignore parse errors for partial chunks
                        }
                    }
                }
            }

            return fullText || "Lỗi: Không có phản hồi từ AI.";"""

content = callGeminiAPI_old.sub(lambda m: callGeminiAPI_new, content)

# Update generateWriterTurn and generateCriticTurn to support onProgress
content = content.replace("async generateWriterTurn(step: WorkflowStep, previousCriticFeedback?: string, isUserFeedback?: boolean): Promise<string> {", "async generateWriterTurn(step: WorkflowStep, previousCriticFeedback?: string, isUserFeedback?: boolean, onProgress?: (text: string) => void): Promise<string> {")
content = content.replace("return await this.callGeminiAPI(this.getPrimaryModel(), prompt, finalKey);", "return await this.callGeminiAPI(this.getPrimaryModel(), prompt, finalKey, 3, false, onProgress);")

content = content.replace("async generateCriticTurn(step: WorkflowStep, writerDraft: string): Promise<string> {", "async generateCriticTurn(step: WorkflowStep, writerDraft: string, onProgress?: (text: string) => void): Promise<string> {")
content = content.replace("return await this.callGeminiAPI(this.getPrimaryModel(), prompt, geminiKey);", "return await this.callGeminiAPI(this.getPrimaryModel(), prompt, geminiKey, 3, false, onProgress);")
content = content.replace("return await this.callGeminiAPI(this.getPrimaryModel(), summaryPrompt, this.writerKey);", "return await this.callGeminiAPI(this.getPrimaryModel(), summaryPrompt, this.writerKey, 3, false, onProgress);")

# Update retry recursive calls
content = content.replace("return this.callGeminiAPI(model, prompt, customKey, retries - 1, useFallback);", "return this.callGeminiAPI(model, prompt, customKey, retries - 1, useFallback, onProgress);")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch session applied successfully.")
