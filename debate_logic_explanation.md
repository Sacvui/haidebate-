# Thuật Toán và Các Lệnh (Prompts) trong Hệ thống Hải Debate

Tài liệu này giải thích chi tiết cơ chế hoạt động, thuật toán tranh luận và các câu lệnh (Prompts) được sử dụng để điều khiển 2 AI (Writer và Critic).

## 1. Thuật Toán Tranh Luận (The Debate Algorithm)

Hệ thống hoạt động dựa trên một **Máy Trạng Thái (State Machine)** kết hợp với **Vòng lặp Phản hồi (Feedback Loop)**.

### Cấu Trúc Tổng Quan
*   **3 Giai Đoạn (Phases):**
    1.  `1_TOPIC`: Thẩm định & Chọn Đề tài.
    2.  `2_MODEL`: Xây dựng Mô hình & Cơ sở lý thuyết.
    3.  `3_OUTLINE`: Viết Đề cương chi tiết.
*   **Số Vòng Phản Biện (Rounds):** Được cấu hình cứng (Config Hardcoded).
    *   Topic: 2 Vòng.
    *   Model: 3 Vòng.
    *   Outline: 3 Vòng.

### Luồng Xử Lý (The Core Loop - `runStepLoop`)
Quy trình diễn ra tự động như sau:

1.  **Khởi tạo (Start):** Người dùng chọn Giai đoạn.
2.  **Bước 1: Writer Khởi Tạo (Writer Initial Proposal)**
    *   Hệ thống gọi Writer AI.
    *   Input: Yêu cầu người dùng (Topic, Goal, Level).
    *   Output: Bản nháp đầu tiên (Draft v1).
3.  **Vòng Lặp Tranh Luận (Debate Loop)** - chạy từ `Round 1` đến `MaxRound`:
    *   **Bước A: Critic Phản Biện**
        *   Input: Bản nháp hiện tại của Writer + Persona (Vai trò) của Critic.
        *   Output: Nhận xét (Feedback) - chỉ ra lỗi sai, lỗ hổng logic, thiếu tính mới.
    *   **Bước B: Writer Chỉnh Sửa (Writer Revision)**
        *   *Nếu chưa phải vòng cuối cùng:*
        *   Input: Bản nháp cũ + Lời chê của Critic.
        *   Logic: AI Writer phải "đọc" lời chê -> Tư duy lại -> Viết lại bản mới (Draft v+1).
4.  **Kết Thúc (Finalize):**
    *   Tại vòng cuối cùng, Writer đưa ra bản chốt (Final Choice/Final Draft).

---

## 2. Các Lệnh Điều Khiển (System Prompts & Commands)

Mỗi AI (Writer/Critic) được lập trình bằng các "Prompt" (Câu lệnh hệ thống) riêng biệt, thay đổi theo **Trình độ học thuật** (`Undergrad`, `Master`, `PhD`).

### A. Người Viết (The Writer)
Mục tiêu: Đề xuất, Viết, Sửa chữa.

*   **Lệnh Cốt Lõi (Core Instruction):**
    > "Quy trình suy nghĩ (Chain of Thought): Phân tích -> Xử lý phản biện -> Đề xuất."
*   **Ví dụ Lệnh (Giai đoạn Đề tài):**
    > "Nếu Critic chê, hãy sửa chữa ngay lập tức. Đừng ngoan cố, nhưng phải bảo vệ lập trường nếu đúng. Ở vòng cuối, hãy ĐỀ XUẤT 1 PHƯƠNG ÁN CHỐT."
*   **Ví dụ Lệnh (Giai đoạn Mô hình - PhD):**
    > "Giải quyết mâu thuẫn lý thuyết & Cơ chế (Mechanism). Số lượng biến: 8-15 biến. Bắt buộc sơ đồ Mermaid."

### B. Người Phản Biện (The Critic)
Mục tiêu: Tấn công, Soi lỗi, Hoài nghi.

*   **Hệ Thống Persona (Nhân Vật):**
    *   **Đại học (Undergrad):** "Giảng viên khó tính" -> Soi quy tắc, format.
    *   **Thạc sĩ (Master):** "Hội đồng phản biện" -> Soi phương pháp luận, biến trung gian/điều tiết.
    *   **Tiến sĩ (PhD):** "Reviewer 2 (Tạp chí Top)" -> *Cực kỳ tàn nhẫn*. Soi tính mới (Novelty) và sự đóng góp (Contribution).
*   **Lệnh Tấn Công (Attack Pattern):**
    > "VAI TRÒ: Đối thủ phản biện. KHÔNG PHẢI GIÁO VIÊN."
    > "TONE: Thẳng thắn, sắc bén, hoài nghi. Đừng khen ngợi xã giao."
    > "TIÊU CHÍ: Tính mới? Dữ liệu đâu? Đo lường thế nào?"

## 3. Mã Nguồn Tham Khảo (Source Code Mapping)

*   **Logic Vòng Lặp:** Nằm trong file `components/DebateManager.tsx` (Hàm `runStepLoop`).
*   **Cấu Hình Prompts:** Nằm trong file `lib/agents.ts`.
    *   `TOPIC_WRITER_PROMPT` / `TOPIC_CRITIC_PROMPT`
    *   `getModelWriterPrompt(level)`
    *   `getCriticPersona(level)`

---
*Tài liệu này được tạo tự động để giải thích kiến trúc hệ thống Hải Debate.*
