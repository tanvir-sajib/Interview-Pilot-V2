import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AudioService } from './audio.service';
import { AudioUploadDto } from './audio-upload.dto';

/**
 * Handles audio file upload initiation.
 * Returns a signed URL for direct upload to the storage backend.
 */
@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  async initiateUpload(@Body() dto: AudioUploadDto) {
    // Simple validation is enforced by DTOs + class-validator pipe globally.
    const uploadUrl = await this.audioService.getSignedUploadUrl(dto.filename);
    return { uploadUrl };
  }
}
