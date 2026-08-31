import { AgentMessage, WorkflowStep, AcademicLevel, ProjectType } from './types';
import {
    TOPIC_WRITER_PROMPT,
    TOPIC_CRITIC_PROMPT,
    LIT_REVIEW_WRITER_PROMPT,
    LIT_REVIEW_CRITIC_PROMPT,
    getModelWriterPrompt,
    getModelCriticPrompt,
    getOutlineWriterPrompt,
    OUTLINE_CRITIC_PROMPT,
    getSurveyPrompt,
    SURVEY_CRITIC_PROMPT,
} from './researchPrompts';
import {
    STARTUP_TOPIC_WRITER_PROMPT,
    STARTUP_TOPIC_CRITIC_PROMPT,
    STARTUP_MODEL_WRITER_PROMPT,
    STARTUP_MODEL_CRITIC_PROMPT,
    STARTUP_OUTLINE_WRITER_PROMPT,
    STARTUP_OUTLINE_CRITIC_PROMPT,
    STARTUP_GTM_WRITER_PROMPT,
    STARTUP_GTM_CRITIC_PROMPT,
    STARTUP_SURVEY_WRITER_PROMPT,
    STARTUP_SURVEY_CRITIC_PROMPT,
} from './startupPrompts';
import { SOFTWARE_ARCH_WRITER_PROMPT, SOFTWARE_ARCH_CRITIC_PROMPT, SOFTWARE_BENCHMARK_WRITER_PROMPT, SOFTWARE_BENCHMARK_CRITIC_PROMPT } from '../software_prompts';
import { searchPapersBySemanticScholar } from '../doiVerifier';

export class AgentSession {
    private messages: AgentMessage[] = [];
    public finalizedTopic?: string;
    public finalizedLitReview?: string;
    public finalizedModel?: string;
    public finalizedModelChart?: string;
    public finalizedArch?: string;
    public finalizedOutline?: string;
    public finalizedOutlineChart?: string;
    public finalizedGTM?: string;
    public finalizedBenchmark?: string;
    public finalizedSurvey?: string;
    private sessionId: string;
    private userId?: string;
    private contextSummary?: string;
    private static CONTEXT_SUMMARY_THRESHOLD = 30;

    constructor(
        public topic: string,
        public goal: string = "Nghiên cứu khoa học",
        public audience: string = "Chuyên gia/Nhà nghiên cứu",
        public level: AcademicLevel = "MASTER",
        public language: 'vi' | 'en' = 'vi',
        public projectType: ProjectType = 'RESEARCH',
        private writerKey?: string,
        private criticKey?: string,
        sessionId?: string,
        userId?: string,
        public paperType: string = 'quant'
    ) {
        this.sessionId = sessionId || `session_${Date.now()} `;
        this.userId = userId;
    }

    public updateTopic(newTopic: string) {
        this.topic = newTopic;
        this.finalizedTopic = newTopic;
    }

    public setFinalizedTopic(topic: string) {
        this.finalizedTopic = topic;
    }

    public setFinalizedLitReview(litReview: string) {
        this.finalizedLitReview = litReview;
    }

    public setFinalizedArch(arch: string) {
        this.finalizedArch = arch;
    }

    public setFinalizedBenchmark(benchmark: string) {
        this.finalizedBenchmark = benchmark;
    }

    public setFinalizedModel(model: string, chart?: string) {
        this.finalizedModel = model;
        this.finalizedModelChart = chart;
    }

    public setFinalizedOutline(outline: string, chart?: string) {
        this.finalizedOutline = outline;
        this.finalizedOutlineChart = chart;
    }

    public setFinalizedGTM(gtm: string) {
        this.finalizedGTM = gtm;
    }

    public setFinalizedSurvey(survey: string) {
        this.finalizedSurvey = survey;
    }

    public getSessionId(): string {
        return this.sessionId;
    }

    public getContextSummary(): string | undefined {
        return this.contextSummary;
    }

    public setContextSummary(summary: string): void {
        this.contextSummary = summary;
    }

