import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...\n");

  // =========================================================
  // PASSWORDS
  // =========================================================

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const instructorPassword = await bcrypt.hash("Instructor@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  // =========================================================
  // ADMIN
  // =========================================================

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@example.com",
    },

    update: {
      name: "Admin User",
      passwordHash: adminPassword,
      role: "ADMIN",
    },

    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // =========================================================
  // INSTRUCTOR
  // =========================================================

  const instructor = await prisma.user.upsert({
    where: {
      email: "instructor@example.com",
    },

    update: {
      name: "John Instructor",
      passwordHash: instructorPassword,
      role: "INSTRUCTOR",
    },

    create: {
      name: "John Instructor",
      email: "instructor@example.com",
      passwordHash: instructorPassword,
      role: "INSTRUCTOR",
    },
  });

  console.log(`✅ Instructor created: ${instructor.email}`);

  // =========================================================
  // STUDENT
  // =========================================================

  const student = await prisma.user.upsert({
    where: {
      email: "student@example.com",
    },

    update: {
      name: "Student User",
      passwordHash: studentPassword,
      role: "STUDENT",
    },

    create: {
      name: "Student User",
      email: "student@example.com",
      passwordHash: studentPassword,
      role: "STUDENT",
    },
  });

  console.log(`✅ Student created: ${student.email}`);

  // =========================================================
  // SAMPLE CLASSES
  // =========================================================

  const classes = [
    {
      title: "Introduction to JavaScript",
      description:
        "Learn JavaScript fundamentals including variables, functions, arrays and objects.",
      scheduledAt: new Date("2026-10-07T10:00:00"),
      duration: 60,
      roomName: "abhidhama-javascript-101",
    },

    {
      title: "React & Next.js",
      description:
        "Learn React components, hooks, routing and Next.js App Router.",
      scheduledAt: new Date("2026-10-08T12:00:00"),
      duration: 90,
      roomName: "abhidhama-react-nextjs",
    },

    {
      title: "Database Management",
      description:
        "Learn PostgreSQL, database design, relationships and Prisma ORM.",
      scheduledAt: new Date("2026-10-09T11:00:00"),
      duration: 60,
      roomName: "abhidhama-database-101",
    },

    {
      title: "Full Stack Development",
      description:
        "Build a complete full-stack application using Next.js, Express and PostgreSQL.",
      scheduledAt: new Date("2026-10-10T14:00:00"),
      duration: 120,
      roomName: "abhidhama-fullstack",
    },
  ];

  for (const classData of classes) {
    const createdClass = await prisma.class.upsert({
      where: {
        roomName: classData.roomName,
      },

      update: {
        title: classData.title,
        description: classData.description,
        scheduledAt: classData.scheduledAt,
        duration: classData.duration,
        instructorId: instructor.id,
        status: "SCHEDULED",
      },

      create: {
        title: classData.title,
        description: classData.description,
        scheduledAt: classData.scheduledAt,
        duration: classData.duration,
        roomName: classData.roomName,
        instructorId: instructor.id,
        status: "SCHEDULED",
      },
    });

    console.log(
      `✅ Class created: ${createdClass.title} (ID: ${createdClass.id})`
    );
  }

  // =========================================================
  // FINISHED
  // =========================================================

  console.log("\n========================================");
  console.log("🎉 DATABASE SEED COMPLETED");
  console.log("========================================");

  console.log("\n👑 ADMIN");
  console.log("Email:    admin@example.com");
  console.log("Password: Admin@123");

  console.log("\n👨‍🏫 INSTRUCTOR");
  console.log("Email:    instructor@example.com");
  console.log("Password: Instructor@123");

  console.log("\n🎓 STUDENT");
  console.log("Email:    student@example.com");
  console.log("Password: Student@123");

  console.log("\n📚 SAMPLE CLASSES");
  console.log("1. Introduction to JavaScript");
  console.log("2. React & Next.js");
  console.log("3. Database Management");
  console.log("4. Full Stack Development");

  console.log("\n========================================");
}

main()
  .catch((error) => {
    console.error("\n❌ SEED FAILED");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });