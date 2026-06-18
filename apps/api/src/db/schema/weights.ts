import { date, pgTable, real, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

/** A weight measurement (canonical unit: kg). One entry per user per day. */
export const weights = pgTable(
  'weights',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    date: date('date').notNull(),
    valueKg: real('value_kg').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('weights_user_id_date_uq').on(t.userId, t.date)],
);