    public async generateContextSummary(): Promise<string | null> {
        if (this.messages.length < AgentSession.CONTEXT_SUMMARY_THRESHOLD) {
            return null;
        }

        const summaryPrompt = `
  Bạn là trợ lý tóm tắt hội thoại. Hãy tóm tắt các ĐIỂM ĐÃ CHỐT sau từ cuộc hội thoại:

  Đề tài: ${this.topic}
  Loại dự án: ${this.projectType}

${this.finalizedTopic ? `✅ Ý tưởng/Đề tài đã chốt: ${this.finalizedTopic}` : ''}
${this.finalizedModel ? `✅ Mô hình đã chốt: ${this.finalizedModel.substring(0, 500)}...` : ''}
${this.finalizedOutline ? `✅ Đề cương đã chốt: ${this.finalizedOutline.substring(0, 500)}...` : ''}
${this.finalizedGTM ? `✅ GTM đã chốt: ${this.finalizedGTM.substring(0, 500)}...` : ''}

YÊU CẦU: Tóm tắt trong 5 - 7 bullet points ngắn gọn. Tập trung vào các quyết định quan trọng và hướng đi đã thống nhất.
    `;

        try {
            const summary = await this.callGeminiAPI(this.getPrimaryModel(), summaryPrompt, this.writerKey);
            this.contextSummary = summary;
            return summary;
        } catch (e) {
            console.error('Failed to generate context summary:', e);
            return null;
        }
    }

    public isUsingSameKey(): boolean {
        return this.writerKey === this.criticKey || (!this.criticKey && !!this.writerKey);
    }

