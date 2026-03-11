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
import { SOFTWARE_ARCH_WRITER_PROMPT, SOFTWARE_ARCH_CRITIC_PROMPT, SOFTWARE_BENCHMARK_WRITER_PROMPT } from '../software_prompts';

export class AgentSession {
    private messages: AgentMessage[] = [];
    public finalizedTopic?: string;
    public finalizedModel?: string;
    public finalizedModelChart?: string;
    public finalizedOutline?: string;
    public finalizedOutlineChart?: string;
    public finalizedGTM?: string;
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
        userId?: string
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
            const summary = await this.callGeminiAPI(AgentSession.PRIMARY_MODEL, summaryPrompt);
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
    private static PRIMARY_MODEL = 'gemini-3-flash-preview';
    private static FALLBACK_MODEL = 'gemini-flash-latest';

    private async callGeminiAPI(model: string, prompt: string, customKey?: string, retries = 3, useFallback = false): Promise<string> {
        const currentModel = useFallback ? AgentSession.FALLBACK_MODEL : model;

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
                    useCustomKey: !!customKey
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || 'Unknown error';

                console.error(`🚨 Gemini Proxy Error: `, {
                    model: currentModel,
                    status: response.status,
                    message: errorMsg,
                    retriesLeft: retries,
                    useFallback
                });

                if (response.status === 429 || response.status === 503) {
                    if (retries > 0 && !useFallback) {
                        const waitTime = 10000 * (4 - retries);
                        console.warn(`⚠️ Rate Limit on ${currentModel}.Retrying in ${waitTime / 1000}s... (${retries} retries left)`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        return this.callGeminiAPI(model, prompt, customKey, retries - 1, false);
                    }

                    if (!useFallback) {
                        console.warn(`🔄 Switching to fallback model: ${AgentSession.FALLBACK_MODEL} `);
                        return this.callGeminiAPI(model, prompt, customKey, 2, true);
                    }

                    throw new Error(`Cả hai model đều hết quota. Vui lòng thử lại sau hoặc dùng API Key riêng.`);
                }

                if (response.status === 401) {
                    throw new Error(`Vui lòng đăng nhập để sử dụng tính năng AI.`);
                }

                throw new Error(errorMsg);
            }

            if (useFallback) {
                console.log(`✅ Fallback model ${currentModel} succeeded!`);
            }

            return data.text || "Lỗi: Không có phản hồi từ AI.";

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (retries > 0 && (error.message?.includes('fetch') || error.message?.includes('network'))) {
                console.warn(`Network error, retrying... (${retries} left)`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                return this.callGeminiAPI(model, prompt, customKey, retries - 1, useFallback);
            }
            throw error;
        }
    }

