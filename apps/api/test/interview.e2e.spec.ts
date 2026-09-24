import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { QuestionCategory, QuestionSeniority, QuestionStatus, InterviewStatus } from '@prisma/client';

/** Mock Prisma used by interview e2e tests – retained for compatibility. */
export class MockPrismaService {
  private users: any[] = [];
  private questions: any[] = [];
  private interviewSessions: any[] = [];
  private sessionQuestions: any[] = [];
  private answers: any[] = [];

  user = {
    findUnique: async (args: any) => {
      const user = this.users.find(u => (args.where?.email && u.email === args.where.email) || (args.where?.id && u.id === args.where.id));
      if (!user) return null;
      if (args.include?.profile) { return { ...user, profile: user.profile ?? { id: uuidv4() } }; }
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

  question = {
    findMany: async (args: any) => {
      const filtered = this.questions.filter(q => q.category === args.where?.category && q.seniority === args.where?.seniority && q.status === args.where?.status);
      return args.take ? filtered.slice(0, args.take) : filtered;
    },
  };

  interviewSession = {
    create: async (args: any) => {
      const sess = { id: uuidv4(), ...args.data, status: InterviewStatus.READY, startedAt: null, endedAt: null };
      this.interviewSessions.push(sess);
      return sess;
    },
    findUnique: async (args: any) => this.interviewSessions.find(s => s.id === args.where.id),
    update: async (args: any) => {
      const sess = this.interviewSessions.find(s => s.id === args.where.id);
      if (!sess) throw new Error('Session not found');
      Object.assign(sess, args.data);
      return sess;
    },
  };

  sessionQuestion = {
    create: async (args: any) => {
      const sq = { id: uuidv4(), ...args.data, answers: [], question: this.questions.find(q => q.id === args.data.questionId) };
      this.sessionQuestions.push(sq);
      return sq;
    },
    findMany: async (args: any) => {
      let results = this.sessionQuestions.filter(sq => sq.sessionId === args.where.sessionId);
      results = results.sort((a, b) => a.order - b.order);
      if (args.include?.question) { results = results.map(sq => ({ ...sq, question: this.questions.find(q => q.id === sq.questionId) })); }
      if (args.include?.answers) { results = results.map(sq => ({ ...sq, answers: this.answers.filter(a => a.sessionQuestionId === sq.id) })); }
      return results;
    },
    findFirst: async (args: any) => {
      const sq = this.sessionQuestions.find(s => s.sessionId === args.where.sessionId && s.questionId === args.where.questionId);
      if (!sq) return null;
      if (args.include?.answers) { return { ...sq, answers: this.answers.filter(a => a.sessionQuestionId === sq.id) }; }
      return sq;
    },
  };

  answer = {
    create: async (args: any) => {
      const ans = { id: uuidv4(), ...args.data };
      this.answers.push(ans);
      const sq = this.sessionQuestions.find(s => s.id === args.data.sessionQuestionId);
      if (sq) { sq.answers.push(ans); }
      return ans;
    },
  };
}

describe('placeholder for interview.e2e mock file', () => {
  it('always passes', () => {
    expect(true).toBe(true);
  });
});
