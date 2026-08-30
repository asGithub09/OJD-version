require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./config/db");

const Faculty = require("./models/Faculty");
const Course = require("./models/Course");
const CourseModule = require("./models/CourseModule");
const CourseLesson = require("./models/CourseLesson");

/*
 * ============================================================
 * OJDV INITIAL DATABASE SEED
 * ============================================================
 *
 * This script:
 *
 * - Uses the existing MongoDB connection configuration.
 * - Does NOT modify server.js.
 * - Does NOT modify authentication.
 * - Does NOT modify API routes.
 * - Creates/reuses Faculty records.
 * - Creates/reuses the initial UPSC course.
 * - Creates/reuses course modules.
 * - Creates/reuses course lessons.
 *
 * It is safe to run more than once.
 * ============================================================
 */

const facultyData = [
  {
    name: "Dr. Ananya Sharma",
    slug: "dr-ananya-sharma",
    photoUrl: "",
    designation: "Senior Faculty – Indian Polity",
    subject: "Indian Polity",
    qualification: "Ph.D. in Political Science",
    experience: "12+ Years",
    bio:
      "Experienced educator specializing in Indian Polity, Constitution and civil services preparation.",
    specialization: [
      "Indian Constitution",
      "Indian Polity",
      "Governance",
    ],
    featured: true,
    published: true,
    displayOrder: 1,
  },

  {
    name: "Rahul Verma",
    slug: "rahul-verma",
    photoUrl: "",
    designation: "Senior Faculty – General Studies",
    subject: "General Studies",
    qualification: "M.A. in History",
    experience: "10+ Years",
    bio:
      "Faculty member focused on structured General Studies preparation and foundational learning.",
    specialization: [
      "General Studies",
      "History",
      "Current Affairs",
    ],
    featured: true,
    published: true,
    displayOrder: 2,
  },
];

/*
 * ============================================================
 * COURSE
 * ============================================================
 */

const courseData = {
  title: "UPSC Civil Services",
  slug: "upsc-civil-services",

  shortDescription:
    "Structured preparation for India's most competitive civil services examination.",

  description:
    "A structured UPSC Civil Services learning program covering foundational concepts, Indian Polity and current affairs. The initial OJDV learning path is designed to demonstrate the complete course, module and lesson experience.",

  category: "CIVIL SERVICES",

  thumbnailUrl: "",

  level: "ALL_LEVELS",

  duration: "12 Months",

  price: 0,

  originalPrice: 0,

  featured: true,

  published: true,

  displayOrder: 1,
};


/*
 * ============================================================
 * MODULES
 * ============================================================
 */

