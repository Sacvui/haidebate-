"use client";

import React from "react";
import { Sparkles, Users, Zap, Heart, ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { ImpactStats } from "@/components/ImpactStats";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-blue-600 shadow-lg shadow-blue-500/30">
                            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">Hải Debate</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/guide" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Hướng dẫn</Link>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            Vào App ngay <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white z-0"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
                        <Sparkles size={14} /> The Art of Scientific Debate
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 leading-tight">
                        Nghiên cứu không phải <br /> là sự cô đơn.
                    </h1>

                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Hải Debate sinh ra để làm bạn đồng hành cùng những nhà nghiên cứu trẻ.
                        Chúng tôi biến việc viết luận văn khô khan thành một cuộc "tranh biện" đầy màu sắc với AI.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-500/30 hover:bg-blue-500 hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            <Zap size={20} /> Bắt đầu Dự án Mới
                        </Link>
                        <a
                            href="https://github.com/Sacvui/haidebate-"
                            target="_blank"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                        >
                            <Github size={20} /> Star on GitHub
                        </a>
                    </div>

                    <div className="mt-12 opacity-80 scale-90">
                        <ImpactStats />
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-slate-900">Tại sao lại là "Debate"?</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Khoa học phát triển nhờ sự phản biện. Nhưng không phải ai cũng có một người hướng dẫn (Mentor) luôn túc trực để phản bác ý tưởng của mình.
                            </p>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Hải Debate tạo ra <strong>Critic AI</strong> - một "Reviewer khó tính" ảo. Nó sẽ không khen bạn đâu. Nó sẽ tìm ra lỗi sai, lỗ hổng logic, và bắt bạn phải suy nghĩ sâu hơn.
                                Đó mới là cách để tiến bộ.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4"><Zap size={20} /></div>
                                <h3 className="font-bold text-slate-900 mb-2">Phản biện tức thì</h3>
                                <p className="text-sm text-slate-500">Không cần đợi email hàng tuần. Nhận feedback ngay lập tức.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-8">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4"><Users size={20} /></div>
                                <h3 className="font-bold text-slate-900 mb-2">Đa vai trò</h3>
                                <p className="text-sm text-slate-500">Một AI viết, một AI chấm. Khách quan tuyệt đối.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4"><Heart size={20} /></div>
                                <h3 className="font-bold text-slate-900 mb-2">Miễn phí trọn đời</h3>
                                <p className="text-sm text-slate-500">Chỉ cần API Key của bạn. Chúng tôi không thu phí nền tảng.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-slate-900 text-slate-400 text-center">
                <div className="max-w-2xl mx-auto">
                    <p className="mb-4 text-slate-500">Được phát triển với tình yêu khoa học</p>
                    <h3 className="text-xl font-bold text-white mb-2">Hải Debate Research Assistant</h3>
                    <p className="text-sm">
                        © 2026 Sidewalk Professor Hải Rong Chơi. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
