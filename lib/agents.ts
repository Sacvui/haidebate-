
export interface AgentMessage {
  role: 'writer' | 'critic';
  content: string;
  timestamp: number;
  round?: number;
}

export type WorkflowStep = '1_TOPIC' | '2_MODEL' | '3_OUTLINE' | '4_SURVEY';
export type AcademicLevel = 'UNDERGRAD' | 'MASTER' | 'PHD';
export type ProjectType = 'RESEARCH' | 'STARTUP';

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

import { GOAL_OPTIONS } from './constants';

const getOutlineStructure = (outputType: string) => {
  // ... (omitted) match existing
  if (outputType === GOAL_OPTIONS.UNDERGRAD_RESEARCH) {
    return `
        CẤU TRÚC TIỂU LUẬN / KHÓA LUẬN:
        1. Mở đầu (Lý do chọn đề tài, Mục tiêu, Đối tượng).
        2. Cơ sở lý thuyết (Các khái niệm chính).
        3. Phương pháp nghiên cứu (Mô hình, Thang đo).
        4. Kết quả mong đợi & Kết luận.
        `;
  }
  if (outputType === GOAL_OPTIONS.MASTER_THESIS || outputType === GOAL_OPTIONS.PHD_DISSERTATION) {
    return `
        CẤU TRÚC LUẬN VĂN / LUẬN ÁN (CHƯƠNG HỒI):
        Chương 1: Tổng quan nghiên cứu (Giới thiệu, Tính cấp thiết, Gap).
        Chương 2: Cơ sở lý thuyết & Mô hình nghiên cứu.
        Chương 3: Phương pháp nghiên cứu.
        Chương 4: Kết quả nghiên cứu & Thảo luận.
        Chương 5: Kết luận & Hàm ý quản trị.
        `;
  }
  if (outputType === GOAL_OPTIONS.DOMESTIC_PAPER) {
    return `
        CẤU TRÚC BÀI BÁO KHOA HỌC (IMRAD):
        1. Introduction (Đặt vấn đề, Gap, Mục tiêu).
        2. Literature Review & Hypothesis (Tổng quan & Giả thuyết).
        3. Methodology (Phương pháp, Mẫu, Thang đo).
        4. Results (Kết quả phân tích).
        5. Discussion & Conclusion (Thảo luận, Đóng góp, Hạn chế).
        `;
  }
  if (outputType === GOAL_OPTIONS.GRANT_PROPOSAL) {
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

// =============================================================================
// STARTUP PROJECT PROMPTS (COMPLETELY SEPARATE FROM RESEARCH)
// =============================================================================

const STARTUP_TOPIC_WRITER_PROMPT = `
NHIỆM VỤ: Đề xuất/tinh chỉnh Ý Tưởng Kinh Doanh Khởi Nghiệp.

VÍ DỤ MẪU (FEW-SHOT EXAMPLES):

VÍ DỤ 1: Ý TƯỞNG TỐT (9/10)
Input: "App giao đồ ăn cho dân văn phòng"
Output:
🎯 VẤN ĐỀ (PROBLEM): Nhân viên văn phòng tại TP.HCM thường xuyên bỏ bữa trưa hoặc ăn đồ ăn nhanh thiếu dinh dưỡng do thiếu thời gian và lựa chọn healthy gần công ty.
💡 GIẢI PHÁP (SOLUTION): Ứng dụng "HealthyBox" - đặt trước bữa trưa healthy từ các bếp địa phương, giao tận nơi đúng 12h.
👤 KHÁCH HÀNG (TARGET): Nhân viên văn phòng 25-40 tuổi, thu nhập 15-30tr/tháng, quan tâm sức khỏe.
⭐ ĐIỂM KHÁC BIỆT (USP): Đặt trước 1 tuần, menu theo chế độ ăn (Keto, Low-carb, Thuần chay), cam kết dưới 500 calo.
💰 MÔ HÌNH DOANH THU: Commission 15% mỗi đơn + Gói subscription tuần/tháng.

VÍ DỤ 2: Ý TƯỞNG YẾU (4/10)
Input: "Bán hàng online"
Output: "Mở shop bán đồ online"
❌ Lý do yếu: Quá chung chung, không rõ vấn đề giải quyết, không có điểm khác biệt.

QUY TRÌNH:
1. Phân tích input/phản biện
2. Đề xuất:
   - Lần đầu: 3 phương án (Táo bạo | An toàn | Cân bằng)
   - Sau phản biện: Cải thiện theo góp ý
   - Vòng cuối: In đậm "CHỐT Ý TƯỞNG: [Mô tả ngắn gọn]"

FORMAT OUTPUT BẮT BUỘC:
🎯 VẤN ĐỀ (PROBLEM): [Khách hàng đang gặp vấn đề gì?]
💡 GIẢI PHÁP (SOLUTION): [Sản phẩm/dịch vụ của bạn giải quyết thế nào?]
👤 KHÁCH HÀNG (TARGET CUSTOMER): [Ai sẽ mua? Mô tả chi tiết]
⭐ ĐIỂM KHÁC BIỆT (USP): [Tại sao chọn bạn thay vì đối thủ?]
💰 MÔ HÌNH DOANH THU (REVENUE MODEL): [Kiếm tiền bằng cách nào?]

YÊU CẦU: Ngắn gọn, tập trung vào tính khả thi và thị trường.
`;

const STARTUP_TOPIC_CRITIC_PROMPT = `
PHẢN BIỆN Ý TƯỞNG KINH DOANH - RUBRIC CHI TIẾT (BẮT BUỘC CHẤM ĐIỂM):

1. VẤN ĐỀ THẬT SỰ (PROBLEM-SOLUTION FIT) - 3 điểm:
   - Đây có phải vấn đề thực sự không? (Pain point rõ ràng?)
   - Khách hàng có sẵn sàng trả tiền để giải quyết?
   - Hiện tại họ đang giải quyết bằng cách nào?

2. QUY MÔ THỊ TRƯỜNG (MARKET SIZE) - 3 điểm:
   - TAM (Total Addressable Market) có đủ lớn không?
   - Thị trường đang tăng hay giảm?
   - Có rào cản gia nhập không?

3. TÍNH KHẢ THI (FEASIBILITY) - 2 điểm:
   - Founder có đủ năng lực thực hiện?
   - Chi phí khởi đầu có hợp lý?
   - Có thể MVP trong 3 tháng không?

4. LỢI THẾ CẠNH TRANH (COMPETITIVE ADVANTAGE) - 2 điểm:
   - Điểm khác biệt có bền vững không?
   - Đối thủ có dễ dàng copy không?

TỔNG ĐIỂM: .../10

NẾU < 9 ĐIỂM:
❌ KẾT LUẬN: CHƯA SẴN SÀNG - Yêu cầu pivot hoặc tinh chỉnh.

OUTPUT FORM:
📊 ĐIỂM SỐ: .../10
❌ Điểm yếu chính: [Vấn đề lớn nhất]
➡️ Đề xuất pivot: [Cách điều chỉnh cụ thể]
💡 Gợi ý: [Ý tưởng bổ sung nếu có]
`;

const STARTUP_MODEL_WRITER_PROMPT = `
NHIỆM VỤ: Xây dựng Mô Hình Kinh Doanh (Business Model) theo LEAN CANVAS.

BỐI CẢNH: Dựa trên ý tưởng kinh doanh đã được phê duyệt, xây dựng mô hình kinh doanh chi tiết.

CẤU TRÚC LEAN CANVAS (BẮT BUỘC 9 Ô):

┌─────────────────────┬─────────────────────┬─────────────────────┐
│ 2. PROBLEM          │ 4. SOLUTION         │ 3. UNIQUE VALUE     │
│ 3 vấn đề lớn nhất   │ 3 tính năng chính   │ PROPOSITION         │
│                     │                     │ Tuyên bố giá trị    │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ 8. KEY METRICS      │ 5. UNFAIR           │ 9. CHANNELS         │
│ Chỉ số đo lường     │ ADVANTAGE           │ Kênh tiếp cận       │
│ thành công          │ Lợi thế không thể   │ khách hàng          │
│                     │ copy                │                     │
├─────────────────────┴─────────────────────┴─────────────────────┤
│ 7. COST STRUCTURE                │ 6. REVENUE STREAMS            │
│ Chi phí cố định & biến đổi       │ Các nguồn doanh thu           │
└──────────────────────────────────┴───────────────────────────────┘
│ 1. CUSTOMER SEGMENTS: Phân khúc khách hàng mục tiêu             │
└─────────────────────────────────────────────────────────────────┘

YÊU CẦU ĐẦU RA:
1. Điền đầy đủ 9 ô của Lean Canvas với nội dung chi tiết.
2. SƠ ĐỒ MERMAID BẮT BUỘC:

VÍ DỤ CHUẨN:
\`\`\`mermaid
graph TD
    subgraph Customer["👤 CUSTOMER"]
        CS[Nhân viên văn phòng 25-40t]
    end
    
    subgraph Problem["🎯 PROBLEM"]
        P1[Thiếu thời gian nấu ăn]
        P2[Đồ ăn văn phòng không healthy]
    end
    
    subgraph Solution["💡 SOLUTION"]
        S1[App đặt trước bữa trưa]
        S2[Menu theo chế độ ăn]
    end
    
    subgraph Revenue["💰 REVENUE"]
        R1[Commission 15%]
        R2[Subscription tuần/tháng]
    end
    
    CS --> P1 & P2
    P1 & P2 --> S1 & S2
    S1 & S2 --> R1 & R2
\`\`\`

QUY TẮC MERMAID:
- Dùng 'graph TD' (Top-Down) hoặc 'graph LR' (Left-Right)
- Subgraph để nhóm các thành phần
- Node: [Tên ngắn gọn] (không dấu ngoặc kép bên trong)
- Không ký tự đặc biệt: (), {}, "", ''

3. Giải thích ngắn gọn cho mỗi ô (2-3 câu).
`;

const STARTUP_MODEL_CRITIC_PROMPT = `
PHẢN BIỆN MÔ HÌNH KINH DOANH - RUBRIC CHI TIẾT (NGHIÊM KHẮC):

1. PROBLEM-SOLUTION FIT (3 điểm):
   - Giải pháp có thực sự giải quyết vấn đề nêu ra?
   - 3 tính năng chính có đủ để giải quyết 3 vấn đề không?

2. REVENUE MODEL (3 điểm):
   - Mô hình doanh thu có rõ ràng không?
   - Unit Economics có hợp lý? (CAC < LTV?)
   - Có khả năng scale không?

3. COMPETITIVE MOAT (2 điểm):
   - "Unfair Advantage" có thực sự không thể copy?
   - Có network effects hoặc switching costs không?

4. LEAN CANVAS COMPLETENESS (2 điểm):
   - Đã điền đủ 9 ô chưa?
   - Sơ đồ Mermaid có lỗi cú pháp không?

TỔNG ĐIỂM: .../10

NẾU < 9 ĐIỂM:
❌ REJECT - Chỉ ra lỗi cụ thể từng ô.

LƯU Ý ĐẶC BIỆT:
- Kiểm tra kỹ code Mermaid. Nếu code sai cú pháp -> Trừ 2 điểm ngay.
- Nếu Revenue Model mơ hồ -> Trừ 2 điểm.

OUTPUT FORM:
📊 ĐIỂM SỐ: .../10
❌ Ô cần sửa: [Tên ô - Vấn đề]
➡️ Đề xuất: [Cách cải thiện cụ thể]
`;

const STARTUP_OUTLINE_WRITER_PROMPT = `
NHIỆM VỤ: Lập PITCH DECK + BUSINESS PLAN (Kế hoạch Kinh doanh Toàn diện) PHIÊN BẢN HOÀN CHỈNH.

BỐI CẢNH: Dựa trên Ý tưởng và Lean Canvas đã được phê duyệt, xây dựng Pitch Deck + Business Plan chuẩn để gọi vốn đầu tư.

CẤU TRÚC 15 PHẦN (BẮT BUỘC):

═══════════════════════════════════════════════════════════════
PHẦN A: PITCH DECK (10 SLIDES) - CHO NHÀ ĐẦU TƯ
═══════════════════════════════════════════════════════════════

📌 SLIDE 1: TITLE
- Tên startup + Logo (mô tả)
- Tagline (1 câu tóm tắt giá trị)
- Thông tin liên hệ

📌 SLIDE 2: PROBLEM
- 3 vấn đề chính khách hàng đang gặp
- Số liệu/thống kê chứng minh vấn đề lớn
- Quote từ khách hàng tiềm năng (nếu có)

📌 SLIDE 3: SOLUTION
- Mô tả sản phẩm/dịch vụ
- Demo/Screenshots (mô tả giao diện)
- Tính năng chính (3-5 features)

📌 SLIDE 4: MARKET SIZE
- TAM (Total Addressable Market)
- SAM (Serviceable Addressable Market)
- SOM (Serviceable Obtainable Market)
- Nguồn: Báo cáo ngành, thống kê

📌 SLIDE 5: PRODUCT/DEMO
- Chi tiết sản phẩm
- User flow chính
- Screenshots/Mockups (mô tả)

📌 SLIDE 6: BUSINESS MODEL
- Cách kiếm tiền (Revenue streams)
- Pricing (Bảng giá)
- Unit Economics (CAC, LTV, Margin)

📌 SLIDE 7: TRACTION
- Số liệu đạt được (Users, Revenue, Growth)
- Milestones đã hoàn thành
- Testimonials (nếu có)

📌 SLIDE 8: TEAM
- Founders + Background
- Advisors (nếu có)
- Tại sao team này sẽ thành công?

📌 SLIDE 9: COMPETITION
- Competitive landscape (ma trận cạnh tranh)
- Điểm khác biệt so với từng đối thủ
- Barriers to entry

📌 SLIDE 10: ASK
- Số tiền cần gọi
- Mục đích sử dụng vốn (Use of funds)
- Milestones sau khi nhận vốn
- Thông tin liên hệ

═══════════════════════════════════════════════════════════════
PHẦN B: KẾ HOẠCH TÀI CHÍNH (FINANCIAL PLAN) - CHI TIẾT
═══════════════════════════════════════════════════════════════

📌 SLIDE 11: FINANCIAL PROJECTIONS (Dự báo Tài chính)

11.1 DỰ BÁO DOANH THU (Revenue Forecast) - 3 năm:
| Năm | Số khách hàng | ARPU | Doanh thu | Tăng trưởng |
|-----|---------------|------|-----------|-------------|
| Y1  | ...           | ...  | ...       | -           |
| Y2  | ...           | ...  | ...       | ...%        |
| Y3  | ...           | ...  | ...       | ...%        |

11.2 CƠ CẤU CHI PHÍ (Cost Structure):
- Chi phí cố định: Văn phòng, Lương core team, Phần mềm...
- Chi phí biến đổi: Marketing, Server, Commission...
- Chi phí một lần: Phát triển MVP, Thiết kế, Pháp lý...

11.3 UNIT ECONOMICS:
- CAC (Customer Acquisition Cost): Chi phí có 1 khách hàng
- LTV (Lifetime Value): Giá trị vòng đời khách hàng
- LTV/CAC Ratio: Phải > 3x để bền vững
- Payback Period: Thời gian hoàn vốn mỗi khách

11.4 BREAK-EVEN ANALYSIS (Điểm hòa vốn):
- Số khách hàng cần để hòa vốn: X khách
- Thời gian dự kiến đạt break-even: Y tháng
- Runway với số vốn hiện tại: Z tháng

📌 SLIDE 12: FUNDING & USE OF FUNDS (Vốn & Sử dụng vốn)

12.1 LỊCH SỬ GỌI VỐN (nếu có):
| Vòng | Thời gian | Số tiền | Nhà đầu tư | Valuation |
|------|-----------|---------|------------|-----------|

12.2 VỐN CẦN GỌI LẦN NÀY:
- Số tiền: [X VND / USD]
- Valuation kỳ vọng: [Pre-money / Post-money]
- Loại hình: Equity / Convertible Note / SAFE

12.3 SỬ DỤNG VỐN (Use of Funds):
| Hạng mục | % | Số tiền | Chi tiết |
|----------|---|---------|----------|
| Product Development | 40% | ... | Thuê dev, server, tools |
| Marketing & Sales | 30% | ... | Paid ads, content, events |
| Operations | 20% | ... | Văn phòng, pháp lý, HR |
| Reserve | 10% | ... | Dự phòng chi phí |

═══════════════════════════════════════════════════════════════
PHẦN C: KẾ HOẠCH MARKETING & LAUNCHING (GO-TO-MARKET STRATEGY)
═══════════════════════════════════════════════════════════════

📌 SLIDE 13: GO-TO-MARKET STRATEGY (Chiến lược ra thị trường)

13.1 GIAI ĐOẠN LAUNCHING (3 tháng đầu):

📅 THÁNG 1 - PRE-LAUNCH:
- Xây dựng landing page + waitlist
- Content marketing (Blog, Social)
- Influencer seeding (5-10 KOLs)
- PR: Bài viết trên báo công nghệ/khởi nghiệp
- Target: 1,000 email đăng ký

📅 THÁNG 2 - SOFT LAUNCH:
- Beta testing với 100 early adopters
- Thu thập feedback, fix bugs
- Case studies từ beta users
- Referral program cho early users
- Target: 500 active users

📅 THÁNG 3 - HARD LAUNCH:
- Official launch event (online/offline)
- Paid advertising (Facebook, Google, TikTok)
- PR campaign lớn
- Partnership announcements
- Target: 2,000 paying customers

13.2 KÊNH MARKETING (Channels):
| Kênh | Ngân sách | CAC dự kiến | Mục tiêu |
|------|-----------|-------------|----------|
| Facebook/Instagram Ads | 30% | X VND | Awareness + Acquisition |
| Google Ads | 20% | Y VND | Intent-based acquisition |
| Content Marketing | 15% | Z VND | SEO + Organic |
| Influencer/KOL | 20% | W VND | Trust + Reach |
| Referral Program | 10% | V VND | Viral growth |
| Events/Partnerships | 5% | U VND | B2B leads |

📌 SLIDE 14: MARKETING TIMELINE (Chi tiết theo tuần)

| Tuần | Hoạt động | KPI | Ngân sách | Owner |
|------|-----------|-----|-----------|-------|
| W1-2 | Landing page + Waitlist | 500 signups | 5M | Product |
| W3-4 | Content seeding (10 bài) | 10K views | 3M | Marketing |
| W5-6 | KOL outreach (10 người) | 5 confirmed | 10M | BD |
| W7-8 | Beta launch + Feedback | 100 users | 2M | Product |
| W9-10 | PR articles (5 báo) | 50K reach | 5M | PR |
| W11-12 | Hard launch + Paid ads | 2K customers | 30M | Marketing |

📌 SLIDE 15: KEY METRICS & MILESTONES

15.1 NORTH STAR METRIC:
- Metric chính để đo thành công: [VD: Monthly Active Users, Revenue, etc.]

15.2 MILESTONES 12 THÁNG:
| Milestone | Timeline | Target | Status |
|-----------|----------|--------|--------|
| MVP Launch | M1-2 | Live product | 🟡 |
| Product-Market Fit | M3-6 | 40% retention | ⚪ |
| Break-even | M9-12 | Profitable unit | ⚪ |
| Series A Ready | M12 | 10K users, 500M revenue | ⚪ |

YÊU CẦU ĐẶC BIỆT VỀ FORMAT:
1. **KHÔNG** thêm bất kỳ lời dẫn nhập nào.
2. **CHỈ** xuất ra nội dung thuần túy.
3. Mỗi phần phải có bảng và bullet points chi tiết.
4. Sử dụng emoji và formatting rõ ràng.
5. Số liệu phải realistic và có logic.

HÃY VIẾT NHƯ MỘT FOUNDER ĐANG CHUẨN BỊ GỌI VỐN SERIES A.
`;

const STARTUP_OUTLINE_CRITIC_PROMPT = `
PHẢN BIỆN PITCH DECK - RUBRIC CHI TIẾT (BẮT BUỘC CHẤM ĐIỂM):

1. STORY & FLOW (3 điểm):
   - Mạch truyện có hấp dẫn không?
   - Từ Problem -> Solution -> Ask có logic không?
   - Có "hook" ngay từ slide đầu không?

2. DATA & TRACTION (3 điểm):
   - Số liệu thị trường có nguồn không?
   - Traction có ấn tượng không?
   - Unit Economics có hợp lý không?

3. TEAM & CREDIBILITY (2 điểm):
   - Team có đủ năng lực không?
   - Có unfair advantage từ background không?

4. ASK & USE OF FUNDS (2 điểm):
   - Số tiền xin có hợp lý với milestones?
   - Use of funds có rõ ràng không?

TỔNG ĐIỂM: .../10

NẾU < 9 ĐIỂM:
❌ REJECT - Yêu cầu sửa slide cụ thể.

LƯU Ý:
- Nếu thiếu slide nào trong 10 slides -> Trừ 1 điểm/slide.
- Nếu không có số liệu Market Size -> Trừ 2 điểm.

OUTPUT FORM:
📊 ĐIỂM SỐ: .../10
- Story: .../3
- Data: .../3
- Team: .../2
- Ask: .../2

❌ SLIDES CẦN SỬA:
...

➡️ YÊU CẦU CẢI THIỆN:
...
`;

const STARTUP_SURVEY_WRITER_PROMPT = `
NHIỆM VỤ: Thiết kế Bảng Khảo Sát CUSTOMER DISCOVERY (Khám Phá Khách Hàng).

BỐI CẢNH: Dựa trên Ý tưởng và Lean Canvas đã xây dựng, thiết kế bảng khảo sát để validate giả định với khách hàng thực tế.

PHƯƠNG PHÁP: THE MOM TEST (BẮT BUỘC)
- KHÔNG hỏi ý kiến -> Hỏi về HÀNH VI trong quá khứ
- KHÔNG dẫn dắt câu trả lời -> Để khách hàng tự nói
- KHÔNG pitch sản phẩm -> Chỉ lắng nghe vấn đề

CẤU TRÚC BẢNG KHẢO SÁT:

📌 PHẦN 1: NHÂN KHẨU HỌC (DEMOGRAPHICS)
- Độ tuổi, Giới tính, Nghề nghiệp
- Thu nhập (nếu relevant)
- Khu vực sinh sống/làm việc

📌 PHẦN 2: XÁC NHẬN VẤN ĐỀ (PROBLEM VALIDATION)
VÍ DỤ CÂU HỎI TỐT (Mom Test):
- "Lần cuối bạn gặp vấn đề [X] là khi nào?"
- "Bạn đã làm gì để giải quyết?"
- "Điều gì khiến bạn khó chịu nhất về [Y]?"

VÍ DỤ CÂU HỎI TỆ (TRÁNH):
- "Bạn có thấy [sản phẩm của tôi] hữu ích không?" ❌
- "Bạn có muốn dùng app này không?" ❌

📌 PHẦN 3: GIẢI PHÁP HIỆN TẠI (CURRENT SOLUTIONS)
- Hiện tại bạn đang dùng gì để giải quyết vấn đề này?
- Chi phí bạn đang bỏ ra là bao nhiêu?
- Điểm gì khiến bạn không hài lòng với giải pháp hiện tại?

📌 PHẦN 4: SẴN SÀNG CHI TRẢ (WILLINGNESS TO PAY)
- "Nếu có giải pháp giải quyết [vấn đề], bạn sẵn sàng chi bao nhiêu?"
- Tần suất sử dụng dự kiến
- Yếu tố quyết định mua hàng

📌 PHẦN 5: ƯU TIÊN TÍNH NĂNG (FEATURE PRIORITIZATION)
- Liệt kê 5-7 tính năng tiềm năng
- Yêu cầu xếp hạng theo mức độ quan trọng (1-5)
- Hỏi thêm tính năng nào còn thiếu

YÊU CẦU OUTPUT (MARKDOWN TABLE):

| Phần | Câu hỏi | Loại | Mục đích |
|------|---------|------|----------|
| 1 | Bạn thuộc độ tuổi nào? | Multiple Choice | Demographics |
| 2 | Lần cuối bạn bỏ bữa trưa là khi nào? | Open-ended | Problem Validation |
| ... | ... | ... | ... |

PHƯƠNG ÁN THU THẬP DỮ LIỆU:
1. Phỏng vấn sâu (In-depth Interview): 10-20 người, 30-45 phút/người
2. Khảo sát online (Google Forms): 100-200 responses
3. Landing Page Test: Đo lường conversion rate

SAMPLE SIZE & VALIDATION:
- Minimum: 30 responses để có statistical significance
- Target: 100+ responses cho quantitative insights
`;

const STARTUP_SURVEY_CRITIC_PROMPT = `
PHẢN BIỆN BẢNG KHẢO SÁT CUSTOMER DISCOVERY - RUBRIC CHI TIẾT:

1. MOM TEST COMPLIANCE (3 điểm):
   - Câu hỏi có tránh dẫn dắt không?
   - Có hỏi về hành vi quá khứ thay vì ý kiến?
   - Có tránh pitch sản phẩm trong câu hỏi?

2. PROBLEM VALIDATION DEPTH (3 điểm):
   - Câu hỏi có đào sâu vào pain points?
   - Có hỏi về giải pháp hiện tại?
   - Có đo lường frequency/severity của vấn đề?

3. WILLINGNESS TO PAY (2 điểm):
   - Có câu hỏi về ngân sách không?
   - Có đo conversion intent không?

4. FORMAT & STRUCTURE (2 điểm):
   - Bảng hỏi có đủ các phần cần thiết?
   - Số lượng câu hỏi có hợp lý? (15-25 câu)

TỔNG ĐIỂM: .../10

NẾU < 9 ĐIỂM:
❌ YÊU CẦU SỬA: Chỉ ra cụ thể câu hỏi nào cần sửa/xóa/thêm.

LƯU Ý ĐẶC BIỆT:
- Nếu có câu hỏi dẫn dắt (leading question) -> Trừ 1 điểm/câu
- Nếu thiếu phần Willingness to Pay -> Trừ 2 điểm

OUTPUT:
📊 ĐIỂM SỐ: .../10
❌ CÂU HỎI CẦN SỬA:
1. Câu X: [Vấn đề] -> [Gợi ý sửa]
2. ...

➡️ CÂU HỎI NÊN THÊM:
...
`;

export class AgentSession {
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
    public projectType: ProjectType = 'RESEARCH', // NEW: Support startup projects
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

  private async callGeminiAPI(model: string, prompt: string, customKey?: string, retries = 3): Promise<string> {
    try {
      // Call server-side proxy instead of direct API
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // If custom key provided, add it to headers
      if (customKey) {
        headers['x-gemini-api-key'] = customKey;
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          prompt,
          useCustomKey: !!customKey
        })
      });

      const data = await response.json();

      // Handle errors from proxy
      if (!response.ok) {
        const errorMsg = data.error || 'Unknown error';

        console.error(`🚨 Gemini Proxy Error:`, {
          model,
          status: response.status,
          message: errorMsg,
          retriesLeft: retries
        });

        // Handle Rate Limit (429)
        if (response.status === 429) {
          if (retries > 0) {
            const waitTime = 10000 * (4 - retries); // 10s, 20s, 30s
            console.warn(`⚠️ Rate Limit. Retrying in ${waitTime / 1000}s... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.callGeminiAPI(model, prompt, customKey, retries - 1);
          }
          throw new Error(`Hết quota hoặc vượt giới hạn. Vui lòng thử lại sau hoặc sử dụng API Key riêng trong Cài đặt.`);
        }

        // Unauthorized (need login)
        if (response.status === 401) {
          throw new Error(`Vui lòng đăng nhập để sử dụng tính năng AI.`);
        }

        // Other errors
        throw new Error(errorMsg);
      }

      return data.text || "Lỗi: Không có phản hồi từ AI.";

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Network errors -> Retry
      if (retries > 0 && (error.message?.includes('fetch') || error.message?.includes('network'))) {
        console.warn(`Network error, retrying... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return this.callGeminiAPI(model, prompt, customKey, retries - 1);
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

      // Choose prompts based on project type
      if (this.projectType === 'STARTUP') {
        // STARTUP PROJECT PROMPTS
        switch (step) {
          case '1_TOPIC':
            sysPrompt = STARTUP_TOPIC_WRITER_PROMPT;
            break;
          case '2_MODEL':
            sysPrompt = STARTUP_MODEL_WRITER_PROMPT;
            if (this.finalizedTopic) {
              contextAddition = `\n\nÝ TƯỞNG KINH DOANH ĐÃ PHÊ DUYỆT:\n"${this.finalizedTopic}"`;
            }
            break;
          case '3_OUTLINE':
            sysPrompt = STARTUP_OUTLINE_WRITER_PROMPT;
            if (this.finalizedTopic) {
              contextAddition += `\n\nÝ TƯỞNG KINH DOANH:\n"${this.finalizedTopic}"`;
            }
            if (this.finalizedModel) {
              contextAddition += `\n\nLEAN CANVAS ĐÃ PHÊ DUYỆT:\n${this.finalizedModel.substring(0, 1500)}...`;
            }
            if (this.finalizedModelChart) {
              contextAddition += `\n\nSƠ ĐỒ BUSINESS MODEL:\n\`\`\`mermaid\n${this.finalizedModelChart}\n\`\`\``;
            }
            break;
          case '4_SURVEY':
            sysPrompt = STARTUP_SURVEY_WRITER_PROMPT;
            if (this.finalizedTopic) {
              contextAddition += `\n\nÝ TƯỞNG: "${this.finalizedTopic}"`;
            }
            if (this.finalizedModel) {
              contextAddition += `\n\nLEAN CANVAS: ${this.finalizedModel.substring(0, 500)}...`;
            }
            if (this.finalizedOutline) {
              contextAddition += `\n\nPITCH DECK (trích đoạn): ${this.finalizedOutline.substring(0, 500)}...`;
            }
            break;
        }
      } else {
        // RESEARCH PROJECT PROMPTS (existing logic)
        switch (step) {
          case '1_TOPIC':
            sysPrompt = TOPIC_WRITER_PROMPT;
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
          case '4_SURVEY':
            sysPrompt = getSurveyWriterPrompt(this.level);
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
      }

      const context = `CHỦ ĐỀ GỐC: ${this.topic}\nLOẠI HÌNH (OUTPUT): ${this.goal}\nĐỐI TƯỢNG: ${this.audience}\nTRÌNH ĐỘ: ${this.level}\nNGÔN NGỮ ĐẦU RA (OUTPUT LANGUAGE): ${this.language === 'en' ? 'ENGLISH (100%)' : 'VIETNAMESE (100%)'}${contextAddition}`;;

      const prompt = previousCriticFeedback
        ? `${context}\n\nPHẢN HỒI CỦA CRITIC (Vòng trước): ${previousCriticFeedback}\n\n${sysPrompt}\nHãy cải thiện/viết tiếp dựa trên phản hồi này.`
        : `${context}\n\n${sysPrompt}\nHãy bắt đầu thực hiện nhiệm vụ cho giai đoạn này.`;

      // Use Gemini 3 Flash Preview (pass custom key if available)
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

      // Choose critic prompts based on project type
      if (this.projectType === 'STARTUP') {
        switch (step) {
          case '1_TOPIC': sysPrompt = STARTUP_TOPIC_CRITIC_PROMPT; break;
          case '2_MODEL': sysPrompt = STARTUP_MODEL_CRITIC_PROMPT; break;
          case '3_OUTLINE': sysPrompt = STARTUP_OUTLINE_CRITIC_PROMPT; break;
          case '4_SURVEY': sysPrompt = STARTUP_SURVEY_CRITIC_PROMPT; break;
        }
      } else {
        switch (step) {
          case '1_TOPIC': sysPrompt = TOPIC_CRITIC_PROMPT; break;
          case '2_MODEL': sysPrompt = getModelCriticPrompt(this.level); break;
          case '3_OUTLINE': sysPrompt = OUTLINE_CRITIC_PROMPT; break;
          case '4_SURVEY': sysPrompt = SURVEY_CRITIC_PROMPT; break;
        }
      }

      const prompt = `${sysPrompt}\n\nBÀI LÀM CỦA WRITER:\n${writerDraft}\n\nHãy đóng vai trò Critic và đưa ra nhận xét chi tiết, khắt khe.`;

      // Use Gemini 3 Flash Preview (pass custom key if available)
      return await this.callGeminiAPI('gemini-3-flash-preview', prompt, geminiKey);

    } catch (error) {
      return `Lỗi Critic (Quota/Network): ${error}`;
    }
  }
}
