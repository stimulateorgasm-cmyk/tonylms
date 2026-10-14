import React from 'react';
import { useLMS } from '../context/LMSContext';
import { getTranslation } from '../utils/i18n';
import { Play, CheckCircle2, BookOpen, Clock, ArrowRight } from 'lucide-react';

export const MyCourses: React.FC = () => {
  const {
    language,
    courses,
    sections,
    lessons,
    isUserEnrolled,
    getCourseProgressPercent,
    openCourse,
    setCurrentView,
    currentUser,
  } = useLMS();

  const t = getTranslation(language);

  const enrolledCourses = courses.filter((c) => isUserEnrolled(c.id));

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {t.my_enrolled_tracks}
        </h1>
        <p className="text-sm text-[#94A3B8]">
          {language === 'ru'
            ? `Студент: ${currentUser.name} (${currentUser.email})`
            : `Student: ${currentUser.name} (${currentUser.email})`}
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1E2438] bg-[#111420] p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-[#64748B]" />
          <h3 className="mt-4 text-base font-semibold text-white">
            {t.no_enrolled_courses}
          </h3>
          <button
            onClick={() => setCurrentView('catalog')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#E25858] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D04545]"
          >
            <span>{t.nav_catalog}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {enrolledCourses.map((course) => {
            const courseSections = sections.filter((s) => s.course_id === course.id);
            const courseLessons = lessons.filter((l) => l.course_id === course.id);
            const progressPercent = getCourseProgressPercent(course.id);
            const title = language === 'ru' ? course.title_ru : course.title_en;
            const description = language === 'ru' ? course.description_ru : course.description_en;

            return (
              <div
                key={course.id}
                className="flex flex-col overflow-hidden rounded-xl border border-[#1E2438] bg-[#111420] transition-colors hover:border-[#2E3652]"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#090A0F]">
                  <img
                    src={course.cover_image}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111420] via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3 rounded bg-black/60 px-2 py-1 text-[11px] font-medium text-emerald-400 backdrop-blur-sm">
                    {progressPercent === 100 ? 'Завершен ✓' : `${progressPercent}%`}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <span>{courseSections.length} {t.modules_count}</span>
                      <span aria-hidden="true">·</span>
                      <span>{courseLessons.length} {t.lessons_count}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <p className="text-sm text-[#94A3B8] line-clamp-2">{description}</p>
                  </div>

                  <div className="mt-6 space-y-4 border-t border-[#1E2438] pt-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#94A3B8]">{t.progress_label}</span>
                        <span className="font-mono text-white tabular-nums">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1E2438]">
                        <div
                          className="h-full bg-[#E25858] transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => openCourse(course.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E25858] py-2.5 px-4 text-xs font-semibold text-white hover:bg-[#D04545] transition-colors"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{t.btn_continue}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
