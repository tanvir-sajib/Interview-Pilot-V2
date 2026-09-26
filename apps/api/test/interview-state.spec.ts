import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { QuestionCategory, QuestionSeniority } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { MockPrismaService } from './interview.e2e.spec'; // re-use the mock defined there

/**
 * Extended interview flow tests covering invalid state transitions.
 */

describe('Interview state transition edge‑cases', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let interviewId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRES_IN = '10s';
    process.env.REFRESH_EXPIRES_IN = '1h';
    process.env.BCRYPT_SALT_ROUNDS = '8';

    const mockPrismaService = new MockPrismaService();
    // Insert sample questions
    mockPrismaService['questions'] = [
      {
        id: uuidv4(),
        category: 'TECHNICAL',
        seniority: 'MID',
        status: 'PUBLISHED',
        title: 'Sample question',
        text: 'Explain closures.',
        role: 'TECHNICAL',
        difficulty: 'EASY',
        language: 'EN',
        expectedConcepts: [],
        rubric: 'Rubric',
      },
    ];

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('register & login', async () => {
    const reg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'state@test.com', password: 'Password123' });
    expect(reg.status).toBe(201);
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'state@test.com', password: 'Password123' });
    expect(login.status).toBe(200);
    accessToken = login.body.accessToken;
  });

  it('create interview', async () => {
    const res = await request(app.getHttpServer())
      .post('/interviews')
      .set('Authorization', `Bearer ${accessToken}`)      .send({ userId: 'dummy', track: QuestionCategory.TECHNICAL, seniority: QuestionSeniority.MID });
    expect(res.status).toBe(201);
    interviewId = res.body.id;
  });

  it('start session (required before complete)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/interviews/${interviewId}/start`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(201);
  });

  it('complete session', async () => {
    const res = await request(app.getHttpServer())
      .post(`/interviews/${interviewId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('COMPLETED');
  });

  it('reject answer submission after completion', async () => {
    const res = await request(app.getHttpServer())
      .post(`/interviews/${interviewId}/answer`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ questionId: 'nonexistent', content: 'Should fail' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid session state/);
  });
  it('cancel session and reject answer submission', async () => {
    // Create a new interview for this test
    const newRes = await request(app.getHttpServer())
      .post('/interviews')
      .set('Authorization', `Bearer ${accessToken}`)      .send({ userId: 'dummy', track: QuestionCategory.TECHNICAL, seniority: QuestionSeniority.MID });
    expect(newRes.status).toBe(201);
    const newInterviewId = newRes.body.id;
    // start session
    const startRes = await request(app.getHttpServer())
      .post(`/interviews/${newInterviewId}/start`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(startRes.status).toBe(201);
    // cancel session
    const cancelRes = await request(app.getHttpServer())
      .post(`/interviews/${newInterviewId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(cancelRes.status).toBe(200);
    // attempt to answer after cancellation
    const answerRes = await request(app.getHttpServer())
      .post(`/interviews/${newInterviewId}/answer`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ questionId: 'nonexistent', content: 'Should fail' });
    expect(answerRes.status).toBe(400);
    expect(answerRes.body.message).toMatch(/Invalid session state/);
  });
});