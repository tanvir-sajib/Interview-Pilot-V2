import { Controller, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  /**
   * Enqueue an evaluation for a given answer.
   * The authenticated user ID is used for tracking.
   */
  @Post('enqueue/:answerId')
  @UseGuards(JwtAuthGuard)
  async enqueue(@Param('answerId') answerId: string, @Req() req: Request) {
    const userId = (req as any).user?.sub ?? (req as any).user?.id;
    const jobId = await this.evaluationsService.enqueueEvaluation(answerId, userId);
    return { jobId };
  }
}
