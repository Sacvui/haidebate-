"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sparkles, HelpCircle, LogOut, Settings, Lock, CheckCircle, ArrowRight, Mail, BookOpen, FolderOpen } from "lucide-react";
import { AcademicLevel, ProjectType } from "@/lib/agents";
import { SavedProject, createNewProject, saveProject, getProject } from "@/lib/projectStorage";
import { LevelGuidelines } from "@/components/LevelGuidelines";
import { SettingsModal } from "@/components/SettingsModal";
import { ResearchForm } from "@/components/ResearchForm";
import { SignupModal } from "@/components/auth/SignupModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { ShareModal } from "@/components/ShareModal";
import { GuideModal } from "@/components/GuideModal";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { signIn } from "next-auth/react";
import Cookies from "js-cookie";
import { LoadingH } from "@/components/LoadingH";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectManager } from "@/components/ProjectManager";

// Lazy load heavy components
const DebateManager = dynamic(() => import("@/components/DebateManager").then(mod => mod.DebateManager), {
  loading: () => <div className="flex items-center justify-center min-h-screen"><LoadingH /></div>,
  ssr: false
});

interface ResearchFormData {
  topic: string;
  level: AcademicLevel;
  goal: string;
  audience: string;
  language: 'vi' | 'en';
  projectType: ProjectType;
}

export default function Home() {
  // State
  const [isStarted, setIsStarted] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [currentProject, setCurrentProject] = useState<SavedProject | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyCritic, setApiKeyCritic] = useState<string | undefined>(undefined);

  // Auth Hook
  const { user, login, logout, isLoading } = useAuth();
  const [formData, setFormData] = useState<ResearchFormData | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
    // Load API keys from localStorage
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setApiKey(savedKey);
    const savedCriticKey = localStorage.getItem("gemini_api_key_critic");
    if (savedCriticKey) setApiKeyCritic(savedCriticKey);

    // Load saved session state
    const savedSession = localStorage.getItem("current_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.isStarted && parsed.formData) {
          setFormData(parsed.formData);
          setIsStarted(true);
          setSessionId(parsed.sessionId);
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }

    // Check for referral code in URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
      Cookies.set("referral_code", ref, { expires: 7 }); // Save for 7 days
    }
  }, []);

  // Save session state when it changes
  useEffect(() => {
    if (isStarted && formData && isMounted) {
      localStorage.setItem("current_session", JSON.stringify({
        isStarted,
        formData,
        sessionId: sessionId || `session_${Date.now()}` // Generate if missing
      }));
      if (!sessionId) {
        setSessionId(`session_${Date.now()}`);
      }
    } else if (isMounted && !isStarted) {
      // Clear session if reset (optional, or keep for history?)
      // For now, let's strictly clear if user explicitly exits, 
      // but here we don't have an explicit exit action besides refresh which we want to survive.
      // So do nothing.
    }
  }, [isStarted, formData, isMounted, sessionId]);


  const handleManualReferral = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setReferralCode(code);
    if (code) {
      Cookies.set("referral_code", code, { expires: 7 });
    } else {
      Cookies.remove("referral_code");
    }
  };

  const handleStart = (data: ResearchFormData) => {
    // 1. Create a new project FIRST to get the authoritative ID
    const newProj = createNewProject(
      data.topic,
      data.goal,
      data.audience,
      data.level,
      data.language,
      data.projectType
    );
    saveProject(newProj);

    // 2. Use the project ID for everything else
    const accurateId = newProj.id;
    setFormData(data);
    setIsStarted(true);
    setSessionId(accurateId);
    setCurrentProject(newProj);

    // 3. Explicit save to local session
    localStorage.setItem("current_session", JSON.stringify({
      isStarted: true,
      formData: data,
      sessionId: accurateId
    }));
  };

  const handleSelectProject = (project: SavedProject) => {
    setCurrentProject(project);
    setFormData({
      topic: project.topic,
      level: project.level,
      goal: project.goal,
      audience: project.audience,
      language: project.language,
      projectType: project.projectType
    });
    setSessionId(project.id);
    setIsStarted(true);
    setShowProjects(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("current_session");
    logout();
  }

  const handleGoHome = () => {
    setIsStarted(false);
    setShowProjects(false);

    // Update local session to not auto-start on refresh
    const savedSession = localStorage.getItem("current_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        localStorage.setItem("current_session", JSON.stringify({
          ...parsed,
          isStarted: false
        }));
      } catch (e) { }
    }
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><LoadingH /></div>;

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
                  type="button"
                  onClick={(e) => { e.preventDefault(); void signIn("google", { callbackUrl: "/" }); }}
                  className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-slate-700 font-bold text-sm shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); void signIn("orcid", { callbackUrl: "/" }); }}
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
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            {/* Animation Component */}
            {isMounted && (
              <div className="w-full relative z-10 scale-110 origin-center">
                <HeroDemo />
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- FULL APP LAYOUT (AUTHED) --- */}
      {user && (
        <>
          {/* Header */}
          <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 animate-in slide-in-from-top-4 duration-500">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleGoHome}
              >
                <div className="w-10 h-10 shadow-md shadow-blue-500/20 rounded-lg overflow-hidden">
                  <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                  Hải Debate
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {/* Share Button (Points) */}
                <button
                  onClick={() => setShowShare(true)}
                  className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium text-xs md:text-sm transition-colors border border-green-200"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="hidden md:inline">Nhận Điểm</span>
                  <span className="md:hidden">Điểm</span>
                </button>

                {/* Projects Button */}
                <button
                  onClick={() => setShowProjects(true)}
                  className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium text-xs md:text-sm transition-colors border border-blue-200"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden md:inline">Dự án</span>
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

                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Đăng xuất">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          <div className="pt-24 px-4 pb-12 transition-all duration-500">
            {showProjects ? (
              <ProjectManager
                onSelectProject={handleSelectProject}
                onCreateNew={() => { setShowProjects(false); setIsStarted(false); setFormData(null); }}
              />
            ) : !isStarted || !formData ? (
              <div className="max-w-xl mx-auto mt-10">
                <ResearchForm
                  onStart={handleStart}
                  onOpenGuidelines={() => setShowGuidelines(true)}
                />
              </div>
            ) : (
              <ErrorBoundary>
                <DebateManager
                  key={sessionId}
                  topic={formData.topic}
                  goal={formData.goal}
                  audience={formData.audience}
                  level={formData.level}
                  language={formData.language}
                  projectType={formData.projectType}
                  apiKey={apiKey}
                  apiKeyCritic={apiKeyCritic}
                  userId={user.id}
                  sessionId={sessionId}
                  onExit={() => {
                    setIsStarted(false);
                    setShowProjects(true);
                  }}
                  onNewProject={() => {
                    setIsStarted(false);
                    setFormData(null);
                  }}
                />
              </ErrorBoundary>
            )}
          </div>
          {/* Footer */}
          <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-auto bg-slate-50">
            <p>© 2026 Hải Debate. Powered by <span className="font-bold text-slate-600">Sidewalk Professor Hải Rong Chơi</span>.</p>
          </footer>
        </>
      )}
    </main>
  );
}
