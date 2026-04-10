import type {
  AnalyticsSnapshot,
  CalendarRecord,
  DailyTaskItem,
  NotificationRecord,
  QuestionBankItem,
  QuizAttemptSummary,
  QuizStatsSnapshot,
  StudyPlanSummary,
  StudySession,
  TodayDashboard,
} from "@/lib/api";

export const demoWeeklyVelocity = [
  { day: "Mon", score: 48 },
  { day: "Tue", score: 54 },
  { day: "Wed", score: 62 },
  { day: "Thu", score: 58 },
  { day: "Fri", score: 76 },
  { day: "Sat", score: 83 },
  { day: "Sun", score: 91 },
];

export const demoTasks: DailyTaskItem[] = [
  {
    id: "demo-1",
    chapterName: "Electrostatics PYQs",
    subjectName: "Physics",
    durationMinutes: 90,
    status: "pending",
    dayNumber: 12,
    type: "study",
  },
  {
    id: "demo-2",
    chapterName: "Aldehydes and Ketones revision",
    subjectName: "Chemistry",
    durationMinutes: 45,
    status: "in-progress",
    dayNumber: 12,
    type: "revision",
  },
  {
    id: "demo-3",
    chapterName: "Definite Integrals checkpoint",
    subjectName: "Mathematics",
    durationMinutes: 60,
    status: "completed",
    dayNumber: 12,
    type: "study",
  },
];

export const demoPlans: StudyPlanSummary[] = [
  {
    id: "demo-plan-1",
    title: "JEE Main - 90 Day Sprint",
    status: "active",
    stats: {
      totalStudyDays: 68,
      totalRevisionDays: 12,
      totalStudyHours: 360,
      chaptersCount: 84,
    },
    config: {
      totalDays: 90,
      hoursPerDay: 4,
      className: "12",
      startDate: new Date().toISOString(),
    },
  },
];

export const demoDashboard: TodayDashboard = {
  greeting: "Good evening",
  motivation:
    "You are closer than you think. Protect momentum today and the results will compound.",
  date: new Date().toISOString(),
  today: {
    tasks: demoTasks,
    progress: {
      totalTasks: 3,
      completed: 1,
      inProgress: 1,
      pending: 1,
      skipped: 0,
      totalMinutes: 195,
      completedMinutes: 60,
      completionRate: 33,
    },
  },
  revision: {
    dueCount: 4,
    weakCount: 2,
    cards: [
      {
        id: "rev-1",
        chapterName: "Rotational Dynamics",
        subjectName: "Physics",
        difficulty: "hard",
        isWeak: true,
      },
      {
        id: "rev-2",
        chapterName: "Electrochemistry",
        subjectName: "Chemistry",
        difficulty: "medium",
        isWeak: true,
      },
    ],
  },
  plans: [
    {
      id: "demo-plan-1",
      title: "JEE Main - 90 Day Sprint",
      currentDay: 12,
      totalDays: 90,
      daysRemaining: 78,
      progressPercent: 13,
      hoursPerDay: 4,
    },
  ],
  overall: {
    totalTasks: 44,
    completedTasks: 31,
    skippedTasks: 3,
    totalHours: 58.5,
    completedHours: 38.5,
    completionRate: 70,
  },
};

export const demoAnalytics: AnalyticsSnapshot = {
  accuracy: 89,
  progress: 71,
  weak_chapters: ["Rotational Dynamics", "Electrochemistry", "Thermodynamics"],
};

