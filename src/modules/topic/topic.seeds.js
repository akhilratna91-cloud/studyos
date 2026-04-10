/**
 * StudyOS - Topic Seed Data
 *
 * Predefined topics keyed by "examSlug/subjectSlug/chapterSlug".
 * During seeding, slugs are resolved to ObjectIds.
 */

const TOPIC_SEEDS = {
  // ═══════════════════════════════════════════════════════════════════════════════
  // JEE MAIN — PHYSICS
  // ═══════════════════════════════════════════════════════════════════════════════

  'jee-main/physics/kinematics': [
    { name: 'Distance & Displacement',        slug: 'distance-displacement',      difficulty: 'easy',   weightage: 15, estimatedMinutes: 30, sortOrder: 1 },
    { name: 'Speed & Velocity',               slug: 'speed-velocity',             difficulty: 'easy',   weightage: 15, estimatedMinutes: 30, sortOrder: 2 },
    { name: 'Equations of Motion',            slug: 'equations-of-motion',        difficulty: 'medium', weightage: 20, estimatedMinutes: 45, sortOrder: 3 },
    { name: 'Projectile Motion',              slug: 'projectile-motion',          difficulty: 'hard',   weightage: 25, estimatedMinutes: 60, sortOrder: 4 },
    { name: 'Relative Motion',               slug: 'relative-motion',            difficulty: 'hard',   weightage: 25, estimatedMinutes: 60, sortOrder: 5, prerequisites: ['equations-of-motion'] },
  ],

  'jee-main/physics/laws-of-motion': [
    { name: "Newton's First Law",             slug: 'newtons-first-law',          difficulty: 'easy',   weightage: 12, estimatedMinutes: 20, sortOrder: 1 },
    { name: "Newton's Second Law (F=ma)",     slug: 'newtons-second-law',         difficulty: 'medium', weightage: 20, estimatedMinutes: 40, sortOrder: 2 },
    { name: "Newton's Third Law",             slug: 'newtons-third-law',          difficulty: 'easy',   weightage: 12, estimatedMinutes: 20, sortOrder: 3 },
    { name: 'Free Body Diagrams',             slug: 'free-body-diagrams',         difficulty: 'medium', weightage: 18, estimatedMinutes: 45, sortOrder: 4 },
    { name: 'Friction',                       slug: 'friction',                   difficulty: 'medium', weightage: 18, estimatedMinutes: 45, sortOrder: 5 },
    { name: 'Circular Motion Forces',         slug: 'circular-motion-forces',     difficulty: 'hard',   weightage: 20, estimatedMinutes: 60, sortOrder: 6, prerequisites: ['newtons-second-law', 'free-body-diagrams'] },
  ],

  'jee-main/physics/electrostatics': [
    { name: "Coulomb's Law",                  slug: 'coulombs-law',               difficulty: 'medium', weightage: 15, estimatedMinutes: 35, sortOrder: 1 },
    { name: 'Electric Field',                 slug: 'electric-field',             difficulty: 'medium', weightage: 18, estimatedMinutes: 45, sortOrder: 2 },
    { name: 'Electric Potential',             slug: 'electric-potential',          difficulty: 'hard',   weightage: 20, estimatedMinutes: 50, sortOrder: 3, prerequisites: ['electric-field'] },
    { name: "Gauss's Law",                    slug: 'gauss-law',                  difficulty: 'hard',   weightage: 22, estimatedMinutes: 60, sortOrder: 4 },
    { name: 'Capacitors',                     slug: 'capacitors',                 difficulty: 'hard',   weightage: 25, estimatedMinutes: 60, sortOrder: 5, prerequisites: ['electric-potential'] },
  ],

  // ═══════════════════════════════════════════════════════════════════════════════
  // JEE MAIN — CHEMISTRY
  // ═══════════════════════════════════════════════════════════════════════════════

  'jee-main/chemistry/atomic-structure': [
    { name: "Bohr's Model",                   slug: 'bohrs-model',               difficulty: 'medium', weightage: 20, estimatedMinutes: 35, sortOrder: 1 },
    { name: 'Quantum Numbers',                slug: 'quantum-numbers',            difficulty: 'medium', weightage: 25, estimatedMinutes: 40, sortOrder: 2 },
    { name: 'Electronic Configuration',       slug: 'electronic-configuration',   difficulty: 'easy',   weightage: 20, estimatedMinutes: 25, sortOrder: 3 },
    { name: 'Photoelectric Effect',           slug: 'photoelectric-effect',       difficulty: 'hard',   weightage: 35, estimatedMinutes: 50, sortOrder: 4 },
  ],

  'jee-main/chemistry/chemical-bonding': [
    { name: 'Ionic Bonding',                  slug: 'ionic-bonding',              difficulty: 'easy',   weightage: 12, estimatedMinutes: 25, sortOrder: 1 },
    { name: 'Covalent Bonding',               slug: 'covalent-bonding',           difficulty: 'medium', weightage: 15, estimatedMinutes: 35, sortOrder: 2 },
    { name: 'VSEPR Theory',                   slug: 'vsepr-theory',               difficulty: 'medium', weightage: 18, estimatedMinutes: 40, sortOrder: 3 },
    { name: 'Hybridization',                  slug: 'hybridization',              difficulty: 'hard',   weightage: 25, estimatedMinutes: 55, sortOrder: 4, prerequisites: ['covalent-bonding'] },
    { name: 'Molecular Orbital Theory',       slug: 'molecular-orbital-theory',   difficulty: 'hard',   weightage: 30, estimatedMinutes: 60, sortOrder: 5, prerequisites: ['hybridization'] },
  ],

  // ═══════════════════════════════════════════════════════════════════════════════
  // JEE MAIN — MATHEMATICS
  // ═══════════════════════════════════════════════════════════════════════════════

  'jee-main/mathematics/limits-continuity': [
    { name: 'Concept of Limits',              slug: 'concept-of-limits',           difficulty: 'medium', weightage: 15, estimatedMinutes: 35, sortOrder: 1 },
    { name: "L'Hôpital's Rule",               slug: 'lhopitals-rule',             difficulty: 'hard',   weightage: 20, estimatedMinutes: 45, sortOrder: 2, prerequisites: ['concept-of-limits'] },
    { name: 'Continuity',                     slug: 'continuity',                  difficulty: 'medium', weightage: 20, estimatedMinutes: 40, sortOrder: 3 },
    { name: 'Differentiability',              slug: 'differentiability',           difficulty: 'hard',   weightage: 25, estimatedMinutes: 50, sortOrder: 4, prerequisites: ['continuity'] },
    { name: 'Standard Limits',                slug: 'standard-limits',             difficulty: 'medium', weightage: 20, estimatedMinutes: 35, sortOrder: 5 },
  ],

  'jee-main/mathematics/integrals': [
    { name: 'Indefinite Integrals',           slug: 'indefinite-integrals',        difficulty: 'medium', weightage: 20, estimatedMinutes: 45, sortOrder: 1 },
    { name: 'Integration by Substitution',    slug: 'integration-substitution',    difficulty: 'medium', weightage: 20, estimatedMinutes: 45, sortOrder: 2 },
    { name: 'Integration by Parts',           slug: 'integration-by-parts',        difficulty: 'hard',   weightage: 20, estimatedMinutes: 50, sortOrder: 3, prerequisites: ['indefinite-integrals'] },
    { name: 'Partial Fractions',              slug: 'partial-fractions',           difficulty: 'hard',   weightage: 15, estimatedMinutes: 45, sortOrder: 4 },
    { name: 'Definite Integrals',             slug: 'definite-integrals',          difficulty: 'hard',   weightage: 25, estimatedMinutes: 60, sortOrder: 5, prerequisites: ['indefinite-integrals'] },
  ],

  // ═══════════════════════════════════════════════════════════════════════════════
  // NEET UG — PHYSICS
  // ═══════════════════════════════════════════════════════════════════════════════

  'neet-ug/physics/kinematics': [
    { name: 'Scalar & Vector Quantities',     slug: 'scalar-vector',               difficulty: 'easy',   weightage: 15, estimatedMinutes: 20, sortOrder: 1 },
    { name: 'Motion in a Straight Line',      slug: 'motion-straight-line',        difficulty: 'medium', weightage: 25, estimatedMinutes: 40, sortOrder: 2 },
    { name: 'Motion in a Plane',              slug: 'motion-in-plane',             difficulty: 'hard',   weightage: 30, estimatedMinutes: 50, sortOrder: 3, prerequisites: ['motion-straight-line'] },
    { name: 'Projectile Motion',              slug: 'projectile-motion',           difficulty: 'hard',   weightage: 30, estimatedMinutes: 55, sortOrder: 4, prerequisites: ['motion-in-plane'] },
  ],

  'neet-ug/physics/electrostatics': [
    { name: 'Electric Charges',               slug: 'electric-charges',            difficulty: 'easy',   weightage: 12, estimatedMinutes: 20, sortOrder: 1 },
    { name: "Coulomb's Law",                  slug: 'coulombs-law',               difficulty: 'medium', weightage: 18, estimatedMinutes: 35, sortOrder: 2 },
    { name: 'Electric Field Lines',           slug: 'electric-field-lines',        difficulty: 'medium', weightage: 18, estimatedMinutes: 35, sortOrder: 3 },
    { name: 'Electric Dipole',                slug: 'electric-dipole',             difficulty: 'hard',   weightage: 22, estimatedMinutes: 50, sortOrder: 4 },
    { name: "Gauss's Theorem",               slug: 'gauss-theorem',              difficulty: 'hard',   weightage: 30, estimatedMinutes: 60, sortOrder: 5, prerequisites: ['electric-field-lines'] },
  ],

  // ═══════════════════════════════════════════════════════════════════════════════
  // NEET UG — BOTANY
  // ═══════════════════════════════════════════════════════════════════════════════

  'neet-ug/botany/cell-biology': [
    { name: 'Cell Structure',                 slug: 'cell-structure',              difficulty: 'easy',   weightage: 15, estimatedMinutes: 25, sortOrder: 1 },
    { name: 'Cell Organelles',                slug: 'cell-organelles',             difficulty: 'medium', weightage: 20, estimatedMinutes: 40, sortOrder: 2 },
    { name: 'Cell Division — Mitosis',        slug: 'mitosis',                     difficulty: 'medium', weightage: 20, estimatedMinutes: 35, sortOrder: 3 },
    { name: 'Cell Division — Meiosis',        slug: 'meiosis',                     difficulty: 'hard',   weightage: 25, estimatedMinutes: 45, sortOrder: 4, prerequisites: ['mitosis'] },
    { name: 'Cell Cycle Regulation',          slug: 'cell-cycle-regulation',       difficulty: 'hard',   weightage: 20, estimatedMinutes: 40, sortOrder: 5 },
  ],

  'neet-ug/botany/genetics-evolution': [
    { name: "Mendel's Laws",                  slug: 'mendels-laws',               difficulty: 'medium', weightage: 18, estimatedMinutes: 40, sortOrder: 1 },
    { name: 'Chromosomal Theory',             slug: 'chromosomal-theory',          difficulty: 'medium', weightage: 15, estimatedMinutes: 35, sortOrder: 2 },
    { name: 'DNA Structure & Replication',    slug: 'dna-structure-replication',   difficulty: 'hard',   weightage: 22, estimatedMinutes: 50, sortOrder: 3 },
    { name: 'Gene Expression',               slug: 'gene-expression',             difficulty: 'hard',   weightage: 25, estimatedMinutes: 55, sortOrder: 4, prerequisites: ['dna-structure-replication'] },
    { name: 'Evolution — Natural Selection',  slug: 'natural-selection',           difficulty: 'medium', weightage: 20, estimatedMinutes: 35, sortOrder: 5 },
  ],

  // ═══════════════════════════════════════════════════════════════════════════════
  // NEET UG — ZOOLOGY
  // ═══════════════════════════════════════════════════════════════════════════════

  'neet-ug/zoology/human-physiology': [
    { name: 'Digestive System',               slug: 'digestive-system',            difficulty: 'medium', weightage: 14, estimatedMinutes: 40, sortOrder: 1 },
    { name: 'Respiratory System',             slug: 'respiratory-system',          difficulty: 'medium', weightage: 14, estimatedMinutes: 40, sortOrder: 2 },
    { name: 'Circulatory System',             slug: 'circulatory-system',          difficulty: 'hard',   weightage: 18, estimatedMinutes: 55, sortOrder: 3 },
    { name: 'Excretory System',               slug: 'excretory-system',            difficulty: 'medium', weightage: 14, estimatedMinutes: 40, sortOrder: 4 },
    { name: 'Nervous System',                 slug: 'nervous-system',              difficulty: 'hard',   weightage: 20, estimatedMinutes: 60, sortOrder: 5 },
    { name: 'Endocrine System',               slug: 'endocrine-system',            difficulty: 'hard',   weightage: 20, estimatedMinutes: 55, sortOrder: 6 },
  ],

  // ═══════════════════════════════════════════════════════════════════════════════
  // CBSE 12 — PHYSICS
  // ═══════════════════════════════════════════════════════════════════════════════

  'cbse-class-12/physics/electric-charges-fields': [
    { name: 'Electric Charge Properties',     slug: 'charge-properties',           difficulty: 'easy',   weightage: 15, estimatedMinutes: 20, sortOrder: 1 },
    { name: "Coulomb's Law",                  slug: 'coulombs-law',               difficulty: 'medium', weightage: 20, estimatedMinutes: 35, sortOrder: 2 },
    { name: 'Electric Field',                 slug: 'electric-field',              difficulty: 'medium', weightage: 20, estimatedMinutes: 40, sortOrder: 3 },
    { name: 'Electric Dipole',                slug: 'electric-dipole',             difficulty: 'hard',   weightage: 20, estimatedMinutes: 45, sortOrder: 4 },
    { name: "Gauss's Law",                    slug: 'gauss-law',                  difficulty: 'hard',   weightage: 25, estimatedMinutes: 55, sortOrder: 5, prerequisites: ['electric-field'] },
  ],

  'cbse-class-12/physics/current-electricity': [
    { name: "Ohm's Law",                      slug: 'ohms-law',                   difficulty: 'easy',   weightage: 15, estimatedMinutes: 20, sortOrder: 1 },
    { name: 'Resistors in Series & Parallel', slug: 'resistors-series-parallel',   difficulty: 'medium', weightage: 20, estimatedMinutes: 35, sortOrder: 2 },
    { name: "Kirchhoff's Laws",               slug: 'kirchhoffs-laws',            difficulty: 'hard',   weightage: 25, estimatedMinutes: 50, sortOrder: 3, prerequisites: ['ohms-law'] },
    { name: 'Wheatstone Bridge',              slug: 'wheatstone-bridge',           difficulty: 'hard',   weightage: 20, estimatedMinutes: 45, sortOrder: 4, prerequisites: ['kirchhoffs-laws'] },
    { name: 'Potentiometer',                  slug: 'potentiometer',               difficulty: 'hard',   weightage: 20, estimatedMinutes: 40, sortOrder: 5 },
  ],

  // ═══════════════════════════════════════════════════════════════════════════════
  // CBSE 12 — MATHEMATICS
  // ═══════════════════════════════════════════════════════════════════════════════

  'cbse-class-12/mathematics/integrals': [
    { name: 'Indefinite Integrals',           slug: 'indefinite-integrals',        difficulty: 'medium', weightage: 18, estimatedMinutes: 40, sortOrder: 1 },
    { name: 'Methods of Integration',         slug: 'methods-of-integration',      difficulty: 'hard',   weightage: 22, estimatedMinutes: 55, sortOrder: 2, prerequisites: ['indefinite-integrals'] },
    { name: 'Definite Integrals',             slug: 'definite-integrals',          difficulty: 'hard',   weightage: 22, estimatedMinutes: 50, sortOrder: 3 },
    { name: 'Area Under Curves',              slug: 'area-under-curves',           difficulty: 'hard',   weightage: 20, estimatedMinutes: 50, sortOrder: 4, prerequisites: ['definite-integrals'] },
    { name: 'Properties of Definite Integrals', slug: 'properties-definite',       difficulty: 'medium', weightage: 18, estimatedMinutes: 35, sortOrder: 5 },
  ],

  'cbse-class-12/mathematics/probability': [
    { name: 'Conditional Probability',        slug: 'conditional-probability',     difficulty: 'medium', weightage: 20, estimatedMinutes: 35, sortOrder: 1 },
    { name: "Bayes' Theorem",                 slug: 'bayes-theorem',              difficulty: 'hard',   weightage: 25, estimatedMinutes: 50, sortOrder: 2, prerequisites: ['conditional-probability'] },
    { name: 'Random Variables',               slug: 'random-variables',            difficulty: 'medium', weightage: 20, estimatedMinutes: 35, sortOrder: 3 },
    { name: 'Binomial Distribution',          slug: 'binomial-distribution',       difficulty: 'hard',   weightage: 20, estimatedMinutes: 45, sortOrder: 4, prerequisites: ['random-variables'] },
    { name: 'Mean & Variance',                slug: 'mean-variance',              difficulty: 'medium', weightage: 15, estimatedMinutes: 30, sortOrder: 5 },
  ],
};

module.exports = TOPIC_SEEDS;
