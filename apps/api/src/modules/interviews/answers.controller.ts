import { Controller, Get, Post, Param, Query, Body, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '@prisma/client';
import { AnswersService } from './answers.service';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuard)
  async listBySession(@Param('sessionId') sessionId: string) {
    return this.answersService.getAnswersBySession(sessionId);
  }
}
