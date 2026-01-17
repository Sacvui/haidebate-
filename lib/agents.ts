
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

VÍ DỤ MẪU (FEW-SHOT EXAMPLES):

VÍ DỤ 1: ĐỀ TÀI TỐT (9/10)
Input: "Nghiên cứu ảnh hưởng của AI đến nhân viên"
Output: "Tác động của trí tuệ nhân tạo (AI) đến hiệu suất làm việc và sự hài lòng công việc của nhân viên văn phòng tại Việt Nam: Vai trò điều tiết của nỗi lo mất việc làm"
✅ Lý do tốt: Cụ thể (đối tượng, phạm vi), có biến cụ thể (hiệu suất, hài lòng), có tính mới (nỗi lo mất việc).

VÍ DỤ 2: ĐỀ TÀI YẾU (4/10)
Input: "Nghiên cứu về chuyển đổi số"
Output: "Nghiên cứu về chuyển đổi số trong doanh nghiệp"
❌ Lý do yếu: Quá chung chung, không rõ biến nghiên cứu, không có bối cảnh cụ thể.

QUY TRÌNH:
1. Phân tích input/phản biện
2. Đề xuất:
   - Lần đầu: 3 phương án (Sáng tạo | An toàn | Cân bằng)
   - Sau phản biện: Cải thiện theo góp ý
   - Vòng cuối: In đậm "CHỐT ĐỀ TÀI: [Tên đề tài]"

YÊU CẦU: Ngắn gọn, tập trung tính mới và cấp thiết.
`;

const TOPIC_CRITIC_PROMPT = `
PHẢN BIỆN ĐỀ TÀI - RUBRIC CHI TIẾT (BẮT BUỘC CHẤM ĐIỂM):

1. TÍNH MỚI (NOVELTY) - 3 điểm:
   - So với nghiên cứu trước đây?
   - Có gap nghiên cứu rõ ràng không?

2. TÍNH KHẢ THI (FEASIBILITY) - 3 điểm:
   - Dữ liệu có thể thu thập không?
   - Phương pháp đo lường có sẵn không?

3. TÍNH RÕ RÀNG (CLARITY) - 2 điểm:
   - Tên đề tài có dễ hiểu?
   - Các biến có được xác định rõ?

4. PHẠM VI (SCOPE) - 2 điểm:
   - Không quá rộng cũng không quá hẹp?
   - Phù hợp với trình độ (Undergrad/Master/PhD)?

TỔNG ĐIỂM: .../10

NẾU < 9 ĐIỂM:
❌ KẾT LUẬN: KHÔNG DUYỆT (REJECT) - Yêu cầu sửa cụ thể.

KIỂM TRA TRÍCH DẪN (QUAN TRỌNG NHẤT):
- Writer có bịa đặt nguồn không?
- DOI có hoạt động không?
- **TUYỆT ĐỐI KHÔNG TỰ BỊA DẪN CHỨNG GIẢ ĐỂ PHẢN BÁC.** Nếu bạn (Critic) đưa ra gợi ý nguồn, nó PHẢI CÓ THẬT.

OUTPUT FORM:
📊 ĐIỂM SỐ: .../10
❌ Lỗi chính: [Vấn đề]
➡️ Đề xuất sửa: [Cách cụ thể]
⚠️ Cảnh báo DOI: [Nếu phát hiện nghi vấn]
`;

const getModelWriterPrompt = (level: AcademicLevel) => `
NHIỆM VỤ: Xây dựng Cơ sở lý thuyết và Mô hình nghiên cứu.
TRÌNH ĐỘ YÊU CẦU: ${level}
${getModelRequirements(level)}

VÍ DỤ MẪU (FEW-SHOT EXAMPLES):

VÍ DỤ 1: GIẢI THÍCH LÝ THUYẾT TỐT (TAM)
"Thuyết Chấp nhận Công nghệ (TAM) được phát triển bởi Davis (1989) nhằm giải thích ý định sử dụng công nghệ. Mô hình này phù hợp cho nghiên cứu về AI vì nó tập trung vào hai yếu tố cốt lõi: Nhận thức tính hữu ích (PU) và Nhận thức tính dễ sử dụng (PEOU). Các nghiên cứu trước đây (Venkatesh & Bala, 2008) đã chứng minh độ tin cậy cao của TAM trong bối cảnh công nghệ mới."

VÍ DỤ 2: GIẢ THUYẾT TỐT (H1)
"H1: Nhận thức tính hữu ích (PU) có tác động tích cực cùng chiều đến Ý định sử dụng AI (IU).
Biện luận: Theo Davis (1989), khi người dùng tin rằng hệ thống giúp cải thiện hiệu suất, họ sẽ có xu hướng sử dụng nó nhiều hơn. Trong bối cảnh AI, nếu nhân viên thấy AI giúp họ hoàn thành việc nhanh hơn, họ sẽ sẵn sàng chấp nhận nó (Nguyen et al., 2023)."

