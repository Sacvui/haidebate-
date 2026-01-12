import React from 'react';
import { X, Smile, BookOpen, Users } from 'lucide-react';
import { createPortal } from 'react-dom';

interface HumorousGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HumorousGuideModal = ({ isOpen, onClose }: HumorousGuideModalProps) => {
    if (!isOpen) return null;

    // Use portal to render at root level to ensure z-index works correctly
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden border-4 border-dashed border-indigo-200">
                {/* Header */}
                <div className="bg-indigo-50 p-6 flex justify-between items-start border-b border-indigo-100">
                    <div className="flex gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm rotate-3">
                            <Smile size={32} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                Giải Ngố Thuật Ngữ 🧐
                            </h2>
                            <p className="text-indigo-600 font-medium">Bí kíp sinh tồn trong giới học thuật</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

                    {/* Section 1: Output */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-lg font-bold text-slate-900">
                            <BookOpen className="text-blue-500" />
                            <h3>1. Loại hình bài viết (Output) là cái gì?</h3>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-xl space-y-3 text-slate-600 leading-relaxed border border-slate-100">
                            <p>
                                <strong className="text-slate-800">Tiểu luận:</strong> Là bài tập về nhà phiên bản "nâng cấp", viết để thầy cô biết mình có đi học và (hy vọng) hiểu bài.
                            </p>
                            <p>
                                <strong className="text-slate-800">Luận văn Thạc sĩ:</strong> Là khi bạn nhận ra "Tiểu luận" chỉ là trò trẻ con. Bạn phải chứng minh mình có thể nghiên cứu một vấn đề gì đó sâu sắc (hoặc ít nhất là làm cho nó có vẻ sâu sắc).
                            </p>
                            <p>
                                <strong className="text-slate-800">Bài báo Quốc tế (ISI/Scopus):</strong> Đấu trường sinh tử. Nơi bạn viết tiếng Anh như người bản xứ (nhờ AI) và chiến đấu với những Reviewer khó tính nhất quả đất. Đạt được cái này là "oách" nhất!
                            </p>
                        </div>
                    </div>

                    {/* Section 2: Audience */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-lg font-bold text-slate-900">
                            <Users className="text-orange-500" />
                            <h3>2. Đối tượng độc giả là ai?</h3>
                        </div>
                        <div className="bg-orange-50/50 p-5 rounded-xl space-y-3 text-slate-600 leading-relaxed border border-orange-100">
                            <p>
                                <strong className="text-slate-800">Giảng viên hướng dẫn:</strong> Người nắm giữ vận mệnh của bạn. Viết sao cho thầy/cô vui là được (nhưng nhớ phải đúng format).
                            </p>
                            <p>
                                <strong className="text-slate-800">Hội đồng phản biện:</strong> Những người sẽ đặt những câu hỏi mà bạn chưa bao giờ nghĩ tới (và cũng không biết trả lời sao). Mục tiêu: Viết thật chặt chẽ để họ "hết đường bắt bẻ".
                            </p>
                            <p>
                                <strong className="text-slate-800">Cộng đồng học thuật:</strong> Những người bạn chưa từng gặp nhưng sẽ đọc bài của bạn (hy vọng thế). Viết để đóng góp tri thức cho nhân loại (hoặc ít nhất là tăng số lượng bài báo).
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 italic">
                    *Đọc xong cười xỉu nhưng nhớ quay lại làm bài nghiêm túc nhé!
                </div>
            </div>
        </div>,
        document.body
    );
};
