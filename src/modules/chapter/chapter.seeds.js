/**
 * StudyOS - Chapter Seed Data
 *
 * Predefined chapters keyed by "examSlug/subjectSlug".
 * During seeding, slugs are resolved to ObjectIds.
 */

const CHAPTER_SEEDS = {
  // ─── JEE Main — Physics ────────────────────────────────────────────────────────
  'jee-main/physics': [
    { name: 'Kinematics',                  slug: 'kinematics',               difficulty: 'medium', weightage: 8,  estimatedHours: 12, sortOrder: 1 },
    { name: 'Laws of Motion',              slug: 'laws-of-motion',           difficulty: 'medium', weightage: 8,  estimatedHours: 14, sortOrder: 2 },
    { name: 'Work, Energy & Power',        slug: 'work-energy-power',        difficulty: 'medium', weightage: 7,  estimatedHours: 10, sortOrder: 3 },
    { name: 'Rotational Motion',           slug: 'rotational-motion',        difficulty: 'hard',   weightage: 8,  estimatedHours: 16, sortOrder: 4 },
    { name: 'Gravitation',                 slug: 'gravitation',              difficulty: 'medium', weightage: 5,  estimatedHours: 8,  sortOrder: 5 },
    { name: 'Thermodynamics',              slug: 'thermodynamics',           difficulty: 'hard',   weightage: 8,  estimatedHours: 14, sortOrder: 6 },
    { name: 'Oscillations & Waves',        slug: 'oscillations-waves',       difficulty: 'hard',   weightage: 7,  estimatedHours: 12, sortOrder: 7 },
    { name: 'Electrostatics',              slug: 'electrostatics',           difficulty: 'hard',   weightage: 10, estimatedHours: 16, sortOrder: 8 },
    { name: 'Current Electricity',         slug: 'current-electricity',      difficulty: 'medium', weightage: 9,  estimatedHours: 12, sortOrder: 9 },
    { name: 'Magnetism & EMI',             slug: 'magnetism-emi',            difficulty: 'hard',   weightage: 8,  estimatedHours: 14, sortOrder: 10 },
    { name: 'Optics',                      slug: 'optics',                   difficulty: 'medium', weightage: 9,  estimatedHours: 12, sortOrder: 11 },
    { name: 'Modern Physics',              slug: 'modern-physics',           difficulty: 'medium', weightage: 8,  estimatedHours: 10, sortOrder: 12 },
    { name: 'Semiconductors',              slug: 'semiconductors',           difficulty: 'easy',   weightage: 5,  estimatedHours: 6,  sortOrder: 13 },
  ],

  // ─── JEE Main — Chemistry ─────────────────────────────────────────────────────
  'jee-main/chemistry': [
    { name: 'Atomic Structure',            slug: 'atomic-structure',         difficulty: 'medium', weightage: 7,  estimatedHours: 8,  sortOrder: 1 },
    { name: 'Chemical Bonding',            slug: 'chemical-bonding',         difficulty: 'hard',   weightage: 9,  estimatedHours: 14, sortOrder: 2 },
    { name: 'Thermodynamics & Thermochemistry', slug: 'thermodynamics',     difficulty: 'hard',   weightage: 8,  estimatedHours: 12, sortOrder: 3 },
    { name: 'Equilibrium',                 slug: 'equilibrium',              difficulty: 'hard',   weightage: 8,  estimatedHours: 14, sortOrder: 4 },
    { name: 'Organic Chemistry Basics',    slug: 'organic-basics',           difficulty: 'medium', weightage: 8,  estimatedHours: 10, sortOrder: 5 },
    { name: 'Hydrocarbons',                slug: 'hydrocarbons',             difficulty: 'medium', weightage: 7,  estimatedHours: 10, sortOrder: 6 },
    { name: 'Coordination Compounds',      slug: 'coordination-compounds',   difficulty: 'hard',   weightage: 7,  estimatedHours: 10, sortOrder: 7 },
    { name: 'Electrochemistry',            slug: 'electrochemistry',         difficulty: 'hard',   weightage: 8,  estimatedHours: 10, sortOrder: 8 },
    { name: 'Solutions',                   slug: 'solutions',                difficulty: 'medium', weightage: 6,  estimatedHours: 8,  sortOrder: 9 },
    { name: 'Periodic Table & Properties', slug: 'periodic-table',           difficulty: 'easy',   weightage: 7,  estimatedHours: 6,  sortOrder: 10 },
    { name: 'p-Block Elements',            slug: 'p-block-elements',         difficulty: 'medium', weightage: 8,  estimatedHours: 12, sortOrder: 11 },
    { name: 'd & f Block Elements',        slug: 'd-f-block-elements',       difficulty: 'medium', weightage: 7,  estimatedHours: 8,  sortOrder: 12 },
    { name: 'Polymers & Biomolecules',     slug: 'polymers-biomolecules',    difficulty: 'easy',   weightage: 5,  estimatedHours: 6,  sortOrder: 13 },
    { name: 'Environmental Chemistry',     slug: 'environmental-chemistry',  difficulty: 'easy',   weightage: 5,  estimatedHours: 4,  sortOrder: 14 },
  ],

  // ─── JEE Main — Mathematics ───────────────────────────────────────────────────
  'jee-main/mathematics': [
    { name: 'Sets, Relations & Functions', slug: 'sets-relations-functions', difficulty: 'medium', weightage: 6,  estimatedHours: 8,  sortOrder: 1 },
    { name: 'Complex Numbers',             slug: 'complex-numbers',          difficulty: 'medium', weightage: 6,  estimatedHours: 10, sortOrder: 2 },
    { name: 'Quadratic Equations',         slug: 'quadratic-equations',      difficulty: 'easy',   weightage: 5,  estimatedHours: 6,  sortOrder: 3 },
    { name: 'Matrices & Determinants',     slug: 'matrices-determinants',    difficulty: 'hard',   weightage: 8,  estimatedHours: 14, sortOrder: 4 },
    { name: 'Permutations & Combinations', slug: 'permutations-combinations', difficulty: 'medium', weightage: 6, estimatedHours: 8,  sortOrder: 5 },
    { name: 'Binomial Theorem',            slug: 'binomial-theorem',         difficulty: 'medium', weightage: 5,  estimatedHours: 6,  sortOrder: 6 },
    { name: 'Sequences & Series',          slug: 'sequences-series',         difficulty: 'medium', weightage: 6,  estimatedHours: 8,  sortOrder: 7 },
    { name: 'Limits, Continuity & Differentiability', slug: 'limits-continuity', difficulty: 'hard', weightage: 10, estimatedHours: 16, sortOrder: 8 },
    { name: 'Integrals',                   slug: 'integrals',                difficulty: 'hard',   weightage: 10, estimatedHours: 18, sortOrder: 9 },
    { name: 'Differential Equations',      slug: 'differential-equations',   difficulty: 'hard',   weightage: 7,  estimatedHours: 12, sortOrder: 10 },
    { name: 'Coordinate Geometry',         slug: 'coordinate-geometry',      difficulty: 'medium', weightage: 10, estimatedHours: 14, sortOrder: 11 },
    { name: 'Trigonometry',                slug: 'trigonometry',             difficulty: 'medium', weightage: 7,  estimatedHours: 10, sortOrder: 12 },
    { name: 'Probability & Statistics',    slug: 'probability-statistics',   difficulty: 'medium', weightage: 8,  estimatedHours: 10, sortOrder: 13 },
    { name: 'Vectors & 3D Geometry',       slug: 'vectors-3d-geometry',      difficulty: 'hard',   weightage: 6,  estimatedHours: 12, sortOrder: 14 },
  ],

  // ─── NEET UG — Physics ─────────────────────────────────────────────────────────
  'neet-ug/physics': [
    { name: 'Physical World & Measurement', slug: 'measurement',            difficulty: 'easy',   weightage: 4,  estimatedHours: 4,  sortOrder: 1 },
    { name: 'Kinematics',                  slug: 'kinematics',               difficulty: 'medium', weightage: 8,  estimatedHours: 10, sortOrder: 2 },
    { name: 'Laws of Motion',              slug: 'laws-of-motion',           difficulty: 'medium', weightage: 8,  estimatedHours: 10, sortOrder: 3 },
    { name: 'Work, Energy & Power',        slug: 'work-energy-power',        difficulty: 'medium', weightage: 7,  estimatedHours: 8,  sortOrder: 4 },
    { name: 'Gravitation',                 slug: 'gravitation',              difficulty: 'medium', weightage: 5,  estimatedHours: 6,  sortOrder: 5 },
    { name: 'Properties of Matter',        slug: 'properties-of-matter',     difficulty: 'medium', weightage: 6,  estimatedHours: 8,  sortOrder: 6 },
    { name: 'Thermodynamics',              slug: 'thermodynamics',           difficulty: 'hard',   weightage: 8,  estimatedHours: 12, sortOrder: 7 },
    { name: 'Oscillations & Waves',        slug: 'oscillations-waves',       difficulty: 'hard',   weightage: 6,  estimatedHours: 10, sortOrder: 8 },
    { name: 'Electrostatics',              slug: 'electrostatics',           difficulty: 'hard',   weightage: 10, estimatedHours: 14, sortOrder: 9 },
    { name: 'Current Electricity',         slug: 'current-electricity',      difficulty: 'medium', weightage: 9,  estimatedHours: 10, sortOrder: 10 },
    { name: 'Optics',                      slug: 'optics',                   difficulty: 'medium', weightage: 10, estimatedHours: 12, sortOrder: 11 },
    { name: 'Modern Physics',              slug: 'modern-physics',           difficulty: 'medium', weightage: 8,  estimatedHours: 8,  sortOrder: 12 },
    { name: 'Dual Nature & Atoms',         slug: 'dual-nature-atoms',        difficulty: 'medium', weightage: 6,  estimatedHours: 6,  sortOrder: 13 },
    { name: 'Semiconductor Devices',       slug: 'semiconductor-devices',    difficulty: 'easy',   weightage: 5,  estimatedHours: 4,  sortOrder: 14 },
  ],

  // ─── NEET UG — Chemistry ───────────────────────────────────────────────────────
  'neet-ug/chemistry': [
    { name: 'Some Basic Concepts',         slug: 'basic-concepts',           difficulty: 'easy',   weightage: 5,  estimatedHours: 6,  sortOrder: 1 },
    { name: 'Atomic Structure',            slug: 'atomic-structure',         difficulty: 'medium', weightage: 7,  estimatedHours: 8,  sortOrder: 2 },
    { name: 'Chemical Bonding',            slug: 'chemical-bonding',         difficulty: 'hard',   weightage: 9,  estimatedHours: 12, sortOrder: 3 },
    { name: 'Chemical Equilibrium',        slug: 'chemical-equilibrium',     difficulty: 'hard',   weightage: 8,  estimatedHours: 10, sortOrder: 4 },
    { name: 'Organic Chemistry',           slug: 'organic-chemistry',        difficulty: 'hard',   weightage: 12, estimatedHours: 18, sortOrder: 5 },
    { name: 'Coordination Chemistry',      slug: 'coordination-chemistry',   difficulty: 'hard',   weightage: 7,  estimatedHours: 10, sortOrder: 6 },
    { name: 'Biomolecules',                slug: 'biomolecules',             difficulty: 'easy',   weightage: 6,  estimatedHours: 6,  sortOrder: 7 },
    { name: 'Chemistry in Everyday Life',  slug: 'everyday-chemistry',       difficulty: 'easy',   weightage: 4,  estimatedHours: 4,  sortOrder: 8 },
  ],

  // ─── NEET UG — Botany ──────────────────────────────────────────────────────────
  'neet-ug/botany': [
    { name: 'Cell Biology',                slug: 'cell-biology',             difficulty: 'medium', weightage: 10, estimatedHours: 12, sortOrder: 1 },
    { name: 'Plant Morphology',            slug: 'plant-morphology',         difficulty: 'easy',   weightage: 8,  estimatedHours: 8,  sortOrder: 2 },
    { name: 'Plant Anatomy',               slug: 'plant-anatomy',            difficulty: 'medium', weightage: 8,  estimatedHours: 8,  sortOrder: 3 },
    { name: 'Plant Physiology',            slug: 'plant-physiology',         difficulty: 'hard',   weightage: 12, estimatedHours: 16, sortOrder: 4 },
    { name: 'Genetics & Evolution',        slug: 'genetics-evolution',       difficulty: 'hard',   weightage: 14, estimatedHours: 18, sortOrder: 5 },
    { name: 'Ecology & Environment',       slug: 'ecology-environment',      difficulty: 'medium', weightage: 10, estimatedHours: 10, sortOrder: 6 },
    { name: 'Plant Kingdom',               slug: 'plant-kingdom',            difficulty: 'easy',   weightage: 8,  estimatedHours: 8,  sortOrder: 7 },
    { name: 'Biotechnology',               slug: 'biotechnology',            difficulty: 'medium', weightage: 8,  estimatedHours: 10, sortOrder: 8 },
  ],

  // ─── NEET UG — Zoology ─────────────────────────────────────────────────────────
  'neet-ug/zoology': [
    { name: 'Animal Kingdom',              slug: 'animal-kingdom',           difficulty: 'easy',   weightage: 8,  estimatedHours: 8,  sortOrder: 1 },
    { name: 'Structural Organisation',     slug: 'structural-organisation',  difficulty: 'medium', weightage: 8,  estimatedHours: 10, sortOrder: 2 },
    { name: 'Human Physiology',            slug: 'human-physiology',         difficulty: 'hard',   weightage: 18, estimatedHours: 22, sortOrder: 3 },
    { name: 'Human Reproduction',          slug: 'human-reproduction',       difficulty: 'medium', weightage: 10, estimatedHours: 10, sortOrder: 4 },
    { name: 'Reproductive Health',         slug: 'reproductive-health',      difficulty: 'easy',   weightage: 5,  estimatedHours: 4,  sortOrder: 5 },
    { name: 'Genetics',                    slug: 'genetics',                 difficulty: 'hard',   weightage: 14, estimatedHours: 16, sortOrder: 6 },
    { name: 'Evolution',                   slug: 'evolution',                difficulty: 'medium', weightage: 6,  estimatedHours: 6,  sortOrder: 7 },
    { name: 'Human Health & Disease',      slug: 'human-health-disease',     difficulty: 'medium', weightage: 8,  estimatedHours: 8,  sortOrder: 8 },
  ],

  // ─── CBSE Class 12 — Physics ───────────────────────────────────────────────────
  'cbse-class-12/physics': [
    { name: 'Electric Charges & Fields',   slug: 'electric-charges-fields',  difficulty: 'hard',   weightage: 10, estimatedHours: 12, sortOrder: 1 },
    { name: 'Electrostatic Potential',     slug: 'electrostatic-potential',  difficulty: 'hard',   weightage: 8,  estimatedHours: 10, sortOrder: 2 },
    { name: 'Current Electricity',         slug: 'current-electricity',      difficulty: 'medium', weightage: 10, estimatedHours: 10, sortOrder: 3 },
    { name: 'Moving Charges & Magnetism',  slug: 'moving-charges-magnetism', difficulty: 'hard',   weightage: 8,  estimatedHours: 12, sortOrder: 4 },
    { name: 'EMI & AC',                    slug: 'emi-ac',                   difficulty: 'hard',   weightage: 8,  estimatedHours: 10, sortOrder: 5 },
    { name: 'EM Waves',                    slug: 'em-waves',                 difficulty: 'easy',   weightage: 4,  estimatedHours: 4,  sortOrder: 6 },
    { name: 'Ray Optics',                  slug: 'ray-optics',               difficulty: 'medium', weightage: 10, estimatedHours: 12, sortOrder: 7 },
    { name: 'Wave Optics',                 slug: 'wave-optics',              difficulty: 'hard',   weightage: 8,  estimatedHours: 10, sortOrder: 8 },
    { name: 'Dual Nature of Radiation',    slug: 'dual-nature',              difficulty: 'medium', weightage: 6,  estimatedHours: 6,  sortOrder: 9 },
    { name: 'Atoms',                       slug: 'atoms',                    difficulty: 'medium', weightage: 5,  estimatedHours: 6,  sortOrder: 10 },
    { name: 'Nuclei',                      slug: 'nuclei',                   difficulty: 'medium', weightage: 5,  estimatedHours: 6,  sortOrder: 11 },
    { name: 'Semiconductor Electronics',   slug: 'semiconductor-electronics', difficulty: 'easy',  weightage: 8,  estimatedHours: 8,  sortOrder: 12 },
  ],

  // ─── CBSE Class 12 — Chemistry ─────────────────────────────────────────────────
  'cbse-class-12/chemistry': [
    { name: 'Solid State',                 slug: 'solid-state',              difficulty: 'medium', weightage: 7,  estimatedHours: 8,  sortOrder: 1 },
    { name: 'Solutions',                   slug: 'solutions',                difficulty: 'medium', weightage: 7,  estimatedHours: 8,  sortOrder: 2 },
    { name: 'Electrochemistry',            slug: 'electrochemistry',         difficulty: 'hard',   weightage: 8,  estimatedHours: 10, sortOrder: 3 },
    { name: 'Chemical Kinetics',           slug: 'chemical-kinetics',        difficulty: 'hard',   weightage: 8,  estimatedHours: 10, sortOrder: 4 },
    { name: 'Surface Chemistry',           slug: 'surface-chemistry',        difficulty: 'easy',   weightage: 5,  estimatedHours: 4,  sortOrder: 5 },
    { name: 'p-Block Elements',            slug: 'p-block-elements',         difficulty: 'medium', weightage: 9,  estimatedHours: 12, sortOrder: 6 },
    { name: 'd & f Block Elements',        slug: 'd-f-block-elements',       difficulty: 'medium', weightage: 8,  estimatedHours: 10, sortOrder: 7 },
    { name: 'Coordination Compounds',      slug: 'coordination-compounds',   difficulty: 'hard',   weightage: 8,  estimatedHours: 10, sortOrder: 8 },
    { name: 'Haloalkanes',                 slug: 'haloalkanes',              difficulty: 'medium', weightage: 7,  estimatedHours: 8,  sortOrder: 9 },
    { name: 'Alcohols & Phenols',          slug: 'alcohols-phenols',         difficulty: 'medium', weightage: 7,  estimatedHours: 8,  sortOrder: 10 },
    { name: 'Aldehydes & Ketones',         slug: 'aldehydes-ketones',        difficulty: 'hard',   weightage: 8,  estimatedHours: 10, sortOrder: 11 },
    { name: 'Amines',                      slug: 'amines',                   difficulty: 'medium', weightage: 6,  estimatedHours: 6,  sortOrder: 12 },
    { name: 'Biomolecules',                slug: 'biomolecules',             difficulty: 'easy',   weightage: 5,  estimatedHours: 4,  sortOrder: 13 },
    { name: 'Polymers',                    slug: 'polymers',                 difficulty: 'easy',   weightage: 4,  estimatedHours: 4,  sortOrder: 14 },
    { name: 'Chemistry in Everyday Life',  slug: 'everyday-chemistry',       difficulty: 'easy',   weightage: 3,  estimatedHours: 3,  sortOrder: 15 },
  ],

  // ─── CBSE Class 12 — Mathematics ───────────────────────────────────────────────
  'cbse-class-12/mathematics': [
    { name: 'Relations & Functions',       slug: 'relations-functions',      difficulty: 'medium', weightage: 8,  estimatedHours: 10, sortOrder: 1 },
    { name: 'Inverse Trigonometric Fns',   slug: 'inverse-trig',             difficulty: 'medium', weightage: 5,  estimatedHours: 6,  sortOrder: 2 },
    { name: 'Matrices',                    slug: 'matrices',                 difficulty: 'medium', weightage: 7,  estimatedHours: 8,  sortOrder: 3 },
    { name: 'Determinants',                slug: 'determinants',             difficulty: 'medium', weightage: 7,  estimatedHours: 8,  sortOrder: 4 },
    { name: 'Continuity & Differentiability', slug: 'continuity-diff',      difficulty: 'hard',   weightage: 10, estimatedHours: 14, sortOrder: 5 },
    { name: 'Application of Derivatives',  slug: 'application-derivatives',  difficulty: 'hard',   weightage: 8,  estimatedHours: 12, sortOrder: 6 },
    { name: 'Integrals',                   slug: 'integrals',                difficulty: 'hard',   weightage: 12, estimatedHours: 16, sortOrder: 7 },
    { name: 'Application of Integrals',    slug: 'application-integrals',    difficulty: 'hard',   weightage: 6,  estimatedHours: 8,  sortOrder: 8 },
    { name: 'Differential Equations',      slug: 'differential-equations',   difficulty: 'hard',   weightage: 7,  estimatedHours: 10, sortOrder: 9 },
    { name: 'Vectors',                     slug: 'vectors',                  difficulty: 'medium', weightage: 6,  estimatedHours: 8,  sortOrder: 10 },
    { name: 'Three Dimensional Geometry',  slug: '3d-geometry',              difficulty: 'hard',   weightage: 8,  estimatedHours: 10, sortOrder: 11 },
    { name: 'Linear Programming',          slug: 'linear-programming',       difficulty: 'easy',   weightage: 5,  estimatedHours: 6,  sortOrder: 12 },
    { name: 'Probability',                 slug: 'probability',              difficulty: 'medium', weightage: 8,  estimatedHours: 10, sortOrder: 13 },
  ],
};

module.exports = CHAPTER_SEEDS;
