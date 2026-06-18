import { z } from "zod";
import { Confidence, MealType, ScoreBand } from "./enums";

/** Claude vision structured output — one identified food item. */
export const MealVisionItem = z.object({
  name: z.string(),
  fatsecretQuery: z.string(),
  quantityGrams: z.number().positive(),
  quantityDisplay: z.string(),
  confidence: Confidence,
});
export type MealVisionItem = z.infer<typeof MealVisionItem>;

/** Claude vision structured output for a whole meal photo. */
export const MealVision = z.object({
  isFood: z.boolean(),
  dishName: z.string(),
  items: z.array(MealVisionItem),
  overallConfidence: Confidence,
  notes: z.string(),
});
export type MealVision = z.infer<typeof MealVision>;

/** Aggregated nutrient profile. */
export const Nutrients = z.object({
  kcal: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  fiberG: z.number().nonnegative().optional(),
  sugarG: z.number().nonnegative().optional(),
  sodiumMg: z.number().nonnegative().optional(),
});
export type Nutrients = z.infer<typeof Nutrients>;

/** A resolved food item with nutrition (after FatSecret lookup). */
export const MealItem = z.object({
  id: z.string().uuid(),
  name: z.string(),
  fatsecretFoodId: z.string().optional(),
  quantityGrams: z.number().positive(),
  nutrients: Nutrients,
  source: z.enum(["fatsecret", "estimate"]),
});
export type MealItem = z.infer<typeof MealItem>;

/** Deterministic 0–100 score + explanation + tip. */
export const MealScore = z.object({
  value: z.number().int().min(0).max(100),
  band: ScoreBand,
  rationale: z.string(),
  tip: z.string(),
});
export type MealScore = z.infer<typeof MealScore>;

/** A logged meal. */
export const Meal = z.object({
  id: z.string().uuid(),
  type: MealType,
  eatenAt: z.string().datetime(),
  photoKey: z.string().optional(),
  dishName: z.string(),
  items: z.array(MealItem),
  totals: Nutrients,
  score: MealScore,
});
export type Meal = z.infer<typeof Meal>;
