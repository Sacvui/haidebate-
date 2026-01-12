import React from 'react';
import { X, BookOpen, Users, Info } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GuideModal = ({ isOpen, onClose }: GuideModalProps) => {

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    ></motion.div>

                    {/* Modal Content */}
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-slate-200"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Header */}
                        <div className="bg-slate-50 p-6 flex justify-between items-start border-b border-slate-100">
                            <div className="flex gap-4">
                                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                    <Info size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Hướng Dẫn Chọn Loại Hình & Độc Giả
                                    </h2>
                                    <p className="text-slate-500 text-sm">Các tiêu chuẩn học thuật cần lưu ý</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

                            {/* Section 1: Output */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-base font-bold text-slate-900 uppercase tracking-wide">
                                    <BookOpen size={18} className="text-blue-600" />
                                    <h3>1. Loại hình bài viết (Structure & Insight)</h3>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-lg space-y-4 text-sm text-slate-600 border border-slate-100">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-800 text-base">📘 Tiểu luận / Khóa luận</div>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong>Cấu trúc:</strong> Mở bài (Đặt vấn đề) → Thân bài (Phân tích, Tổng hợp) → Kết luận.</li>
                                            <li><strong>Insight:</strong> Giảng viên tìm kiếm khả năng <em>tổng hợp kiến thức</em> và tư duy logic cơ bản. Không cần quá nhiều tính mới, nhưng phải trích dẫn nguồn chuẩn xác.</li>
                                        </ul>
                                    </div>
                                    <div className="w-full h-px bg-slate-200"></div>
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-800 text-base">🎓 Luận văn Thạc sĩ (Master's Thesis)</div>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong>Cấu trúc:</strong> Intro → Literature Review (Khe hổng nghiên cứu) → Methodology → Results → Discussion.</li>
                                            <li><strong>Insight:</strong> Từ khóa là <em>"Khe hổng nghiên cứu" (Research Gap)</em>. Bạn phải chỉ ra các nghiên cứu trước chưa làm được gì và bài của bạn lấp đầy khoảng trống đó như thế nào.</li>
                                        </ul>
                                    </div>
                                    <div className="w-full h-px bg-slate-200"></div>
                                    <div className="space-y-2">
                                        <div className="font-semibold text-slate-800 text-base">🌍 Bài báo Quốc tế (ISI/Scopus)</div>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li><strong>Cấu trúc:</strong> IMRaD (Introduction - Methods - Results - Discussion). Cực kỳ chặt chẽ.</li>
                                            <li><strong>Insight:</strong> Reviewer quốc tế "soi" rất kỹ phần <em>Phương pháp luận (Methodology)</em> và <em>Đóng góp mới (Novelty)</em>. Số liệu phải tin cậy, biện luận phải sắc bén.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Audience */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-base font-bold text-slate-900 uppercase tracking-wide">
                                    <Users size={18} className="text-blue-600" />
                                    <h3>2. Đối tượng độc giả (Họ muốn nghe gì?)</h3>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-lg space-y-3 text-sm text-slate-600 border border-slate-100">
                                    <ul className="space-y-3">
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-slate-800 min-w-[150px]">Giảng viên hướng dẫn:</span>
                                            <span>"Em có làm đúng tiến độ và quy định không?". Muốn thấy sự nỗ lực và tuân thủ.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-slate-800 min-w-[150px]">Hội đồng phản biện:</span>
                                            <span>"Tại sao lại chọn phương pháp này mà không phải phương pháp kia?". Họ đóng vai trò "Devil's Advocate" để thử thách sự vững chắc của lập luận.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-slate-800 min-w-[150px]">Reviewer Quốc tế:</span>
                                            <span>"Bài này có gì mới so với thế giới không?". Họ quan tâm đến giá trị đóng góp toàn cầu (Global Contribution).</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
