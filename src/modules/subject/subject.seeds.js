/**
 * StudyOS - Subject Seed Data (v1.0.2 Matrix)
 *
 * Predefined subjects linked to exams by exam slug.
 */

const pcm = [
  { name: 'Physics', slug: 'physics', icon: '⚡', color: '#10B981', weightage: 33, totalMarks: 100, sortOrder: 1 },
  { name: 'Chemistry', slug: 'chemistry', icon: '🧪', color: '#A855F7', weightage: 33, totalMarks: 100, sortOrder: 2 },
  { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#F59E0B', weightage: 34, totalMarks: 100, sortOrder: 3 },
];

const pcb = [
  { name: 'Physics', slug: 'physics', icon: '⚡', color: '#10B981', weightage: 25, totalMarks: 180, sortOrder: 1 },
  { name: 'Chemistry', slug: 'chemistry', icon: '🧪', color: '#A855F7', weightage: 25, totalMarks: 180, sortOrder: 2 },
  { name: 'Biology (Botany)', slug: 'botany', icon: '🌿', color: '#22C55E', weightage: 25, totalMarks: 180, sortOrder: 3 },
  { name: 'Biology (Zoology)', slug: 'zoology', icon: '🐾', color: '#EF4444', weightage: 25, totalMarks: 180, sortOrder: 4 },
];

const sscSubjects = [
  { name: 'General Intelligence', slug: 'general-intelligence', icon: '🧠', color: '#A855F7', weightage: 25, totalMarks: 50, sortOrder: 1 },
  { name: 'English Language', slug: 'english', icon: '📖', color: '#06B6D4', weightage: 25, totalMarks: 50, sortOrder: 2 },
  { name: 'Quantitative Aptitude', slug: 'quantitative', icon: '🔢', color: '#F59E0B', weightage: 25, totalMarks: 50, sortOrder: 3 },
  { name: 'General Awareness', slug: 'general-awareness', icon: '🌍', color: '#10B981', weightage: 25, totalMarks: 50, sortOrder: 4 },
];

const bankSubjects = [
  { name: 'English Language', slug: 'english', icon: '📖', color: '#06B6D4', weightage: 20, totalMarks: 40, sortOrder: 1 },
  { name: 'Quantitative Aptitude', slug: 'quantitative', icon: '🔢', color: '#F59E0B', weightage: 20, totalMarks: 40, sortOrder: 2 },
  { name: 'Reasoning Ability', slug: 'reasoning', icon: '🧩', color: '#A855F7', weightage: 20, totalMarks: 40, sortOrder: 3 },
  { name: 'General Awareness', slug: 'general-awareness', icon: '🌍', color: '#10B981', weightage: 20, totalMarks: 40, sortOrder: 4 },
  { name: 'Computer Aptitude', slug: 'computer', icon: '💻', color: '#6366F1', weightage: 20, totalMarks: 40, sortOrder: 5 },
];

const SUBJECT_SEEDS = {
  // Engineering
  'jee-main': pcm,
  'jee-advanced': pcm,
  'bitsat': [
    ...pcm,
    { name: 'English Proficiency', slug: 'english-proficiency', icon: '📖', color: '#06B6D4', weightage: 10, totalMarks: 45, sortOrder: 4 },
    { name: 'Logical Reasoning', slug: 'logical-reasoning', icon: '🧠', color: '#EC4899', weightage: 10, totalMarks: 45, sortOrder: 5 },
  ],
  'wbjee': pcm,
  'comedk-uget': pcm,
  'kcet': pcm,
  'mht-cet': pcm,
  'viteee': pcm,
  'srmjeee': pcm,
  'met': pcm,
  'kiitee': pcm,
  'ap-eamcet': pcm,
  'ts-eamcet': pcm,
  'gujcet': pcm,
  'keam': pcm,

  // Medical
  'neet-ug': pcb,
  'neet-pg': [
    { name: 'Pre-Clinical', slug: 'pre-clinical', icon: '🧬', color: '#10B981', weightage: 30, totalMarks: 240, sortOrder: 1 },
    { name: 'Para-Clinical', slug: 'para-clinical', icon: '🔬', color: '#A855F7', weightage: 30, totalMarks: 240, sortOrder: 2 },
    { name: 'Clinical Subjects', slug: 'clinical', icon: '🩺', color: '#EF4444', weightage: 40, totalMarks: 320, sortOrder: 3 },
  ],
  'ini-cet': [
    { name: 'Basic Medical Sciences', slug: 'basic-medical', icon: '🧬', color: '#10B981', weightage: 45, totalMarks: 90, sortOrder: 1 },
    { name: 'Clinical Specialities', slug: 'clinical-specialities', icon: '🩺', color: '#A855F7', weightage: 55, totalMarks: 110, sortOrder: 2 },
  ],
  'fmge': [
    { name: 'Pre & Para Clinical', slug: 'pre-para-clinical', icon: '🔬', color: '#10B981', weightage: 50, totalMarks: 150, sortOrder: 1 },
    { name: 'Clinical Subjects', slug: 'clinical-subjects', icon: '🩺', color: '#EF4444', weightage: 50, totalMarks: 150, sortOrder: 2 },
  ],

  // Government & SSC
  'ssc-cgl': sscSubjects,
  'ssc-chsl': sscSubjects,
  'ssc-mts': sscSubjects,
  'ssc-cpo': sscSubjects,
  'ssc-gd': sscSubjects,
  'ssc-je': [
    { name: 'General Intelligence', slug: 'general-intelligence', icon: '🧠', color: '#A855F7', weightage: 25, totalMarks: 50, sortOrder: 1 },
    { name: 'General Awareness', slug: 'general-awareness', icon: '🌍', color: '#10B981', weightage: 25, totalMarks: 50, sortOrder: 2 },
    { name: 'Engineering Domain', slug: 'engineering-domain', icon: '⚙️', color: '#F59E0B', weightage: 50, totalMarks: 100, sortOrder: 3 },
  ],

  // Railways
  'rrb-ntpc': sscSubjects,
  'rrb-je': sscSubjects,
  'rrb-alp': sscSubjects,

  // Banking
  'ibps-po': bankSubjects,
  'ibps-clerk': bankSubjects,
  'sbi-po': bankSubjects,
  'sbi-clerk': bankSubjects,
  'rbi-grade-b': bankSubjects,

  // Civil Services & Defence
  'upsc-cse': [
    { name: 'General Studies', slug: 'general-studies', icon: '📚', color: '#6366F1', weightage: 40, totalMarks: 1000, sortOrder: 1 },
    { name: 'CSAT', slug: 'csat', icon: '🧠', color: '#A855F7', weightage: 10, totalMarks: 200, sortOrder: 2 },
    { name: 'Optional Subject', slug: 'optional', icon: '📝', color: '#EC4899', weightage: 25, totalMarks: 500, sortOrder: 3 },
    { name: 'Essay', slug: 'essay', icon: '✍️', color: '#F97316', weightage: 12, totalMarks: 250, sortOrder: 4 },
    { name: 'Ethics', slug: 'ethics', icon: '⚖️', color: '#10B981', weightage: 13, totalMarks: 250, sortOrder: 5 },
  ],
  'upsc-nda': [
    { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#F59E0B', weightage: 33, totalMarks: 300, sortOrder: 1 },
    { name: 'General Ability Test', slug: 'gat', icon: '🛡️', color: '#10B981', weightage: 67, totalMarks: 600, sortOrder: 2 },
  ],
  'upsc-cds': [
    { name: 'English', slug: 'english', icon: '📖', color: '#06B6D4', weightage: 33, totalMarks: 100, sortOrder: 1 },
    { name: 'General Knowledge', slug: 'general-knowledge', icon: '🌍', color: '#10B981', weightage: 33, totalMarks: 100, sortOrder: 2 },
    { name: 'Elementary Mathematics', slug: 'elementary-maths', icon: '📐', color: '#F59E0B', weightage: 34, totalMarks: 100, sortOrder: 3 },
  ],
  'afcat': [
    { name: 'Verbal Ability', slug: 'verbal-ability', icon: '🗣️', color: '#06B6D4', weightage: 25, totalMarks: 75, sortOrder: 1 },
    { name: 'Numerical Ability', slug: 'numerical-ability', icon: '🔢', color: '#F59E0B', weightage: 25, totalMarks: 75, sortOrder: 2 },
    { name: 'Reasoning & Military Aptitude', slug: 'military-aptitude', icon: '🎯', color: '#A855F7', weightage: 25, totalMarks: 75, sortOrder: 3 },
    { name: 'General Awareness', slug: 'general-awareness', icon: '🌍', color: '#10B981', weightage: 25, totalMarks: 75, sortOrder: 4 },
  ],
  'uppsc': sscSubjects,
  'bpsc': sscSubjects,

  // Management
  'cat': [
    { name: 'VARC (Verbal)', slug: 'varc', icon: '📖', color: '#06B6D4', weightage: 33, totalMarks: 66, sortOrder: 1 },
    { name: 'DILR (Data & Reasoning)', slug: 'dilr', icon: '📊', color: '#A855F7', weightage: 33, totalMarks: 66, sortOrder: 2 },
    { name: 'QA (Quant)', slug: 'qa', icon: '🔢', color: '#F59E0B', weightage: 34, totalMarks: 66, sortOrder: 3 },
  ],
  'xat': [
    { name: 'Verbal & Logical', slug: 'verbal-logical', icon: '📖', color: '#06B6D4', weightage: 25, totalMarks: 25, sortOrder: 1 },
    { name: 'Decision Making', slug: 'decision-making', icon: '🧩', color: '#EC4899', weightage: 25, totalMarks: 25, sortOrder: 2 },
    { name: 'Quantitative & Data', slug: 'quant-data', icon: '🔢', color: '#F59E0B', weightage: 25, totalMarks: 25, sortOrder: 3 },
    { name: 'General Knowledge', slug: 'general-knowledge', icon: '🌍', color: '#10B981', weightage: 25, totalMarks: 25, sortOrder: 4 },
  ],
  'nmat': [
    { name: 'Language Skills', slug: 'language-skills', icon: '📖', color: '#06B6D4', weightage: 33, totalMarks: 120, sortOrder: 1 },
    { name: 'Quantitative Skills', slug: 'quantitative-skills', icon: '🔢', color: '#F59E0B', weightage: 33, totalMarks: 120, sortOrder: 2 },
    { name: 'Logical Reasoning', slug: 'logical-reasoning', icon: '🧠', color: '#A855F7', weightage: 34, totalMarks: 120, sortOrder: 3 },
  ],
  'snap': [
    { name: 'General English', slug: 'general-english', icon: '📖', color: '#06B6D4', weightage: 25, totalMarks: 15, sortOrder: 1 },
    { name: 'Analytical & Logical Reasoning', slug: 'logical-reasoning', icon: '🧠', color: '#A855F7', weightage: 40, totalMarks: 25, sortOrder: 2 },
    { name: 'Quantitative & Data', slug: 'quant-data', icon: '🔢', color: '#F59E0B', weightage: 35, totalMarks: 20, sortOrder: 3 },
  ],

  // Law Entrance
  'clat-ug': [
    { name: 'English Language', slug: 'english', icon: '📖', color: '#06B6D4', weightage: 20, totalMarks: 24, sortOrder: 1 },
    { name: 'Current Affairs & GK', slug: 'current-affairs', icon: '📰', color: '#10B981', weightage: 25, totalMarks: 30, sortOrder: 2 },
    { name: 'Legal Reasoning', slug: 'legal-reasoning', icon: '⚖️', color: '#EC4899', weightage: 25, totalMarks: 30, sortOrder: 3 },
    { name: 'Logical Reasoning', slug: 'logical-reasoning', icon: '🧠', color: '#A855F7', weightage: 20, totalMarks: 24, sortOrder: 4 },
    { name: 'Quantitative Techniques', slug: 'quant', icon: '🔢', color: '#F59E0B', weightage: 10, totalMarks: 12, sortOrder: 5 },
  ],
  'ailet': [
    { name: 'English Language', slug: 'english', icon: '📖', color: '#06B6D4', weightage: 33, totalMarks: 50, sortOrder: 1 },
    { name: 'Current Affairs & GK', slug: 'current-affairs', icon: '📰', color: '#10B981', weightage: 20, totalMarks: 30, sortOrder: 2 },
    { name: 'Logical Reasoning', slug: 'logical-reasoning', icon: '🧠', color: '#A855F7', weightage: 47, totalMarks: 70, sortOrder: 3 },
  ],

  // Graduate & Research (GATE)
  'gate-cs': [
    { name: 'General Aptitude', slug: 'general-aptitude', icon: '🧠', color: '#06B6D4', weightage: 15, totalMarks: 15, sortOrder: 1 },
    { name: 'Engineering Mathematics', slug: 'engg-maths', icon: '📐', color: '#F59E0B', weightage: 13, totalMarks: 13, sortOrder: 2 },
    { name: 'Computer Science Core', slug: 'cs-core', icon: '💻', color: '#A855F7', weightage: 72, totalMarks: 72, sortOrder: 3 },
  ],
  'gate-ec': [
    { name: 'General Aptitude', slug: 'general-aptitude', icon: '🧠', color: '#06B6D4', weightage: 15, totalMarks: 15, sortOrder: 1 },
    { name: 'Engineering Mathematics', slug: 'engg-maths', icon: '📐', color: '#F59E0B', weightage: 13, totalMarks: 13, sortOrder: 2 },
    { name: 'Electronics & Signals', slug: 'ec-core', icon: '⚡', color: '#10B981', weightage: 72, totalMarks: 72, sortOrder: 3 },
  ],
  'ugc-net': [
    { name: 'Teaching & Research Aptitude', slug: 'teaching-aptitude', icon: '🎓', color: '#6366F1', weightage: 33, totalMarks: 100, sortOrder: 1 },
    { name: 'Subject Core', slug: 'subject-core', icon: '📚', color: '#A855F7', weightage: 67, totalMarks: 200, sortOrder: 2 },
  ],

  // School Boards
  'cbse-class-10': [
    { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#F59E0B', weightage: 20, totalMarks: 80, sortOrder: 1 },
    { name: 'Science', slug: 'science', icon: '🔬', color: '#10B981', weightage: 20, totalMarks: 80, sortOrder: 2 },
    { name: 'Social Science', slug: 'social-science', icon: '🌍', color: '#6366F1', weightage: 20, totalMarks: 80, sortOrder: 3 },
    { name: 'English', slug: 'english', icon: '📖', color: '#06B6D4', weightage: 20, totalMarks: 80, sortOrder: 4 },
    { name: 'Hindi', slug: 'hindi', icon: '🇮🇳', color: '#EF4444', weightage: 20, totalMarks: 80, sortOrder: 5 },
  ],
  'cbse-class-12': [
    { name: 'Physics', slug: 'physics', icon: '⚡', color: '#10B981', weightage: 20, totalMarks: 70, sortOrder: 1 },
    { name: 'Chemistry', slug: 'chemistry', icon: '🧪', color: '#A855F7', weightage: 20, totalMarks: 70, sortOrder: 2 },
    { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#F59E0B', weightage: 20, totalMarks: 80, sortOrder: 3 },
    { name: 'English', slug: 'english', icon: '📖', color: '#06B6D4', weightage: 20, totalMarks: 80, sortOrder: 4 },
    { name: 'Computer Science', slug: 'computer-science', icon: '💻', color: '#6366F1', weightage: 20, totalMarks: 70, sortOrder: 5 },
  ],
  'icse-class-10': [
    { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#F59E0B', weightage: 20, totalMarks: 100, sortOrder: 1 },
    { name: 'Science', slug: 'science', icon: '🔬', color: '#10B981', weightage: 20, totalMarks: 100, sortOrder: 2 },
    { name: 'History & Civics', slug: 'history-civics', icon: '🏛️', color: '#EF4444', weightage: 20, totalMarks: 100, sortOrder: 3 },
    { name: 'Geography', slug: 'geography', icon: '🗺️', color: '#6366F1', weightage: 20, totalMarks: 100, sortOrder: 4 },
    { name: 'English', slug: 'english', icon: '📖', color: '#06B6D4', weightage: 20, totalMarks: 100, sortOrder: 5 },
  ],
  'isc-class-12': [
    { name: 'Physics', slug: 'physics', icon: '⚡', color: '#10B981', weightage: 20, totalMarks: 100, sortOrder: 1 },
    { name: 'Chemistry', slug: 'chemistry', icon: '🧪', color: '#A855F7', weightage: 20, totalMarks: 100, sortOrder: 2 },
    { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#F59E0B', weightage: 20, totalMarks: 100, sortOrder: 3 },
    { name: 'English', slug: 'english', icon: '📖', color: '#06B6D4', weightage: 20, totalMarks: 100, sortOrder: 4 },
    { name: 'Computer Science', slug: 'computer-science', icon: '💻', color: '#6366F1', weightage: 20, totalMarks: 100, sortOrder: 5 },
  ],

  // Overseas & Aptitude
  'sat': [
    { name: 'Reading & Writing', slug: 'sat-rw', icon: '📖', color: '#06B6D4', weightage: 50, totalMarks: 800, sortOrder: 1 },
    { name: 'Math', slug: 'sat-math', icon: '📐', color: '#F59E0B', weightage: 50, totalMarks: 800, sortOrder: 2 },
  ],
  'gre': [
    { name: 'Verbal Reasoning', slug: 'gre-verbal', icon: '📖', color: '#06B6D4', weightage: 50, totalMarks: 170, sortOrder: 1 },
    { name: 'Quantitative Reasoning', slug: 'gre-quant', icon: '🔢', color: '#F59E0B', weightage: 50, totalMarks: 170, sortOrder: 2 },
  ],
};

module.exports = SUBJECT_SEEDS;
