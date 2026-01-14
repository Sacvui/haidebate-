
export interface AgentMessage {
  role: 'writer' | 'critic';
  content: string;
  timestamp: number;
  round?: number;
}

export type WorkflowStep = '1_TOPIC' | '2_MODEL' | '3_OUTLINE' | '4_SURVEY';
export type AcademicLevel = 'UNDERGRAD' | 'MASTER' | 'PHD';

// --- PROMPTS HELPERS ---

const getModelRequirements = (level: AcademicLevel) => {
  // ... (omitted) match existing
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
  // ... (omitted) match existing
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
  // ... (omitted) match existing
  switch (level) {
    case 'UNDERGRAD': return "Giảng viên khó tính (Strict Instructor). Đòi hỏi tính Logic và Tuân thủ quy tắc.";
    case 'MASTER': return "Hội đồng phản biện sắc sảo (Critical Council). Tấn công vào phương pháp luận và cơ sở lý thuyết.";
    case 'PHD': return "Reviewer 2 (Top Journal). Cực kỳ tàn nhẫn và hoài nghi. Soi mói từng lỗ hổng nhỏ nhất về tính mới (Novelty).";
    default: return "Nhà phản biện";
  }
};

// --- BASE PROMPTS ---

const TOPIC_WRITER_PROMPT = `
NHIỆM VỤ: Đề xuất/tinh chỉnh Tên Đề Tài nghiên cứu.

QUY TRÌNH:
1. Phân tích input/phản biện
2. Đề xuất:
   - Lần đầu: 3 phương án (Sáng tạo | An toàn | Cân bằng)
   - Sau phản biện: Cải thiện theo góp ý
   - Vòng cuối: In đậm "CHỐT ĐỀ TÀI: [Tên đề tài]"

YÊU CẦU: Ngắn gọn, tập trung tính mới và cấp thiết.
`;

const TOPIC_CRITIC_PROMPT = `
PHẢN BIỆN ĐỀ TÀI:

1. Tính mới: So với nghiên cứu hiện có?
2. Khả thi: Dữ liệu/Phương pháp đo?
3. Rõ ràng: Tên đề tài hiểu ngay?
4. **KIỂM TRA TRÍCH DẪN (QUAN TRỌNG NHẤT):**
   - Writer có bịa đặt nguồn không?
   - DOI có hoạt động không?
   - **TUYỆT ĐỐI KHÔNG TỰ BỊA DẪN CHỨNG GIẢ ĐỂ PHẢN BÁC.** Nếu bạn (Critic) đưa ra gợi ý nguồn, nó PHẢI CÓ THẬT.

OUTPUT:
❌ Lỗi: [Vấn đề]
➡️ Sửa: [Cách cụ thể]
⚠️ Cảnh báo DOI: [Nếu phát hiện nghi vấn]
`;

const getModelWriterPrompt = (level: AcademicLevel) => `
NHIỆM VỤ: Xây dựng Cơ sở lý thuyết và Mô hình nghiên cứu.
TRÌNH ĐỘ YÊU CẦU: ${level}
${getModelRequirements(level)}

QUY TẮC "LIÊM CHÍNH KHOA HỌC" (BẮT BUỘC):
- **KHÔNG ĐƯỢC BỊA DOI (Fake DOI).** Đây là lỗi nghiêm trọng nhất.
- Nếu bạn không chắc chắn về một nguồn, hãy trích dẫn tên Tác giả + Năm (VD: Nguyen et al., 2023) và KHÔNG ghi DOI.
- Chỉ ghi DOI nếu bạn chắc chắn nó tồn tại thật 100%.

QUY TRÌNH SUY NGHĨ:
1. Xác định lý thuyết nền (Base Theory) phù hợp nhất.
2. Biện luận các giả thuyết (Hypothesis Development) dựa trên lý thuyết.
3. Xây dựng mô hình khái niệm.

YÊU CẦU ĐẦU RA:
1. Giải thích lý thuyết nền ngắn gọn.
2. Danh sách biến và giả thuyết (H1, H2...).
3. SƠ ĐỒ MERMAID (BẮT BUỘC):
   
   VÍ DỤ CHUẨN:
   \`\`\`mermaid
   graph LR
     A[Nhận thức Hữu ích] --> C[Ý định Sử dụng]
     B[Dễ Sử dụng] --> C
     C --> D[Hành vi Thực tế]
   \`\`\`
   
   QUY TẮC BẮT BUỘC:
   - Dùng 'graph LR' hoặc 'graph TD'
   - Node: [Tên ngắn gọn] (không dấu ngoặc kép)
   - Mũi tên: --> (không nhãn phức tạp)
   - Không xuống dòng trong node
   - Không ký tự đặc biệt: (), {}, "", ''
   
4. Trích dẫn nguồn (Citation) dạng giả định chuẩn APA.
`;