QUY TẮC "LIÊM CHÍNH KHOA HỌC" (BẮT BUỘC):
- **KHÔNG ĐƯỢC BỊA DOI (Fake DOI).** Đây là lỗi nghiêm trọng nhất.
- Nếu bạn không chắc chắn về một nguồn, hãy trích dẫn tên Tác giả + Năm (VD: Nguyen et al., 2023) và KHÔNG ghi DOI.
- Chỉ ghi DOI nếu bạn chắc chắn nó tồn tại thật 100%.

QUY TRÌNH SUY NGHĨ (CHAIN-OF-THOUGHT):
1. Phân tích đề tài: Xác định biến độc lập (IV), phụ thuộc (DV), trung gian (M), điều tiết (Mod).
2. Chọn lý thuyết nền: Lý thuyết nào giải thích tốt nhất mối quan hệ này? (TAM, TPB, UTAUT, RBV...?)
3. Xây dựng mô hình: Vẽ mối quan hệ (IV -> M -> DV).
4. Biện luận giả thuyết: Dùng lý thuyết để giải thích tại sao biến A tác động biến B.

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
PHẢN BIỆN MÔ HÌNH - RUBRIC CHI TIẾT (NGHIÊM KHẮC):

1. CƠ SỞ LÝ THUYẾT (THEORY) - 3 điểm:
   - Lý thuyết nền có phù hợp không? (VD: Nghiên cứu hành vi dùng TAM/TPB là đúng, dùng RBV là sai)
   - Có giải thích rõ ràng không?

2. LOGIC MÔ HÌNH (MODEL LOGIC) - 3 điểm:
   - Các mối quan hệ có hợp lý không?
   - Có biến lạ xuất hiện không?
   - Sơ đồ Mermaid có lỗi cú pháp không?

3. GIẢ THUYẾT (HYPOTHESES) - 2 điểm:
   - Biện luận có dựa trên lý thuyết không?
   - Hướng tác động (+/-) có rõ ràng?

4. LIÊM CHÍNH TRÍCH DẪN (CITATION) - 2 điểm:
   - Có fake DOI không?
   - Tác giả được trích dẫn có đúng lĩnh vực không?

TỔNG ĐIỂM: .../10

NẾU < 9 ĐIỂM:
❌ REJECT - Chỉ ra lỗi cụ thể.

LƯU Ý ĐẶC BIỆT:
- Kiểm tra kỹ code Mermaid. Nếu code sai cú pháp -> Trừ 2 điểm ngay lập tức.
- Kiểm tra DOI. Nếu Fake -> 0 điểm phần Citation.

OUTPUT FORM:
📊 ĐIỂM SỐ: .../10
❌ Lỗi chính: ...
➡️ Đề xuất: ...
⚠️ Cảnh báo DOI: ...
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
PHẢN BIỆN ĐỀ CƯƠNG - RUBRIC CHI TIẾT (BẮT BUỘC CHẤM ĐIỂM):

1. LOGIC FLOW (3 điểm):
   - Mạch lạc: Vấn đề -> Mục tiêu -> Phương pháp?
   - Mục tiêu có đo lường được không?
   - Kết cấu có hợp lý không?

2. LITERATURE REVIEW (3 điểm):
   - Số lượng citation đủ chưa (≥ 15)?
   - Có bài từ top journals không?
   - Có tổng hợp (synthesis) hay chỉ liệt kê?
   - DOI/Nguồn có thật không? (Kiểm tra kỹ)

3. METHODOLOGY RIGOR (2 điểm):
   - Thiết kế nghiên cứu rõ ràng?
   - Phương pháp chọn mẫu hợp lý?
   - Công cụ phân tích phù hợp?

4. FORMAT & PRESENTATION (2 điểm):
   - Đánh số đúng (1, 1.1...)?
   - Không lỗi chính tả/ngữ pháp?
   - Văn phong học thuật?

TỔNG ĐIỂM: .../10

NẾU < 9 ĐIỂM:
❌ REJECT - Yêu cầu sửa lỗi cụ thể.

LƯU Ý: 
- Nếu phát hiện Fake DOI -> 0 điểm phần Lit Review -> REJECT ngay.
- Nếu thiếu các section quan trọng -> REJECT.

OUTPUT FORM:
📊 ĐIỂM SỐ: .../10
- Logic: .../3
- Lit Review: .../3
- Method: .../2
- Format: .../2

❌ LỖI NGHIÊM TRỌNG:
...

➡️ YÊU CẦU SỬA:
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

QUY TẮC "LIÊM CHÍNH KHOA HỌC" (BẮT BUỘC):
- Sử dụng thang đo chuẩn từ các bài báo gốc (Original Scale).
- KHÔNG BỊA ĐẶT CÂU HỎI mà không có cơ sở lý thuyết.
- Trích dẫn nguồn (Author, Year) cho mỗi nhóm thang đo.

