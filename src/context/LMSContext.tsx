import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Course,
  Section,
  Lesson,
  Enrollment,
  LessonProgress,
  Language,
  StudentImportRow,
} from '../types/lms';
import {
  SEED_USERS,
  SEED_COURSES,
  SEED_SECTIONS,
  SEED_LESSONS,
  SEED_ENROLLMENTS,
  SEED_PROGRESS,
} from '../data/seedCourses';

interface LMSContextType {
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;

  // Active View Navigation
  currentView: 'catalog' | 'my-courses' | 'classroom' | 'admin';
  setCurrentView: (view: 'catalog' | 'my-courses' | 'classroom' | 'admin') => void;
  activeCourseId: string | null;
  activeLessonId: string | null;
  openLesson: (courseId: string, lessonId: string) => void;
  openCourse: (courseId: string) => void;

  // Auth & User
  currentUser: User;
  switchUser: (userId: string) => void;
  users: User[];
  addUser: (email: string, name: string, role?: 'student' | 'admin') => User;

  // Courses & Curriculum
  courses: Course[];
  sections: Section[];
  lessons: Lesson[];
  addSection: (courseId: string, titleRu: string, titleEn: string) => void;
  addLesson: (lessonData: Omit<Lesson, 'id' | 'sort_order'>) => void;
  updateLesson: (lessonId: string, lessonData: Partial<Lesson>) => void;
  deleteLesson: (lessonId: string) => void;

  // Enrollments
  enrollments: Enrollment[];
  isUserEnrolled: (courseId: string, userId?: string) => boolean;
  grantEnrollment: (userId: string, courseId: string) => void;
  revokeEnrollment: (userId: string, courseId: string) => void;

  // Progress
  progress: LessonProgress[];
  getLessonProgress: (lessonId: string, userId?: string) => LessonProgress | undefined;
  markLessonComplete: (lessonId: string, isCompleted: boolean) => void;
  updateWatchPosition: (lessonId: string, seconds: number) => void;
  getCourseProgressPercent: (courseId: string, userId?: string) => number;

  // Migration & Admin Utilities
  batchImportStudents: (rows: StudentImportRow[]) => { importedCount: number; errors: string[] };
  resetDatabaseToSeed: () => void;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'tonyroar_lms_users_v1',
  COURSES: 'tonyroar_lms_courses_v1',
  SECTIONS: 'tonyroar_lms_sections_v1',
  LESSONS: 'tonyroar_lms_lessons_v1',
  ENROLLMENTS: 'tonyroar_lms_enrollments_v1',
  PROGRESS: 'tonyroar_lms_progress_v1',
  CURRENT_USER_ID: 'tonyroar_lms_current_user_id_v1',
  LANG: 'tonyroar_lms_lang_v1',
};

