import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { getTranslation } from '../utils/i18n';
import {
  BookOpen,
  Users,
  UploadCloud,
  Server,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Copy,
  ExternalLink,
  Shield,
  FileSpreadsheet,
  Database,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Course, Lesson, StudentImportRow } from '../types/lms';

export const AdminPanel: React.FC = () => {
  const {
    language,
    courses,
    sections,
    lessons,
    users,
    enrollments,
    isUserEnrolled,
    grantEnrollment,
    revokeEnrollment,
    addUser,
    addLesson,
    updateLesson,
    deleteLesson,
    batchImportStudents,
    resetDatabaseToSeed,
  } = useLMS();

  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<
    'courses' | 'students' | 'csv' | 'server'
  >('courses');

  // Course Editor State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || ''
  );
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string>('');

  // Lesson form state
  const [formTitleRu, setFormTitleRu] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formDuration, setFormDuration] = useState(15);
  const [formNotesRu, setFormNotesRu] = useState('');
  const [formNotesEn, setFormNotesEn] = useState('');
  const [formIsPreview, setFormIsPreview] = useState(false);

  // Student Manager State
  const [studentSearch, setStudentSearch] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCourseId, setNewStudentCourseId] = useState(courses[0]?.id || '');

  // CSV Importer State
  const [csvText, setCsvText] = useState(
    `anna.ivanova@mail.ru, Анна Иванова, master-orgasms-ru\nalex.smith@gmail.com, Alex Smith, master-orgasms-en\ndmitry.k@yandex.ru, Дмитрий Кузнецов, quickstart-male\nolga.v@gmail.com, Ольга Волкова, quickstart-female`
  );
  const [parsedRows, setParsedRows] = useState<StudentImportRow[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Selected course data
  const selectedCourse =
    courses.find((c) => c.id === selectedCourseId) || courses[0];
  const courseSections = sections.filter((s) => s.course_id === selectedCourse?.id);

  // Open add lesson modal
  const handleOpenAddLesson = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setFormTitleRu('');
    setFormTitleEn('');
    setFormVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    setFormDuration(20);
    setFormNotesRu('');
    setFormNotesEn('');
    setFormIsPreview(false);
    setIsAddingLesson(true);
    setEditingLesson(null);
  };

  // Open edit lesson modal
  const handleOpenEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTargetSectionId(lesson.section_id);
    setFormTitleRu(lesson.title_ru);
    setFormTitleEn(lesson.title_en);
    setFormVideoUrl(lesson.video_url);
    setFormDuration(lesson.duration_minutes);
    setFormNotesRu(lesson.notes_ru);
    setFormNotesEn(lesson.notes_en);
    setFormIsPreview(lesson.is_preview);
    setIsAddingLesson(false);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleRu.trim()) return;

    if (editingLesson) {
      updateLesson(editingLesson.id, {
        title_ru: formTitleRu,
        title_en: formTitleEn || formTitleRu,
        video_url: formVideoUrl,
        duration_minutes: Number(formDuration),
        notes_ru: formNotesRu,
        notes_en: formNotesEn,
        is_preview: formIsPreview,
      });
      setEditingLesson(null);
    } else {
      addLesson({
        section_id: targetSectionId,
        course_id: selectedCourse.id,
        title_ru: formTitleRu,
        title_en: formTitleEn || formTitleRu,
        video_url: formVideoUrl,
        video_type: 'direct',
        duration_minutes: Number(formDuration),
        notes_ru: formNotesRu,
        notes_en: formNotesEn,
        materials: [],
        is_preview: formIsPreview,
      });
      setIsAddingLesson(false);
    }
  };

  // Add new student handler
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail.trim() || !newStudentEmail.includes('@')) return;

    const user = addUser(
      newStudentEmail.trim(),
      newStudentName.trim() || newStudentEmail.split('@')[0],
      'student'
    );
    if (newStudentCourseId) {
      grantEnrollment(user.id, newStudentCourseId);
    }

    setNewStudentEmail('');
    setNewStudentName('');
    setShowAddStudentModal(false);
  };

  // CSV Parsing
  const handleParseCsv = () => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    const rows: StudentImportRow[] = lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        email: parts[0] || '',
        name: parts[1] || parts[0]?.split('@')[0] || '',
        course_slug: parts[2] || '',
      };
    });
    setParsedRows(rows);
    setImportStatus(null);
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;
    const result = batchImportStudents(parsedRows);
    setImportStatus(
      `Успешно импортировано ${result.importedCount} студентов! Ошибок: ${result.errors.length}`
    );
    setParsedRows([]);
  };

  // Copy helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // SQL Schema Script for Anton's Postgres
  const sqlSchema = `-- PostgreSQL 17 DDL for TonyRoar LMS (Host 155.117.20.144)
-- Connect to database: docker exec -it postgres psql -U postgres -d tonyroar_lms

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  title_ru VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  description_ru TEXT,
  description_en TEXT,
  track_category VARCHAR(64) NOT NULL,
  cover_image VARCHAR(512),
  is_published BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sections (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
  title_ru VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR(64) PRIMARY KEY,
  section_id VARCHAR(64) REFERENCES sections(id) ON DELETE CASCADE,
  course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
  title_ru VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  duration_minutes INT DEFAULT 15,
  video_url TEXT NOT NULL,
  video_type VARCHAR(32) DEFAULT 'direct',
  notes_ru TEXT,
  notes_en TEXT,
  homework_ru TEXT,
  homework_en TEXT,
  materials JSONB DEFAULT '[]'::jsonb,
  is_preview BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enrollments (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(32) DEFAULT 'active',
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  lesson_id VARCHAR(64) REFERENCES lessons(id) ON DELETE CASCADE,
  course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  last_watched_second INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section ON lessons(section_id);
`;

  // Caddyfile block
  const caddyConfig = `# Caddy configuration snippet for TonyRoar LMS
# File: /etc/caddy/Caddyfile
# (Does NOT interfere with tonyroar-dashboard on port 3001 or WordPress/WooCommerce)

lms.tonyroar.com {
    reverse_proxy 127.0.0.1:3002 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    encode gzip zstd
}
`;

  // systemd service
  const systemdService = `# systemd Service Unit for TonyRoar LMS
# File: /etc/systemd/system/tonyroar-lms.service
# Run: systemctl daemon-reload && systemctl enable --now tonyroar-lms

[Unit]
Description=TonyRoar LMS Platform (Courses & Video)
After=network.target postgres.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/tonyroar-lms
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3002
Environment=DATABASE_URL=postgresql://postgres:PASSWORD@127.0.0.1:5432/tonyroar_lms

[Install]
WantedBy=multi-user.target
`;

  return (
    <div className="space-y-8 pb-20">
      {/* Admin Header */}
      <div className="flex flex-col gap-4 border-b border-[#1E2438] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E25858]">
            <Shield className="h-4 w-4" />
            <span>Панель администратора</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t.admin_title}
          </h1>
          <p className="mt-1 text-sm text-[#94A3B8]">{t.admin_subtitle}</p>
        </div>

        <button
          onClick={resetDatabaseToSeed}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2438] bg-[#111420] px-3 py-2 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
          title="Сбросить демо-данные к исходному состоянию"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Сброс демо-данных</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#1E2438] pb-2 text-sm">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'courses'
              ? 'bg-[#1E2438] text-white'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{t.tab_courses_editor}</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-[#1E2438] text-white'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{t.tab_students_manager}</span>
        </button>

        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'csv'
              ? 'bg-[#1E2438] text-white'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          <span>{t.tab_csv_migration}</span>
        </button>

        <button
          onClick={() => setActiveTab('server')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'server'
              ? 'bg-[#1E2438] text-white'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>{t.tab_server_postgres}</span>
        </button>
      </div>

      {/* TAB 1: Courses & Curriculum Editor */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Select Course Dropdown / Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                  selectedCourseId === course.id
                    ? 'bg-[#E25858] text-white'
                    : 'border border-[#1E2438] bg-[#111420] text-[#94A3B8] hover:text-white'
                }`}
              >
                {course.title_ru}
              </button>
            ))}
          </div>

          {/* Course Curriculum Tree */}
          <div className="rounded-xl border border-[#1E2438] bg-[#111420] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2438] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedCourse.title_ru}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Slug: <span className="font-mono text-[#E25858]">{selectedCourse.slug}</span> · Категория: {selectedCourse.track_category}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {courseSections.map((section, sIdx) => {
                const secLessons = lessons.filter((l) => l.section_id === section.id);

                return (
                  <div
                    key={section.id}
                    className="rounded-lg border border-[#1E2438] bg-[#090A0F] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">
                        {section.title_ru}
                      </h4>
                      <button
                        onClick={() => handleOpenAddLesson(section.id)}
                        className="flex items-center gap-1 rounded bg-[#161B2B] px-2.5 py-1 text-xs text-[#E25858] hover:bg-[#1E2438] transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        <span>{t.add_lesson}</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {secLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between rounded border border-[#1E2438] bg-[#111420] p-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{lesson.title_ru}</span>
                              {lesson.is_preview && (
                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-[11px] text-[#64748B] truncate max-w-md">
                              URL: {lesson.video_url}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[#94A3B8] tabular-nums">
                              {lesson.duration_minutes} мин
                            </span>
                            <button
                              onClick={() => handleOpenEditLesson(lesson)}
                              className="rounded p-1 text-[#94A3B8] hover:text-white transition-colors"
                              title="Редактировать урок"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Удалить урок "${lesson.title_ru}"?`)) {
                                  deleteLesson(lesson.id);
                                }
                              }}
                              className="rounded p-1 text-[#94A3B8] hover:text-[#E25858] transition-colors"
                              title="Удалить урок"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Students & Access Manager */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                placeholder={t.search_students_placeholder}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full rounded-lg border border-[#1E2438] bg-[#111420] pl-9 pr-4 py-2 text-xs text-white placeholder-[#64748B] focus:border-[#E25858] focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowAddStudentModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E25858] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D04545]"
            >
              <Plus className="h-4 w-4" />
              <span>{t.add_new_student}</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#1E2438] bg-[#111420]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#1E2438] bg-[#090A0F] text-[#94A3B8]">
                <tr>
                  <th className="p-4">{t.student_table_name}</th>
                  <th className="p-4">{t.student_table_email}</th>
                  <th className="p-4">Роль</th>
                  <th className="p-4">Доступы к 4 трекам</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2438]">
                {users
                  .filter(
                    (u) =>
                      u.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      u.name.toLowerCase().includes(studentSearch.toLowerCase())
                  )
                  .map((student) => (
                    <tr key={student.id} className="hover:bg-[#161B2B] transition-colors">
                      <td className="p-4 font-semibold text-white">{student.name}</td>
                      <td className="p-4 font-mono text-[#CBD5E1]">{student.email}</td>
                      <td className="p-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                            student.role === 'admin'
                              ? 'bg-[#E25858]/20 text-[#E25858]'
                              : 'bg-white/10 text-[#94A3B8]'
                          }`}
                        >
                          {student.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {courses.map((c) => {
                            const hasAccess = isUserEnrolled(c.id, student.id);
                            return (
                              <button
                                key={c.id}
                                onClick={() => {
                                  if (hasAccess) {
                                    revokeEnrollment(student.id, c.id);
                                  } else {
                                    grantEnrollment(student.id, c.id);
                                  }
                                }}
                                className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                  hasAccess
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-[#1E2438] text-[#64748B] hover:text-white'
                                }`}
                                title={c.title_ru}
                              >
                                {hasAccess ? `✓ ${c.slug}` : `+ ${c.slug}`}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CSV Batch Migration */}
      {activeTab === 'csv' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1E2438] bg-[#111420] p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">{t.csv_import_title}</h3>
              <p className="mt-1 text-xs text-[#94A3B8]">{t.csv_import_desc}</p>
            </div>

            <div className="rounded-lg border border-[#1E2438] bg-[#090A0F] p-3 text-xs text-[#94A3B8] space-y-1">
              <p className="font-semibold text-white">Допустимые слаги курсов для импорта:</p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-[#E25858]">
                <span>master-orgasms-ru</span> · <span>master-orgasms-en</span> · <span>quickstart-male</span> · <span>quickstart-female</span>
              </div>
            </div>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={t.csv_placeholder}
              className="w-full rounded-lg border border-[#1E2438] bg-[#090A0F] p-4 font-mono text-xs text-white placeholder-[#64748B] focus:border-[#E25858] focus:outline-none"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleParseCsv}
                className="inline-flex items-center gap-2 rounded-lg bg-[#161B2B] border border-[#2E3652] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E2438]"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>{t.csv_parse_btn}</span>
              </button>

              {parsedRows.length > 0 && (
                <button
                  onClick={handleCommitImport}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E25858] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D04545]"
                >
                  <Check className="h-4 w-4" />
                  <span>{t.csv_import_btn} ({parsedRows.length})</span>
                </button>
              )}
            </div>

            {importStatus && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                {importStatus}
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-[#1E2438]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090A0F] text-[#94A3B8]">
                    <tr>
                      <th className="p-3">Email</th>
                      <th className="p-3">Имя</th>
                      <th className="p-3">Курс (Slug)</th>
                      <th className="p-3">Статус валидации</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2438] bg-[#111420]">
                    {parsedRows.map((r, i) => {
                      const courseExists = courses.some(
                        (c) => c.slug === r.course_slug || c.id === r.course_slug
                      );
                      return (
                        <tr key={i}>
                          <td className="p-3 font-mono text-white">{r.email}</td>
                          <td className="p-3 text-[#CBD5E1]">{r.name}</td>
                          <td className="p-3 font-mono text-[#E25858]">{r.course_slug}</td>
                          <td className="p-3">
                            {courseExists ? (
                              <span className="text-emerald-400">✓ {t.csv_valid}</span>
                            ) : (
                              <span className="text-amber-400">⚠ {t.csv_error}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Server Deployment & PostgreSQL */}
      {activeTab === 'server' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1E2438] bg-[#111420] p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {t.server_deployment_title}
              </h3>
              <p className="mt-1 text-xs text-[#94A3B8]">
                {t.server_deployment_desc}
              </p>
            </div>

            {/* Server Specifications */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-lg border border-[#1E2438] bg-[#090A0F] p-3">
                <p className="text-[#64748B]">Целевой сервер</p>
                <p className="mt-1 font-mono font-semibold text-white">
                  155.117.20.144 : 2223
                </p>
              </div>
              <div className="rounded-lg border border-[#1E2438] bg-[#090A0F] p-3">
                <p className="text-[#64748B]">База данных</p>
                <p className="mt-1 font-mono font-semibold text-white">
                  Docker postgres (5432)
                </p>
              </div>
              <div className="rounded-lg border border-[#1E2438] bg-[#090A0F] p-3">
                <p className="text-[#64748B]">Выделенный порт LMS</p>
                <p className="mt-1 font-mono font-semibold text-[#E25858]">
                  Port 3002 (CRM на 3001 не затронута)
                </p>
              </div>
            </div>

            {/* Section 1: SQL Schema */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  1. Схема PostgreSQL 17 (DDL & Индексы)
                </span>
                <button
                  onClick={() => handleCopy(sqlSchema, 'sql')}
                  className="flex items-center gap-1.5 rounded bg-[#161B2B] px-2.5 py-1 text-xs text-[#E25858] hover:bg-[#1E2438] transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedType === 'sql' ? t.copied : t.copy_sql}</span>
                </button>
              </div>
              <pre className="max-h-60 overflow-y-auto rounded-lg border border-[#1E2438] bg-[#090A0F] p-3 font-mono text-[11px] text-[#94A3B8]">
                {sqlSchema}
              </pre>
            </div>

            {/* Section 2: Caddyfile */}
            <div className="space-y-2 pt-4 border-t border-[#1E2438]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  2. Конфигурация Caddy (/etc/caddy/Caddyfile)
                </span>
                <button
                  onClick={() => handleCopy(caddyConfig, 'caddy')}
                  className="flex items-center gap-1.5 rounded bg-[#161B2B] px-2.5 py-1 text-xs text-[#E25858] hover:bg-[#1E2438] transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedType === 'caddy' ? t.copied : t.copy_caddy}</span>
                </button>
              </div>
              <pre className="rounded-lg border border-[#1E2438] bg-[#090A0F] p-3 font-mono text-[11px] text-[#94A3B8]">
                {caddyConfig}
              </pre>
            </div>

            {/* Section 3: systemd service */}
            <div className="space-y-2 pt-4 border-t border-[#1E2438]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  3. Сервис systemd (/etc/systemd/system/tonyroar-lms.service)
                </span>
                <button
                  onClick={() => handleCopy(systemdService, 'systemd')}
                  className="flex items-center gap-1.5 rounded bg-[#161B2B] px-2.5 py-1 text-xs text-[#E25858] hover:bg-[#1E2438] transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedType === 'systemd' ? t.copied : t.copy_systemd}</span>
                </button>
              </div>
              <pre className="rounded-lg border border-[#1E2438] bg-[#090A0F] p-3 font-mono text-[11px] text-[#94A3B8]">
                {systemdService}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Lesson */}
      {(isAddingLesson || editingLesson) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-[#1E2438] bg-[#111420] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingLesson ? t.edit_lesson : t.add_lesson}
            </h3>

            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1">{t.lesson_title_ru}</label>
                <input
                  type="text"
                  required
                  value={formTitleRu}
                  onChange={(e) => setFormTitleRu(e.target.value)}
                  className="w-full rounded border border-[#1E2438] bg-[#090A0F] p-2 text-white focus:border-[#E25858] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">{t.lesson_title_en}</label>
                <input
                  type="text"
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  className="w-full rounded border border-[#1E2438] bg-[#090A0F] p-2 text-white focus:border-[#E25858] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">{t.video_url_label}</label>
                <input
                  type="text"
                  required
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  className="w-full rounded border border-[#1E2438] bg-[#090A0F] p-2 font-mono text-white focus:border-[#E25858] focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-[#64748B]">{t.video_url_hint}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] mb-1">{t.duration_minutes_label}</label>
                  <input
                    type="number"
                    min={1}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full rounded border border-[#1E2438] bg-[#090A0F] p-2 text-white focus:border-[#E25858] focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-[#94A3B8]">
                    <input
                      type="checkbox"
                      checked={formIsPreview}
                      onChange={(e) => setFormIsPreview(e.target.checked)}
                      className="rounded border-[#1E2438] bg-[#090A0F] accent-[#E25858]"
                    />
                    <span>{t.is_preview_label}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">{t.notes_label_ru}</label>
                <textarea
                  rows={3}
                  value={formNotesRu}
                  onChange={(e) => setFormNotesRu(e.target.value)}
                  className="w-full rounded border border-[#1E2438] bg-[#090A0F] p-2 text-white focus:border-[#E25858] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingLesson(false);
                    setEditingLesson(null);
                  }}
                  className="rounded px-4 py-2 text-xs text-[#94A3B8] hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#E25858] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D04545]"
                >
                  {t.save_changes}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Student Manually */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[#1E2438] bg-[#111420] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">{t.add_student_title}</h3>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1">Email студента *</label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full rounded border border-[#1E2438] bg-[#090A0F] p-2 text-white focus:border-[#E25858] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Имя и фамилия</label>
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full rounded border border-[#1E2438] bg-[#090A0F] p-2 text-white focus:border-[#E25858] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">{t.select_course_grant}</label>
                <select
                  value={newStudentCourseId}
                  onChange={(e) => setNewStudentCourseId(e.target.value)}
                  className="w-full rounded border border-[#1E2438] bg-[#090A0F] p-2 text-white focus:border-[#E25858] focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title_ru} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="rounded px-4 py-2 text-xs text-[#94A3B8] hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#E25858] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D04545]"
                >
                  Создать и выдать доступ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
