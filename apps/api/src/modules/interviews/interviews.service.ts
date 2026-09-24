import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, InterviewStatus } from '@prisma/client';
import { CreateInterviewDto } from './dto/create-interview.dto';

/**
 * Service handling interview session lifecycle.
 * Added validation to reject answer submissions when the session is not IN_PROGRESS.
 */
@Injectable()
export class InterviewsService {
  constructor(private prisma: PrismaService) {}

  async createSession(dto: CreateInterviewDto) {
    const session = await this.prisma.interviewSession.create({
      data: {
        userId: dto.userId,
        track: dto.track,
        seniority: dto.seniority,
        status: InterviewStatus.READY,
      },
    });
    const questions = await this.prisma.question.findMany({
      where: { category: dto.track, seniority: dto.seniority, status: 'PUBLISHED' },
      take: 10,
    });
    for (const [i, q] of questions.entries()) {
      await this.prisma.sessionQuestion.create({ data: { sessionId: session.id, questionId: q.id, order: i + 1 } });
    }
    return session;
  }

  async startSession(id: string) {
    const session = await this.prisma.interviewSession.findUnique({ where: { id } });
    if (!session) return null;
    if (session.status !== InterviewStatus.READY) throw new BadRequestException('Cannot start');
    return this.prisma.interviewSession.update({ where: { id }, data: { status: InterviewStatus.IN_PROGRESS, startedAt: new Date() } });
  }

  async getCurrentQuestion(sessionId: string) {
    const sqs = await this.prisma.sessionQuestion.findMany({ where: { sessionId }, orderBy: { order: 'asc' }, include: { question: true, answers: true } });
    return sqs.find(s => s.answers.length === 0) ?? null;
  }

  async submitAnswer(sessionId: string, questionId: string, content: string) {
    const session = await this.prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== InterviewStatus.IN_PROGRESS) throw new BadRequestException('Invalid session state');
    const sq = await this.prisma.sessionQuestion.findFirst({ where: { sessionId, questionId }, include: { answers: true } });
    if (!sq) throw new NotFoundException('Not in session');
    if (sq.answers.length > 0) throw new BadRequestException('Answered');
    return this.prisma.answer.create({ data: { sessionQuestionId: sq.id, speaker: 'USER', content } });
  }

  async completeSession(id: string) {
    const session = await this.prisma.interviewSession.findUnique({ where: { id } });
    if (!session) return null;
    if (session.status !== InterviewStatus.IN_PROGRESS) throw new BadRequestException('Invalid state');
    return this.prisma.interviewSession.update({ where: { id }, data: { status: InterviewStatus.COMPLETED, endedAt: new Date() } });
  }

  async cancelSession(id: string) {
    const session = await this.prisma.interviewSession.findUnique({ where: { id } });
    if (!session) return null;
    // Allow cancel if session is not already completed
    if (session.status === InterviewStatus.COMPLETED) throw new BadRequestException('Cannot cancel a completed session');
    if (session.status === InterviewStatus.CANCELLED) throw new BadRequestException('Session already cancelled');
    return this.prisma.interviewSession.update({ where: { id }, data: { status: InterviewStatus.CANCELLED, endedAt: new Date() } });
  }
}
