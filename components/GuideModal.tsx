import React from 'react';
import { X, BookOpen, Users, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

interface GuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GuideModal = ({ isOpen, onClose }: GuideModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-200">
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
                            <h3>1. Loại hình bài viết (Output)</h3>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-lg space-y-3 text-sm text-slate-600 border border-slate-100">
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <span className="font-semibold text-slate-800 min-w-[140px]">Tiểu luận/Khóa luận:</span>
                                    <span>Yêu cầu cơ bản về cấu trúc, độ dài 3.000 - 10.000 từ. Tập trung vào tổng quan tài liệu và phân tích sơ bộ.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-semibold text-slate-800 min-w-[140px]">Luận văn Thạc sĩ:</span>
                                    <span>Yêu cầu tính mới (Novelty) và đóng góp thực tiễn/lý luận. Cần mô hình nghiên cứu và kiểm định giả thuyết chặt chẽ.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-semibold text-slate-800 min-w-[140px]">Bài báo Quốc tế:</span>
                                    <span>Tiêu chuẩn khắt khe nhất (ISI/Scopus). Đòi hỏi phương pháp luận vững chắc, đóng góp học thuật rõ ràng và văn phong tiếng Anh học thuật chuẩn mực.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 2: Audience */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-base font-bold text-slate-900 uppercase tracking-wide">
                            <Users size={18} className="text-blue-600" />
                            <h3>2. Đối tượng độc giả</h3>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-lg space-y-3 text-sm text-slate-600 border border-slate-100">
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <span className="font-semibold text-slate-800 min-w-[140px]">Giảng viên hướng dẫn:</span>
                                    <span>Quan tâm đến tiến độ, tuân thủ quy trình và sự phù hợp của đề tài với hướng nghiên cứu.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-semibold text-slate-800 min-w-[140px]">Hội đồng phản biện:</span>
                                    <span>Tập trung soi xét các "lỗ hổng" logic, phương pháp nghiên cứu và tính xác thực của dữ liệu. Cần lập luận chặt chẽ để thuyết phục.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-semibold text-slate-800 min-w-[140px]">Cộng đồng học thuật:</span>
                                    <span>Quan tâm đến đóng góp mới của bài viết vào kho tàng tri thức chung.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>,
        document.body
    );
};
