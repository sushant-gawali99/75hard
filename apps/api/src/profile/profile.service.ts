import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { deriveNutritionTargets, type Sex, type ActivityLevel, type UpsertProfileInput } from '@process/shared';
import { type Db } from '../db/client';
import { DRIZZLE } from '../db/db.module';
import { nutritionTargets, profiles } from '../db/schema';

@Injectable()
export class ProfileService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async get(userId: string) {
    const [row] = await this.db.select().from(profiles).where(eq(profiles.userId, userId));
    return row ?? null;
  }

  async getTargets(userId: string) {
    const [row] = await this.db.select().from(nutritionTargets).where(eq(nutritionTargets.userId, userId));
    return row ?? null;
  }

  async upsert(userId: string, input: UpsertProfileInput) {
    const [row] = await this.db
      .insert(profiles)
      .values({ userId, ...input })
      .onConflictDoUpdate({ target: profiles.userId, set: { ...input, updatedAt: new Date() } })
      .returning();

    const targets = deriveNutritionTargets({
      sex: (row.sex as Sex | null) ?? undefined,
      age: row.age ?? undefined,
      heightCm: row.heightCm ?? undefined,
      weightKg: row.startWeightKg ?? undefined,
      goalWeightKg: row.goalWeightKg ?? undefined,
      activity: (row.activity as ActivityLevel | null) ?? undefined,
    });
    if (targets) {
      await this.db
        .insert(nutritionTargets)
        .values({ userId, ...targets })
        .onConflictDoUpdate({ target: nutritionTargets.userId, set: { ...targets, updatedAt: new Date() } });
    }

    return row;
  }
}