VÍ DỤ MẪU:
| Biến (Variable) | Mã (Code) | Câu hỏi (Items) | Nguồn gốc (Source) |
|---|---|---|---|
| Nhận thức tính hữu ích | PU1 | Sử dụng AI giúp tôi hoàn thành công việc nhanh hơn. | Davis (1989) |
| | PU2 | Sử dụng AI giúp nâng cao hiệu suất làm việc của tôi. | Davis (1989) |
| Ý định sử dụng | IU1 | Tôi dự định sẽ sử dụng thường xuyên trong tương lai. | Venkatesh et al. (2003) |

YÊU CẦU OUTPUT (MARKDOWN TABLE):
- Table 1: Các thang đo chính (Constructs & Items)
- Table 2: Thông tin nhân khẩu học (Control Variables)

SAU BẢNG LÀ PHẦN "PHƯƠNG ÁN THU THẬP DỮ LIỆU":
- Phương pháp lấy mẫu (Sampling Method).
- Kích thước mẫu (Sample Size) - giải thích công thức tính.
- Đối tượng khảo sát (Target Population).
`;

const SURVEY_CRITIC_PROMPT = `
PHẢN BIỆN BẢNG HỎI - RUBRIC CHI TIẾT:

1. VALIDITY (HỢP LỆ) - 3 điểm:
   - Thang đo có đo đúng biến không? (Face Validity)
   - Nguồn gốc có uy tín không? (Construct Validity)

2. RELIABILITY (TIN CẬY) - 3 điểm:
   - Câu hỏi có rõ ràng, dễ hiểu?
   - Có bị dẫn dắt (Leading question) không?
   - Số lượng items có đủ không (thường ≥ 3 items/biến)?

3. FORMAT & ADAPTATION (2 điểm):
   - Thang đo Likert (1-5 hoặc 1-7) có thống nhất?
   - Dịch có chuẩn không?

4. DEMOGRAPHICS & SAMPLING (2 điểm):
   - Các biến kiểm soát có phù hợp?
   - Kích thước mẫu có đủ lớn cho SEM/Regression?

TỔNG ĐIỂM: .../10

NẾU < 9 ĐIỂM:
❌ YÊU CẦU SỬA: Chỉ ra cụ thể item nào cần sửa/xóa/thêm.

OUTPUT:
📊 ĐIỂM SỐ: .../10
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
  public finalizedTopic?: string;
  public finalizedModel?: string;
  public finalizedModelChart?: string;
  public finalizedOutline?: string;
  public finalizedSurvey?: string;
  private sessionId: string;
  private userId?: string;

  constructor(
    public topic: string,
    public goal: string = "Nghiên cứu khoa học",
    public audience: string = "Chuyên gia/Nhà nghiên cứu",
    public level: AcademicLevel = "MASTER",
    public language: 'vi' | 'en' = 'vi',
    private writerKey?: string,
    private criticKey?: string,
    sessionId?: string,
    userId?: string
  ) {
    this.sessionId = sessionId || `session_${Date.now()}`;
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

  public setFinalizedOutline(outline: string) {
    this.finalizedOutline = outline;
  }

  public setFinalizedSurvey(survey: string) {
    this.finalizedSurvey = survey;
  }

  public getSessionId(): string {
    return this.sessionId;
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

      let sysPrompt = "";
      let contextAddition = "";

      switch (step) {
        case '1_TOPIC':
          sysPrompt = TOPIC_WRITER_PROMPT;
          break;
        case '2_MODEL':
          sysPrompt = getModelWriterPrompt(this.level);
          // Add finalized topic as context
          if (this.finalizedTopic) {
            contextAddition = `\n\nĐỀ TÀI ĐÃ ĐƯỢC PHÊ DUYỆT (sử dụng làm nền tảng):\n"${this.finalizedTopic}"`;
          }
          break;
        case '3_OUTLINE':
          sysPrompt = getOutlineWriterPrompt(this.goal);
          // Add finalized topic and model as context
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
        case '4_SURVEY':
          sysPrompt = getSurveyWriterPrompt(this.level);
          // Add all finalized results as context
          if (this.finalizedTopic) {
            contextAddition += `\n\nĐỀ TÀI: "${this.finalizedTopic}"`;
          }
          if (this.finalizedModel) {
            contextAddition += `\n\nMÔ HÌNH: ${this.finalizedModel.substring(0, 500)}...`;
          }
          if (this.finalizedOutline) {
            contextAddition += `\n\nĐỀ CƯƠNG (trích đoạn): ${this.finalizedOutline.substring(0, 500)}...`;
          }
          break;
      }

      const context = `CHỦ ĐỀ GỐC: ${this.topic}\nLOẠI HÌNH (OUTPUT): ${this.goal}\nĐỐI TƯỢNG: ${this.audience}\nTRÌNH ĐỘ: ${this.level}\nNGÔN NGỮ ĐẦU RA (OUTPUT LANGUAGE): ${this.language === 'en' ? 'ENGLISH (100%)' : 'VIETNAMESE (100%)'}${contextAddition}`;;

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
