import { IsString, IsEnum } from 'class-validator';
import { QuestionCategory, QuestionSeniority } from '../../prisma/client';

export class CreateInterviewDto {
  @IsString()
  userId: string;

  @IsEnum(QuestionCategory)
  track: QuestionCategory;

  @IsEnum(QuestionSeniority)
  seniority: QuestionSeniority;
}
