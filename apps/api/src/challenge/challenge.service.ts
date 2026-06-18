import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { type Db } from '../db/client';
import { DRIZZLE } from '../db/db.module';
import { challenges } from '../db/schema';

@Injectable()
export class ChallengeService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async current(userId: string) {
    const rows = await this.db
      .select()
      .from(challenges)
      .where(eq(challenges.userId, userId))
      .orderBy(desc(challenges.createdAt))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(userId: string, days: number) {
    const [row] = await this.db
      .insert(challenges)
      .values({ userId, days, startDate: new Date().toISOString().slice(0, 10) })
      .returning();
    return row;
  }
}
