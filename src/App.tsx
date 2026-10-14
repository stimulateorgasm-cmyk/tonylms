import React from 'react';
import { LMSProvider, useLMS } from './context/LMSContext';
import { Navbar } from './components/Navbar';
import { CourseCatalog } from './components/CourseCatalog';
import { MyCourses } from './components/MyCourses';
import { ClassroomPlayer } from './components/ClassroomPlayer';
import { AdminPanel } from './components/AdminPanel';
import { getTranslation } from './utils/i18n';
import { Shield, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, language, currentUser, switchUser } = useLMS();
  const t = getTranslation(language);

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-[#F1F5F9]">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
        {currentView === 'catalog' && <CourseCatalog />}
        {currentView === 'my-courses' && <MyCourses />}
        {currentView === 'classroom' && <ClassroomPlayer />}
        {currentView === 'admin' && <AdminPanel />}
      </main>

      {/* Editorial anti-slop footer */}
      <footer className="mt-auto border-t border-[#1E2438] bg-[#07080C] py-8 text-xs text-[#64748B]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/80">{t.brand}</span>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} Tony Roar Academy</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>PostgreSQL 17 Ready</span>
            <span aria-hidden="true">·</span>
            <span>VPS 155.117.20.144</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() =>
                switchUser(
                  currentUser.role === 'admin'
                    ? 'user-student-elena'
                    : 'user-anton-admin'
                )
              }
              className="text-[#94A3B8] hover:text-[#E25858] transition-colors"
            >
              [Тест: {currentUser.role === 'admin' ? 'Переключить на Студента' : 'Переключить на Антона (Админ)'}]
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LMSProvider>
      <AppContent />
    </LMSProvider>
  );
}
