export type Role = 'student' | 'admin';

export type Language = 'ru' | 'en';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export type TrackCategory =
  | 'mastery_ru'
  | 'mastery_en'
  | 'quickstart_male'
  | 'quickstart_female';

export interface Course {
  id: string;
  slug: string;
  title_ru: string;
  title_en: string;
  description_ru: string;
  description_en: string;
  track_category: TrackCategory;
  cover_image: string;
  is_published: boolean;
  sort_order: number;
  badge_ru?: string;
  badge_en?: string;
}

export interface Section {
  id: string;
  course_id: string;
  title_ru: string;
  title_en: string;
  sort_order: number;
}

export interface LessonMaterial {
  id: string;
  title: string;
  url: string;
  type: 'audio' | 'pdf' | 'guide';
  size?: string;
}

export interface Lesson {
  id: string;
  section_id: string;
  course_id: string;
  title_ru: string;
  title_en: string;
  duration_minutes: number;
  video_url: string;
  video_type: 'direct' | 'bunny_stream' | 'embed' | 'hls';
  notes_ru: string;
  notes_en: string;
  homework_ru?: string;
  homework_en?: string;
  materials: LessonMaterial[];
  is_preview: boolean;
  sort_order: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'revoked';
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  last_watched_second: number;
  updated_at: string;
}

export interface StudentImportRow {
  email: string;
  name?: string;
  course_slug: string;
  status?: string;
}
