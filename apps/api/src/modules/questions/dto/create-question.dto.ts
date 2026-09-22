import { IsString, IsNotEmpty, IsArray, IsOptional, IsEnum, ArrayNotEmpty, MaxLength, MinLength } from 'class-validator';
import { QuestionRole, QuestionSeniority, QuestionCategory, QuestionDifficulty, QuestionLanguage } from '@prisma/client';

export class CreateQuestionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsEnum(QuestionRole)
  role!: QuestionRole;

  @IsEnum(QuestionSeniority)
  seniority!: QuestionSeniority;

  @IsEnum(QuestionCategory)
  category!: QuestionCategory;

  @IsEnum(QuestionDifficulty)
  difficulty!: QuestionDifficulty;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags!: string[];

  @IsArray()
  @IsString({ each: true })
  expectedConcepts!: string[];

  @IsString()
  rubric!: string;

  @IsEnum(QuestionLanguage)
  language!: QuestionLanguage;
}
