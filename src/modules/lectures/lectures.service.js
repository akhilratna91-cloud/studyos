/**
 * StudyOS - Educational Video Lectures & Resources Service
 */

const CURATED_LECTURES = [
  {
    id: "lec-jee-phys-1",
    examSlug: "jee-main",
    subjectSlug: "physics",
    chapterName: "Kinematics",
    title: "JEE Main Physics: Motion in 1D & 2D Masterclass",
    channel: "Physics Wallah",
    duration: "1h 45m",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tags: ["kinematics", "motion", "jee-main", "physics"],
    rating: 4.9,
    views: "1.2M",
  },
  {
    id: "lec-jee-chem-1",
    examSlug: "jee-main",
    subjectSlug: "chemistry",
    chapterName: "Electrochemistry",
    title: "Electrochemistry Full Chapter Revision with PYQs",
    channel: "Unacademy JEE",
    duration: "2h 10m",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tags: ["electrochemistry", "jee-main", "chemistry"],
    rating: 4.8,
    views: "850K",
  },
  {
    id: "lec-neet-bio-1",
    examSlug: "neet",
    subjectSlug: "biology",
    chapterName: "Human Physiology",
    title: "NEET Biology: Complete Human Physiology One Shot",
    channel: "Vedantu NEET",
    duration: "3h 15m",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tags: ["human-physiology", "neet", "biology"],
    rating: 4.9,
    views: "2.1M",
  },
  {
    id: "lec-ssc-math-1",
    examSlug: "ssc-cgl",
    subjectSlug: "quantitative-aptitude",
    chapterName: "Percentage & Profit Loss",
    title: "SSC CGL Quantitative Aptitude: Fast Calculation Tricks",
    channel: "Gagan Pratap Maths",
    duration: "1h 30m",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tags: ["percentage", "ssc-cgl", "maths"],
    rating: 4.9,
    views: "3.4M",
  },
  {
    id: "lec-upsc-polity-1",
    examSlug: "upsc-cse",
    subjectSlug: "indian-polity",
    chapterName: "Preamble & Fundamental Rights",
    title: "UPSC CSE Indian Polity: Laxmikanth Chapter-by-Chapter Guide",
    channel: "StudyIQ IAS",
    duration: "2h 45m",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tags: ["polity", "upsc-cse", "fundamental-rights"],
    rating: 4.9,
    views: "1.9M",
  },
];

class LecturesService {
  /**
   * Search and filter video lectures.
   *
   * @param {object} query
   * @param {string} [query.exam]
   * @param {string} [query.subject]
   * @param {string} [query.q] - search keyword
   * @returns {Array} Matched lectures
   */
  static getLectures(query = {}) {
    let result = [...CURATED_LECTURES];

    if (query.exam) {
      const examLow = query.exam.toLowerCase();
      result = result.filter(
        (l) => l.examSlug.toLowerCase() === examLow || l.tags.includes(examLow)
      );
    }

    if (query.subject) {
      const subLow = query.subject.toLowerCase();
      result = result.filter(
        (l) => l.subjectSlug.toLowerCase() === subLow || l.tags.includes(subLow)
      );
    }

    if (query.q) {
      const searchLow = query.q.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(searchLow) ||
          l.chapterName.toLowerCase().includes(searchLow) ||
          l.channel.toLowerCase().includes(searchLow)
      );
    }

    return result;
  }
}

module.exports = LecturesService;
