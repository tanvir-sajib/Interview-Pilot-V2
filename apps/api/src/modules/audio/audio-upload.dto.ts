import { IsString, IsInt, Min, Max } from 'class-validator';

export class AudioUploadDto {
  @IsString()
  filename!: string;

  @IsInt()
  @Min(1)
  @Max(500 * 1024 * 1024) // 500 MB max size
  size!: number;
}
