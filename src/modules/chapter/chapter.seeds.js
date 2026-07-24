/**
 * StudyOS - Chapter Seed Data (v1.0.2 Matrix)
 *
 * Predefined chapters keyed by "examSlug/subjectSlug".
 */

const jeePhysicsChapters = [
  { name: 'Kinematics', slug: 'kinematics', difficulty: 'medium', weightage: 8, estimatedHours: 12, sortOrder: 1 },
  { name: 'Laws of Motion', slug: 'laws-of-motion', difficulty: 'medium', weightage: 8, estimatedHours: 14, sortOrder: 2 },
  { name: 'Work, Energy & Power', slug: 'work-energy-power', difficulty: 'medium', weightage: 7, estimatedHours: 10, sortOrder: 3 },
  { name: 'Rotational Motion', slug: 'rotational-motion', difficulty: 'hard', weightage: 8, estimatedHours: 16, sortOrder: 4 },
  { name: 'Gravitation', slug: 'gravitation', difficulty: 'medium', weightage: 5, estimatedHours: 8, sortOrder: 5 },
  { name: 'Thermodynamics', slug: 'thermodynamics', difficulty: 'hard', weightage: 8, estimatedHours: 14, sortOrder: 6 },
  { name: 'Electrostatics', slug: 'electrostatics', difficulty: 'hard', weightage: 10, estimatedHours: 16, sortOrder: 7 },
  { name: 'Current Electricity', slug: 'current-electricity', difficulty: 'medium', weightage: 9, estimatedHours: 12, sortOrder: 8 },
  { name: 'Magnetism & EMI', slug: 'magnetism-emi', difficulty: 'hard', weightage: 8, estimatedHours: 14, sortOrder: 9 },
  { name: 'Optics', slug: 'optics', difficulty: 'medium', weightage: 9, estimatedHours: 12, sortOrder: 10 },
];

const jeeChemChapters = [
  { name: 'Atomic Structure', slug: 'atomic-structure', difficulty: 'medium', weightage: 7, estimatedHours: 8, sortOrder: 1 },
  { name: 'Chemical Bonding', slug: 'chemical-bonding', difficulty: 'hard', weightage: 9, estimatedHours: 14, sortOrder: 2 },
  { name: 'Thermodynamics & Thermochemistry', slug: 'thermodynamics', difficulty: 'hard', weightage: 8, estimatedHours: 12, sortOrder: 3 },
  { name: 'Equilibrium', slug: 'equilibrium', difficulty: 'hard', weightage: 8, estimatedHours: 14, sortOrder: 4 },
  { name: 'Organic Chemistry Basics', slug: 'organic-basics', difficulty: 'medium', weightage: 8, estimatedHours: 10, sortOrder: 5 },
  { name: 'Hydrocarbons', slug: 'hydrocarbons', difficulty: 'medium', weightage: 7, estimatedHours: 10, sortOrder: 6 },
  { name: 'Coordination Compounds', slug: 'coordination-compounds', difficulty: 'hard', weightage: 7, estimatedHours: 10, sortOrder: 7 },
  { name: 'Electrochemistry', slug: 'electrochemistry', difficulty: 'hard', weightage: 8, estimatedHours: 10, sortOrder: 8 },
];

const jeeMathChapters = [
  { name: 'Sets, Relations & Functions', slug: 'sets-relations-functions', difficulty: 'medium', weightage: 6, estimatedHours: 8, sortOrder: 1 },
  { name: 'Quadratic Equations', slug: 'quadratic-equations', difficulty: 'easy', weightage: 5, estimatedHours: 6, sortOrder: 2 },
  { name: 'Matrices & Determinants', slug: 'matrices-determinants', difficulty: 'hard', weightage: 8, estimatedHours: 14, sortOrder: 3 },
  { name: 'Limits, Continuity & Differentiability', slug: 'limits-continuity', difficulty: 'hard', weightage: 10, estimatedHours: 16, sortOrder: 4 },
  { name: 'Integrals', slug: 'integrals', difficulty: 'hard', weightage: 10, estimatedHours: 18, sortOrder: 5 },
  { name: 'Coordinate Geometry', slug: 'coordinate-geometry', difficulty: 'medium', weightage: 10, estimatedHours: 14, sortOrder: 6 },
  { name: 'Probability & Statistics', slug: 'probability-statistics', difficulty: 'medium', weightage: 8, estimatedHours: 10, sortOrder: 7 },
  { name: 'Vectors & 3D Geometry', slug: 'vectors-3d-geometry', difficulty: 'hard', weightage: 6, estimatedHours: 12, sortOrder: 8 },
];

