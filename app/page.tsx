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
import { GuideModal } from "@/components/GuideModal";
import { signIn } from "next-auth/react";
import Cookies from "js-cookie";

export default function Home() {
  // State
  const [isStarted, setIsStarted] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
  const [apiKeyCritic, setApiKeyCritic] = useState<string | undefined>(undefined);

  // Auth Hook
  const { user, login, logout, isLoading } = useAuth();
  const [formData, setFormData] = useState<any>(null);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    // Check for referral code in URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
      Cookies.set("referral_code", ref, { expires: 7 }); // Save for 7 days
    }
  }, []);

  const handleManualReferral = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setReferralCode(code);
    if (code) {
      Cookies.set("referral_code", code, { expires: 7 });
    } else {
      Cookies.remove("referral_code");
    }
  };

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



  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden flex flex-col">
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <LevelGuidelines isOpen={showGuidelines} onClose={() => setShowGuidelines(false)} onSelectLevel={() => { }} />
      {/* SignupModal removed */}
      {user && <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} userId={user.id} user={user} onSuccess={() => { /* maybe refresh points */ }} />}

      {/* --- SPLIT SCREEN LAYOUT (GUEST) --- */}
      {!user && (
        <div className="flex h-screen w-full">
          {/* LEFT COLUMN: LOGIN */}
          <div className="w-full md:w-[480px] bg-white border-r border-slate-200 p-8 flex flex-col justify-center relative z-20 shadow-2xl">
            <div className="mb-8">
              <div className="w-16 h-16 mb-4 shadow-lg shadow-blue-500/20 rounded-2xl overflow-hidden">
                <img src="/favicon.ico" alt="Hải Debate Logo" className="w-full h-full object-cover" />
              </div>
              <a href="/" className="block group">
                <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2 group-hover:opacity-80 transition-opacity">
                  Hải Debate <br />
                  <span className="text-blue-600">Research Assistant</span>
                </h1>
              </a>
              <p className="text-slate-500">
                <Sparkles className="inline-block w-4 h-4 mr-1 text-blue-500" />
                <i>"Để nghiên cứu thực sự là một cuộc rong chơi nhiều hoa thơm cỏ lạ."</i>
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-6">

              {/* Referral Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Thư tiến cử số (Nếu có)</label>
                <input
                  type="text"
                  placeholder="Nhập Số trên thư tiến cử..."
                  value={referralCode}
                  onChange={handleManualReferral}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-center tracking-widest text-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    try {
                      await signIn("google");
                    } catch (e) {
                      console.error("Google signIn error:", e);
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-slate-700 font-bold text-sm shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Google
                </button>
                <button
                  onClick={async () => {
                    try {
                      await signIn("orcid");
                    } catch (e) {
                      console.error("ORCID signIn error:", e);
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-slate-700 font-bold text-sm shadow-sm"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/06/ORCID_iD.svg" className="w-5 h-5" alt="ORCID" />
                  ORCID
                </button>
              </div>

              <p className="text-xs text-center text-slate-400">
                Điểm danh hàng ngày và kết nạp đồng môn để nhận bí kíp võ công
              </p>
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
                <div className="w-10 h-10 shadow-md shadow-blue-500/20 rounded-lg overflow-hidden">
                  <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
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
                  <span className="font-bold text-slate-700">{user.points || 0} pts</span>
                  <span className="mx-1">•</span>
                  {user.name || (user.email ? user.email.split('@')[0] : 'Người dùng')}
                </div>

                <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-slate-700 transition-colors" title="Cài đặt API Key">
                  <Settings size={18} />
                </button>
                <button onClick={() => setShowGuide(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Hướng dẫn lấy Key">
                  <HelpCircle size={18} />
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
