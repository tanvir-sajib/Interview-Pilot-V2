import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  async getAnswersBySession(sessionId: string) {
    return this.prisma.answer.findMany({ where: { sessionQuestion: { sessionId } }, include: { sessionQuestion: true } });
  }
}
