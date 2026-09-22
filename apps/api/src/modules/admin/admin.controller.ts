import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/v1/admin')
export class AdminController {
  @Get('secret')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findSecret() {
    return { secret: 'Only admin can see this' };
  }
}
