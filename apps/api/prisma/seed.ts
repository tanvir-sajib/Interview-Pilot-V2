import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Typed enums from Prisma client
import { QuestionRole, QuestionSeniority, QuestionCategory, QuestionDifficulty, QuestionLanguage } from '@prisma/client';

// Type for a single question datum
interface QuestionData {
  title: string;
  text: string;
  tags: string[];
  role: QuestionRole;
  seniority: QuestionSeniority;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  expectedConcepts: string[];
  rubric: string;
  language: QuestionLanguage;
}

async function seed() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: await bcrypt.hash('AdminPass123', 12),
      role: 'ADMIN',
      isActive: true,
      profile: { create: {} },
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: await bcrypt.hash('UserPass123', 12),
      role: 'USER',
      isActive: true,
      profile: { create: {} },
    },
  });

  const questions: QuestionData[] = [
    {
      title: 'Explain closure in JavaScript',
      text: 'Describe what a closure is ...',
      tags: ['javascript', 'closures'],
      role: 'TECHNICAL',
      seniority: 'MID',
      category: 'TECHNICAL',
      difficulty: 'EASY',
      expectedConcepts: ['variables', 'scope'],
      rubric: 'Cover basic definition and example',
      language: 'EN',
    },
    {
      title: 'How do you handle conflict in a team?',
      text: 'Give an example of resolving disagreement...',
      tags: ['soft-skill'],
      role: 'HR',
      seniority: 'JUNIOR',
      category: 'HR_BEHAVIORAL',
      difficulty: 'MEDIUM',
      expectedConcepts: ['communication', 'compromise'],
      rubric: 'Use STAR framework',
      language: 'EN',
    },
  ];

  for (const q of questions) {
    const created = await prisma.question.create({
      data: {
        title: q.title,
        text: q.text,
        tags: q.tags,
        role: q.role,
        seniority: q.seniority,
        category: q.category,
        difficulty: q.difficulty,
        expectedConcepts: q.expectedConcepts,
        rubric: q.rubric,
        language: q.language,
        status: 'DRAFT',
        isActive: true,
        authorId: admin.id,
      },
      include: { versions: true },
    });

    await prisma.questionVersion.create({
      data: {
        questionId: created.id,
        versionNumber: 1,
        role: q.role,
        seniority: q.seniority,
        category: q.category,
        difficulty: q.difficulty,
        tags: q.tags,
        expectedConcepts: q.expectedConcepts,
        rubric: q.rubric,
        language: q.language,
        content: q.text,
      },
    });

    await prisma.questionVersion.create({
      data: {
        questionId: created.id,
        versionNumber: 2,
        role: q.role,
        seniority: q.seniority,
        category: q.category,
        difficulty: q.difficulty,
        tags: q.tags,
        expectedConcepts: q.expectedConcepts,
        rubric: q.rubric,
        language: q.language,
        content: 'Updated text for version 2',
      },
    });
  }

  console.log('✅ Seed completed');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