const getModelCriticPrompt = (level: AcademicLevel) => `
PHẢN BIỆN MÔ HÌNH (${level}):

1. Độ phức tạp: Đúng tầm ${level}?
2. Logic: Quan hệ biến hợp lý?
3. **LIÊM CHÍNH KHOA HỌC (KIỂM TRA DOI):**
   - Kiểm tra ngẫu nhiên 1-2 DOI mà Writer đưa ra.
   - Nếu phát hiện DOI giả -> **TỪ CHỐI NGAY LẬP TỨC (REJECT)** và cảnh báo gay gắt.
   - Bản thân CRITIC cũng **KHÔNG ĐƯỢC BỊA NGUỒN** để ra vẻ hiểu biết. Chỉ trích dẫn những bài kinh điển có thật.

OUTPUT:
❌ Lỗi: [Vấn đề]
➡️ Sửa: [Cách cụ thể]
`;

const getOutlineWriterPrompt = (outputType: string) => `
NHIỆM VỤ: Lập Đề cương nghiên cứu (Research Proposal/Outline) PHIÊN BẢN CUỐI CÙNG HOÀN HẢO NHẤT.

BỐI CẢNH: Bạn đã trải qua các vòng tranh biện và nhận phản hồi từ Critic. Nhiệm vụ bây giờ là TỔNG HỢP tất cả những điểm tốt nhất để tạo ra một bản đề cương hoàn chỉnh.

YÊU CẦU ĐẶC BIỆT VỀ FORMAT (QUAN TRỌNG):
1. **KHÔNG** thêm bất kỳ lời dẫn nhập, kết luận, hay ghi chú cá nhân nào (ví dụ: "Dưới đây là đề cương...", "Tôi đã chỉnh sửa...").
2. **CHỈ** xuất ra nội dung đề cương thuần túy.
3. **FONT CHỮ & NGÔN NGỮ**: Dùng Tiếng Việt chuẩn mực học thuật. Tuyệt đối KHÔNG dùng ký tự lạ, font lỗi, hoặc bullet points không chuẩn. Dùng hệ thống đánh số 1, 1.1, 1.1.1.
4. **MỨC ĐỘ CHI TIẾT**: Cực kỳ chi tiết. Mỗi mục phải có ít nhất 3-4 gạch đầu dòng diễn giải nội dung cần viết.

CẤU TRÚC BẮT BUỘC (${outputType}):
${getOutlineStructure(outputType)}

HÃY VIẾT NHƯ MỘT NHÀ NGHIÊN CỨU CHUYÊN NGHIỆP ĐANG NỘP ĐỀ CƯƠNG CHO HỘI ĐỒNG.
`;

const OUTLINE_CRITIC_PROMPT = `
PHẢN BIỆN ĐỀ CƯƠNG (CỰC KỲ NGHIÊM KHẮC - RULE 9/10):

Vai trò: Bạn là Chủ tịch Hội đồng Phản biện. Tiêu chuẩn rất cao.

NHIỆM VỤ: Đánh giá đề cương theo thang điểm 10.
Nếu tổng điểm hoặc điểm thành phần < 9/10 => KHÔNG DUYỆT (REJECT).

TIÊU CHÍ CHẤM ĐIỂM (BẮT BUỘC XUẤT RA ĐIỂM SỐ):
1. **Tính Logic (Logic Flow):** [Điểm/10] - Mạch lạc giữa Vấn đề -> Mục tiêu -> Phương pháp?
2. **Format (APA Style):** [Điểm/10] - Cấu trúc chuẩn không? Trình bày chuyên nghiệp không?
3. **Độ đầy đủ (Completeness):** [Điểm/10] - Các mục con có chi tiết không?
4. **Trích dẫn (Citations):** [Pass/Fail] - Có DOI không? Nguồn có thật không?

NẾU CÓ ĐIỂM NÀO < 9:
- HÃY YÊU CẦU VIẾT LẠI NGAY LẬP TỨC.
- CHỈ RA LỖI CỤ THỂ ĐỂ SỬA.

OUTPUT FORM:
📊 ĐÁNH GIÁ:
- Logic: .../10
- Format: .../10
- Đầy đủ: .../10
- Citation: ...

❌ LỖI NGHIÊM TRỌNG:
...

➡️ HƯỚNG DẪN REVIEWER (WRITER) CẦN LÀM GÌ TIẾP THEO:
...
`;

const getSurveyWriterPrompt = (level: AcademicLevel) => `
NHIỆM VỤ: Xây dựng Thang đo (Scale) và Bảng hỏi Khảo sát (Survey Questionnaire).
TRÌNH ĐỘ: ${level}

QUY TRÌNH:
1. Dựa trên Mô hình nghiên cứu đã chốt (Biến độc lập, phụ thuộc, trung gian...).
2. Tìm thang đo chuẩn (từ Paper gốc tiếng Anh).
3. Dịch và điều chỉnh (Scale Adaptation) cho phù hợp bối cảnh nghiên cứu.
4. Xây dựng Biến Kiểm soát (Demographics).

YÊU CẦU OUTPUT (MARKDOWN TABLE):
- Biến | Mã hóa | Câu hỏi (Tiếng Việt) | Nguồn tham khảo (Author, Year)
- Ví dụ:
| Biến (Variable) | Item Code | Câu hỏi khảo sát (Items) | Nguồn gốc (Source) |
|---|---|---|---|
| Nhận thức (PE) | PE1 | Tôi thấy AI giúp tôi viết nhanh hơn. | Davis (1989) |

SAU BẢNG LÀ PHẦN "GHI CHÚ THU THẬP DỮ LIỆU":
- Phương pháp lấy mẫu?
- Kích thước mẫu dự kiến (N)?
`;

const SURVEY_CRITIC_PROMPT = `
PHẢN BIỆN BẢNG HỎI (SURVEY CHECKLIST):

1. **Validity:** Thang đo có đo đúng khái niệm không?
2. **Reliability:** Câu hỏi có dễ hiểu không? Có bị Bias không?
3. **Format:** Bảng có rõ ràng không?
4. **Nguồn gốc:** Có trích dẫn Author gốc không?

OUTPUT:
📊 ĐÁNH GIÁ: [Pass/Minor Revise/Major Revise]
❌ LỖI CỤ THỂ:
1. ...
2. ...
`;

export class AgentSession {
  // ... (class implementation remains same but methods use new prompts)
  // NOTE: I am not replacing the CLASS implementation in this tool call significantly, just the strings.
  // Wait, replace_file_content matches TargetContent. I need to be careful.
  // I'll replace the ENTIRE file content from "export type WorkflowStep..." down to the start of Class?
  // No, the file is large.
  // I will just replace the "WorkflowStep" line and inject the prompts before "export class AgentSession".

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

  public isUsingSameKey(): boolean {
    // Check if Writer and Critic are using the same API key
    return this.writerKey === this.criticKey || (!this.criticKey && !!this.writerKey);
  }

  private async callGeminiAPI(model: string, prompt: string, key: string, retries = 3): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();

