import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { type AddWeightInput } from '@process/shared';
import { type Db } from '../db/client';
import { DRIZZLE } from '../db/db.module';
import { weights } from '../db/schema';

const toKg = (value: number, unit: 'kg' | 'lb') => (unit === 'lb' ? value / 2.20462 : value);

@Injectable()
export class WeightsService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  list(userId: string) {
    return this.db.select().from(weights).where(eq(weights.userId, userId)).orderBy(weights.date);
  }

  async add(userId: string, input: AddWeightInput) {
    const valueKg = +toKg(input.value, input.unit).toFixed(2);
    const [row] = await this.db
      .insert(weights)
      .values({ userId, date: input.date, valueKg, note: input.note })
      .onConflictDoUpdate({ target: [weights.userId, weights.date], set: { valueKg, note: input.note } })
      .returning();
    return row;
  }
}
