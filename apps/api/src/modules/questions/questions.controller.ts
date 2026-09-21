import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '@prisma/client'; // using user role for guard
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // Only ADMIN can create questions
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createDto: CreateQuestionDto) {
    return this.questionsService.createQuestion(createDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const question = await this.questionsService.findById(id);
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  @Get(':id/versions')
  async listVersions(@Param('id') id: string) {
    return this.questionsService.listVersions(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() updateDto: UpdateQuestionDto) {
    const result = await this.questionsService.updateQuestion(id, updateDto);
    if (!result) throw new NotFoundException('Question not found');
    return result;
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async publish(@Param('id') id: string) {
    await this.questionsService.setStatus(id, 'PUBLISHED');
    return { status: 'published' };
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async archive(@Param('id') id: string) {
    await this.questionsService.setStatus(id, 'ARCHIVED');
    return { status: 'archived' };
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async review(@Param('id') id: string) {
    await this.questionsService.setStatus(id, 'REVIEW');
    return { status: 'review' };
  }
}
