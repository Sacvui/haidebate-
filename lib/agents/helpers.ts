import { AcademicLevel } from './types';
import { GOAL_OPTIONS } from '../constants';

// --- PROMPTS HELPERS ---

export const getModelRequirements = (level: AcademicLevel) => {
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

export const getOutlineStructure = (outputType: string) => {
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

export const getCriticPersona = (level: AcademicLevel) => {
    switch (level) {
        case 'UNDERGRAD': return "Giảng viên khó tính (Strict Instructor). Đòi hỏi tính Logic và Tuân thủ quy tắc.";
        case 'MASTER': return "Hội đồng phản biện sắc sảo (Critical Council). Tấn công vào phương pháp luận và cơ sở lý thuyết.";
        case 'PHD': return "Reviewer 2 (Top Journal). Cực kỳ tàn nhẫn và hoài nghi. Soi mói từng lỗ hổng nhỏ nhất về tính mới (Novelty).";
        default: return "Nhà phản biện";
    }
};
