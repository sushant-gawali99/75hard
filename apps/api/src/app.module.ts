import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { validateEnv } from './config/env.validation';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { RuleLogsModule } from './rule-logs/rule-logs.module';
import { RulesModule } from './rules/rules.module';
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
  ],
})
export class AppModule {}
