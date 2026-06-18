import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { AuthGuard } from './auth/auth.guard';
import { ChallengeModule } from './challenge/challenge.module';
import { CheckinsModule } from './checkins/checkins.module';
import { validateEnv } from './config/env.validation';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { MealsModule } from './meals/meals.module';
import { ProfileModule } from './profile/profile.module';
import { RuleLogsModule } from './rule-logs/rule-logs.module';
import { RulesModule } from './rules/rules.module';
import { StreaksModule } from './streaks/streaks.module';
import { WeightsModule } from './weights/weights.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    DbModule,
    HealthModule,
    RulesModule,
    RuleLogsModule,
    WeightsModule,
    StreaksModule,
    ProfileModule,
    ChallengeModule,
    MealsModule,
    CheckinsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