      if (data.error) {
        const errorCode = data.error.code;
        const errorMsg = data.error.message;

        // Log full error for debugging
        console.error(`🚨 Gemini API Error:`, {
          model,
          code: errorCode,
          message: errorMsg,
          retriesLeft: retries
        });

        // Handle Rate Limit (429) or Quota
        if (errorCode === 429 || errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("overloaded")) {
          if (retries > 0) {
            const waitTime = 10000 * (4 - retries); // 10s, 20s, 30s
            console.warn(`⚠️ Quota/Rate Limit for ${model}. Retrying in ${waitTime / 1000}s... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.callGeminiAPI(model, prompt, key, retries - 1);
          }
          throw new Error(`Hết Quota (Hạn mức) miễn phí trong ngày hoặc Model đang quá tải. Vui lòng sử dụng API Key riêng trong phần Cài đặt.`);
        }

        // Model not found (404)
        if (errorCode === 404) {
          throw new Error(`Model "${model}" không tồn tại. Vui lòng kiểm tra tên model.`);
        }

        // Invalid API Key (401, 403)
        if (errorCode === 401 || errorCode === 403) {
          throw new Error(`API Key không hợp lệ hoặc hết hạn. Vui lòng kiểm tra lại.`);
        }

        // Other errors
        throw new Error(`Lỗi API (${errorCode}): ${errorMsg}`);
      }

      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Lỗi: Không có phản hồi từ AI.";

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Network errors -> Retry Same Model
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return this.callGeminiAPI(model, prompt, key, retries - 1);
      }
      throw error;
    }
  }

  async generateWriterTurn(step: WorkflowStep, previousCriticFeedback?: string): Promise<string> {
    try {
      const finalKey = this.writerKey;
      if (!finalKey) {
        return "⚠️ CHƯA CẤU HÌNH API KEY: Vui lòng vào Cài đặt (⚙️) để nhập API Key của bạn. Hệ thống không còn dùng key mặc định.";
      }

      console.log(`🔑 Writer using key: ${finalKey.substring(0, 10)}...`);

      let sysPrompt = "";
      switch (step) {
        case '1_TOPIC': sysPrompt = TOPIC_WRITER_PROMPT; break;
        case '2_MODEL': sysPrompt = getModelWriterPrompt(this.level); break;
        case '3_OUTLINE': sysPrompt = getOutlineWriterPrompt(this.goal); break;
        case '4_SURVEY': sysPrompt = getSurveyWriterPrompt(this.level); break;
      }

      const context = `CHỦ ĐỀ GỐC: ${this.topic}\nLOẠI HÌNH (OUTPUT): ${this.goal}\nĐỐI TƯỢNG: ${this.audience}\nTRÌNH ĐỘ: ${this.level}\nNGÔN NGỮ ĐẦU RA (OUTPUT LANGUAGE): ${this.language === 'en' ? 'ENGLISH (100%)' : 'VIETNAMESE (100%)'}`;

      const prompt = previousCriticFeedback
        ? `${context}\n\nPHẢN HỒI CỦA CRITIC (Vòng trước): ${previousCriticFeedback}\n\n${sysPrompt}\nHãy cải thiện/viết tiếp dựa trên phản hồi này.`
        : `${context}\n\n${sysPrompt}\nHãy bắt đầu thực hiện nhiệm vụ cho giai đoạn này.`;

      // Use Gemini 3 Flash Preview
      return await this.callGeminiAPI('gemini-3-flash-preview', prompt, finalKey);

    } catch (error: any) {
      console.error("Gemini Writer Error:", error);
      return `Lỗi AI: ${error.message || error}`;
    }
  }

  async generateCriticTurn(step: WorkflowStep, writerDraft: string): Promise<string> {
    // Use Critic Key if available, else fallback to Writer Key
    const geminiKey = this.criticKey || this.writerKey;

    if (!geminiKey) {
      return "⚠️ CHƯA CẤU HÌNH API KEY: Vui lòng vào Cài đặt (⚙️) để nhập API Key.";
    }

    console.log(`🔑 Critic using key: ${geminiKey.substring(0, 10)}...`);
    try {
      let sysPrompt = "";
      switch (step) {
        case '1_TOPIC': sysPrompt = TOPIC_CRITIC_PROMPT; break;
        case '2_MODEL': sysPrompt = getModelCriticPrompt(this.level); break;
        case '3_OUTLINE': sysPrompt = OUTLINE_CRITIC_PROMPT; break;
        case '4_SURVEY': sysPrompt = SURVEY_CRITIC_PROMPT; break;
      }

      const prompt = `${sysPrompt}\n\nBÀI LÀM CỦA WRITER:\n${writerDraft}\n\nHãy đóng vai trò Critic và đưa ra nhận xét chi tiết, khắt khe.`;

      // Use Gemini 3 Flash Preview
      return await this.callGeminiAPI('gemini-3-flash-preview', prompt, geminiKey);

    } catch (error) {
      return `Lỗi Critic (Quota/Network): ${error}`;
    }
  }
}