export const demoSessions: StudySession[] = [
  { id: "sess-1", durationMinutes: 45, createdAt: new Date().toISOString() },
  {
    id: "sess-2",
    durationMinutes: 25,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const demoCalendar: CalendarRecord[] = Array.from({ length: 12 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - index);

  return {
    id: `cal-${index + 1}`,
    dateString: date.toISOString().split("T")[0],
    completed: index % 3 !== 0,
  };
});

export const demoNotifications: NotificationRecord[] = [
  {
    id: "note-1",
    message: "Revision window is open for Rotational Dynamics.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "note-2",
    message: "You completed 45 focused minutes yesterday. Keep the streak alive.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const demoQuestionBank: QuestionBankItem[] = [
  {
    id: "guest-q-kinematics-1",
    question:
      "A car starts from rest and accelerates uniformly at 2 m/s^2 for 5 s. What distance does it cover?",
    options: [
      { label: "A", text: "10 m" },
      { label: "B", text: "20 m" },
      { label: "C", text: "25 m" },
      { label: "D", text: "50 m" },
    ],
    difficulty: "easy",
    type: "mcq",
    explanation: "Use s = ut + 1/2 at^2. With u = 0, s = 1/2 x 2 x 25 = 25 m.",
    chapterName: "Kinematics",
    subjectName: "Physics",
    tags: ["pyq", "jee-main-2024", "motion"],
    correctAnswer: 2,
  },
  {
    id: "guest-q-kinematics-2",
    question:
      "The slope of a velocity-time graph gives which physical quantity?",
    options: [
      { label: "A", text: "Acceleration" },
      { label: "B", text: "Displacement" },
      { label: "C", text: "Speed" },
      { label: "D", text: "Force" },
    ],
    difficulty: "easy",
    type: "mcq",
    explanation: "dv/dt is acceleration, which is the slope of the v-t graph.",
    chapterName: "Kinematics",
    subjectName: "Physics",
    tags: ["pyq", "jee-main-2023", "graphs"],
    correctAnswer: 0,
  },
  {
    id: "guest-q-mole-1",
    question: "How many molecules are present in 1 mole of a substance?",
    options: [
      { label: "A", text: "3.01 x 10^23" },
      { label: "B", text: "6.02 x 10^23" },
      { label: "C", text: "9.03 x 10^23" },
      { label: "D", text: "12.04 x 10^23" },
    ],
    difficulty: "easy",
    type: "mcq",
    explanation: "1 mole contains Avogadro's number, 6.02 x 10^23 particles.",
    chapterName: "Mole Concept",
    subjectName: "Chemistry",
    tags: ["pyq", "jee-main-2024", "stoichiometry"],
    correctAnswer: 1,
  },
  {
    id: "guest-q-mole-2",
    question: "Molar mass of CO2 is:",
    options: [
      { label: "A", text: "22 g/mol" },
      { label: "B", text: "28 g/mol" },
      { label: "C", text: "44 g/mol" },
      { label: "D", text: "48 g/mol" },
    ],
    difficulty: "easy",
    type: "mcq",
    explanation: "12 + 16 + 16 = 44 g/mol.",
    chapterName: "Mole Concept",
    subjectName: "Chemistry",
    tags: ["pyq", "jee-main-2022", "stoichiometry"],
    correctAnswer: 2,
  },
  {
    id: "guest-q-quadratic-1",
    question: "For x^2 - 5x + 6 = 0, the roots are:",
    options: [
      { label: "A", text: "2 and 3" },
      { label: "B", text: "1 and 6" },
      { label: "C", text: "-2 and -3" },
      { label: "D", text: "0 and 5" },
    ],
    difficulty: "easy",
    type: "mcq",
    explanation: "(x - 2)(x - 3) = 0, so the roots are 2 and 3.",
    chapterName: "Quadratic Equations",
    subjectName: "Mathematics",
    tags: ["pyq", "jee-main-2024", "algebra"],
    correctAnswer: 0,
  },
  {
    id: "guest-q-quadratic-2",
    question: "The discriminant of x^2 + 4x + 4 = 0 is:",
    options: [
      { label: "A", text: "0" },
      { label: "B", text: "4" },
      { label: "C", text: "8" },
      { label: "D", text: "16" },
    ],
    difficulty: "medium",
    type: "mcq",
    explanation: "b^2 - 4ac = 16 - 16 = 0.",
    chapterName: "Quadratic Equations",
    subjectName: "Mathematics",
    tags: ["pyq", "jee-main-2023", "algebra"],
    correctAnswer: 0,
  },
  {
    id: "guest-q-current-1",
    question: "The SI unit of electric resistance is:",
    options: [
      { label: "A", text: "Volt" },
      { label: "B", text: "Ampere" },
      { label: "C", text: "Ohm" },
      { label: "D", text: "Watt" },
    ],
    difficulty: "easy",
    type: "mcq",
    explanation: "Electric resistance is measured in ohms.",
    chapterName: "Current Electricity",
    subjectName: "Physics",
    tags: ["pyq", "jee-main-2021", "electricity"],
    correctAnswer: 2,
  },
  {
    id: "guest-q-organic-1",
    question: "The functional group in alcohols is:",
    options: [
      { label: "A", text: "-CHO" },
      { label: "B", text: "-COOH" },
      { label: "C", text: "-OH" },
      { label: "D", text: "-NH2" },
    ],
    difficulty: "easy",
    type: "mcq",
    explanation: "Alcohols contain the hydroxyl group, -OH.",
    chapterName: "Organic Chemistry Basics",
    subjectName: "Chemistry",
    tags: ["pyq", "neet-2024", "organic"],
    correctAnswer: 2,
  },
  {
    id: "guest-q-biology-1",
    question: "The powerhouse of the cell is:",
    options: [
      { label: "A", text: "Nucleus" },
      { label: "B", text: "Mitochondria" },
      { label: "C", text: "Ribosome" },
      { label: "D", text: "Golgi body" },
    ],
    difficulty: "easy",
    type: "mcq",
    explanation: "Mitochondria are known as the powerhouse of the cell.",
    chapterName: "Cell Structure",
    subjectName: "Biology",
    tags: ["pyq", "neet-2024", "biology"],
    correctAnswer: 1,
  },
];

export const demoQuizHistory: QuizAttemptSummary[] = [
  {
    id: "guest-attempt-1",
    quizId: {
      id: "guest-quiz-1",
      title: "Guest Mixed Sprint",
      type: "custom",
      totalQuestions: 5,
      timeLimitMinutes: 20,
      passingScore: 60,
      difficulty: "mixed",
      subjectName: "Mixed",
    },
    status: "completed",
    totalQuestions: 5,
    answered: 5,
    correct: 4,
    wrong: 1,
    skipped: 0,
    score: 80,
    passed: true,
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 86340000).toISOString(),
    timeTakenMinutes: 14,
    timeLimitMinutes: 20,
  },
];

export const demoQuizStats: QuizStatsSnapshot = {
  totalQuizzes: 1,
  totalQuestionsAttempted: 5,
  totalCorrect: 4,
  avgScore: 80,
  highestScore: 80,
  passRate: 100,
  avgTimeTaken: 14,
  accuracy: 80,
};
