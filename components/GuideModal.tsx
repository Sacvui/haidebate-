import React from 'react';
import { X, ExternalLink, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GuideModal = ({ isOpen, onClose }: GuideModalProps) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white sticky top-0 z-20">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <HelpCircle className="text-blue-600" size={24} />
                            Hướng Dẫn Lấy API Key
                        </h3>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-8">

                        {/* Intro */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-800 text-sm">
                            <p className="font-semibold mb-1">Tại sao cần 2 Key?</p>
                            <p>Để "Cuộc tranh biện" diễn ra mượt mà nhất, chúng tôi sử dụng 2 mô hình AI riêng biệt: một người viết (Proposer) và một người phản biện (Critic). Dùng 2 Key từ 2 tài khoản Google khác nhau giúp bạn <strong>nhân đôi giới hạn sử dụng (Quota)</strong> miễn phí!</p>
                        </div>

                        {/* Step 1 */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span>
                                Truy cập Google AI Studio
                            </h4>
                            <p className="text-slate-600 text-sm ml-8">Truy cập đường dẫn bên dưới và đăng nhập bằng tài khoản Google của bạn.</p>
                            <div className="ml-8">
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                >
                                    <ExternalLink size={16} />
                                    Lấy API Key tại đây
                                </a>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
                                Tạo Key mới
                            </h4>
                            <div className="ml-8 space-y-2 text-sm text-slate-600">
                                <p>1. Nhấn vào nút <span className="font-bold text-slate-800">Create API key</span>.</p>
                                <p>2. Chọn <span className="font-bold text-slate-800">Create API key in new project</span>.</p>
                                <p>3. Copy đoạn mã bắt đầu bằng <code>AIza...</code></p>
                            </div>
                            <div className="ml-8 bg-slate-100 p-3 rounded-lg border border-slate-200">
                                <div className="h-2 w-3/4 bg-slate-200 rounded mb-2"></div>
                                <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">3</span>
                                Nhập vào Hệ thống
                            </h4>
                            <div className="ml-8 text-sm text-slate-600">
                                <p className="mb-2">Quay lại trang này, mở mục <span className="font-bold text-slate-800 inline-flex items-center gap-1">Cài đặt API Key</span> trên thanh menu.</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Dán Key thứ 1 vào ô <strong>Writer AI</strong>.</li>
                                    <li>Đăng xuất Google, đăng nhập tài khoản Google khác, lấy Key thứ 2.</li>
                                    <li>Dán Key thứ 2 vào ô <strong>Critic AI</strong>.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Note */}
                        <div className="border-t border-slate-100 pt-6">
                            <p className="text-xs text-slate-400 text-center">
                                * API Key của bạn được lưu cục bộ trên trình duyệt (LocalStorage) và gửi trực tiếp đến Google AI Studio. Chúng tôi không lưu trữ Key của bạn trên máy chủ.
                            </p>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl sticky bottom-0">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                            Đã Hiểu, Bắt Đầu Thôi!
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};