    // Primary and fallback models
    private getPrimaryModel(): string {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('gemini_custom_model') || 'gemini-3.6-flash';
        }
        return 'gemini-3.6-flash';
    }
    private getFallbackModel(): string {
        return 'gemini-3.5-pro';
    }

    private async callGeminiAPI(model: string, prompt: string, customKey?: string, retries = 3, useFallback = false, onProgress?: (text: string) => void): Promise<string> {
        const currentModel = useFallback ? this.getFallbackModel() : model;

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (customKey) {
                headers['x-gemini-api-key'] = customKey;
            }

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    model: currentModel,
                    prompt,
                    useCustomKey: !!customKey,
                    userId: this.userId
                })
            });

            if (!response.ok) {
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
                const lines = buffer.split('\n');
                
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

            return fullText || "Lỗi: Không có phản hồi từ AI.";

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            const isRetryableError = error.message?.includes('fetch') || 
                                     error.message?.includes('network') || 
                                     error.message?.includes('SERVER_TIMEOUT') ||
                                     error.message?.includes('JSON');
            
            if (retries > 0 && isRetryableError) {
                console.warn(`Transient error, retrying... (${retries} left)`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                return this.callGeminiAPI(model, prompt, customKey, retries - 1, useFallback, onProgress);
            }
            throw error;
        }
    }

    async generateWriterTurn(step: WorkflowStep, previousCriticFeedback?: string, isUserFeedback?: boolean, onProgress?: (text: string) => void): Promise<string> {
        try {
            const finalKey = this.writerKey;
            if (!finalKey) {
                return "CHƯA CẤU HÌNH API KEY: Vui lòng vào Cài đặt để nhập API Key của bạn. Hệ thống không còn dùng key mặc định.";
            }

            let sysPrompt = "";
            let contextAddition = "";

            if (this.contextSummary) {
                contextAddition += `\n\n📌 TÓM TẮT CÁC ĐIỂM ĐÃ CHỐT: \n${this.contextSummary} \n\n`;
            }

            if (this.projectType === 'STARTUP') {
                switch (step) {
                    case '1_TOPIC':
                        sysPrompt = STARTUP_TOPIC_WRITER_PROMPT;
                        break;
                    case '2_MODEL':
                        sysPrompt = STARTUP_MODEL_WRITER_PROMPT;
                        if (this.finalizedTopic) {
                            contextAddition = `\n\nÝ TƯỞNG KINH DOANH ĐÃ PHÊ DUYỆT: \n"${this.finalizedTopic}"`;
                        }
                        break;
                    case '3_OUTLINE':
                        sysPrompt = STARTUP_OUTLINE_WRITER_PROMPT;
                        if (this.finalizedTopic) {
                            contextAddition += `\n\nÝ TƯỞNG KINH DOANH: \n"${this.finalizedTopic}"`;
                        }
                        if (this.finalizedModel) {
                            contextAddition += `\n\nLEAN CANVAS ĐÃ PHÊ DUYỆT: \n${this.finalizedModel.substring(0, 1500)}...`;
                        }
                        if (this.finalizedModelChart) {
                            contextAddition += `\n\nSƠ ĐỒ BUSINESS MODEL: \n\`\`\`mermaid\n${this.finalizedModelChart}\n\`\`\``;
                        }
                        if (this.finalizedSurvey) {
                            contextAddition += `\n\nCUSTOMER DISCOVERY (Insight khảo sát): \n${this.finalizedSurvey.substring(0, 1000)}...`;
                        }
                        if (this.finalizedGTM) {
                            contextAddition += `\n\nGTM STRATEGY (Chiến lược ra mắt): \n${this.finalizedGTM.substring(0, 1000)}...`;
                        }
                        break;
                    case '5_GTM':
                        sysPrompt = STARTUP_GTM_WRITER_PROMPT;
                        if (this.finalizedTopic) {
                            contextAddition += `\n\nÝ TƯỞNG: "${this.finalizedTopic}"`;
                        }
                        if (this.finalizedModel) {
                            contextAddition += `\n\nLEAN CANVAS: ${this.finalizedModel.substring(0, 1500)}...`;
                        }
                        if (this.finalizedSurvey) {
                            contextAddition += `\n\nCUSTOMER DISCOVERY: ${this.finalizedSurvey.substring(0, 1000)}...`;
                        }
                        break;
                    case '4_SURVEY':
                        sysPrompt = STARTUP_SURVEY_WRITER_PROMPT;
                        if (this.finalizedTopic) {
                            contextAddition += `\n\nÝ TƯỞNG: "${this.finalizedTopic}"`;
                        }
                        if (this.finalizedModel) {
                            contextAddition += `\n\nLEAN CANVAS: ${this.finalizedModel.substring(0, 1500)}...`;
                        }
                        break;
                }
            } else {
                switch (step) {
                    case '1_TOPIC':
                        sysPrompt = TOPIC_WRITER_PROMPT;
                        break;
                    case '1_LIT_REVIEW':
                        sysPrompt = LIT_REVIEW_WRITER_PROMPT;
                        if (this.finalizedTopic) {
                            contextAddition += `\n\nĐỀ TÀI CHÍNH THỨC: "${this.finalizedTopic}"`;
                            
                            // RAG Injection for real papers
                            if (!previousCriticFeedback) { // Only fetch on the first round to save time/bandwidth
                                try {
                                    console.log("Fetching real papers from Semantic Scholar for RAG...");
                                    const papers = await searchPapersBySemanticScholar(this.finalizedTopic, 5);
                                    if (papers.length > 0) {
                                        contextAddition += `\n\n[DỮ LIỆU RAG - BẮT BUỘC SỬ DỤNG]\nDưới đây là thông tin và tóm tắt (Abstract) của ${papers.length} bài báo CÓ THẬT được trích xuất từ Semantic Scholar. \nBạn BẮT BUỘC phải trích dẫn và tổng hợp từ các bài báo này, TUYỆT ĐỐI không bịa thêm nguồn khác:\n\n`;
                                        papers.forEach((p: any, idx: number) => {
                                            contextAddition += `Bài ${idx + 1}:\n- Tiêu đề: ${p.title}\n- Tác giả: ${p.authors} (${p.year})\n- Tạp chí/Hội nghị: ${p.venue}\n- DOI: ${p.doi}\n- Tóm tắt: ${p.abstract}\n\n`;
                                        });
                                    }
                                } catch (e) {
                                    console.error("Failed to fetch RAG context:", e);
                                }
                            }
                        }
                        break;
                    case '2_MODEL':
                        sysPrompt = getModelWriterPrompt(this.level, this.paperType);
                        if (this.finalizedTopic) {
                            contextAddition = `\n\nĐỀ TÀI ĐÃ ĐƯỢC PHÊ DUYỆT (sử dụng làm nền tảng):\n"${this.finalizedTopic}"`;
                        }
                        if (this.finalizedLitReview) {
                            contextAddition += `\n\nTỔNG QUAN TÀI LIỆU (Lit Review) ĐÃ PHÊ DUYỆT:\n${this.finalizedLitReview.substring(0, 1500)}...`;
                        }
                        break;
                    case '3_OUTLINE':
                        sysPrompt = getOutlineWriterPrompt(this.goal);
                        if (this.finalizedTopic) {
                            contextAddition += `\n\nĐỀ TÀI ĐÃ PHÊ DUYỆT:\n"${this.finalizedTopic}"`;
                        }
                        if (this.finalizedModel) {
                            contextAddition += `\n\nMÔ HÌNH LÝ THUYẾT ĐÃ PHÊ DUYỆT:\n${this.finalizedModel.substring(0, 1000)}...`;
                        }
                        if (this.finalizedModelChart) {
                            contextAddition += `\n\nSƠ ĐỒ MÔ HÌNH:\n\`\`\`mermaid\n${this.finalizedModelChart}\n\`\`\``;
                        }
                        if (this.finalizedSurvey) {
                            contextAddition += `\n\nPHƯƠNG PHÁP NGHIÊN CỨU ĐÃ PHÊ DUYỆT:\n${this.finalizedSurvey.substring(0, 1500)}...`;
                        }
                        if (this.finalizedBenchmark) {
                            contextAddition += `\n\nKẾT QUẢ KIỂM THỬ ĐÃ PHÊ DUYỆT:\n${this.finalizedBenchmark.substring(0, 1500)}...`;
                        }
                        break;
                    case '2_ARCH':
                        sysPrompt = SOFTWARE_ARCH_WRITER_PROMPT;
                        if (this.finalizedTopic) contextAddition = `\n\nĐỀ TÀI: "${this.finalizedTopic}"`;
                        if (this.finalizedLitReview) {
                            contextAddition += `\n\nTỔNG QUAN TÀI LIỆU (Lit Review):\n${this.finalizedLitReview.substring(0, 1500)}...`;
                        }
                        break;
                    case '4_BENCHMARK':
                        sysPrompt = SOFTWARE_BENCHMARK_WRITER_PROMPT;
                        if (this.finalizedTopic) contextAddition += `\n\nĐỀ TÀI: "${this.finalizedTopic}"`;
                        if (this.finalizedArch) contextAddition += `\n\nKIẾN TRÚC: ${this.finalizedArch.substring(0, 1500)}...`;
                        else if (this.finalizedModel) contextAddition += `\n\nKIẾN TRÚC: ${this.finalizedModel.substring(0, 1500)}...`;
                        break;
                    case '4_SURVEY':
                        sysPrompt = getSurveyPrompt(this.level, this.paperType);
                        if (this.finalizedTopic) {
                            contextAddition += `\n\nĐỀ TÀI: "${this.finalizedTopic}"`;
                        }
                        if (this.finalizedModel) {
                            contextAddition += `\n\nMÔ HÌNH: ${this.finalizedModel.substring(0, 1500)}...`;
                        }
                        break;
                }
            }

            let languageInstruction = this.language === 'en' 
                ? 'ENGLISH (100%). CRITICAL: DO NOT translate word-for-word from Vietnamese. Use standard, native Academic/Business English terminology. Ensure ALL text, headings, tables, and Mermaid chart labels are completely in English. The writing style MUST be formal and adhere strictly to international standards.'
                : 'VIETNAMESE (100%)';

            const context = `CHỦ ĐỀ GỐC: ${this.topic}\nLOẠI HÌNH (OUTPUT): ${this.goal}\nĐỐI TƯỢNG: ${this.audience}\nTRÌNH ĐỘ: ${this.level}\nNGÔN NGỮ ĐẦU RA (OUTPUT LANGUAGE): ${languageInstruction}${contextAddition}`;

            let feedbackStr = "";
            if (previousCriticFeedback) {
                if (isUserFeedback) {
                    feedbackStr = `\n\nYÊU CẦU TỪ GIÁO SƯ HƯỚNG DẪN (BẮT BUỘC TUÂN THỦ):\n${previousCriticFeedback}\n\nHãy sửa lại bản nháp dựa trên yêu cầu này.`;
                } else {
                    feedbackStr = `\n\nPHẢN HỒI CỦA CRITIC (Vòng trước): \n${previousCriticFeedback}\n\nHãy cải thiện/viết tiếp dựa trên phản hồi này.`;
                }
            }

            const prompt = `${context}${feedbackStr}\n\n${sysPrompt}\nHãy bắt đầu thực hiện nhiệm vụ cho giai đoạn này.`;

            return await this.callGeminiAPI(this.getPrimaryModel(), prompt, finalKey, 3, false, onProgress);

        } catch (error: any) {
            console.error("Gemini Writer Error:", error);
            return `Lỗi AI: ${error.message || error}`;
        }
    }

    async generateCriticTurn(step: WorkflowStep, writerDraft: string, onProgress?: (text: string) => void): Promise<string> {
        const geminiKey = this.criticKey || this.writerKey;

        if (!geminiKey) {
            return "CHƯA CẤU HÌNH API KEY: Vui lòng vào Cài đặt để nhập API Key.";
        }
        try {
            let sysPrompt = "";

            if (this.projectType === 'STARTUP') {
                switch (step) {
                    case '1_TOPIC': sysPrompt = STARTUP_TOPIC_CRITIC_PROMPT; break;
                    case '2_MODEL': sysPrompt = STARTUP_MODEL_CRITIC_PROMPT; break;
                    case '3_OUTLINE': sysPrompt = STARTUP_OUTLINE_CRITIC_PROMPT; break;
                    case '4_SURVEY': sysPrompt = STARTUP_SURVEY_CRITIC_PROMPT; break;
                    case '5_GTM': sysPrompt = STARTUP_GTM_CRITIC_PROMPT; break;
                }
            } else {
                switch (step) {
                    case '1_TOPIC': sysPrompt = TOPIC_CRITIC_PROMPT; break;
                    case '1_LIT_REVIEW': sysPrompt = LIT_REVIEW_CRITIC_PROMPT; break;
                    case '2_MODEL': sysPrompt = getModelCriticPrompt(this.level, this.paperType); break;
                    case '3_OUTLINE': sysPrompt = OUTLINE_CRITIC_PROMPT; break;
                    case '4_SURVEY': sysPrompt = SURVEY_CRITIC_PROMPT; break;
                    case '2_ARCH': sysPrompt = SOFTWARE_ARCH_CRITIC_PROMPT; break;
                    case '4_BENCHMARK': sysPrompt = SOFTWARE_BENCHMARK_CRITIC_PROMPT; break;
                }
            }

            let languageInstruction = this.language === 'en'
                ? 'ENGLISH. CRITICAL: Rigorously evaluate if the text uses native Academic/Business English. Penalize any awkward translations from Vietnamese (Vinglish). ALL charts, headings, and data MUST be in English. Force the Writer to fix unnatural phrasing.'
                : 'VIETNAMESE';

            const context = `TRÌNH ĐỘ: ${this.level}\nĐỐI TƯỢNG: ${this.audience}\nĐỀ TÀI: ${this.topic}\nLOẠI HÌNH: ${this.goal}\nNGÔN NGỮ: ${languageInstruction}`;

            const prompt = `${context}\n\n${sysPrompt}\n\nBÀI LÀM CỦA WRITER:\n${writerDraft}\n\nHãy đóng vai trò Critic và đưa ra nhận xét chi tiết, khắt khe.`;

            return await this.callGeminiAPI(this.getPrimaryModel(), prompt, geminiKey, 3, false, onProgress);

        } catch (error) {
            return `Lỗi Critic (Quota/Network): ${error}`;
        }
    }
}
