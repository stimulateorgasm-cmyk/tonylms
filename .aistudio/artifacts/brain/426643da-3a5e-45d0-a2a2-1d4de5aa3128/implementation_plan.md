# TonyRoar LMS — Self-Hosted Course Platform

An independent, self-hosted Learning Management System (LMS) built to replace Teachable and Skillspace for Anton's psychological, hypnotic, and intimacy educational programs. It provides students with a focused, dark atmospheric learning environment and gives the instructor full control over student enrollments, course structures, video delivery, and student migration.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following directions were confirmed during initial clarification and guide this implementation:

- **Video Delivery Strategy**: Starting with high-performance responsive sample video streams and media embeds while video asset links from Teachable/Skillspace are finalized. The video player architecture is engineered with a modular provider interface ready for Bunny.net Stream or signed CDN URLs with short TTL.
- **Database & Architecture**: Full-stack application with an in-memory/persistent typed store mirroring the production PostgreSQL 17 schema (`users`, `courses`, `sections`, `lessons`, `enrollments`, `lesson_progress`). Includes an exportable SQL DDL script and Docker/Caddy/systemd deployment guide for Anton's VPS.
- **Visual Aesthetic**: Dark atmospheric editorial style inspired by `strah.fun` — deep slate/black background tones (`#090A0F`), subtle borders (`#1F2438`), warm ambient highlights, distraction-free theater video player, and clean typography.
- **Bilingual Tracks**: Seamless RU/EN interface language toggle coupled with the 4 designated tracks:
  1. RU-курс «Мастер оргазмов» (полный)
  2. EN-курс «Hypnotic Orgasm Class / Master of Orgasms» (full)
  3. «Быстрый старт: Мужской трек» (RU/EN)
  4. «Быстрый старт: Женский трек» (RU/EN)

---

### 1. Overview & Core Concept

- **What It Does**: A complete LMS platform replacing third-party SaaS subscriptions. Students register/log in, access their enrolled tracks, watch video lessons with resume-from-timestamp capability, mark progress, and download supplementary materials. The admin panel empowers Anton to manage courses, adjust lesson content, grant student access, and batch-import existing students from Teachable/Skillspace via CSV/JSON.
- **Target Audience & Persona**:
  - *Students*: Adults learning hypnotic techniques and sexual mastery in Russian or English who need a private, distraction-free, reliable mobile and desktop video learning experience.
  - *Instructor / Admin (Anton)*: Needs effortless course editing, quick student access grants, and zero risk of vendor lock-in or recurring SaaS fees.
- **Key Value**: 100% data ownership on Anton's server, lightning-fast player loading, seamless RU/EN localization, and simple integration with WooCommerce/Caddy when payments are ready.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Student Authentication & Onboarding**:
   - Clean email/password sign-in and registration screen.
   - Demo student & admin quick-switch buttons for effortless evaluation.
   - Session persistence and role authorization.
2. **Student Dashboard & Course Hub**:
   - Overview of enrolled tracks with visual progress meters and "Continue where you left off" quick-action.
   - Catalog of available tracks with syllabus preview.
   - Language selector (RU / EN) instantly translating all interface labels.
3. **Immersive Video Lesson Classroom**:
   - Two-zone layout: Wide theater video viewport with custom playback controls, playback speed (0.75x–2x), timestamp bookmarks, and completed/resume status.
   - Curriculum drawer/sidebar listing sections and lessons with real-time completion checkmarks.
   - Tabbed lesson workspace beneath player: Lesson Notes & Key Takeaways, Practical Homework / Exercises, and Audio / PDF Downloads.
   - Mark as Completed button with auto-advance to next lesson.
4. **Admin Dashboard & Course Editor**:
   - Course hierarchy management: Create/edit course → Section → Lesson (title, description, duration, video URL / Bunny embed ID, attachments).
   - Student Enrollment Management: Searchable table of registered students, add student, toggle access to any of the 4 courses.
   - CSV / JSON Batch Import Tool: Paste student email lists with assigned course tracks to migrate directly from Teachable / Skillspace.

#### Visual Identity & Theme (strah.fun Inspired)

- **Aesthetic Direction**: Moody, dark editorial, minimalist, and intimate. Restrained contrast with sharp spatial geometry.
- **Color Palette**:
  - Dominant Canvas (60%): `#090A0F` (abyssal graphite)
  - Structural Panels & Cards (30%): `#111420` (subtle midnight slate) with hairline borders `#1E2438`
  - Accent Budget (10%): `#E25858` (crimson ember for primary actions, play indicators, and active states) and `#D4AF37` (soft gold for certificate/mastery milestones)
- **Typography**:
  - Display / Headings: `Plus Jakarta Sans` (bold, tracking-tight, title-case)
  - Body: `Plus Jakarta Sans` / `DM Sans` (legible 15px, comfortable reading measure)
  - Data / Timestamps: `JetBrains Mono` / tabular numerals (`tabular-nums`)
- **Anti-Slop Discipline**: No generic purple gradients, no floating decorative dots, no fake system telemetry or meaningless version badges. Clean unboxed metadata with `·` separators.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Modular Storage Layer (In-Memory + Postgres Ready)**
  - *Chosen Approach*: Implement a typed data repository that stores state in local storage/memory for the applet demo while providing a 1:1 SQL schema and migration script for Anton's PostgreSQL 17 instance on `155.117.20.144`.
  - *Why*: Allows immediate interactive testing in the browser while guaranteeing seamless copy-paste or export deployment to the target Linux host without rewriting data logic.
