import { integer, pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/** A logged meal with aggregated nutrition totals + score. */
export const meals = pgTable('meals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // breakfast | lunch | dinner | snack
  eatenAt: timestamp('eaten_at', { withTimezone: true }).notNull(),
  photoKey: text('photo_key'),
  dishName: text('dish_name').notNull(),
  // totals
  kcal: real('kcal'),
  proteinG: real('protein_g'),
  carbsG: real('carbs_g'),
  fatG: real('fat_g'),
  fiberG: real('fiber_g'),
  sugarG: real('sugar_g'),
  sodiumMg: real('sodium_mg'),
  // score
  score: integer('score'),
  band: text('band'),
  rationale: text('rationale'),
  tip: text('tip'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** A single resolved food item within a meal. */
export const mealItems = pgTable('meal_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  mealId: uuid('meal_id')
    .notNull()
    .references(() => meals.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  fatsecretFoodId: text('fatsecret_food_id'),
  quantityGrams: real('quantity_grams').notNull(),
  kcal: real('kcal').notNull(),
  proteinG: real('protein_g').notNull(),
  carbsG: real('carbs_g').notNull(),
  fatG: real('fat_g').notNull(),
  fiberG: real('fiber_g'),
  sugarG: real('sugar_g'),
  sodiumMg: real('sodium_mg'),
  source: text('source').notNull(), // fatsecret | estimate
});
