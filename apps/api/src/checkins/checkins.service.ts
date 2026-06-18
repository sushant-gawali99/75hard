import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { type UpsertCheckinInput } from '@process/shared';
import { type Db } from '../db/client';
import { DRIZZLE } from '../db/db.module';
import { checkins } from '../db/schema';

@Injectable()
export class CheckinsService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async getByDate(userId: string, date: string) {
    const [row] = await this.db
      .select()
      .from(checkins)
      .where(and(eq(checkins.userId, userId), eq(checkins.date, date)));
    return row ?? null;
  }

  async upsert(userId: string, input: UpsertCheckinInput) {
    const mood = input.mood ?? null;
    const note = input.note ?? null;
    const [row] = await this.db
      .insert(checkins)
      .values({ userId, date: input.date, mood, note })
      .onConflictDoUpdate({
        target: [checkins.userId, checkins.date],
        set: { mood, note, updatedAt: new Date() },
      })
      .returning();
    return row;
  }
}
