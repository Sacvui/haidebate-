
export interface AgentMessage {
  role: 'writer' | 'critic';
  content: string;
  timestamp: number;
  round?: number;
}

export type WorkflowStep = '1_TOPIC' | '2_MODEL' | '3_OUTLINE';
export type AcademicLevel = 'UNDERGRAD' | 'MASTER' | 'PHD';

// --- PROMPTS HELPERS ---

const getModelRequirements = (level: AcademicLevel) => {
  switch (level) {
    case 'UNDERGRAD':
      return `
            - CẤP ĐỘ 1: TIỂU LUẬN ĐẠI HỌC (MÔ HÌNH MÔ TẢ).
            - Số lượng biến: 2 - 4 biến chính.
            - Loại biến: Chủ yếu biến Độc lập (IV) -> Phụ thuộc (DV).
            - Cấu trúc: Tuyến tính đơn giản.
            `;
    case 'MASTER':
      return `
            - CẤP ĐỘ 2: LUẬN VĂN THẠC SĨ (MÔ HÌNH GIẢI THÍCH).
            - Số lượng biến: 5 - 8 biến.
            - BẮT BUỘC có biến Trung gian (Mediator) hoặc Điều tiết (Moderator).
            - Cấu trúc: Quan hệ nhân quả có căn cứ lý thuyết (TPB, TAM...).
            `;
    case 'PHD':
      return `
            - CẤP ĐỘ 3: BÀI BÁO QUỐC TẾ / TIẾN SĨ (MÔ HÌNH CƠ CHẾ).
            - Số lượng biến: 8 - 15 biến (hoặc hơn).
            - Phức tạp: Trung gian đa lớp, Điều tiết hỗn hợp, Biến tiềm ẩn bậc cao.
            - Cấu trúc: Đa tầng. Giải quyết mâu thuẫn lý thuyết & Cơ chế (Mechanism).
            `;
    default: return "";
  }
};

const getOutlineStructure = (outputType: string) => {
  if (outputType.includes("Tiểu luận") || outputType.includes("Khóa luận")) {
    return `
        CẤU TRÚC TIỂU LUẬN / KHÓA LUẬN:
        1. Mở đầu (Lý do chọn đề tài, Mục tiêu, Đối tượng).
        2. Cơ sở lý thuyết (Các khái niệm chính).
        3. Phương pháp nghiên cứu (Mô hình, Thang đo).
        4. Kết quả mong đợi & Kết luận.
        `;
  }
  if (outputType.includes("Luận văn") || outputType.includes("Tiến sĩ")) {
    return `
        CẤU TRÚC LUẬN VĂN / LUẬN ÁN (CHƯƠNG HỒI):
        Chương 1: Tổng quan nghiên cứu (Giới thiệu, Tính cấp thiết, Gap).
        Chương 2: Cơ sở lý thuyết & Mô hình nghiên cứu.
        Chương 3: Phương pháp nghiên cứu.
        Chương 4: Kết quả nghiên cứu & Thảo luận.
        Chương 5: Kết luận & Hàm ý quản trị.
        `;
  }
  if (outputType.includes("Bài báo") || outputType.includes("Nghiên cứu khoa học")) {
    return `
        CẤU TRÚC BÀI BÁO KHOA HỌC (IMRAD):
        1. Introduction (Đặt vấn đề, Gap, Mục tiêu).
        2. Literature Review & Hypothesis (Tổng quan & Giả thuyết).
        3. Methodology (Phương pháp, Mẫu, Thang đo).
        4. Results (Kết quả phân tích).
        5. Discussion & Conclusion (Thảo luận, Đóng góp, Hạn chế).
        `;
  }
  if (outputType.includes("Đề xuất") || outputType.includes("Proposal")) {
    return `
        CẤU TRÚC ĐỀ XUẤT NGHIÊN CỨU (GRANT PROPOSAL):
        1. Executive Summary (Tóm tắt dự án).
        2. Statement of Problem (Vấn đề nghiên cứu).
        3. Objectives & Scope (Mục tiêu & Phạm vi).
        4. Methodology (Phương pháp dự kiến).
        5. Budget & Timeline (Ngân sách & Tiến độ).
        `;
  }
  return "Cấu trúc IMRAD chuẩn mực.";
};

const getCriticPersona = (level: AcademicLevel) => {
  switch (level) {
    case 'UNDERGRAD': return "Giảng viên khó tính (Strict Instructor). Đòi hỏi tính Logic và Tuân thủ quy tắc.";
    case 'MASTER': return "Hội đồng phản biện sắc sảo (Critical Council). Tấn công vào phương pháp luận và cơ sở lý thuyết.";
    case 'PHD': return "Reviewer 2 (Top Journal). Cực kỳ tàn nhẫn và hoài nghi. Soi mói từng lỗ hổng nhỏ nhất về tính mới (Novelty).";
    default: return "Nhà phản biện";
  }
};

