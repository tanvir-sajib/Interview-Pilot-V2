import { IsOptional, IsString, IsArray, IsEnum, ArrayNotEmpty } from 'class-validator';
import { QuestionRole, QuestionSeniority, QuestionCategory, QuestionDifficulty, QuestionLanguage } from '@prisma/client';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsEnum(QuestionRole)
  role?: QuestionRole;

  @IsOptional()
  @IsEnum(QuestionSeniority)
  seniority?: QuestionSeniority;

  @IsOptional()
  @IsEnum(QuestionCategory)
  category?: QuestionCategory;

  @IsOptional()
  @IsEnum(QuestionDifficulty)
  difficulty?: QuestionDifficulty;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expectedConcepts?: string[];

  @IsOptional()
  @IsString()
  rubric?: string;

  @IsOptional()
  @IsEnum(QuestionLanguage)
  language?: QuestionLanguage;
}