const sscQuantChapters = [
  { name: 'Number System', slug: 'number-system', difficulty: 'easy', weightage: 10, estimatedHours: 8, sortOrder: 1 },
  { name: 'Percentages & Profit Loss', slug: 'percentages-profit-loss', difficulty: 'medium', weightage: 15, estimatedHours: 10, sortOrder: 2 },
  { name: 'Ratio & Proportion', slug: 'ratio-proportion', difficulty: 'easy', weightage: 10, estimatedHours: 6, sortOrder: 3 },
  { name: 'Time, Speed & Distance', slug: 'time-speed-distance', difficulty: 'medium', weightage: 12, estimatedHours: 8, sortOrder: 4 },
  { name: 'Geometry & Mensuration', slug: 'geometry-mensuration', difficulty: 'hard', weightage: 18, estimatedHours: 14, sortOrder: 5 },
  { name: 'Algebra & Trigonometry', slug: 'algebra-trigonometry', difficulty: 'hard', weightage: 15, estimatedHours: 12, sortOrder: 6 },
];

const sscReasoningChapters = [
  { name: 'Analogies & Classification', slug: 'analogies-classification', difficulty: 'easy', weightage: 15, estimatedHours: 6, sortOrder: 1 },
  { name: 'Coding & Decoding', slug: 'coding-decoding', difficulty: 'easy', weightage: 15, estimatedHours: 6, sortOrder: 2 },
  { name: 'Syllogism & Venn Diagrams', slug: 'syllogism-venn', difficulty: 'medium', weightage: 15, estimatedHours: 8, sortOrder: 3 },
  { name: 'Blood Relations & Direction', slug: 'blood-relations', difficulty: 'medium', weightage: 12, estimatedHours: 6, sortOrder: 4 },
  { name: 'Non-Verbal & Pattern Completion', slug: 'non-verbal-patterns', difficulty: 'easy', weightage: 15, estimatedHours: 6, sortOrder: 5 },
];