// --- BASE PROMPTS ---

const TOPIC_WRITER_PROMPT = `
NHIỆM VỤ: Đề xuất hoặc tinh chỉnh Tên Đề Tài nghiên cứu.
QUY TRÌNH SUY NGHĨ:
1. Phân tích: Đánh giá input của người dùng hoặc phản hồi của Critic (nếu có).
2. Xử lý phản biện (nếu có): Nếu Critic chê, hãy sửa chữa ngay lập tức. Đừng ngoan cố, nhưng phải bảo vệ lập trường nếu đúng.
3. Đề xuất: 
   - Nếu là bước đầu: Đưa ra 3 phương án (Sáng tạo - An toàn - Cân bằng).
   - Nếu là bước sau phản biện: Cải thiện đề tài dựa trên góp ý.
   - QUAN TRỌNG: Ở vòng cuối, hãy ĐỀ XUẤT 1 PHƯƠNG ÁN CHỐT (FINAL CHOICE) rõ ràng.
   - FORMAT BẮT BUỘC KHI CHỐT: Hãy in đậm dòng: "CHỐT ĐỀ TÀI: [Tên đề tài hoàn chỉnh]" ở cuối bài.

YÊU CẦU: Ngắn gọn. Tập trung vào tính mới và tính cấp thiết.
`;

const TOPIC_CRITIC_PROMPT = `
VAI TRÒ: Đối thủ phản biện (Critical Opponent). KHÔNG PHẢI GIÁO VIÊN.
NHIỆM VỤ: Tấn công vào các lỗ hổng của đề tài.
TIÊU CHÍ (CỰC KỲ KHẮT KHE):
1. Tính mới (Novelty): "Cái này ai cũng làm rồi, có gì mới đâu?"
2. Tính khả thi: "Làm sao đo lường được biến này? Dữ liệu ở đâu?"
3. Logic: Tên đề tài có phản ánh đúng vấn đề không?

TONE & STYLE:
- Thẳng thắn, sắc bén, hoài nghi.
- Dùng từ ngữ mạnh: "Thiếu căn cứ", "Mơ hồ", "Không thuyết phục".
- Đừng khen ngợi xã giao. Hãy chỉ ra lỗi sai để Writer hoàn thiện.
`;

const getModelWriterPrompt = (level: AcademicLevel) => `
NHIỆM VỤ: Xây dựng Cơ sở lý thuyết và Mô hình nghiên cứu.
TRÌNH ĐỘ YÊU CẦU: ${level}
${getModelRequirements(level)}

QUY TRÌNH SUY NGHĨ:
1. Xác định lý thuyết nền (Base Theory) phù hợp nhất.
2. Biện luận các giả thuyết (Hypothesis Development) dựa trên lý thuyết.
3. Xây dựng mô hình khái niệm.

YÊU CẦU ĐẦU RA:
1. Giải thích lý thuyết nền ngắn gọn.
2. Danh sách biến và giả thuyết (H1, H2...).
3. SƠ ĐỒ MERMAID (BẮT BUỘC):
   - Sử dụng 'graph LR' hoặc 'graph TD'.
   - Node phải nằm trong ngoặc vuông [Tên Biến].
   - Mũi tên --> có nhãn nếu cần.
4. Trích dẫn nguồn (Citation) dạng giả định chuẩn APA.
FORMAT: LaTeX cho phương trình nếu có.
`;

const getModelCriticPrompt = (level: AcademicLevel) => `
VAI TRÒ: ${getCriticPersona(level)}
NHIỆM VỤ: Phản biện mô hình.
TIÊU CHÍ:
1. Độ phức tạp: Mô hình có đúng tầm ${level} không?
2. Logic & Gap: Quan hệ hợp lý không?
3. ANTI-HALLUCINATION: Check trích dẫn.
`;

const getOutlineWriterPrompt = (outputType: string) => `
NHIỆM VỤ: Lập Đề cương chi tiết (Detailed Outline).
CHUẨN FORMAT: APA 7th Edition.
LOẠI HÌNH BÀI VIẾT: ${outputType}

CHIẾN LƯỢC THỰC HIỆN (CHAIN OF THOUGHT):
Bước 1 (Brainstorm): Liệt kê 3 hướng tiếp cận logic cho đề tài này.
Bước 2 (Select): Chọn hướng tiếp cận tốt nhất, đảm bảo tính mạch lạc (Coherence).
Bước 3 (Elaborate): Viết chi tiết đề cương dựa trên hướng đã chọn.

YÊU CẦU CHI TIẾT:
- Chia chương mục rõ ràng (Chương -> Mục lớn -> Mục nhỏ).
- Mỗi mục phải có mô tả ngắn về nội dung dự kiến viết (Key Points).
- Đảm bảo logic dòng chảy: Vấn đề -> Nguyên nhân -> Giải pháp/Kết quả.
${getOutlineStructure(outputType)}
`;