const moduleData = [
  {
    title: "UPSC Foundation",
    description:
      "Understand the UPSC examination structure and build a strong preparation foundation.",
    displayOrder: 1,
    published: true,
    isFree: true,

    lessons: [
      {
        title: "Introduction to UPSC Civil Services",
        description:
          "Understand what the UPSC Civil Services Examination is and how the overall selection process works.",
        type: "ARTICLE",
        content:
          "The UPSC Civil Services Examination is one of India's most competitive examinations. It broadly consists of the Preliminary Examination, Main Examination and Personality Test. A successful preparation strategy begins with understanding the examination structure, syllabus and long-term preparation requirements.",
        duration: "10 min",
        displayOrder: 1,
        published: true,
        isFree: true,
      },

      {
        title: "Understanding the Examination Structure",
        description:
          "Learn how Prelims, Mains and the Personality Test fit together.",
        type: "ARTICLE",
        content:
          "The Preliminary Examination is used as the screening stage. Candidates who qualify proceed to the Main Examination, which evaluates analytical and descriptive abilities. Candidates shortlisted from the Main Examination appear for the Personality Test.",
        duration: "12 min",
        displayOrder: 2,
        published: true,
        isFree: true,
      },

      {
        title: "How to Begin UPSC Preparation",
        description:
          "Build a practical starting strategy for your UPSC preparation.",
        type: "ARTICLE",
        content:
          "Start by understanding the syllabus and previous-year question papers. Establish a realistic study schedule, select limited and reliable resources, revise consistently and gradually develop answer-writing and test-taking skills.",
        duration: "15 min",
        displayOrder: 3,
        published: true,
        isFree: true,
      },
    ],
  },

  {
    title: "Indian Polity",
    description:
      "Build a strong conceptual understanding of the Indian Constitution and political system.",
    displayOrder: 2,
    published: true,
    isFree: true,

    lessons: [
      {
        title: "Constitution of India",
        description:
          "Introduction to the Constitution of India and its fundamental framework.",
        type: "ARTICLE",
        content:
          "The Constitution of India establishes the framework of government, defines institutional powers and protects fundamental rights. Understanding its structure provides the foundation for studying Indian Polity.",
        duration: "14 min",
        displayOrder: 1,
        published: true,
        isFree: true,
      },

      {
        title: "Fundamental Rights",
        description:
          "Understand the fundamental rights guaranteed by the Constitution.",
        type: "ARTICLE",
        content:
          "Fundamental Rights are constitutional protections available to individuals. They form an important part of the Indian constitutional framework and are frequently relevant to civil services examination questions.",
        duration: "16 min",
        displayOrder: 2,
        published: true,
        isFree: true,
      },

      {
        title: "Directive Principles of State Policy",
        description:
          "Learn the purpose and significance of the Directive Principles.",
        type: "ARTICLE",
        content:
          "The Directive Principles of State Policy provide guiding principles for governance and social and economic development. They are an important constitutional topic for understanding the relationship between rights, governance and public policy.",
        duration: "13 min",
        displayOrder: 3,
        published: true,
        isFree: true,
      },
    ],
  },

  {
    title: "Current Affairs",
    description:
      "Develop a disciplined system for following and revising current affairs.",
    displayOrder: 3,
    published: true,
    isFree: true,

    lessons: [
      {
        title: "Introduction to Current Affairs",
        description:
          "Understand why current affairs matter for UPSC preparation.",
        type: "ARTICLE",
        content:
          "Current affairs connect static concepts with contemporary developments. Effective preparation focuses on understanding issues, identifying their constitutional, economic, social and international dimensions and connecting them with the UPSC syllabus.",
        duration: "10 min",
        displayOrder: 1,
        published: true,
        isFree: true,
      },

      {
        title: "Building a Daily Current Affairs Habit",
        description:
          "Create a sustainable daily system for reading and revising current affairs.",
        type: "ARTICLE",
        content:
          "A consistent current affairs routine is more effective than irregular intensive reading. Maintain concise notes, connect news with syllabus topics and periodically revise important developments.",
        duration: "11 min",
        displayOrder: 2,
        published: true,
        isFree: true,
      },
    ],
  },
];


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const upsertFaculty = async (data) => {
  const faculty = await Faculty.findOneAndUpdate(
    { slug: data.slug },
    {
      $set: data,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return faculty;
};


const upsertCourse = async (data, facultyIds) => {
  const course = await Course.findOneAndUpdate(
    { slug: data.slug },
    {
      $set: {
        ...data,
        faculty: facultyIds,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return course;
};


const upsertModule = async (courseId, data) => {
  const module = await CourseModule.findOneAndUpdate(
    {
      course: courseId,
      title: data.title,
    },
    {
      $set: {
        course: courseId,
        title: data.title,
        description: data.description,
        displayOrder: data.displayOrder,
        published: data.published,
        isFree: data.isFree,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return module;
};


const upsertLesson = async (
  courseId,
  moduleId,
  data
) => {
  const lesson = await CourseLesson.findOneAndUpdate(
    {
      course: courseId,
      module: moduleId,
      title: data.title,
    },
    {
      $set: {
        course: courseId,
        module: moduleId,
        title: data.title,
        description: data.description,
        type: data.type,
        content: data.content,
        thumbnailUrl: data.thumbnailUrl || "",
        displayOrder: data.displayOrder,
        duration: data.duration,
        published: data.published,
        isFree: data.isFree,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return lesson;
};


/*
 * ============================================================
 * SEED
 * ============================================================
 */

const seedDatabase = async () => {
  try {
    console.log("");
    console.log("========================================");
    console.log("       OJDV DATABASE SEED");
    console.log("========================================");
    console.log("");

    /*
     * Connect to MongoDB using the existing
     * application configuration.
     */
    await connectDB();

    /*
     * --------------------------------------------------------
     * FACULTY
     * --------------------------------------------------------
     */

    console.log("Creating / updating faculty...");

    const facultyRecords = [];

    for (const data of facultyData) {
      const faculty = await upsertFaculty(data);

      facultyRecords.push(faculty);

      console.log(
        `  ✓ Faculty: ${faculty.name}`
      );
    }

    /*
     * --------------------------------------------------------
     * COURSE
     * --------------------------------------------------------
     */

    console.log("");
    console.log("Creating / updating course...");

    const course = await upsertCourse(
      courseData,
      facultyRecords.map(
        (faculty) => faculty._id
      )
    );

    console.log(
      `  ✓ Course: ${course.title}`
    );

    console.log(
      `  ✓ Course ID: ${course._id}`
    );

    /*
     * --------------------------------------------------------
     * MODULES + LESSONS
     * --------------------------------------------------------
     */

    console.log("");
    console.log("Creating / updating modules and lessons...");

    let moduleCount = 0;
    let lessonCount = 0;

    for (const moduleDataItem of moduleData) {
      const module = await upsertModule(
        course._id,
        moduleDataItem
      );

      moduleCount += 1;

      console.log(
        `  ✓ Module ${module.displayOrder}: ${module.title}`
      );

      for (const lessonData of moduleDataItem.lessons) {
        const lesson = await upsertLesson(
          course._id,
          module._id,
          lessonData
        );

        lessonCount += 1;

        console.log(
          `      ✓ Lesson ${lesson.displayOrder}: ${lesson.title}`
        );
      }
    }

    /*
     * --------------------------------------------------------
     * SUMMARY
     * --------------------------------------------------------
     */

    console.log("");
    console.log("========================================");
    console.log("       OJDV SEED COMPLETE");
    console.log("========================================");

    console.log(
      `Faculty records: ${facultyRecords.length}`
    );

    console.log(
      `Course records: 1`
    );

    console.log(
      `Module records: ${moduleCount}`
    );

    console.log(
      `Lesson records: ${lessonCount}`
    );

    console.log("");
    console.log("Course:");
    console.log(`  ${course.title}`);
    console.log(`  ID: ${course._id}`);
    console.log(`  Slug: ${course.slug}`);

    console.log("");
    console.log("Public course API:");
    console.log("  GET /api/courses");

    console.log("");
    console.log("========================================");
    console.log("");

  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("       OJDV SEED FAILED");
    console.error("========================================");
    console.error(error);
    console.error("========================================");
    console.error("");

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
  }
};


/*
 * ============================================================
 * START
 * ============================================================
 */

seedDatabase();