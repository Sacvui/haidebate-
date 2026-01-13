"use client";

import { useState, useEffect } from "react";
import DebateManager from "@/components/DebateManager";
import { Sparkles, HelpCircle, LogOut, Settings, Lock, CheckCircle, ArrowRight, Mail, Globe, BookOpen } from "lucide-react";
import { AcademicLevel } from "@/lib/agents";
import { LevelGuidelines } from "@/components/LevelGuidelines";
import { SettingsModal } from "@/components/SettingsModal";
import { ResearchForm } from "@/components/ResearchForm";
import { SignupModal } from "@/components/auth/SignupModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { ShareModal } from "@/components/ShareModal";
import { signIn } from "next-auth/react";

export default function Home() {
  // State
  const [isStarted, setIsStarted] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
  const [apiKeyCritic, setApiKeyCritic] = useState<string | undefined>(undefined);

  // Auth Hook
  const { user, login, logout, isLoading } = useAuth();

  // Form State
  const [formData, setFormData] = useState<any>(null);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Load local keys
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setApiKey(savedKey);
    const savedCriticKey = localStorage.getItem("gemini_api_key_critic");
    if (savedCriticKey) setApiKeyCritic(savedCriticKey);
  }, []);

  const handleStart = (data: any) => {
    setFormData(data);
    setIsStarted(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError("");

    try {
      await login(loginEmail, loginPassword);
      // Login successful (user state updates automatically via context)
    } catch (error: any) {
      setLoginError(error.message || "Email chưa đăng ký hoặc mật khẩu sai.");
      // If error is specific to not found, we could show signup.
      if (error.message?.includes("chưa được đăng ký")) {
        setShowSignup(true);
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden flex flex-col">
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <LevelGuidelines isOpen={showGuidelines} onClose={() => setShowGuidelines(false)} onSelectLevel={() => { }} />
      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} onSuccess={() => setShowSignup(false)} />
      {user && <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} userId={user.id} onSuccess={() => { /* maybe refresh points */ }} />}

      {/* --- SPLIT SCREEN LAYOUT (GUEST) --- */}
      {!user && (
        <div className="flex h-screen w-full">
          {/* LEFT COLUMN: LOGIN */}
          <div className="w-full md:w-[480px] bg-white border-r border-slate-200 p-8 flex flex-col justify-center relative z-20 shadow-2xl">
            <div className="mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
                <Sparkles size={24} />
              </div>
              <a href="/" className="block group">
                <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2 group-hover:opacity-80 transition-opacity">
                  Hải Debate <br />
                  <span className="text-blue-600">Research Assistant</span>
                </h1>
              </a>
              <p className="text-slate-500">
                Trợ lý AI chuyên sâu cho Nghiên cứu khoa học, Luận văn & Công bố quốc tế.
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => signIn("google")}
                  className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700 font-bold text-sm shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Google
                </button>
                <button
                  onClick={() => signIn("orcid")}
                  className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700 font-bold text-sm shadow-sm"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/06/ORCID_iD.svg" className="w-5 h-5" alt="ORCID" />
                  ORCID
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSignup(true)}
                  className="flex-1 py-3.5 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl border border-blue-200 transition-all"
                >
                  <Mail size={20} /> Đăng Ký Bằng Email
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">Hoặc Login Email</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm font-medium"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm font-medium"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />

                {loginError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2">
                    ⚠️ {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoginLoading ? "Đang xử lý..." : "Đăng Nhập"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: PREVIEW */}
          <div className="hidden md:flex flex-1 bg-slate-50 items-center justify-center p-12 relative overflow-hidden">
            {/* ... same preview content ... */}
            <div className="absolute inset-0 z-10 bg-white/10 backdrop-blur-[2px]"></div>
            <div className="w-full max-w-2xl opacity-60 scale-95 origin-center select-none pointer-events-none grayscale-[0.2]">
              <ResearchForm onStart={() => { }} onOpenGuidelines={() => { }} isPreview={true} />
            </div>
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
      {user && (
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
                {/* Share Button */}
                <button
                  onClick={() => setShowShare(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium text-sm transition-colors border border-green-200"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Nhận Điểm
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                <div className="text-xs text-slate-500 hidden md:flex items-center gap-1">
                  <span className="font-bold text-slate-700">{user.points} pts</span>
                  <span className="mx-1">•</span>
                  {user.email.split('@')[0]}
                </div>

                <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-slate-700 transition-colors" title="Cài đặt API Key">
                  <Settings size={18} />
                </button>

                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Đăng xuất">
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
                language={formData.language}
                apiKey={apiKey}
                apiKeyCritic={apiKeyCritic}
              />
            )}
          </div>
          {/* Footer */}
          <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-auto bg-slate-50">
            <p>© 2026 Hải Debate. Powered by <span className="font-bold text-slate-600">Sidewalk Professer Hải Rong Chơi</span>.</p>
          </footer>
        </>
      )}
    </main>
  );
}
