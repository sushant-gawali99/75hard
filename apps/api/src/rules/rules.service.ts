import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { type CreateRuleInput } from '@process/shared';
import { type Db } from '../db/client';
import { DRIZZLE } from '../db/db.module';
import { rules } from '../db/schema';

@Injectable()
export class RulesService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  list(userId: string) {
    return this.db.select().from(rules).where(eq(rules.userId, userId)).orderBy(rules.sortOrder);
  }

  async create(userId: string, input: CreateRuleInput) {
    const [row] = await this.db
      .insert(rules)
      .values({
        userId,
        name: input.name,
        icon: input.icon,
        palette: input.palette,
        target: input.target,
        unit: input.unit,
        frequency: input.frequency,
      })
      .returning();
    return row;
  }
}
