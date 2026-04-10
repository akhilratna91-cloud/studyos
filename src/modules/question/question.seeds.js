/**
 * StudyOS - Question Seed Data
 *
 * Curated sample question bank used to make quiz, PYQ, and practice flows
 * work out of the box on a fresh install.
 */

const QUESTION_SEEDS = [
  // JEE Main - Physics
  {
    examSlug: "jee-main",
    subjectSlug: "physics",
    chapterSlug: "kinematics",
    topicSlug: "equations-of-motion",
    difficulty: "easy",
    question:
      "A body starts from rest and moves with uniform acceleration of 2 m/s^2. How much distance does it cover in 3 seconds?",
    options: ["3 m", "6 m", "9 m", "12 m"],
    correctAnswer: 2,
    explanation:
      "Use s = ut + 1/2 at^2. Here u = 0, a = 2, t = 3, so s = 9 m.",
    hint: "Apply the second equation of motion.",
    tags: ["pyq", "jee-main-2024", "kinematics", "numerical"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "physics",
    chapterSlug: "kinematics",
    topicSlug: "projectile-motion",
    difficulty: "medium",
    question:
      "For a projectile launched with speed u at angle theta, the horizontal range on level ground is maximum when theta is:",
    options: ["30 degrees", "45 degrees", "60 degrees", "90 degrees"],
    correctAnswer: 1,
    explanation:
      "Range R = u^2 sin(2 theta) / g. It is maximum when sin(2 theta) = 1, so theta = 45 degrees.",
    hint: "Think about when sin(2 theta) reaches its peak value.",
    tags: ["concept", "projectile-motion", "jee-main-2023"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "physics",
    chapterSlug: "laws-of-motion",
    topicSlug: "free-body-diagrams",
    difficulty: "medium",
    question:
      "A 5 kg block is pulled on a frictionless horizontal surface with a force of 20 N. What is its acceleration?",
    options: ["2 m/s^2", "4 m/s^2", "5 m/s^2", "10 m/s^2"],
    correctAnswer: 1,
    explanation:
      "Using Newton's second law, a = F / m = 20 / 5 = 4 m/s^2.",
    hint: "Use F = ma.",
    tags: ["laws-of-motion", "newtons-second-law", "pyq", "jee-main-2022"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "physics",
    chapterSlug: "laws-of-motion",
    topicSlug: "friction",
    difficulty: "hard",
    question:
      "If the coefficient of friction between two surfaces is 0.4 and the normal reaction is 50 N, the limiting friction is:",
    options: ["10 N", "15 N", "20 N", "25 N"],
    correctAnswer: 2,
    explanation:
      "Limiting friction = mu N = 0.4 x 50 = 20 N.",
    hint: "Multiply coefficient of friction by the normal reaction.",
    tags: ["friction", "numerical", "jee-main-2021"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "physics",
    chapterSlug: "electrostatics",
    topicSlug: "coulombs-law",
    difficulty: "medium",
    question:
      "Two equal point charges are separated by a distance r. If the distance is halved, the electrostatic force becomes:",
    options: ["Half", "Double", "Four times", "Eight times"],
    correctAnswer: 2,
    explanation:
      "By Coulomb's law, F is proportional to 1 / r^2. Halving r makes the force four times.",
    hint: "Force varies inversely as the square of distance.",
    tags: ["pyq", "jee-main-2024", "electrostatics", "coulombs-law"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "physics",
    chapterSlug: "electrostatics",
    topicSlug: "electric-potential",
    difficulty: "hard",
    question:
      "At a point where the electric potential is constant throughout a region, the electric field in that region is:",
    options: ["Maximum", "Non-zero and constant", "Zero", "Infinity"],
    correctAnswer: 2,
    explanation:
      "Electric field is the negative gradient of potential. If potential is constant, its gradient is zero.",
    hint: "Electric field depends on how potential changes with position.",
    tags: ["concept", "electric-potential", "jee-main-2023"],
  },

  // JEE Main - Chemistry
  {
    examSlug: "jee-main",
    subjectSlug: "chemistry",
    chapterSlug: "atomic-structure",
    topicSlug: "bohrs-model",
    difficulty: "easy",
    question:
      "According to Bohr's model, the angular momentum of an electron in an allowed orbit is:",
    options: ["mvr", "nh/2pi", "2nh", "sqrt(n) h"],
    correctAnswer: 1,
    explanation:
      "Bohr quantized angular momentum as mvr = nh / 2pi.",
    hint: "Recall Bohr's quantization condition.",
    tags: ["bohrs-model", "pyq", "jee-main-2022", "atomic-structure"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "chemistry",
    chapterSlug: "atomic-structure",
    topicSlug: "quantum-numbers",
    difficulty: "medium",
    question: "Which quantum number determines the shape of an orbital?",
    options: [
      "Principal quantum number",
      "Azimuthal quantum number",
      "Magnetic quantum number",
      "Spin quantum number",
    ],
    correctAnswer: 1,
    explanation:
      "The azimuthal quantum number l determines the subshell and the shape of the orbital.",
    hint: "Think about which quantum number labels s, p, d, and f orbitals.",
    tags: ["quantum-numbers", "chemistry", "jee-main-2024"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "chemistry",
    chapterSlug: "chemical-bonding",
    topicSlug: "ionic-bonding",
    difficulty: "easy",
    question: "An ionic bond is primarily formed because of:",
    options: [
      "Sharing of electron pairs",
      "Transfer of electrons and electrostatic attraction",
      "Overlap of half-filled orbitals only",
      "Delocalization of electrons",
    ],
    correctAnswer: 1,
    explanation:
      "Ionic bonding arises due to electron transfer followed by electrostatic attraction between oppositely charged ions.",
    hint: "Look for electron transfer rather than sharing.",
    tags: ["chemical-bonding", "ionic-bonding", "jee-main-2023"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "chemistry",
    chapterSlug: "chemical-bonding",
    topicSlug: "hybridization",
    difficulty: "hard",
    question: "The hybridization of carbon in methane is:",
    options: ["sp", "sp2", "sp3", "dsp2"],
    correctAnswer: 2,
    explanation:
      "Carbon forms four equivalent sigma bonds in methane using sp3 hybrid orbitals.",
    hint: "Methane has four equivalent C-H bonds.",
    tags: ["hybridization", "pyq", "jee-main-2021", "organic-basics"],
  },

  // JEE Main - Mathematics
  {
    examSlug: "jee-main",
    subjectSlug: "mathematics",
    chapterSlug: "limits-continuity",
    topicSlug: "concept-of-limits",
    difficulty: "medium",
    question: "The value of lim x->0 (sin x)/x is:",
    options: ["0", "1", "Does not exist", "Infinity"],
    correctAnswer: 1,
    explanation: "This is the standard trigonometric limit equal to 1.",
    hint: "Use the most basic standard limit from calculus.",
    tags: ["limits", "standard-limit", "pyq", "jee-main-2024"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "mathematics",
    chapterSlug: "limits-continuity",
    topicSlug: "continuity",
    difficulty: "hard",
    question: "A function is continuous at x = a if:",
    options: [
      "f(a) = 0",
      "Left-hand and right-hand limits exist but may differ",
      "lim x->a f(x) exists and equals f(a)",
      "Derivative exists at a",
    ],
    correctAnswer: 2,
    explanation:
      "Continuity requires the limit to exist and be equal to the value of the function at that point.",
    hint: "Continuity connects the value at the point with the approaching value.",
    tags: ["continuity", "concept", "jee-main-2023"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "mathematics",
    chapterSlug: "integrals",
    topicSlug: "indefinite-integrals",
    difficulty: "easy",
    question: "Integral of x^2 with respect to x is:",
    options: ["x^3/3 + C", "2x + C", "x^2/2 + C", "3x^2 + C"],
    correctAnswer: 0,
    explanation:
      "Apply the power rule for integration: integral x^n dx = x^(n+1)/(n+1) + C.",
    hint: "Increase the power by one and divide by the new power.",
    tags: ["integrals", "indefinite-integrals", "jee-main-2022"],
  },
  {
    examSlug: "jee-main",
    subjectSlug: "mathematics",
    chapterSlug: "integrals",
    topicSlug: "definite-integrals",
    difficulty: "medium",
    question: "Integral from 0 to 1 of x dx is:",
    options: ["1", "1/2", "2", "0"],
    correctAnswer: 1,
    explanation:
      "Integral x dx = x^2 / 2. Substituting limits 0 to 1 gives 1/2.",
    hint: "Find the antiderivative first, then apply the bounds.",
    tags: ["definite-integrals", "pyq", "jee-main-2024", "calculus"],
  },

  // NEET UG - Physics
  {
    examSlug: "neet-ug",
    subjectSlug: "physics",
    chapterSlug: "kinematics",
    topicSlug: "motion-straight-line",
    difficulty: "easy",
    question: "Velocity is defined as:",
    options: [
      "Rate of change of distance",
      "Rate of change of displacement",
      "Distance traveled per unit acceleration",
      "Displacement per unit force",
    ],
    correctAnswer: 1,
    explanation:
      "Velocity is the rate of change of displacement with time.",
    hint: "Look for displacement, not just distance.",
    tags: ["pyq", "neet-ug-2024", "kinematics", "theory"],
  },
  {
    examSlug: "neet-ug",
    subjectSlug: "physics",
    chapterSlug: "kinematics",
    topicSlug: "projectile-motion",
    difficulty: "medium",
    question:
      "The vertical component of the velocity of a projectile becomes zero at:",
    options: [
      "Point of projection",
      "Highest point",
      "Point of landing only",
      "Every point on the path",
    ],
    correctAnswer: 1,
    explanation:
      "At the highest point, the projectile has only horizontal velocity and zero vertical velocity.",
    hint: "Think about what happens exactly at the top of the trajectory.",
    tags: ["projectile-motion", "neet-ug-2023", "concept"],
  },
  {
    examSlug: "neet-ug",
    subjectSlug: "physics",
    chapterSlug: "electrostatics",
    topicSlug: "coulombs-law",
    difficulty: "medium",
    question: "The SI unit of electric charge is:",
    options: ["Volt", "Coulomb", "Farad", "Henry"],
    correctAnswer: 1,
    explanation:
      "Electric charge is measured in coulomb in the SI system.",
    hint: "It is named after the scientist in Coulomb's law.",
    tags: ["pyq", "neet-ug-2022", "electrostatics", "units"],
  },
  {
    examSlug: "neet-ug",
    subjectSlug: "physics",
    chapterSlug: "electrostatics",
    topicSlug: "electric-dipole",
    difficulty: "hard",
    question:
      "The dipole moment of a dipole having charges +q and -q separated by distance d is:",
    options: ["q/d", "qd", "qd^2", "2qd"],
    correctAnswer: 1,
    explanation:
      "Dipole moment p = q multiplied by the separation distance d.",
    hint: "Dipole moment is charge times separation.",
    tags: ["electric-dipole", "neet-ug-2024", "numerical"],
  },

  // NEET UG - Botany
  {
    examSlug: "neet-ug",
    subjectSlug: "botany",
    chapterSlug: "cell-biology",
    topicSlug: "cell-organelles",
    difficulty: "easy",
    question: "Which organelle is known as the powerhouse of the cell?",
    options: ["Nucleus", "Golgi body", "Mitochondrion", "Ribosome"],
    correctAnswer: 2,
    explanation:
      "Mitochondria generate ATP through respiration, so they are called the powerhouse of the cell.",
    hint: "Think about cellular energy production.",
    tags: ["cell-biology", "pyq", "neet-ug-2024", "biology"],
  },
  {
    examSlug: "neet-ug",
    subjectSlug: "botany",
    chapterSlug: "cell-biology",
    topicSlug: "meiosis",
    difficulty: "hard",
    question: "Crossing over takes place during which phase of meiosis?",
    options: ["Prophase I", "Metaphase I", "Anaphase II", "Telophase II"],
    correctAnswer: 0,
    explanation: "Crossing over occurs in pachytene of prophase I.",
    hint: "It happens in the first meiotic division before homologues separate.",
    tags: ["meiosis", "genetics", "neet-ug-2023"],
  },
  {
    examSlug: "neet-ug",
    subjectSlug: "botany",
    chapterSlug: "genetics-evolution",
    topicSlug: "mendels-laws",
    difficulty: "medium",
    question: "Mendel's law of segregation is also called the law of:",
    options: ["Dominance", "Purity of gametes", "Independent assortment", "Variation"],
    correctAnswer: 1,
    explanation:
      "The two alleles segregate during gamete formation, so each gamete gets only one allele.",
    hint: "Think about what happens to paired factors during gamete formation.",
    tags: ["pyq", "neet-ug-2022", "mendels-laws", "genetics"],
  },
  {
    examSlug: "neet-ug",
    subjectSlug: "botany",
    chapterSlug: "genetics-evolution",
    topicSlug: "dna-structure-replication",
    difficulty: "hard",
    question:
      "According to Watson and Crick, the two strands of DNA are held together by:",
    options: [
      "Ionic bonds",
      "Hydrogen bonds",
      "Peptide bonds",
      "Phosphodiester bonds only",
    ],
    correctAnswer: 1,
    explanation:
      "Complementary nitrogenous bases are joined by hydrogen bonds in DNA.",
    hint: "Think about base pairing.",
    tags: ["dna", "neet-ug-2024", "molecular-biology"],
  },

  // NEET UG - Zoology
  {
    examSlug: "neet-ug",
    subjectSlug: "zoology",
    chapterSlug: "human-physiology",
    topicSlug: "circulatory-system",
    difficulty: "medium",
    question: "The human heart is enclosed by:",
    options: ["Pleura", "Pericardium", "Peritoneum", "Meninges"],
    correctAnswer: 1,
    explanation:
      "The heart is enclosed in a double-walled membranous sac called the pericardium.",
    hint: "It is the protective sac around the heart.",
    tags: ["human-physiology", "pyq", "neet-ug-2024", "circulation"],
  },
  {
    examSlug: "neet-ug",
    subjectSlug: "zoology",
    chapterSlug: "human-physiology",
    topicSlug: "endocrine-system",
    difficulty: "hard",
    question: "Insulin is secreted by:",
    options: [
      "Alpha cells of pancreas",
      "Beta cells of pancreas",
      "Adrenal cortex",
      "Pituitary gland",
    ],
    correctAnswer: 1,
    explanation:
      "Insulin is produced by the beta cells of the islets of Langerhans.",
    hint: "Recall the endocrine part of the pancreas.",
    tags: ["endocrine-system", "neet-ug-2023", "biology"],
  },

  // CBSE Class 12 - Physics
  {
    examSlug: "cbse-class-12",
    subjectSlug: "physics",
    chapterSlug: "electric-charges-fields",
    topicSlug: "coulombs-law",
    difficulty: "easy",
    question: "The force between two point charges is directly proportional to:",
    options: [
      "Square of the distance between them",
      "Product of their charges",
      "Sum of their charges",
      "Potential difference",
    ],
    correctAnswer: 1,
    explanation:
      "Coulomb's law states that force is proportional to q1q2 and inversely proportional to r^2.",
    hint: "Only one option matches the numerator of Coulomb's formula.",
    tags: ["pyq", "cbse-class-12-2024", "electrostatics"],
  },
  {
    examSlug: "cbse-class-12",
    subjectSlug: "physics",
    chapterSlug: "electric-charges-fields",
    topicSlug: "gauss-law",
    difficulty: "hard",
    question: "Gauss's law relates electric flux through a closed surface to:",
    options: [
      "Potential at the surface",
      "Charge enclosed by the surface",
      "Area of the surface only",
      "Current passing through the surface",
    ],
    correctAnswer: 1,
    explanation:
      "Total electric flux through a closed surface equals enclosed charge divided by epsilon-zero.",
    hint: "Gauss's law cares about what is inside the closed surface.",
    tags: ["gauss-law", "cbse-class-12-2023", "theory"],
  },
  {
    examSlug: "cbse-class-12",
    subjectSlug: "physics",
    chapterSlug: "current-electricity",
    topicSlug: "ohms-law",
    difficulty: "easy",
    question: "Ohm's law is given by:",
    options: ["P = VI", "V = IR", "I = q/t", "R = rho L"],
    correctAnswer: 1,
    explanation:
      "Ohm's law states that the potential difference across a conductor is equal to current times resistance.",
    hint: "Pick the direct relation between voltage, current, and resistance.",
    tags: ["current-electricity", "pyq", "cbse-class-12-2024"],
  },
  {
    examSlug: "cbse-class-12",
    subjectSlug: "physics",
    chapterSlug: "current-electricity",
    topicSlug: "kirchhoffs-laws",
    difficulty: "hard",
    question: "Kirchhoff's junction rule is based on conservation of:",
    options: ["Energy", "Momentum", "Charge", "Mass"],
    correctAnswer: 2,
    explanation:
      "At a junction, sum of currents entering equals sum leaving because charge is conserved.",
    hint: "What quantity cannot accumulate at a circuit junction in steady state?",
    tags: ["kirchhoffs-laws", "cbse-class-12-2022", "circuits"],
  },

  // CBSE Class 12 - Mathematics
  {
    examSlug: "cbse-class-12",
    subjectSlug: "mathematics",
    chapterSlug: "integrals",
    topicSlug: "indefinite-integrals",
    difficulty: "medium",
    question: "Integral of cos x dx is:",
    options: ["sin x + C", "-sin x + C", "tan x + C", "-cos x + C"],
    correctAnswer: 0,
    explanation:
      "The derivative of sin x is cos x, so integral of cos x is sin x + C.",
    hint: "Reverse the derivative of trigonometric functions.",
    tags: ["pyq", "cbse-class-12-2024", "integrals"],
  },
  {
    examSlug: "cbse-class-12",
    subjectSlug: "mathematics",
    chapterSlug: "integrals",
    topicSlug: "area-under-curves",
    difficulty: "hard",
    question:
      "The area enclosed between the curve y = x and the x-axis from x = 0 to x = 2 is:",
    options: ["1 sq units", "2 sq units", "4 sq units", "8 sq units"],
    correctAnswer: 1,
    explanation:
      "Area = integral from 0 to 2 of x dx = [x^2/2] from 0 to 2 = 2 square units.",
    hint: "Area under a straight line can be found using integration.",
    tags: ["area-under-curves", "cbse-class-12-2023", "application"],
  },
];

module.exports = QUESTION_SEEDS;
