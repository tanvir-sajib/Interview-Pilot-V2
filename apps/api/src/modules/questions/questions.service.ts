import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionStatus } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async createQuestion(dto: CreateQuestionDto) {
    const question = await this.prisma.question.create({
      data: {
        title: dto.title,
        text: dto.text,
        tags: dto.tags,
        role: dto.role,
        seniority: dto.seniority,
        category: dto.category,
        difficulty: dto.difficulty,
        expectedConcepts: dto.expectedConcepts,
        rubric: dto.rubric,
        language: dto.language,
        status: 'DRAFT',
        isActive: true,
        authorId: 'system',
      },
    });

    await this.prisma.questionVersion.create({
      data: {
        question: { connect: { id: question.id } },
        versionNumber: 1,
        role: dto.role,
        seniority: dto.seniority,
        category: dto.category,
        difficulty: dto.difficulty,
        tags: dto.tags,
        expectedConcepts: dto.expectedConcepts,
        rubric: dto.rubric,
        language: dto.language,
        content: dto.text,
      },
    });

    return question;
  }

  async findById(id: string) {
    return this.prisma.question.findUnique({ where: { id }, include: { versions: true } });
  }

  async listVersions(id: string) {
    return this.prisma.questionVersion.findMany({ where: { questionId: id }, orderBy: { versionNumber: 'desc' } });
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) return null;
    const latestVersion = await this.prisma.questionVersion.findFirst({
      where: { questionId: id },
      orderBy: { versionNumber: 'desc' },
    });
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    const updatedFields = {
      role: dto.role ?? latestVersion!.role,
      seniority: dto.seniority ?? latestVersion!.seniority,
      category: dto.category ?? latestVersion!.category,
      difficulty: dto.difficulty ?? latestVersion!.difficulty,
      tags: dto.tags ?? latestVersion!.tags,
      expectedConcepts: dto.expectedConcepts ?? latestVersion!.expectedConcepts,
      rubric: dto.rubric ?? latestVersion!.rubric ?? existing.rubric,
      language: dto.language ?? latestVersion!.language,
    };
    await this.prisma.questionVersion.create({
      data: {
        ...updatedFields,
        content: dto.text ?? '',
        question: { connect: { id } },
        versionNumber: newVersionNumber,
      },
    });
    await this.prisma.question.update({
      where: { id },
      data: {
        ...updatedFields,
        title: dto.title ?? existing.title,
      },
    });
    return this.prisma.question.findUnique({ where: { id }, include: { versions: true } });
  }

  async setStatus(id: string, status: QuestionStatus) {
    await this.prisma.question.update({ where: { id }, data: { status } });
  }
}
