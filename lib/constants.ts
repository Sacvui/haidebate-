
import { AcademicLevel, ProjectType } from './agents';

export const ACADEMIC_LEVELS: { value: AcademicLevel; label: string }[] = [
    { value: 'UNDERGRAD', label: 'Sinh Viên' },
    { value: 'MASTER', label: 'Thạc Sĩ' },
    { value: 'PHD', label: 'Tiến Sĩ / Công Bố' },
];

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
    { value: 'RESEARCH', label: 'Tiểu luận / Nghiên cứu' },
    { value: 'STARTUP', label: 'Dự án Khởi nghiệp' },
];

export const GOAL_OPTIONS = {
    UNDERGRAD_RESEARCH: "Tiểu luận Đại học/Khóa luận",
    MASTER_THESIS: "Luận văn Thạc sĩ",
    PHD_DISSERTATION: "Bài báo quốc tế (ISI/Scopus) / Đề án Tiến sĩ",
    DOMESTIC_PAPER: "Nghiên cứu khoa học/Đăng báo trong nước",
    GRANT_PROPOSAL: "Đề xuất dự án (Grant Proposal)",
    STARTUP_PLAN: "Pitch Deck / Business Plan",
} as const;

export const AUDIENCE_OPTIONS = [
    "Hội đồng phản biện chuyên môn",
    "Tạp chí Quốc tế (ISI/Scopus)",
    "Giảng viên hướng dẫn",
    "Cộng đồng học thuật",
    "Nhà đầu tư / Quỹ Khởi nghiệp"
];
