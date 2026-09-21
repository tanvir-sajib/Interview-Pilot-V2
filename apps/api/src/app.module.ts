import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { AnswersModule } from './modules/answers/answers.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { AIModule } from './modules/ai/ai.module';
import { HealthModule } from './modules/health/health.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './modules/auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') || '15m' },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
    InterviewsModule,
    AnswersModule,
    EvaluationsModule,
    SubscriptionsModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
    AIModule,
    HealthModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {
  constructor(private readonly prisma: any) {}
}