const OUTLINE_CRITIC_PROMPT = `
VAI TRÒ: Thư ký tòa soạn (Editorial Office).
NHIỆM VỤ: Soát lỗi cấu trúc và format.
TIÊU CHÍ: Logic dòng chảy, Format APA 7.
`;

export class AgentSession {
  private messages: AgentMessage[] = [];

  constructor(
    public topic: string,
    public goal: string = "Nghiên cứu khoa học",
    public audience: string = "Chuyên gia/Nhà nghiên cứu",
    public level: AcademicLevel = "MASTER",
    public language: 'vi' | 'en' = 'vi',
    private writerKey?: string,
    private criticKey?: string
  ) { }

  public updateTopic(newTopic: string) {
    this.topic = newTopic;
    console.log("Topic updated to:", newTopic);
  }

  private async callGeminiAPI(model: string, prompt: string, key: string, retries = 2): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();

      if (data.error) {
        // Handle Rate Limit (429) or Quota
        if (data.error.code === 429 || data.error.message.toLowerCase().includes("quota")) {
          if (retries > 0) {
            const waitTime = 5000 * (3 - retries); // Wait 5s, then 10s
            console.warn(`Quota hit for ${model}. Retrying in ${waitTime / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.callGeminiAPI(model, prompt, key, retries - 1);
          }
          throw new Error(`Model ${model} đang quá tải (Quota). Vui lòng thử lại sau.`);
        }
        throw new Error(data.error.message);
      }

      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Lỗi: Không có phản hồi từ AI.";

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Network errors -> Retry or Fail
      if (retries > 0 && !error.message.includes("quota")) { // Retry network glitches
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.callGeminiAPI(model, prompt, key, retries - 1);
      }
      throw error;
    }
  }

  async generateWriterTurn(step: WorkflowStep, previousCriticFeedback?: string): Promise<string> {
    try {
      const finalKey = this.writerKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!finalKey) return "E: Vui lòng cấu hình API Key Writer";

      let sysPrompt = "";
      switch (step) {
        case '1_TOPIC': sysPrompt = TOPIC_WRITER_PROMPT; break;
        case '2_MODEL': sysPrompt = getModelWriterPrompt(this.level); break;
        case '3_OUTLINE': sysPrompt = getOutlineWriterPrompt(this.goal); break;
      }

      const context = `CHỦ ĐỀ GỐC: ${this.topic}\nLOẠI HÌNH (OUTPUT): ${this.goal}\nĐỐI TƯỢNG: ${this.audience}\nTRÌNH ĐỘ: ${this.level}\nNGÔN NGỮ ĐẦU RA (OUTPUT LANGUAGE): ${this.language === 'en' ? 'ENGLISH (100%)' : 'VIETNAMESE (100%)'}`;

      const prompt = previousCriticFeedback
        ? `${context}\n\nPHẢN HỒI CỦA CRITIC (Vòng trước): ${previousCriticFeedback}\n\n${sysPrompt}\nHãy cải thiện/viết tiếp dựa trên phản hồi này.`
        : `${context}\n\n${sysPrompt}\nHãy bắt đầu thực hiện nhiệm vụ cho giai đoạn này.`;

      // Use Helper with retry (No fallback switching)
      return await this.callGeminiAPI('gemini-2.0-flash', prompt, finalKey);

    } catch (error) {
      console.error("Gemini Writer Error:", error);
      return `Hệ thống đang quá tải (Rate Limit). Vui lòng thử lại sau 30s. (${error})`;
    }
  }

  async generateCriticTurn(step: WorkflowStep, writerDraft: string): Promise<string> {
    // Use Critic Key if available, else fallback to Writer Key
    const geminiKey = this.criticKey || this.writerKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiKey) {
      try {
        let sysPrompt = "";
        switch (step) {
          case '1_TOPIC': sysPrompt = TOPIC_CRITIC_PROMPT; break;
          case '2_MODEL': sysPrompt = getModelCriticPrompt(this.level); break;
          case '3_OUTLINE': sysPrompt = OUTLINE_CRITIC_PROMPT; break;
        }

        const prompt = `${sysPrompt}\n\nBÀI LÀM CỦA WRITER:\n${writerDraft}\n\nHãy đóng vai trò Critic và đưa ra nhận xét chi tiết, khắt khe.`;

        // Use Helper with retry (No fallback switching)
        return await this.callGeminiAPI('gemini-2.0-flash', prompt, geminiKey);

      } catch (error) {
        return `Lỗi Critic (Quota/Network): ${error}`;
      }
    }

    return "Lỗi: Không thể khởi tạo Critic (Thiếu API Key).";
  }
}
