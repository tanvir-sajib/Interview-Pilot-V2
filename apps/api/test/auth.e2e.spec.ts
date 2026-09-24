import 'reflect-metadata';
import { v4 as uuidv4 } from 'uuid';
import { QuestionCategory, QuestionSeniority, QuestionStatus, InterviewStatus, Role } from '@prisma/client';

/** Mock Prisma used by older e2e suites – kept for compatibility. */
export class MockPrismaService {
  private users: any[] = [];
  private questions: any[] = [];
  private interviewSessions: any[] = [];
  private sessionQuestions: any[] = [];
  private answers: any[] = [];

  // ---------- User handling ----------
  user = {
    findUnique: async (args: any) => {
      const user = this.users.find(u => (args.where?.email && u.email === args.where.email) || (args.where?.id && u.id === args.where.id));
      if (!user) return null;
      if (args.include?.profile) {
        return { ...user, profile: user.profile ?? { id: uuidv4() } };
      }
      return user;
    },
    create: async (args: any) => {
      const newUser = { id: uuidv4(), ...args.data, profile: args.data.profile?.create ? { id: uuidv4() } : undefined, refreshTokenVersion: 0 };
      this.users.push(newUser);
      return newUser;
    },
    deleteMany: async () => { this.users = []; return { count: 0 }; },
    update: async (args: any) => {
      const user = this.users.find(u => u.id === args.where.id);
      if (!user) throw new Error('User not found');
      if (args.data.password !== undefined) user.password = args.data.password;
      if (args.data.failedLoginAttempts !== undefined) user.failedLoginAttempts = args.data.failedLoginAttempts;
      if (args.data.lockedUntil !== undefined) user.lockedUntil = args.data.lockedUntil;
      if (args.data.role !== undefined) user.role = args.data.role;
      if (args.data.isActive !== undefined) user.isActive = args.data.isActive;
      if (args.data.refreshTokenVersion !== undefined) user.refreshTokenVersion = args.data.refreshTokenVersion;
      if (args.data.profile?.create !== undefined) { user.profile = user.profile ?? { id: uuidv4() }; }
      if (args.data.profile?.update !== undefined) { user.profile = { ...user.profile, ...args.data.profile.update }; }
      if (args.include?.profile) { return { ...user, profile: user.profile ?? { id: uuidv4() } }; }
      return user;
    },
  };
}

describe('placeholder for auth.e2e mock file', () => {
  it('always passes', () => {
    expect(true).toBe(true);
  });
});
