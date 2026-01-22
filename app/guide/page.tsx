"use client";

import React from "react";
import {
    BookOpen,
    Settings,
    Sparkles,
    MessageSquare,
    FileText,
    Target,
    Share2,
    ShieldCheck,
    Download,
    Lightbulb,
    Rocket,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

const GuideSection = ({ title, icon: Icon, children, id }: { title: string, icon: any, children: React.ReactNode, id: string }) => (
    <section id={id} className="mb-16 scroll-mt-24">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Icon size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-4 text-slate-600 leading-relaxed">
            {children}
        </div>
    </section>
);

const Step = ({ number, title, desc }: { number: number, title: string, desc: string }) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
            {number}
        </div>
        <div>
            <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
            <p className="text-sm">{desc}</p>
        </div>
    </div>
);

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-blue-600">
                            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-slate-800">Hải Debate Guide</span>
                    </Link>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        Quay lại App <ArrowRight size={16} />
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <div className="pt-32 pb-12 px-6 bg-gradient-to-b from-blue-50 to-slate-50 border-b border-slate-200">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-6">
                        <BookOpen size={16} /> Hướng Dẫn Sử Dụng
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                        Cách "Chiến" Luận Văn & Startup <br /> cùng Hải Debate
                    </h1>
                    <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                        Chào mừng bạn đến với vũ trụ "phản biện" của Reviewer #2! Đây là hướng dẫn chi tiết từ A-Z để bạn không bị lạc lối giữa ma trận kiến thức.
                    </p>
                </div>
            </div>

            {/* TOC (Table of Contents) - Sticky on Desktop */}
            <main className="max-w-4xl mx-auto px-6 py-12 relative flex flex-col md:flex-row gap-12">
                {/* Sidebar Navigation */}
                <aside className="hidden md:block w-64 flex-shrink-0">
                    <div className="sticky top-24 space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Mục Lục</p>
                        {[
                            { id: "start", label: "1. Bắt đầu (Setup)" },
                            { id: "research", label: "2. Chế độ Nghiên cứu" },
                            { id: "startup", label: "3. Chế độ Startup" },
                            { id: "export", label: "4. Xuất Báo cáo" },
                            { id: "tips", label: "5. Bí kíp (Pro Tips)" },
                        ].map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </aside>

                {/* Content */}
                <div className="flex-1">

                    {/* 1. Setup */}
                    <GuideSection id="start" title="1. Hành Trang Bắt Đầu" icon={Settings}>
                        <p className="mb-4">Trước khi ra khơi, bạn cần chuẩn bị "vũ khí". Hệ thống này dùng AI của Google (Gemini) để hoạt động.</p>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                                    <ShieldCheck size={18} className="text-green-600" /> Đăng nhập
                                </h3>
                                <p className="text-sm">Bạn có thể dùng Gmail hoặc ORCID để đăng nhập. Hệ thống sẽ lưu lại toàn bộ tiến độ của bạn.</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                                    <Settings size={18} className="text-purple-600" /> Cài đặt API
                                </h3>
                                <p className="text-sm">Đây là bước QUAN TRỌNG NHẤT. Bạn cần nhập 2 Key (Writer & Critic) để AI không bị "kiệt sức" giữa chừng.</p>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-100">
                            <strong>💡 Mẹo:</strong> Hãy xem hướng dẫn chi tiết cách lấy Key bằng cách bấm vào biểu tượng dấu hỏi chấm (?) trên thanh menu chính.
                        </div>
                    </GuideSection>

                    {/* 2. Research Mode */}
                    <GuideSection id="research" title="2. Chế độ Nghiên Cứu (Academic)" icon={FileText}>
                        <p className="mb-4">Dành cho sinh viên, học viên cao học làm Khóa luận, Luận văn. Hải Debate sẽ đóng vai một "Reviewer khó tính" để soi bài của bạn.</p>

                        <div className="space-y-6">
                            <Step
                                number={1}
                                title="Chọn Chủ Đề (Topic)"
                                desc="Nhập ý tưởng ban đầu của bạn. AI sẽ giúp bạn tinh chỉnh tên đề tài sao cho 'kêu' và đúng chuẩn học thuật."
                            />
                            <Step
                                number={2}
                                title="Tổng Quan Tài Liệu (Lit Review)"
                                desc="Hệ thống sẽ tìm các luồng lý thuyết liên quan và chỉ ra 'Khe hổng nghiên cứu' (Research Gap). Critic sẽ kiểm tra xem Gap này có thực sự tồn tại không."
                            />
                            <Step
                                number={3}
                                title="Mô Hình & Giả Thuyết (Model)"
                                desc="AI sẽ vẽ sơ đồ mô hình nghiên cứu (biến độc lập, phụ thuộc...) và biện luận các giả thuyết H1, H2... Critic sẽ soi tính logic của mô hình này."
                            />
                            <Step
                                number={4}
                                title="Đề Cương & Phương Pháp"
                                desc="Cuối cùng, AI sẽ viết chi tiết đề cương và thiết kế bảng câu hỏi khảo sát (Survey) hoặc phương pháp phỏng vấn."
                            />
                        </div>
                    </GuideSection>

                    {/* 3. Startup Mode */}
                    <GuideSection id="startup" title="3. Chế độ Startup (Kinh Doanh)" icon={Rocket}>
                        <p className="mb-4">Dành cho các bạn muốn khởi nghiệp hoặc thi ý tưởng kinh doanh. Thay vì viết văn, chúng ta sẽ làm các tài liệu thực chiến.</p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                <Target className="mt-1 text-red-500" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Idea Validation</h4>
                                    <p className="text-sm">Kiểm tra xem ý tưởng của bạn có ai cần không. Đừng làm cái không ai mua!</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                <MessageSquare className="mt-1 text-green-500" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Lean Canvas</h4>
                                    <p className="text-sm">Vẽ mô hình kinh doanh trên 1 trang giấy (9 ô). Cực kỳ quan trọng để nhìn tổng thể.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                <Share2 className="mt-1 text-blue-500" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Pitch Deck & GTM</h4>
                                    <p className="text-sm">Tạo slide gọi vốn (10-12 slides) và chiến lược ra mắt thị trường (Go-to-Market) trong 90 ngày đầu.</p>
                                </div>
                            </div>
                        </div>
                    </GuideSection>

                    {/* 4. Export */}
                    <GuideSection id="export" title="4. Xuất Báo Cáo & Chia Sẻ" icon={Download}>
                        <p>Sau khi hoàn thành các bước, bạn có thể:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Xuất Word (.docx):</strong> Tải về để chỉnh sửa thêm và nộp cho giảng viên.</li>
                            <li><strong>Xuất PDF:</strong> Để gửi nhanh hoặc in ấn.</li>
                            <li><strong>Chia sẻ (Share):</strong> Gửi link project cho bạn bè hoặc giảng viên hướng dẫn để họ xem trực tiếp trên web.</li>
                        </ul>
                    </GuideSection>

                    {/* 5. Pro Tips */}
                    <GuideSection id="tips" title="5. Bí Kíp của 'Dân Chơi' Nghiên Cứu" icon={Lightbulb}>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
                                <span className="text-2xl mb-2 block">🧐</span>
                                <h4 className="font-bold text-indigo-900 mb-1">Đừng tin AI 100%</h4>
                                <p className="text-xs text-indigo-700">AI có thể "chém gió" (hallucinate). Đặc biệt là trích dẫn. Hãy dùng tính năng <strong>Citation Checker</strong> để kiểm tra lại.</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                                <span className="text-2xl mb-2 block">🔄</span>
                                <h4 className="font-bold text-purple-900 mb-1">Thử lại (Retry)</h4>
                                <p className="text-xs text-purple-700">Nếu thấy AI trả lời chưa hay, hãy bấm nút "Làm lại" hoặc sửa prompt để AI hiểu ý bạn hơn.</p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-100">
                                <span className="text-2xl mb-2 block">🎯</span>
                                <h4 className="font-bold text-orange-900 mb-1">Chọn đúng Level</h4>
                                <p className="text-xs text-orange-700">Đừng chọn PhD nếu bạn chỉ làm tiểu luận. Critic sẽ "hành" bạn ra bã đấy!</p>
                            </div>
                        </div>
                    </GuideSection>

                </div>
            </main>

            {/* Footer CTA */}
            <div className="py-12 bg-slate-900 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Sẵn sàng để "chiến" chưa?</h3>
                <Link
                    href="/"
                    className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-all hover:scale-105"
                >
                    Bắt đầu Dự án Mới ngay 🚀
                </Link>
            </div>

        </div>
    );
}
