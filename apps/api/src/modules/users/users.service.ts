import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.user.update({
      where: { id: userId },
      data: { profile: { update: dto } },
      include: { profile: true },
    });
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      profile: profile.profile,
    };
  }
}
