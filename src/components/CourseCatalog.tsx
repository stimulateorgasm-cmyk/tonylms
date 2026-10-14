import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { getTranslation } from '../utils/i18n';
import { Play, CheckCircle2, Lock, ArrowRight, Clock, BookOpen, Sparkles } from 'lucide-react';
import { Course } from '../types/lms';

export const CourseCatalog: React.FC = () => {
  const {
    language,
    courses,
    sections,
    lessons,
    isUserEnrolled,
    getCourseProgressPercent,
    openCourse,
    currentUser,
    grantEnrollment,
    setCurrentView,
  } = useLMS();

  const t = getTranslation(language);
  const [filter, setFilter] = useState<'all' | 'mastery' | 'quickstart'>('all');

  const filteredCourses = courses.filter((c) => {
    if (filter === 'mastery') {
      return c.track_category === 'mastery_ru' || c.track_category === 'mastery_en';
    }
    if (filter === 'quickstart') {
      return c.track_category === 'quickstart_male' || c.track_category === 'quickstart_female';
    }
    return true;
  });

  const enrolledCount = courses.filter((c) => isUserEnrolled(c.id)).length;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section with dark editorial aesthetics */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1E2438] bg-gradient-to-b from-[#111420] to-[#0B0D14] p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(226,88,88,0.08),transparent_50%)] pointer-events-none" />
        <div className="relative max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <span>TonyRoar Academy</span>
            <span aria-hidden="true">·</span>
            <span>Erotic Hypnosis & Somatic Psychology</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl" style={{ textWrap: 'balance' }}>
            {t.hero_title}
          </h1>

          <p className="text-base leading-relaxed text-[#94A3B8] sm:text-lg">
            {t.hero_subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => {
                const firstEnrolled = courses.find((c) => isUserEnrolled(c.id));
                if (firstEnrolled) {
                  openCourse(firstEnrolled.id);
                } else if (courses.length > 0) {
                  openCourse(courses[0].id);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E25858] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E25858]/20 transition-all hover:bg-[#D04545] active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{t.hero_cta}</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setCurrentView('admin')}
                className="inline-flex items-center gap-2 rounded-lg border border-[#1E2438] bg-[#111420] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#2E3652]"
              >
                <span>{t.nav_admin}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Track Filter Bar */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {t.all_tracks}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-[#64748B]">
              <span>4 программы</span>
              <span aria-hidden="true">·</span>
              <span>RU & EN</span>
              <span aria-hidden="true">·</span>
              <span>Открыто: {enrolledCount} из {courses.length}</span>
            </div>
          </div>

          {/* Interactive Filter Control Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-[#1E2438] bg-[#111420] p-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#1E2438] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {t.track_filter_all}
            </button>
            <button
              onClick={() => setFilter('mastery')}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                filter === 'mastery'
                  ? 'bg-[#1E2438] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {t.track_filter_mastery}
            </button>
            <button
              onClick={() => setFilter('quickstart')}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                filter === 'quickstart'
                  ? 'bg-[#1E2438] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {t.track_filter_quickstart}
            </button>
          </div>
        </div>

        {/* 4 Track Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredCourses.map((course) => {
            const courseSections = sections.filter((s) => s.course_id === course.id);
            const courseLessons = lessons.filter((l) => l.course_id === course.id);
            const totalDuration = courseLessons.reduce((acc, curr) => acc + curr.duration_minutes, 0);
            const isEnrolled = isUserEnrolled(course.id);
            const progressPercent = getCourseProgressPercent(course.id);

            const title = language === 'ru' ? course.title_ru : course.title_en;
            const description = language === 'ru' ? course.description_ru : course.description_en;
            const badge = language === 'ru' ? course.badge_ru : course.badge_en;

            return (
              <div
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-[#1E2438] bg-[#111420] transition-all hover:border-[#2E3652] hover:shadow-xl hover:shadow-black/40"
              >
                {/* Course Image Banner */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#090A0F]">
                  <img
                    src={course.cover_image}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111420] via-transparent to-black/30" />

                  {/* Access Status Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/90 drop-shadow">
                      {badge}
                    </span>
                    <span
                      className={`text-[11px] font-medium drop-shadow ${
                        isEnrolled ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {isEnrolled ? `✓ ${t.badge_enrolled}` : `🔒 ${t.badge_locked}`}
                    </span>
                  </div>
                </div>

                {/* Course Body */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="space-y-3">
                    {/* Metadata line without pills */}
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <span>{courseSections.length} {t.modules_count}</span>
                      <span aria-hidden="true">·</span>
                      <span>{courseLessons.length} {t.lessons_count}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-[#E25858] transition-colors">
                      {title}
                    </h3>

                    <p className="text-sm leading-relaxed text-[#94A3B8] line-clamp-2">
                      {description}
                    </p>
                  </div>

                  {/* Progress or Access Bar */}
                  <div className="mt-6 space-y-4 border-t border-[#1E2438] pt-4">
                    {isEnrolled ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#94A3B8]">{t.progress_label}</span>
                          <span className="font-mono font-medium text-white tabular-nums">
                            {progressPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1E2438]">
                          <div
                            className="h-full bg-[#E25858] transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-[#64748B]">
                        <span>{t.badge_locked}</span>
                        {currentUser.role === 'admin' ? (
                          <span className="text-[#E25858] font-medium">Админ-доступ</span>
                        ) : (
                          <button
                            onClick={() => grantEnrollment(currentUser.id, course.id)}
                            className="text-xs text-[#E25858] hover:underline"
                          >
                            [Демо: Активировать доступ]
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openCourse(course.id)}
                        className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-xs font-semibold transition-all ${
                          isEnrolled
                            ? 'bg-[#E25858] text-white hover:bg-[#D04545]'
                            : 'border border-[#2E3652] bg-[#161B2B] text-white hover:bg-[#1E2438]'
                        }`}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{isEnrolled ? t.btn_continue : t.btn_preview}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
