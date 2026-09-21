import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash } from 'crypto';
import { QuestionRole, QuestionSeniority, QuestionCategory, QuestionDifficulty, QuestionLanguage, QuestionStatus } from '@prisma/client';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async createQuestion(dto: CreateQuestionDto) {
    const now = new Date();
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
        status: QuestionStatus.DRAFT,
        isActive: true,
        author: { connect: { id: 'system' } }, // placeholder – will be set in actual controller
      },
    });
    await this.prisma.questionVersion.create({
      data: {
        questionId: question.id,
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
    // Create new version with updated fields
    const latestVersion = await this.prisma.questionVersion.findFirst({
      where: { questionId: id },
      orderBy: { versionNumber: 'desc' },
    });
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    const updatedFields = {
      role: dto.role ?? latestVersion?.role,
      seniority: dto.seniority ?? latestVersion?.seniority,
      category: dto.category ?? latestVersion?.category,
      difficulty: dto.difficulty ?? latestVersion?.difficulty,
      tags: dto.tags ?? latestVersion?.tags,
      expectedConcepts: dto.expectedConcepts ?? latestVersion?.expectedConcepts,
      rubric: dto.rubric ?? latestVersion?.rubric,
      language: dto.language ?? latestVersion?.language,
      content: dto.text ?? latestVersion?.content,
    };
    await this.prisma.questionVersion.create({ data: { ...updatedFields, questionId: id, versionNumber: newVersionNumber } });
    // Update the question metadata for quick access
    await this.prisma.question.update({ where: { id }, data: { ...updatedFields, title: dto.title ?? existing.title } });
    return this.prisma.question.findUnique({ where: { id }, include: { versions: true } });
  }

  async setStatus(id: string, status: QuestionStatus) {
    await this.prisma.question.update({ where: { id }, data: { status } });
  }
}
