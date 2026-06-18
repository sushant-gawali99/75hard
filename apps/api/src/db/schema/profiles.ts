import { boolean, date, integer, pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/** App-side user profile (identity lives in Better Auth's own tables, added later). */
export const profiles = pgTable('profiles', {
  userId: text('user_id').primaryKey(),
  unit: text('unit').notNull().default('kg'),
  sex: text('sex'),
  age: integer('age'),
  heightCm: real('height_cm'),
  activity: text('activity'),
  startWeightKg: real('start_weight_kg'),
  goalWeightKg: real('goal_weight_kg'),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Daily calorie + macro budget (derived from goal; user-overridable). */
export const nutritionTargets = pgTable('nutrition_targets', {
  userId: text('user_id').primaryKey(),
  kcal: integer('kcal').notNull(),
  proteinG: real('protein_g').notNull(),
  carbsG: real('carbs_g').notNull(),
  fatG: real('fat_g').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** A challenge (how many days the user commits to). */
export const challenges = pgTable('challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  days: integer('days').notNull(),
  startDate: date('start_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
