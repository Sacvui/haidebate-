"use client";

import { useState, useEffect } from "react";
import DebateManager from "@/components/DebateManager";
import { Sparkles, HelpCircle, LogOut, Settings, Lock, CheckCircle, ArrowRight, Mail, Globe, BookOpen } from "lucide-react";
import { AcademicLevel } from "@/lib/agents";
import { LevelGuidelines } from "@/components/LevelGuidelines";
import { SettingsModal } from "@/components/SettingsModal";
import { ResearchForm } from "@/components/ResearchForm";

export default function Home() {
  // State
  const [isStarted, setIsStarted] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ email: string; referralCode?: string } | null>(null);
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

  // Form State for DebateManager (Lifted up)
  const [formData, setFormData] = useState<any>(null);

  // Login State (Inline)
  const [loginEmail, setLoginEmail] = useState("");
  const [isLoginSubmit, setIsLoginSubmit] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("vietpaper_user");
    if (savedUser) {
      setUserProfile(JSON.parse(savedUser));
      setIsGateOpen(true);
    }
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleStart = (data: any) => {
    setFormData(data);
    setIsStarted(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("vietpaper_user");
    window.location.reload();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginSubmit(true);
    if (loginEmail.length > 3) {
      const data = { email: loginEmail };
      localStorage.setItem("vietpaper_user", JSON.stringify(data));
      setTimeout(() => {
        setUserProfile(data);
        setIsGateOpen(true);
      }, 800);
    }
  };

  const handleOrcidLogin = () => {
    const data = { email: "orcid_user@research.org" };
    localStorage.setItem("vietpaper_user", JSON.stringify(data));
    setUserProfile(data);
    setIsGateOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden flex flex-col">
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <LevelGuidelines isOpen={showGuidelines} onClose={() => setShowGuidelines(false)} onSelectLevel={() => { }} />

      {/* --- SPLIT SCREEN LAYOUT (GUEST) --- */}
      {!isGateOpen && (
        <div className="flex h-screen w-full">
          {/* LEFT COLUMN: LOGIN */}
          <div className="w-full md:w-[480px] bg-white border-r border-slate-200 p-8 flex flex-col justify-center relative z-20 shadow-2xl">
            <div className="mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
                <Sparkles size={24} />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                Hải Debate <br />
                <span className="text-blue-600">Research Assistant</span>
              </h1>
              <p className="text-slate-500">
                Trợ lý AI chuyên sâu cho Nghiên cứu khoa học, Luận văn & Công bố quốc tế.
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-6">
              <button
                onClick={handleOrcidLogin}
                className="w-full py-3.5 flex items-center justify-center gap-2 bg-[#A6CE39]/10 text-[#7baa27] hover:bg-[#A6CE39]/20 font-bold rounded-xl border border-[#A6CE39]/50 transition-all"
              >
                <Globe size={20} /> Đăng nhập bằng ORCID
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">Hoặc tiếp tục với Email</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase ml-1">Email Công Việc / Học Tập</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@university.edu.vn"
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoginSubmit}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5 transition-all text-base flex items-center justify-center gap-2"
                >
                  {isLoginSubmit ? <CheckCircle className="animate-pulse" /> : <>Truy cập ngay <ArrowRight size={20} /></>}
                </button>
              </form>

              <p className="text-xs text-center text-slate-400 mt-6">
                *Bằng việc đăng nhập, bạn đồng ý nhận các bản tin học thuật từ Hải Debate.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: PREVIEW (BLURRED/DISABLED) */}
          <div className="hidden md:flex flex-1 bg-slate-50 items-center justify-center p-12 relative overflow-hidden">
            {/* Overlay to prevent clicking */}
            <div className="absolute inset-0 z-10 bg-white/10 backdrop-blur-[2px]"></div>

            <div className="w-full max-w-2xl opacity-60 scale-95 origin-center select-none pointer-events-none grayscale-[0.2]">
              <ResearchForm onStart={() => { }} onOpenGuidelines={() => { }} isPreview={true} />
            </div>

            {/* Lock Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-3 border border-white/50">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white">
                <Lock size={20} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-900">Nội dung bị khóa</h3>
                <p className="text-xs text-slate-500">Đăng nhập để xem đầy đủ</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FULL APP LAYOUT (AUTHED) --- */}
      {isGateOpen && (
        <>
          {/* Header */}
          <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 animate-in slide-in-from-top-4 duration-500">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                  Hải Debate
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {userProfile && (
                  <div className="text-xs text-slate-500 hidden md:flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    {userProfile.email.includes('@') ? userProfile.email.split('@')[0] : "Researcher"}
                  </div>
                )}

                <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-slate-700 transition-colors" title="Cài đặt API Key">
                  <Settings size={18} />
                </button>

                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Đăng xuất">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          <div className="pt-24 px-4 pb-12 transition-all duration-500">
            {!isStarted ? (
              <div className="max-w-xl mx-auto mt-10">
                <ResearchForm
                  onStart={handleStart}
                  onOpenGuidelines={() => setShowGuidelines(true)}
                />
              </div>
            ) : (
              <DebateManager
                topic={formData.topic}
                goal={formData.goal}
                audience={formData.audience}
                level={formData.level}
                apiKey={apiKey}
              />
            )}
          </div>
          {/* Footer */}
          <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-auto bg-slate-50">
            <p>© 2026 Hải Debate. Powered by <span className="font-bold text-slate-600">Sidewalk Professer Hải Rong Chơi</span>.</p>
            <div className="flex justify-center gap-4 mt-2 opacity-60 hover:opacity-100 transition-opacity">
              <a href="#" className="hover:text-blue-600">Điều khoản</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600">Chính sách bảo mật</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600">Liên hệ</a>
            </div>
          </footer>
        </>
      )
      }
    </main >
  );
}
