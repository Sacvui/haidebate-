
export interface AgentMessage {
  role: 'writer' | 'critic';
  content: string;
  timestamp: number;
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
    case 'UNDERGRAD': return "Giảng viên hướng dẫn thân thiện. Chú trọng tính logic cơ bản và clear.";
    case 'MASTER': return "Hội đồng Thạc sĩ chuẩn mực. Soi kỹ cơ sở lý thuyết (Base Theory) và phương pháp luận.";
    case 'PHD': return "Reviewer Tạp chí Q1 (Top-tier Journal). Cực kỳ khắt khe về GAP lý thuyết, Tính mới (Novelty) và Cơ chế (Mechanism).";
    default: return "Nhà phản biện";
  }
};

// --- BASE PROMPTS ---

const TOPIC_WRITER_PROMPT = `
NHIỆM VỤ: Đề xuất hoặc tinh chỉnh Tên Đề Tài nghiên cứu.
QUY TRÌNH SUY NGHĨ (CHAIN OF THOUGHT):
1. Phân tích từ khóa: Xác định các từ khóa chính và mối quan hệ.
2. Xác định khoảng trống (Gap): Tìm điểm mới so với các nghiên cứu cũ.
3. Đề xuất: Đưa ra 3 phương án tên đề tài (Sáng tạo - An toàn - Cân bằng).
YÊU CẦU: Ngắn gọn, súc tích, có tính mới. Kết quả trả về danh sách có giải thích ngắn.
`;

const TOPIC_CRITIC_PROMPT = `
NHIỆM VỤ: Đánh giá tên đề tài.
TIÊU CHÍ: Tính mới, Phạm vi, Tính khả thi.
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
    private apiKey?: string
  ) { }

  async generateWriterTurn(step: WorkflowStep, previousCriticFeedback?: string): Promise<string> {
    try {
      const finalKey = this.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!finalKey) return "E: Vui lòng cấu hình API Key (Trong Cài Đặt hoặc .env)";

      let sysPrompt = "";
      switch (step) {
        case '1_TOPIC': sysPrompt = TOPIC_WRITER_PROMPT; break;
        case '2_MODEL': sysPrompt = getModelWriterPrompt(this.level); break;
        case '3_OUTLINE': sysPrompt = getOutlineWriterPrompt(this.goal); break;
      }

      const context = `CHỦ ĐỀ GỐC: ${this.topic}\nLOẠI HÌNH (OUTPUT): ${this.goal}\nĐỐI TƯỢNG: ${this.audience}\nTRÌNH ĐỘ: ${this.level}`;

      const prompt = previousCriticFeedback
        ? `${context}\n\nPHẢN HỒI CỦA CRITIC (Vòng trước): ${previousCriticFeedback}\n\n${sysPrompt}\nHãy cải thiện/viết tiếp dựa trên phản hồi này.`
        : `${context}\n\n${sysPrompt}\nHãy bắt đầu thực hiện nhiệm vụ cho giai đoạn này.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${finalKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();

      if (data.error) {
        return `Lỗi API Gemini (Writer): ${data.error.message}`;
      }

      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) return "Lỗi: Không nhận được phản hồi từ Gemini.";
      return content;

    } catch (error) {
      console.error("Gemini Writer Error:", error);
      return `Lỗi Network/Code khi gọi Gemini Writer: ${error}`;
    }
  }

  async generateCriticTurn(step: WorkflowStep, writerDraft: string): Promise<string> {
    const geminiKey = this.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiKey) {
      try {
        let sysPrompt = "";
        switch (step) {
          case '1_TOPIC': sysPrompt = TOPIC_CRITIC_PROMPT; break;
          case '2_MODEL': sysPrompt = getModelCriticPrompt(this.level); break;
          case '3_OUTLINE': sysPrompt = OUTLINE_CRITIC_PROMPT; break;
        }

        const prompt = `${sysPrompt}\n\nBÀI LÀM CỦA WRITER:\n${writerDraft}\n\nHãy đóng vai trò Critic và đưa ra nhận xét chi tiết, khắt khe.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();
        if (data.error) {
          return `Lỗi API Gemini (Critic): ${data.error.message}`;
        }

        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) return content;
      } catch (error) {
        return `Lỗi Network/Code khi gọi Gemini Critic: ${error}`;
      }
    }

    return "Lỗi: Không thể khởi tạo Critic (Thiếu API Key).";
  }
}