- **Decision 2: Universal Video Player with Signed URL Provider**
  - *Chosen Approach*: Support standard HTML5 video, HLS/m3u8, direct MP4, Bunny.net Stream iframe embeds, and YouTube/Vimeo fallback, wrapped in an abstraction that accepts signed URL tokens.
  - *Why*: Gives Anton the flexibility to use Bunny.net Stream (the recommended low-cost, high-performance host) or Backblaze B2/Cloudflare without locking the frontend into a single vendor.
- **Decision 3: Complete Pre-Seeded 4 Tracks**
  - *Chosen Approach*: Pre-populate realistic, comprehensive syllabus structures for all 4 tracks (modules, lessons, durations, homework) in both RU and EN so the platform is immediately functional upon launch.
- **Decision 4: Built-in Teachable/Skillspace CSV Migrator**
  - *Chosen Approach*: Add an admin CSV/JSON parser with real-time validation and preview before committing enrollments.
  - *Why*: Directly solves the migration bottleneck without requiring Anton to write database scripts manually.

---

### 4. Technical Architecture & Data Strategy

#### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          TONYROAR LMS (Next/React)                     │
├────────────────────────────────────────────────────────────────────────┤
│ Top Navigation: Brand [TONYROAR LMS] ── Track Selector ── RU/EN ── User │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────┐  ┌─────────────────────────────────┐ │
│  │     STUDENT LEARNING VIEW    │  │       ADMINISTRATION PANEL      │ │
│  ├──────────────────────────────┤  ├─────────────────────────────────┤ │
│  │ • Enrolled Courses Grid      │  │ • Course & Curriculum Editor    │ │
│  │ • Theater Video Player       │  │ • Student Enrollment Table      │ │
│  │ • Lesson Progress & Resume   │  │ • Batch CSV / JSON Importer     │ │
│  │ • Notes, Audio & Downloads   │  │ • Postgres DDL & Backup Tool    │ │
│  └──────────────┬───────────────┘  └────────────────┬────────────────┘ │
│                 │                                   │                  │
│                 ▼                                   ▼                  │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      APPLICATION CORE STATE                       │ │
│  │  • Auth State (CurrentUser, Role: Student | Admin)                │ │
│  │  • Localization Context (RU / EN Dictionary)                      │ │
│  │  • Video Provider (Direct / Bunny.net / Signed Token Resolver)    │ │
│  └──────────────────────────────────┬────────────────────────────────┘ │
│                                     │                                  │
│                                     ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                   TYPED DATA REPOSITORY & STORAGE                 │ │
│  │  • Users · Courses · Sections · Lessons · Enrollments · Progress  │ │
│  │  • PostgreSQL 17 Production Schema & Migration Generator         │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Schema (PostgreSQL 17 Compatible)

```sql
-- Users (Students & Admins)
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'student', -- 'student' | 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses (4 Tracks)
CREATE TABLE courses (
  id VARCHAR(64) PRIMARY KEY,
  title_ru VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  description_ru TEXT,
  description_en TEXT,
  track_category VARCHAR(64) NOT NULL, -- 'mastery' | 'quickstart_male' | 'quickstart_female'
  cover_image VARCHAR(512),
  is_published BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- Sections (Course Modules)
CREATE TABLE sections (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
  title_ru VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0
);

-- Lessons (Video & Content)
CREATE TABLE lessons (
  id VARCHAR(64) PRIMARY KEY,
  section_id VARCHAR(64) REFERENCES sections(id) ON DELETE CASCADE,
  title_ru VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  duration_minutes INT DEFAULT 15,
  video_url TEXT NOT NULL,
  video_type VARCHAR(32) DEFAULT 'direct', -- 'direct' | 'bunny_stream' | 'hls'
  notes_ru TEXT,
  notes_en TEXT,
  materials JSONB DEFAULT '[]'::jsonb, -- attachments, audio tracks
  is_preview BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

-- Enrollments (Student Access to Courses)
CREATE TABLE enrollments (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(32) DEFAULT 'active',
  UNIQUE(user_id, course_id)
);

-- Lesson Progress (Tracking & Resume)
CREATE TABLE lesson_progress (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  lesson_id VARCHAR(64) REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  last_watched_second INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
```

#### Interactive Component & State Mapping

1. **`CoursePlayer`**: Manages video playback time, auto-saves playback seconds every 5 seconds to `lesson_progress`, triggers completion toggle, handles fullscreen and theater mode.
2. **`CourseCurriculumDrawer`**: Accordion of sections and lessons; highlights current active lesson, displays duration and checkmark badges.
3. **`AdminCourseEditor`**: Interactive modal to create or update sections and lessons, edit video URLs, preview playback immediately.
4. **`StudentManager`**: Table with instant search, filter by course enrollment, single-click grant/revoke access.
5. **`CsvMigrationModal`**: Textarea or file upload accepting CSV lines (`email,name,course_slug`), shows parsed preview table with conflict resolution, commits in bulk.
6. **`ServerDeploymentDocs`**: Admin-accessible tab displaying exact Caddyfile configuration and systemd service file ready to deploy on `155.117.20.144` without touching existing ports 3001 (tonyroar-dashboard) or WooCommerce.