    async generateWriterTurn(step: WorkflowStep, previousCriticFeedback?: string): Promise<string> {
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
                        break;
                    case '5_GTM':
                        sysPrompt = STARTUP_GTM_WRITER_PROMPT;
                        if (this.finalizedTopic) {
                            contextAddition += `\n\nÝ TƯỞNG: "${this.finalizedTopic}"`;
                        }
                        if (this.finalizedModel) {
                            contextAddition += `\n\nLEAN CANVAS: ${this.finalizedModel.substring(0, 1500)}...`;
                        }
                        if (this.finalizedOutline) {
                            contextAddition += `\n\nPITCH DECK: ${this.finalizedOutline.substring(0, 1000)}...`;
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
                        if (this.finalizedOutline) {
                            contextAddition += `\n\nPITCH DECK: ${this.finalizedOutline.substring(0, 1500)}...`;
                        }
                        if (this.finalizedGTM) {
                            contextAddition += `\n\nCHIẾN LƯỢC GTM: ${this.finalizedGTM.substring(0, 1500)}...`;
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
                        }
                        break;
                    case '2_MODEL':
                        sysPrompt = getModelWriterPrompt(this.level);
                        if (this.finalizedTopic) {
                            contextAddition = `\n\nĐỀ TÀI ĐÃ ĐƯỢC PHÊ DUYỆT (sử dụng làm nền tảng):\n"${this.finalizedTopic}"`;
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
                        break;
                    case '2_ARCH':
                        sysPrompt = SOFTWARE_ARCH_WRITER_PROMPT;
                        if (this.finalizedTopic) contextAddition = `\n\nĐỀ TÀI: "${this.finalizedTopic}"`;
                        break;
                    case '4_BENCHMARK':
                        sysPrompt = SOFTWARE_BENCHMARK_WRITER_PROMPT;
                        if (this.finalizedTopic) contextAddition += `\n\nĐỀ TÀI: "${this.finalizedTopic}"`;
                        if (this.finalizedModel) contextAddition += `\n\nKIẾN TRÚC: ${this.finalizedModel.substring(0, 1500)}...`;
                        break;
                    case '4_SURVEY':
                        sysPrompt = getSurveyPrompt(this.level);
                        if (this.finalizedTopic) {
                            contextAddition += `\n\nĐỀ TÀI: "${this.finalizedTopic}"`;
                        }
                        if (this.finalizedModel) {
                            contextAddition += `\n\nMÔ HÌNH: ${this.finalizedModel.substring(0, 1500)}...`;
                        }
                        if (this.finalizedOutline) {
                            contextAddition += `\n\nĐỀ CƯƠNG (trích đoạn): ${this.finalizedOutline.substring(0, 1500)}...`;
                        }
                        break;
                }
            }

            const context = `CHỦ ĐỀ GỐC: ${this.topic}\nLOẠI HÌNH (OUTPUT): ${this.goal}\nĐỐI TƯỢNG: ${this.audience}\nTRÌNH ĐỘ: ${this.level}\nNGÔN NGỮ ĐẦU RA (OUTPUT LANGUAGE): ${this.language === 'en' ? 'ENGLISH (100%)' : 'VIETNAMESE (100%)'}${contextAddition}`;

            const prompt = previousCriticFeedback
                ? `${context}\n\nPHẢN HỒI CỦA CRITIC (Vòng trước): ${previousCriticFeedback}\n\n${sysPrompt}\nHãy cải thiện/viết tiếp dựa trên phản hồi này.`
                : `${context}\n\n${sysPrompt}\nHãy bắt đầu thực hiện nhiệm vụ cho giai đoạn này.`;

            return await this.callGeminiAPI('gemini-3-flash-preview', prompt, finalKey);

        } catch (error: any) {
            console.error("Gemini Writer Error:", error);
            return `Lỗi AI: ${error.message || error}`;
        }
    }

    async generateCriticTurn(step: WorkflowStep, writerDraft: string): Promise<string> {
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
                    case '2_MODEL': sysPrompt = getModelCriticPrompt(this.level); break;
                    case '3_OUTLINE': sysPrompt = OUTLINE_CRITIC_PROMPT; break;
                    case '4_SURVEY': sysPrompt = SURVEY_CRITIC_PROMPT; break;
                    case '2_ARCH': sysPrompt = SOFTWARE_ARCH_CRITIC_PROMPT; break;
                    case '4_BENCHMARK': sysPrompt = "Bạn là Reviewer chuyên về Empirical Software Engineering. Hãy đánh giá phương pháp kiểm thử và benchmark vừa đề xuất."; break;
                }
            }

            const context = `TRÌNH ĐỘ: ${this.level}\nĐỐI TƯỢNG: ${this.audience}\nĐỀ TÀI: ${this.topic}\nLOẠI HÌNH: ${this.goal}\nNGÔN NGỮ: ${this.language === 'en' ? 'ENGLISH' : 'VIETNAMESE'}`;

            const prompt = `${context}\n\n${sysPrompt}\n\nBÀI LÀM CỦA WRITER:\n${writerDraft}\n\nHãy đóng vai trò Critic và đưa ra nhận xét chi tiết, khắt khe.`;

            return await this.callGeminiAPI('gemini-3-flash-preview', prompt, geminiKey);

        } catch (error) {
            return `Lỗi Critic (Quota/Network): ${error}`;
        }
    }
}
