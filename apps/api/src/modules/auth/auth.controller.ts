import { Controller, Post, Body, UseGuards, Req, Res, HttpCode, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request) {
    const user = req.user as any;
    // Expect refresh token included in body; alternatively from header 'x-refresh-token'
    const refreshToken = req.headers['x-refresh-token'] as string | undefined;
    if (!refreshToken) throw new Error('Missing refresh token');
    return this.authService.logout(user.userId, refreshToken);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: Request,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    const user = req.user as any;
    return this.authService.changePassword(user.userId, oldPassword, newPassword);
  }
}
