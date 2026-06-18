import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { type CreateRuleInput } from '@process/shared';
import { type Db } from '../db/client';
import { DRIZZLE } from '../db/db.module';
import { rules } from '../db/schema';

// TODO: replace with the authenticated user id once the AUTH epic lands.
const DEV_USER = 'dev-user';

@Injectable()
export class RulesService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  list() {
    return this.db.select().from(rules).where(eq(rules.userId, DEV_USER)).orderBy(rules.sortOrder);
  }

  async create(input: CreateRuleInput) {
    const [row] = await this.db
      .insert(rules)
      .values({
        userId: DEV_USER,
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
