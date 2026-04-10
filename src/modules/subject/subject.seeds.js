/**
 * StudyOS - Subject Seed Data
 *
 * Predefined subjects linked to exams by exam slug.
 * During seeding, slugs are resolved to exam ObjectIds.
 *
 * Each subject has a colour and icon for frontend rendering.
 */

const SUBJECT_SEEDS = {
  // ─── JEE Main / Advanced ──────────────────────────────────────────────────────
  'jee-main': [
    { name: 'Physics',     slug: 'physics',     icon: '⚡', color: '#3B82F6', weightage: 33, totalMarks: 100, sortOrder: 1 },
    { name: 'Chemistry',   slug: 'chemistry',   icon: '🧪', color: '#10B981', weightage: 33, totalMarks: 100, sortOrder: 2 },
    { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#F59E0B', weightage: 34, totalMarks: 100, sortOrder: 3 },
  ],
  'jee-advanced': [
    { name: 'Physics',     slug: 'physics',     icon: '⚡', color: '#3B82F6', weightage: 33, totalMarks: 120, sortOrder: 1 },
    { name: 'Chemistry',   slug: 'chemistry',   icon: '🧪', color: '#10B981', weightage: 33, totalMarks: 120, sortOrder: 2 },
    { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#F59E0B', weightage: 34, totalMarks: 120, sortOrder: 3 },
  ],

  // ─── NEET UG ──────────────────────────────────────────────────────────────────
  'neet-ug': [
    { name: 'Physics',          slug: 'physics',   icon: '⚡', color: '#3B82F6', weightage: 25, totalMarks: 180, sortOrder: 1 },
    { name: 'Chemistry',        slug: 'chemistry', icon: '🧪', color: '#10B981', weightage: 25, totalMarks: 180, sortOrder: 2 },
    { name: 'Biology (Botany)', slug: 'botany',    icon: '🌿', color: '#22C55E', weightage: 25, totalMarks: 180, sortOrder: 3 },
    { name: 'Biology (Zoology)',slug: 'zoology',   icon: '🐾', color: '#EF4444', weightage: 25, totalMarks: 180, sortOrder: 4 },
  ],

  // ─── UPSC CSE ─────────────────────────────────────────────────────────────────
  'upsc-cse': [
    { name: 'General Studies',  slug: 'general-studies', icon: '📚', color: '#6366F1', weightage: 40, totalMarks: 1000, sortOrder: 1 },
    { name: 'CSAT',             slug: 'csat',            icon: '🧠', color: '#8B5CF6', weightage: 10, totalMarks: 200,  sortOrder: 2 },
    { name: 'Optional Subject', slug: 'optional',        icon: '📝', color: '#EC4899', weightage: 25, totalMarks: 500,  sortOrder: 3 },
    { name: 'Essay',            slug: 'essay',           icon: '✍️', color: '#F97316', weightage: 12, totalMarks: 250,  sortOrder: 4 },
    { name: 'Ethics',           slug: 'ethics',          icon: '⚖️', color: '#14B8A6', weightage: 13, totalMarks: 250,  sortOrder: 5 },
  ],

  // ─── SSC CGL ──────────────────────────────────────────────────────────────────
  'ssc-cgl': [
    { name: 'General Intelligence', slug: 'general-intelligence', icon: '🧠', color: '#8B5CF6', weightage: 25, totalMarks: 50, sortOrder: 1 },
    { name: 'English Language',     slug: 'english',              icon: '📖', color: '#3B82F6', weightage: 25, totalMarks: 50, sortOrder: 2 },
    { name: 'Quantitative Aptitude',slug: 'quantitative',         icon: '🔢', color: '#F59E0B', weightage: 25, totalMarks: 50, sortOrder: 3 },
    { name: 'General Awareness',    slug: 'general-awareness',    icon: '🌍', color: '#10B981', weightage: 25, totalMarks: 50, sortOrder: 4 },
  ],

  // ─── SSC CHSL ─────────────────────────────────────────────────────────────────
  'ssc-chsl': [
    { name: 'General Intelligence', slug: 'general-intelligence', icon: '🧠', color: '#8B5CF6', weightage: 25, totalMarks: 50, sortOrder: 1 },
    { name: 'English Language',     slug: 'english',              icon: '📖', color: '#3B82F6', weightage: 25, totalMarks: 50, sortOrder: 2 },
    { name: 'Quantitative Aptitude',slug: 'quantitative',         icon: '🔢', color: '#F59E0B', weightage: 25, totalMarks: 50, sortOrder: 3 },
    { name: 'General Awareness',    slug: 'general-awareness',    icon: '🌍', color: '#10B981', weightage: 25, totalMarks: 50, sortOrder: 4 },
  ],

  // ─── IBPS PO ──────────────────────────────────────────────────────────────────
  'ibps-po': [
    { name: 'English Language',     slug: 'english',    icon: '📖', color: '#3B82F6', weightage: 20, totalMarks: 40, sortOrder: 1 },
    { name: 'Quantitative Aptitude',slug: 'quantitative', icon: '🔢', color: '#F59E0B', weightage: 20, totalMarks: 40, sortOrder: 2 },
    { name: 'Reasoning Ability',    slug: 'reasoning',  icon: '🧩', color: '#8B5CF6', weightage: 20, totalMarks: 40, sortOrder: 3 },
    { name: 'General Awareness',    slug: 'general-awareness', icon: '🌍', color: '#10B981', weightage: 20, totalMarks: 40, sortOrder: 4 },
    { name: 'Computer Aptitude',    slug: 'computer',   icon: '💻', color: '#6366F1', weightage: 20, totalMarks: 40, sortOrder: 5 },
  ],

  // ─── SBI PO ───────────────────────────────────────────────────────────────────
  'sbi-po': [
    { name: 'English Language',     slug: 'english',    icon: '📖', color: '#3B82F6', weightage: 20, totalMarks: 40, sortOrder: 1 },
    { name: 'Quantitative Aptitude',slug: 'quantitative', icon: '🔢', color: '#F59E0B', weightage: 20, totalMarks: 40, sortOrder: 2 },
    { name: 'Reasoning Ability',    slug: 'reasoning',  icon: '🧩', color: '#8B5CF6', weightage: 20, totalMarks: 40, sortOrder: 3 },
    { name: 'General Awareness',    slug: 'general-awareness', icon: '🌍', color: '#10B981', weightage: 20, totalMarks: 40, sortOrder: 4 },
    { name: 'Computer Aptitude',    slug: 'computer',   icon: '💻', color: '#6366F1', weightage: 20, totalMarks: 40, sortOrder: 5 },
  ],

  // ─── CBSE Class 10 ────────────────────────────────────────────────────────────
  'cbse-class-10': [
    { name: 'Mathematics',     slug: 'mathematics',     icon: '📐', color: '#F59E0B', weightage: 20, totalMarks: 80, sortOrder: 1 },
    { name: 'Science',         slug: 'science',         icon: '🔬', color: '#10B981', weightage: 20, totalMarks: 80, sortOrder: 2 },
    { name: 'Social Science',  slug: 'social-science',  icon: '🌍', color: '#6366F1', weightage: 20, totalMarks: 80, sortOrder: 3 },
    { name: 'English',         slug: 'english',         icon: '📖', color: '#3B82F6', weightage: 20, totalMarks: 80, sortOrder: 4 },
    { name: 'Hindi',           slug: 'hindi',           icon: '🇮🇳', color: '#EF4444', weightage: 20, totalMarks: 80, sortOrder: 5 },
  ],

  // ─── CBSE Class 12 ────────────────────────────────────────────────────────────
  'cbse-class-12': [
    { name: 'Physics',          slug: 'physics',          icon: '⚡', color: '#3B82F6', weightage: 20, totalMarks: 70, sortOrder: 1 },
    { name: 'Chemistry',        slug: 'chemistry',        icon: '🧪', color: '#10B981', weightage: 20, totalMarks: 70, sortOrder: 2 },
    { name: 'Mathematics',      slug: 'mathematics',      icon: '📐', color: '#F59E0B', weightage: 20, totalMarks: 80, sortOrder: 3 },
    { name: 'English',          slug: 'english',          icon: '📖', color: '#8B5CF6', weightage: 20, totalMarks: 80, sortOrder: 4 },
    { name: 'Computer Science', slug: 'computer-science', icon: '💻', color: '#6366F1', weightage: 20, totalMarks: 70, sortOrder: 5 },
  ],

  // ─── ICSE Class 10 ────────────────────────────────────────────────────────────
  'icse-class-10': [
    { name: 'Mathematics',       slug: 'mathematics',      icon: '📐', color: '#F59E0B', weightage: 20, totalMarks: 100, sortOrder: 1 },
    { name: 'Science',           slug: 'science',          icon: '🔬', color: '#10B981', weightage: 20, totalMarks: 100, sortOrder: 2 },
    { name: 'History & Civics',  slug: 'history-civics',   icon: '🏛️', color: '#EF4444', weightage: 20, totalMarks: 100, sortOrder: 3 },
    { name: 'Geography',        slug: 'geography',        icon: '🗺️', color: '#6366F1', weightage: 20, totalMarks: 100, sortOrder: 4 },
    { name: 'English',          slug: 'english',          icon: '📖', color: '#3B82F6', weightage: 20, totalMarks: 100, sortOrder: 5 },
  ],

  // ─── ISC Class 12 ─────────────────────────────────────────────────────────────
  'isc-class-12': [
    { name: 'Physics',          slug: 'physics',          icon: '⚡', color: '#3B82F6', weightage: 20, totalMarks: 100, sortOrder: 1 },
    { name: 'Chemistry',        slug: 'chemistry',        icon: '🧪', color: '#10B981', weightage: 20, totalMarks: 100, sortOrder: 2 },
    { name: 'Mathematics',      slug: 'mathematics',      icon: '📐', color: '#F59E0B', weightage: 20, totalMarks: 100, sortOrder: 3 },
    { name: 'English',          slug: 'english',          icon: '📖', color: '#8B5CF6', weightage: 20, totalMarks: 100, sortOrder: 4 },
    { name: 'Computer Science', slug: 'computer-science', icon: '💻', color: '#6366F1', weightage: 20, totalMarks: 100, sortOrder: 5 },
  ],
};

module.exports = SUBJECT_SEEDS;
