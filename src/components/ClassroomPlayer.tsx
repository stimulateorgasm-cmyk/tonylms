import React, { useState, useRef, useEffect } from 'react';
import { useLMS } from '../context/LMSContext';
import { getTranslation } from '../utils/i18n';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Music,
  Check,
  Lock,
  ArrowLeft,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Lesson } from '../types/lms';

export const ClassroomPlayer: React.FC = () => {
  const {
    language,
    courses,
    sections,
    lessons,
    activeCourseId,
    activeLessonId,
    openLesson,
    setCurrentView,
    currentUser,
    isUserEnrolled,
    getLessonProgress,
    markLessonComplete,
    updateWatchPosition,
    getCourseProgressPercent,
  } = useLMS();

  const t = getTranslation(language);

  // Active course & lesson
  const course = courses.find((c) => c.id === activeCourseId) || courses[0];
  const courseSections = sections
    .filter((s) => s.course_id === course.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const courseLessons = lessons
    .filter((l) => l.course_id === course.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const activeLesson =
    courseLessons.find((l) => l.id === activeLessonId) || courseLessons[0];

  const isEnrolled = isUserEnrolled(course.id);
  const progressData = activeLesson ? getLessonProgress(activeLesson.id) : undefined;
  const isCompleted = progressData?.is_completed || false;

  // Video element and state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'homework' | 'materials'>('notes');
  const [resumeNotification, setResumeNotification] = useState<string | null>(null);

  // Handle active lesson change & initial resume position
  useEffect(() => {
    if (!activeLesson) return;
    setIsPlaying(false);
    setCurrentTime(0);

    const savedPos = progressData?.last_watched_second || 0;
    if (savedPos > 15 && videoRef.current) {
      videoRef.current.currentTime = savedPos;
      setCurrentTime(savedPos);
      const min = Math.floor(savedPos / 60);
      const sec = savedPos % 60;
      setResumeNotification(
        `${t.resumed_from} ${min}:${sec < 10 ? '0' : ''}${sec}`
      );
      const timer = setTimeout(() => setResumeNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [activeLessonId]);

  // Periodic watch position saving (every 5 seconds)
  useEffect(() => {
    if (!isPlaying || !activeLesson) return;
    const interval = setInterval(() => {
      if (videoRef.current) {
        updateWatchPosition(activeLesson.id, videoRef.current.currentTime);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, activeLesson?.id]);

  // Player handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (progressData?.last_watched_second && progressData.last_watched_second > 10) {
        videoRef.current.currentTime = progressData.last_watched_second;
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const setSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('player-video-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Lesson Navigation: Prev / Next
  const currentIndex = courseLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

  const handleToggleCompleted = () => {
    if (!activeLesson) return;
    const nextState = !isCompleted;
    markLessonComplete(activeLesson.id, nextState);

    // If marked as completed and there is a next lesson, prompt or auto-navigate
    if (nextState && nextLesson) {
      setTimeout(() => {
        openLesson(course.id, nextLesson.id);
      }, 700);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!activeLesson) {
    return (
      <div className="p-8 text-center text-[#94A3B8]">
        No lesson found in this track.
      </div>
    );
  }

  const lessonTitle = language === 'ru' ? activeLesson.title_ru : activeLesson.title_en;
  const lessonNotes = language === 'ru' ? activeLesson.notes_ru : activeLesson.notes_en;
  const lessonHomework = language === 'ru' ? activeLesson.homework_ru : activeLesson.homework_en;
  const courseTitle = language === 'ru' ? course.title_ru : course.title_en;
  const progressPercent = getCourseProgressPercent(course.id);

  const isLocked = !isEnrolled && !activeLesson.is_preview;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb & Course Header */}
      <div className="flex flex-col gap-4 border-b border-[#1E2438] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('catalog')}
            className="flex items-center gap-1.5 rounded-lg border border-[#1E2438] bg-[#111420] px-3 py-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t.back_to_catalog}</span>
          </button>
          <div className="h-4 w-[1px] bg-[#1E2438]" />
          <div>
            <p className="text-xs text-[#64748B]">{courseTitle}</p>
            <h1 className="text-base font-bold text-white sm:text-lg line-clamp-1">
              {lessonTitle}
            </h1>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] text-[#64748B]">{t.progress_label}</p>
            <p className="font-mono text-xs font-semibold text-white tabular-nums">
              {progressPercent}%
            </p>
          </div>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-[#1E2438]">
            <div
              className="h-full bg-[#E25858] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Player on Left (70%), Curriculum on Right (30%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Video Theater & Tabs (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Video Container */}
          <div
            id="player-video-container"
            className="group relative aspect-video w-full overflow-hidden rounded-xl border border-[#1E2438] bg-black shadow-2xl"
          >
            {isLocked ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-[#090A0F] p-8 text-center">
                <Lock className="h-12 w-12 text-amber-500/80 mb-3" />
                <h3 className="text-lg font-bold text-white">{t.badge_locked}</h3>
                <p className="mt-2 max-w-md text-xs text-[#94A3B8]">
                  {t.locked_lesson_notice}
                </p>
                <button
                  onClick={() => openLesson(course.id, courseLessons[0].id)}
                  className="mt-4 rounded-lg bg-[#E25858] px-4 py-2 text-xs font-semibold text-white"
                >
                  {t.btn_preview}
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={activeLesson.video_url}
                  poster={course.cover_image}
                  className="h-full w-full cursor-pointer object-contain"
                  onClick={togglePlay}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => markLessonComplete(activeLesson.id, true)}
                  playsInline
                />

                {/* Resume Toast */}
                {resumeNotification && (
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-lg bg-black/80 px-3 py-1.5 text-xs text-white backdrop-blur border border-white/10 animate-fade-in">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#E25858]" />
                    <span>{resumeNotification}</span>
                  </div>
                )}

                {/* Video Watermark / Host badge */}
                <div className="absolute top-4 right-4 z-20 hidden items-center gap-1.5 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur sm:flex">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>{t.video_host_badge}</span>
                </div>

                {/* Big Center Play Button when paused */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E25858]/90 text-white shadow-xl backdrop-blur transition-transform hover:scale-110 active:scale-95"
                  >
                    <Play className="h-7 w-7 fill-white translate-x-0.5" />
                  </button>
                )}

                {/* Custom Video Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {/* Timeline Scrubber */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-[#E25858]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="rounded p-1 hover:bg-white/10 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 fill-current" />
                        )}
                      </button>

                      <button
                        onClick={() => skipSeconds(-10)}
                        title="-10s"
                        className="rounded p-1 hover:bg-white/10 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={toggleMute}
                          className="rounded p-1 hover:bg-white/10 transition-colors"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="h-1 w-14 cursor-pointer appearance-none rounded bg-white/20 accent-[#E25858]"
                        />
                      </div>

                      {/* Time Code */}
                      <span className="font-mono text-xs tabular-nums text-white/80">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Speed Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="rounded px-2 py-1 text-xs font-mono font-medium hover:bg-white/10"
                        >
                          {playbackRate}x
                        </button>
                        {showSpeedMenu && (
                          <div className="absolute bottom-full right-0 mb-2 rounded border border-[#1E2438] bg-[#111420] p-1 shadow-lg">
                            {[0.75, 1, 1.25, 1.5, 2].map((r) => (
                              <button
                                key={r}
                                onClick={() => setSpeed(r)}
                                className={`block w-full rounded px-3 py-1 text-xs font-mono text-left ${
                                  playbackRate === r ? 'bg-[#E25858] text-white' : 'text-[#94A3B8] hover:text-white'
                                }`}
                              >
                                {r}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={toggleFullscreen}
                        className="rounded p-1 hover:bg-white/10 transition-colors"
                      >
                        <Maximize className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Row Under Player: Navigation & Complete Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#1E2438] bg-[#111420] p-4">
            <div className="flex items-center gap-2">
              <button
                disabled={!prevLesson}
                onClick={() => prevLesson && openLesson(course.id, prevLesson.id)}
                className="flex items-center gap-1.5 rounded-lg border border-[#1E2438] bg-[#161B2B] px-3 py-2 text-xs font-medium text-white hover:border-[#2E3652] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{t.prev_lesson}</span>
              </button>

              <button
                disabled={!nextLesson}
                onClick={() => nextLesson && openLesson(course.id, nextLesson.id)}
                className="flex items-center gap-1.5 rounded-lg border border-[#1E2438] bg-[#161B2B] px-3 py-2 text-xs font-medium text-white hover:border-[#2E3652] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <span>{t.next_lesson}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleToggleCompleted}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#E25858] text-white hover:bg-[#D04545] shadow-lg shadow-[#E25858]/20'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isCompleted ? t.lesson_completed : t.mark_as_completed}</span>
            </button>
          </div>

          {/* Tabbed Lesson Workspace: Notes / Homework / Materials */}
          <div className="rounded-xl border border-[#1E2438] bg-[#111420] p-6">
            <div className="flex items-center gap-4 border-b border-[#1E2438] pb-3 text-sm">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 pb-2 font-medium transition-colors ${
                  activeTab === 'notes'
                    ? 'border-b-2 border-[#E25858] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>{t.tab_notes}</span>
              </button>

              <button
                onClick={() => setActiveTab('homework')}
                className={`flex items-center gap-2 pb-2 font-medium transition-colors ${
                  activeTab === 'homework'
                    ? 'border-b-2 border-[#E25858] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>{t.tab_homework}</span>
              </button>

              <button
                onClick={() => setActiveTab('materials')}
                className={`flex items-center gap-2 pb-2 font-medium transition-colors ${
                  activeTab === 'materials'
                    ? 'border-b-2 border-[#E25858] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Music className="h-4 w-4" />
                <span>{t.tab_materials}</span>
                {activeLesson.materials.length > 0 && (
                  <span className="font-mono text-xs text-[#E25858]">
                    ({activeLesson.materials.length})
                  </span>
                )}
              </button>
            </div>

            <div className="pt-6">
              {activeTab === 'notes' && (
                <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[#CBD5E1]">
                  <p>{lessonNotes}</p>
                </div>
              )}

              {activeTab === 'homework' && (
                <div className="space-y-4 text-sm leading-relaxed text-[#CBD5E1]">
                  {lessonHomework ? (
                    <div className="rounded-lg border border-[#1E2438] bg-[#090A0F] p-4">
                      <h4 className="mb-2 text-xs font-semibold text-amber-400">
                        Практическое задание:
                      </h4>
                      <p>{lessonHomework}</p>
                    </div>
                  ) : (
                    <p className="text-[#64748B] italic">{t.no_homework}</p>
                  )}
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="space-y-3">
                  {activeLesson.materials.length === 0 ? (
                    <p className="text-sm text-[#64748B] italic">{t.no_materials}</p>
                  ) : (
                    activeLesson.materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between rounded-lg border border-[#1E2438] bg-[#090A0F] p-3 transition-colors hover:border-[#2E3652]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#161B2B] text-[#E25858]">
                            {mat.type === 'audio' ? (
                              <Music className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{mat.title}</p>
                            {mat.size && (
                              <p className="font-mono text-[11px] text-[#64748B] tabular-nums">
                                {mat.size}
                              </p>
                            )}
                          </div>
                        </div>

                        <a
                          href={mat.url}
                          download
                          onClick={(e) => {
                            if (mat.url === '#') {
                              e.preventDefault();
                              alert(`Файл "${mat.title}" готов к выдаче через CDN.`);
                            }
                          }}
                          className="flex items-center gap-1.5 rounded-md border border-[#1E2438] bg-[#111420] px-3 py-1.5 text-xs text-white hover:bg-[#1E2438] transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>{t.download_btn}</span>
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Course Curriculum Sidebar (4 cols) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-[#1E2438] bg-[#111420] p-4">
            <h3 className="text-sm font-bold text-white">Программа курса</h3>
            <p className="mt-0.5 text-xs text-[#64748B]">
              {courseSections.length} {t.modules_count} · {courseLessons.length} {t.lessons_count}
            </p>

            <div className="mt-4 space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {courseSections.map((sec, secIdx) => {
                const secLessons = courseLessons.filter((l) => l.section_id === sec.id);
                const secTitle = language === 'ru' ? sec.title_ru : sec.title_en;

                return (
                  <div key={sec.id} className="space-y-2">
                    <p className="text-xs font-semibold text-[#94A3B8]">
                      {secTitle}
                    </p>

                    <div className="space-y-1">
                      {secLessons.map((les) => {
                        const lesTitle = language === 'ru' ? les.title_ru : les.title_en;
                        const lesPrg = getLessonProgress(les.id);
                        const lesDone = lesPrg?.is_completed;
                        const isCurrent = les.id === activeLesson.id;
                        const lesLocked = !isEnrolled && !les.is_preview;

                        return (
                          <button
                            key={les.id}
                            disabled={lesLocked}
                            onClick={() => openLesson(course.id, les.id)}
                            className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs transition-colors ${
                              isCurrent
                                ? 'bg-[#1E2438] text-white border border-[#2E3652]'
                                : lesLocked
                                ? 'opacity-50 cursor-not-allowed text-[#64748B]'
                                : 'text-[#CBD5E1] hover:bg-[#161B2B] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {lesDone ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                              ) : lesLocked ? (
                                <Lock className="h-3.5 w-3.5 shrink-0 text-amber-500/70" />
                              ) : (
                                <div
                                  className={`h-2 w-2 rounded-full shrink-0 ${
                                    isCurrent ? 'bg-[#E25858]' : 'bg-[#2E3652]'
                                  }`}
                                />
                              )}
                              <span className="truncate">{lesTitle}</span>
                            </div>

                            <span className="font-mono text-[10px] text-[#64748B] tabular-nums shrink-0">
                              {les.duration_minutes}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
