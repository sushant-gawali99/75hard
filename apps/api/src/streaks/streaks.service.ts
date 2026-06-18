import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { type StreaksSummary } from '@process/shared';
import { type Db } from '../db/client';
import { DRIZZLE } from '../db/db.module';
import { ruleLogs, rules } from '../db/schema';

function addDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Consecutive done days ending today (or yesterday if today isn't done yet). */
function currentStreak(done: Set<string>, today: string): number {
  let cursor = done.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (done.has(cursor)) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

function longestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] === addDays(sorted[i - 1]!, 1) ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

@Injectable()
export class StreaksService {
  constructor(@Inject(DRIZZLE) private readonly db: Db) {}

  async summary(userId: string): Promise<StreaksSummary> {
    const [userRules, logs] = await Promise.all([
      this.db.select().from(rules).where(eq(rules.userId, userId)),
      this.db.select().from(ruleLogs).where(eq(ruleLogs.userId, userId)),
    ]);

    const today = new Date().toISOString().slice(0, 10);

    const ruleSummaries = userRules.map((r) => {
      const done = new Set(logs.filter((l) => l.ruleId === r.id && l.state === 'done').map((l) => l.date));
      return { ruleId: r.id, current: currentStreak(done, today), longest: longestStreak([...done]) };
    });

    // A "perfect" day = every current rule was done that day.
    const total = userRules.length;
    const doneCountByDate = new Map<string, number>();
    for (const l of logs) {
      if (l.state === 'done') doneCountByDate.set(l.date, (doneCountByDate.get(l.date) ?? 0) + 1);
    }
    const perfect = new Set(
      [...doneCountByDate.entries()].filter(([, c]) => total > 0 && c >= total).map(([d]) => d),
    );

    return {
      overall: {
        current: currentStreak(perfect, today),
        longest: longestStreak([...perfect]),
        perfectDays: perfect.size,
      },
      rules: ruleSummaries,
    };
  }

  /** Per-day completion % for a month (YYYY-MM). */
  async calendar(userId: string, month: string): Promise<{ days: { date: string; pct: number }[] }> {
    const [userRules, logs] = await Promise.all([
      this.db.select().from(rules).where(eq(rules.userId, userId)),
      this.db.select().from(ruleLogs).where(eq(ruleLogs.userId, userId)),
    ]);
    const total = userRules.length;
    const counts = new Map<string, number>();
    for (const l of logs) {
      if (l.state === 'done' && l.date.startsWith(month)) {
        counts.set(l.date, (counts.get(l.date) ?? 0) + 1);
      }
    }
    const days = [...counts.entries()].map(([date, c]) => ({
      date,
      pct: total > 0 ? Math.round((c / total) * 100) : 0,
    }));
    return { days };
  }
}