export const LMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return saved === 'en' ? 'en' : 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  };

  // State with localStorage backing
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'user-student-elena'; // Default demo student
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      return saved ? JSON.parse(saved) : SEED_COURSES;
    } catch {
      return SEED_COURSES;
    }
  });

  const [sections, setSections] = useState<Section[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SECTIONS);
      return saved ? JSON.parse(saved) : SEED_SECTIONS;
    } catch {
      return SEED_SECTIONS;
    }
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
      return saved ? JSON.parse(saved) : SEED_LESSONS;
    } catch {
      return SEED_LESSONS;
    }
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
      return saved ? JSON.parse(saved) : SEED_ENROLLMENTS;
    } catch {
      return SEED_ENROLLMENTS;
    }
  });

  const [progress, setProgress] = useState<LessonProgress[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return saved ? JSON.parse(saved) : SEED_PROGRESS;
    } catch {
      return SEED_PROGRESS;
    }
  });

  // Navigation View State
  const [currentView, setCurrentView] = useState<'catalog' | 'my-courses' | 'classroom' | 'admin'>('catalog');
  const [activeCourseId, setActiveCourseId] = useState<string | null>('course-master-ru');
  const [activeLessonId, setActiveLessonId] = useState<string | null>('les-ru-101');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  }, [progress]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  };

  const addUser = (email: string, name: string, role: 'student' | 'admin' = 'student'): User => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return existing;

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const openLesson = (courseId: string, lessonId: string) => {
    setActiveCourseId(courseId);
    setActiveLessonId(lessonId);
    setCurrentView('classroom');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    // Find first lesson in course
    const courseSections = sections.filter((s) => s.course_id === courseId).sort((a, b) => a.sort_order - b.sort_order);
    if (courseSections.length > 0) {
      const firstSectionLessons = lessons
        .filter((l) => l.section_id === courseSections[0].id)
        .sort((a, b) => a.sort_order - b.sort_order);
      if (firstSectionLessons.length > 0) {
        setActiveLessonId(firstSectionLessons[0].id);
      }
    }
    setCurrentView('classroom');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enrollment checks
  const isUserEnrolled = (courseId: string, userId = currentUser.id): boolean => {
    const user = users.find((u) => u.id === userId);
    if (user?.role === 'admin') return true; // Admins always have access
    return enrollments.some(
      (e) => e.user_id === userId && e.course_id === courseId && e.status === 'active'
    );
  };

  const grantEnrollment = (userId: string, courseId: string) => {
    setEnrollments((prev) => {
      const existing = prev.find((e) => e.user_id === userId && e.course_id === courseId);
      if (existing) {
        return prev.map((e) => (e.id === existing.id ? { ...e, status: 'active' } : e));
      }
      return [
        ...prev,
        {
          id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          user_id: userId,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          status: 'active',
        },
      ];
    });
  };

  const revokeEnrollment = (userId: string, courseId: string) => {
    setEnrollments((prev) =>
      prev.filter((e) => !(e.user_id === userId && e.course_id === courseId))
    );
  };

  // Progress tracking
  const getLessonProgress = (lessonId: string, userId = currentUser.id): LessonProgress | undefined => {
    return progress.find((p) => p.user_id === userId && p.lesson_id === lessonId);
  };

  const markLessonComplete = (lessonId: string, isCompleted: boolean) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    setProgress((prev) => {
      const existing = prev.find((p) => p.user_id === currentUser.id && p.lesson_id === lessonId);
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id
            ? { ...p, is_completed: isCompleted, updated_at: new Date().toISOString() }
            : p
        );
      }
      return [
        ...prev,
        {
          id: `prg-${Date.now()}`,
          user_id: currentUser.id,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          is_completed: isCompleted,
          last_watched_second: 0,
          updated_at: new Date().toISOString(),
        },
      ];
    });
  };

  const updateWatchPosition = (lessonId: string, seconds: number) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    setProgress((prev) => {
      const existing = prev.find((p) => p.user_id === currentUser.id && p.lesson_id === lessonId);
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id
            ? { ...p, last_watched_second: Math.floor(seconds), updated_at: new Date().toISOString() }
            : p
        );
      }
      return [
        ...prev,
        {
          id: `prg-${Date.now()}`,
          user_id: currentUser.id,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          is_completed: false,
          last_watched_second: Math.floor(seconds),
          updated_at: new Date().toISOString(),
        },
      ];
    });
  };

  const getCourseProgressPercent = (courseId: string, userId = currentUser.id): number => {
    const courseLessons = lessons.filter((l) => l.course_id === courseId);
    if (courseLessons.length === 0) return 0;

    const completedCount = courseLessons.filter((l) => {
      const p = progress.find((prg) => prg.user_id === userId && prg.lesson_id === l.id);
      return p?.is_completed;
    }).length;

    return Math.round((completedCount / courseLessons.length) * 100);
  };

  // Admin Course CRUD
  const addSection = (courseId: string, titleRu: string, titleEn: string) => {
    const courseSections = sections.filter((s) => s.course_id === courseId);
    const newSection: Section = {
      id: `sec-${Date.now()}`,
      course_id: courseId,
      title_ru: titleRu,
      title_en: titleEn,
      sort_order: courseSections.length + 1,
    };
    setSections((prev) => [...prev, newSection]);
  };

  const addLesson = (lessonData: Omit<Lesson, 'id' | 'sort_order'>) => {
    const sectionLessons = lessons.filter((l) => l.section_id === lessonData.section_id);
    const newLesson: Lesson = {
      ...lessonData,
      id: `les-${Date.now()}`,
      sort_order: sectionLessons.length + 1,
    };
    setLessons((prev) => [...prev, newLesson]);
  };

  const updateLesson = (lessonId: string, lessonData: Partial<Lesson>) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, ...lessonData } : l))
    );
  };

  const deleteLesson = (lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  // CSV Batch Migration
  const batchImportStudents = (rows: StudentImportRow[]) => {
    let importedCount = 0;
    const errors: string[] = [];

    rows.forEach((row, index) => {
      const email = row.email?.trim().toLowerCase();
      if (!email || !email.includes('@')) {
        errors.push(`Row ${index + 1}: Invalid email '${row.email}'`);
        return;
      }

      const slug = row.course_slug?.trim();
      const course = courses.find((c) => c.slug === slug || c.id === slug);
      if (!course) {
        errors.push(`Row ${index + 1}: Course slug '${slug}' not found for ${email}`);
        return;
      }

      // Find or create user
      let user = users.find((u) => u.email.toLowerCase() === email);
      if (!user) {
        user = addUser(email, row.name?.trim() || email.split('@')[0], 'student');
      }

      // Grant enrollment
      grantEnrollment(user.id, course.id);
      importedCount++;
    });

    return { importedCount, errors };
  };

  const resetDatabaseToSeed = () => {
    setUsers(SEED_USERS);
    setCourses(SEED_COURSES);
    setSections(SEED_SECTIONS);
    setLessons(SEED_LESSONS);
    setEnrollments(SEED_ENROLLMENTS);
    setProgress(SEED_PROGRESS);
    setCurrentUserId('user-student-elena');
    localStorage.clear();
  };

  return (
    <LMSContext.Provider
      value={{
        language,
        setLanguage,
        currentView,
        setCurrentView,
        activeCourseId,
        activeLessonId,
        openLesson,
        openCourse,
        currentUser,
        switchUser,
        users,
        addUser,
        courses,
        sections,
        lessons,
        addSection,
        addLesson,
        updateLesson,
        deleteLesson,
        enrollments,
        isUserEnrolled,
        grantEnrollment,
        revokeEnrollment,
        progress,
        getLessonProgress,
        markLessonComplete,
        updateWatchPosition,
        getCourseProgressPercent,
        batchImportStudents,
        resetDatabaseToSeed,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = (): LMSContextType => {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};
