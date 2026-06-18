import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createDb, type Db } from './client';

/** DI token for the Drizzle client. Inject with `@Inject(DRIZZLE) db: Db`. */
export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Db => {
        const url = config.get<string>('DATABASE_URL');
        if (!url) throw new Error('DATABASE_URL is required (set it in apps/api/.env)');
        return createDb(url);
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DbModule {}
