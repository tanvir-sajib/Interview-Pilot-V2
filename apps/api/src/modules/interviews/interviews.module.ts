import { Module } from '@nestjs/common';
import { InterviewsController } from './interviews.controller';
import { AnswersController } from './answers.controller';
import { InterviewsService } from './interviews.service';
import { AnswersService } from './answers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InterviewsController, AnswersController],
  providers: [InterviewsService, AnswersService],
})
export class InterviewsModule {}
