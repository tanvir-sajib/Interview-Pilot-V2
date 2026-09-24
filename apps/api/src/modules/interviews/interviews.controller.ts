import { Controller, Post, Get, Body, Param, UseGuards, NotFoundException, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN')
  async create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.createSession(dto);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  async start(@Param('id') id: string) {
    const session = await this.interviewsService.startSession(id);
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  @Get(':id/current-question')
  @UseGuards(JwtAuthGuard)
  async currentQuestion(@Param('id') id: string) {
    const question = await this.interviewsService.getCurrentQuestion(id);
    if (!question) throw new NotFoundException('No active question');
    return question;
  }

  @Post(':id/answer')
  @UseGuards(JwtAuthGuard)
  async submitAnswer(@Param('id') sessionId: string, @Body() body: { questionId: string; content: string }) {
    return this.interviewsService.submitAnswer(sessionId, body.questionId, body.content);
  }

  @HttpCode(200)
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Param('id') id: string) {
    const session = await this.interviewsService.cancelSession(id);
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  async complete(@Param('id') id: string) {
    const session = await this.interviewsService.completeSession(id);
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
}
