import React from 'react';
import { BookOpen } from 'lucide-react';

interface ShareableCardProps {
    topic: string;
    level: string;
    goal: string;
    content: string; // The text to display (summary)
}

// This component is rendered, captured, then hidden/removed unless we want to show a preview
// We use a fixed width/height container to ensure consistent export size
export const ShareableCard = React.forwardRef<HTMLDivElement, ShareableCardProps>(({ topic, level, goal, content }, ref) => {
    return (
        <div ref={ref} className="w-[1080px] h-[1080px] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-16 flex flex-col justify-between text-white relative overflow-hidden font-sans">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-none"></div>

            {/* Organic Shapes */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center gap-4 border-b border-white/20 pb-8">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <BookOpen size={48} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-widest text-blue-200">Hải Debate</h1>
                    <p className="text-xl text-slate-300">Trợ lý AI Nghiên cứu Khoa học</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center space-y-8 my-12">
                <div>
                    <span className="bg-blue-600/80 px-6 py-2 rounded-full text-xl font-bold backdrop-blur-sm border border-blue-400/30 shadow-lg">
                        {level === 'UNDERGRAD' ? 'Sinh Viên' : level === 'MASTER' ? 'Thạc Sĩ' : 'Tiến Sĩ / Công Bố'}
                    </span>
                    <h2 className="text-5xl font-bold mt-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 drop-shadow-sm line-clamp-3">
                        {topic}
                    </h2>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl relative">
                    <div className="absolute -top-6 -left-6 text-8xl text-blue-400 opacity-50 font-serif">"</div>
                    <p className="text-3xl leading-relaxed text-slate-100 font-light italic opacity-90 line-clamp-6">
                        {content}
                    </p>
                    <div className="absolute -bottom-10 -right-4 text-8xl text-orange-400 opacity-50 font-serif rotate-180">"</div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 border-t border-white/20 pt-8 flex justify-between items-end">
                <div>
                    <p className="text-lg text-slate-400 uppercase tracking-widest text-xs mb-2">Được tạo bởi</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                        Dr. Hai Show & Hải Rong Chơi
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">haidebate-ocsd.vercel.app</p>
                    <p className="text-slate-400">Tranh biện • Phản biện • Hoàn thiện</p>
                </div>
            </div>
        </div>
    );
});

ShareableCard.displayName = 'ShareableCard';
