import { IsString, IsEnum, IsOptional, IsArray, ArrayNotEmpty, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import {
  QuestionRole,
  QuestionSeniority,
  QuestionCategory,
  QuestionDifficulty,
  QuestionLanguage,
} from '@prisma/client';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
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
  @ArrayNotEmpty()
  @IsString({ each: true })
  expectedConcepts?: string[];

  @IsOptional()
  @IsString()
  rubric?: string;

  @IsOptional()
  @IsEnum(QuestionLanguage)
  language?: QuestionLanguage;
}
