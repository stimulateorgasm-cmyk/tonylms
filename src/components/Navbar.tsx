import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { getTranslation } from '../utils/i18n';
import { Shield, User, Globe, ChevronDown, BookOpen, Layers, Check, LogOut, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    currentView,
    setCurrentView,
    currentUser,
    switchUser,
    users,
  } = useLMS();

  const t = getTranslation(language);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#1E2438] bg-[#090A0F]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setCurrentView('catalog')}
          className="group flex items-center gap-2 text-left focus:outline-none"
        >
          <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-[#E25858]">
            {t.brand}
          </span>
          <span className="hidden text-xs text-[#64748B] sm:inline">· {t.tagline.split('·')[0]}</span>
        </button>

        {/* Zone 2: Navigation Links (single-line, clean typography) */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setCurrentView('catalog')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'catalog'
                ? 'text-white font-semibold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            {t.nav_catalog}
          </button>
          <button
            onClick={() => setCurrentView('my-courses')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'my-courses'
                ? 'text-white font-semibold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            {t.nav_my_courses}
          </button>
          <button
            onClick={() => setCurrentView('admin')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              currentView === 'admin'
                ? 'text-[#E25858] font-semibold'
                : 'text-[#94A3B8] hover:text-[#E25858]'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>{t.nav_admin}</span>
          </button>
        </nav>

        {/* Zone 3: Language Toggle & User Profile */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center rounded-md border border-[#1E2438] bg-[#111420] p-0.5 text-xs">
            <button
              onClick={() => setLanguage('ru')}
              className={`rounded px-2 py-1 font-medium transition-colors ${
                language === 'ru'
                  ? 'bg-[#1E2438] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`rounded px-2 py-1 font-medium transition-colors ${
                language === 'en'
                  ? 'bg-[#1E2438] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* User Profile & Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-[#1E2438] bg-[#111420] px-2.5 py-1.5 text-xs text-white hover:border-[#2E3652] transition-colors"
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentUser.role === 'admin'
                    ? 'bg-[#E25858] text-white'
                    : 'bg-[#2E3652] text-[#E2E8F0]'
                }`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden max-w-[110px] truncate sm:inline">
                {currentUser.name}
              </span>
              <ChevronDown className="h-3 w-3 text-[#94A3B8]" />
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-64 rounded-lg border border-[#1E2438] bg-[#111420] p-2 shadow-xl shadow-black/60">
                  <div className="border-b border-[#1E2438] pb-2 px-2 pt-1">
                    <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
                      <span>{currentUser.role === 'admin' ? t.role_admin : t.role_student}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                      {t.demo_switch}
                    </p>
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-left transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-[#1E2438] text-white'
                            : 'text-[#94A3B8] hover:bg-[#161B2B] hover:text-white'
                        }`}
                      >
                        <div className="truncate">
                          <p className="font-medium">{u.name}</p>
                          <p className="text-[10px] text-[#64748B]">{u.email} ({u.role})</p>
                        </div>
                        {u.id === currentUser.id && <Check className="h-3 w-3 text-[#E25858] shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-[#1E2438] pt-1">
                    <button
                      onClick={() => {
                        setCurrentView('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-[#94A3B8] hover:bg-[#161B2B] hover:text-white"
                    >
                      <Shield className="h-3.5 w-3.5 text-[#E25858]" />
                      <span>{t.nav_admin}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