const CHAPTER_SEEDS = {
  // JEE Main
  'jee-main/physics': jeePhysicsChapters,
  'jee-main/chemistry': jeeChemChapters,
  'jee-main/mathematics': jeeMathChapters,

  // JEE Advanced
  'jee-advanced/physics': jeePhysicsChapters,
  'jee-advanced/chemistry': jeeChemChapters,
  'jee-advanced/mathematics': jeeMathChapters,

  // BITSAT, WBJEE, COMEDK, KCET, MHT-CET, VITEEE, SRMJEEE, MET, KIITEE, EAMCET
  'bitsat/physics': jeePhysicsChapters,
  'bitsat/chemistry': jeeChemChapters,
  'bitsat/mathematics': jeeMathChapters,
  'wbjee/physics': jeePhysicsChapters,
  'wbjee/chemistry': jeeChemChapters,
  'wbjee/mathematics': jeeMathChapters,
  'comedk-uget/physics': jeePhysicsChapters,
  'comedk-uget/chemistry': jeeChemChapters,
  'comedk-uget/mathematics': jeeMathChapters,
  'kcet/physics': jeePhysicsChapters,
  'kcet/chemistry': jeeChemChapters,
  'kcet/mathematics': jeeMathChapters,
  'mht-cet/physics': jeePhysicsChapters,
  'mht-cet/chemistry': jeeChemChapters,
  'mht-cet/mathematics': jeeMathChapters,
  'viteee/physics': jeePhysicsChapters,
  'viteee/chemistry': jeeChemChapters,
  'viteee/mathematics': jeeMathChapters,

  // NEET UG
  'neet-ug/physics': jeePhysicsChapters,
  'neet-ug/chemistry': jeeChemChapters,
  'neet-ug/botany': [
    { name: 'Cell Biology & Genetics', slug: 'cell-biology-genetics', difficulty: 'hard', weightage: 25, estimatedHours: 16, sortOrder: 1 },
    { name: 'Plant Physiology', slug: 'plant-physiology', difficulty: 'medium', weightage: 20, estimatedHours: 14, sortOrder: 2 },
    { name: 'Ecology & Environment', slug: 'ecology-environment', difficulty: 'easy', weightage: 18, estimatedHours: 10, sortOrder: 3 },
    { name: 'Plant Reproduction', slug: 'plant-reproduction', difficulty: 'medium', weightage: 15, estimatedHours: 10, sortOrder: 4 },
  ],
  'neet-ug/zoology': [
    { name: 'Human Physiology', slug: 'human-physiology', difficulty: 'hard', weightage: 30, estimatedHours: 20, sortOrder: 1 },
    { name: 'Human Reproduction & Health', slug: 'human-reproduction', difficulty: 'medium', weightage: 18, estimatedHours: 12, sortOrder: 2 },
    { name: 'Evolution & Animal Kingdom', slug: 'evolution-animal-kingdom', difficulty: 'medium', weightage: 20, estimatedHours: 14, sortOrder: 3 },
    { name: 'Biotechnology & Applications', slug: 'biotechnology', difficulty: 'hard', weightage: 15, estimatedHours: 10, sortOrder: 4 },
  ],

  // SSC CGL / CHSL / MTS / Railways
  'ssc-cgl/quantitative': sscQuantChapters,
  'ssc-cgl/general-intelligence': sscReasoningChapters,
  'ssc-chsl/quantitative': sscQuantChapters,
  'ssc-chsl/general-intelligence': sscReasoningChapters,
  'rrb-ntpc/quantitative': sscQuantChapters,
  'rrb-ntpc/general-intelligence': sscReasoningChapters,

  // Banking (IBPS PO, SBI PO)
  'ibps-po/quantitative': sscQuantChapters,
  'ibps-po/reasoning': sscReasoningChapters,
  'sbi-po/quantitative': sscQuantChapters,
  'sbi-po/reasoning': sscReasoningChapters,

  // GATE CS
  'gate-cs/cs-core': [
    { name: 'Data Structures & Algorithms', slug: 'dsa', difficulty: 'hard', weightage: 20, estimatedHours: 25, sortOrder: 1 },
    { name: 'Operating Systems', slug: 'operating-systems', difficulty: 'hard', weightage: 12, estimatedHours: 16, sortOrder: 2 },
    { name: 'Computer Networks', slug: 'computer-networks', difficulty: 'hard', weightage: 12, estimatedHours: 16, sortOrder: 3 },
    { name: 'Database Management Systems', slug: 'dbms', difficulty: 'medium', weightage: 10, estimatedHours: 14, sortOrder: 4 },
    { name: 'Theory of Computation & Compiler', slug: 'toc-compiler', difficulty: 'hard', weightage: 14, estimatedHours: 18, sortOrder: 5 },
  ],

  // CAT / Management
  'cat/qa': sscQuantChapters,
  'cat/dilr': sscReasoningChapters,

  // CBSE 10 & 12
  'cbse-class-12/physics': jeePhysicsChapters,
  'cbse-class-12/chemistry': jeeChemChapters,
  'cbse-class-12/mathematics': jeeMathChapters,
  'cbse-class-10/mathematics': sscQuantChapters,
  'cbse-class-10/science': [
    { name: 'Chemical Reactions & Equations', slug: 'chemical-reactions', difficulty: 'easy', weightage: 15, estimatedHours: 8, sortOrder: 1 },
    { name: 'Light — Reflection & Refraction', slug: 'light-reflection', difficulty: 'medium', weightage: 18, estimatedHours: 10, sortOrder: 2 },
    { name: 'Life Processes', slug: 'life-processes', difficulty: 'medium', weightage: 20, estimatedHours: 12, sortOrder: 3 },
    { name: 'Electricity & Magnetic Effects', slug: 'electricity-magnetic', difficulty: 'hard', weightage: 20, estimatedHours: 12, sortOrder: 4 },
  ],
};

module.exports = CHAPTER_SEEDS;
