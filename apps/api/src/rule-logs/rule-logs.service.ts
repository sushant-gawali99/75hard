import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { type SetRuleStateInput } from '@process/shared';
import { type Db } from '../db/client';
import { DRIZZLE } from '../db/db.module';
import { ruleLogs } from '../db/schema';

const DEV_USER = 'dev-user';

@Injectable()
export class RuleLogsService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  listByDate(date: string) {
    return this.db
      .select()
      .from(ruleLogs)
      .where(and(eq(ruleLogs.userId, DEV_USER), eq(ruleLogs.date, date)));
  }

  async set(input: SetRuleStateInput) {
    const [row] = await this.db
      .insert(ruleLogs)
      .values({ ruleId: input.ruleId, userId: DEV_USER, date: input.date, state: input.state })
      .onConflictDoUpdate({ target: [ruleLogs.ruleId, ruleLogs.date], set: { state: input.state } })
      .returning();
    return row;
  }
}
