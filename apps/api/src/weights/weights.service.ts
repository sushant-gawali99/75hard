import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { type AddWeightInput } from '@process/shared';
import { type Db } from '../db/client';
import { DRIZZLE } from '../db/db.module';
import { weights } from '../db/schema';

const DEV_USER = 'dev-user';

const toKg = (value: number, unit: 'kg' | 'lb') => (unit === 'lb' ? value / 2.20462 : value);

@Injectable()
export class WeightsService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  list() {
    return this.db.select().from(weights).where(eq(weights.userId, DEV_USER)).orderBy(weights.date);
  }

  async add(input: AddWeightInput) {
    const valueKg = +toKg(input.value, input.unit).toFixed(2);
    const [row] = await this.db
      .insert(weights)
      .values({ userId: DEV_USER, date: input.date, valueKg, note: input.note })
      .onConflictDoUpdate({ target: [weights.userId, weights.date], set: { valueKg, note: input.note } })
      .returning();
    return row;
  }
}
