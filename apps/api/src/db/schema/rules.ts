import { date, integer, pgTable, real, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

/** A daily process rule. */
export const rules = pgTable('rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  palette: text('palette').notNull().default('green'),
  target: real('target'),
  unit: text('unit'),
  frequency: text('frequency').notNull().default('daily'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** One rule's outcome on one day (done/skipped/missed). */
export const ruleLogs = pgTable(
  'rule_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ruleId: uuid('rule_id')
      .notNull()
      .references(() => rules.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    date: date('date').notNull(),
    state: text('state').notNull(),
  },
  (t) => [uniqueIndex('rule_logs_rule_id_date_uq').on(t.ruleId, t.date)],
);
