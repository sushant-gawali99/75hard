import { z } from "zod";
import { Confidence, MealType, ScoreBand } from "./enums";

/** Claude vision structured output — one identified food item (with fallback estimates). */
export const MealVisionItem = z.object({
  name: z.string(),
  fatsecretQuery: z.string(),
  quantityGrams: z.number().positive(),
  quantityDisplay: z.string(),
  confidence: Confidence,
  estKcal: z.number().nonnegative(),
  estProteinG: z.number().nonnegative(),
  estCarbsG: z.number().nonnegative(),
  estFatG: z.number().nonnegative(),
});
export type MealVisionItem = z.infer<typeof MealVisionItem>;

/** Claude vision structured output for a whole meal photo. */
export const MealVision = z.object({
  isFood: z.boolean(),
  dishName: z.string(),
  items: z.array(MealVisionItem),
  overallConfidence: Confidence,
  notes: z.string(),
  tip: z.string(),
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

/** Request to analyze a meal photo. */
export const AnalyzeMealInput = z.object({
  image: z.string().min(1), // base64 (no data: prefix)
  mealType: MealType.optional(),
  name: z.string().optional(),
});
export type AnalyzeMealInput = z.infer<typeof AnalyzeMealInput>;

/** One item in a save request. */
export const SaveMealItemInput = z.object({
  name: z.string(),
  quantityGrams: z.number().positive(),
  nutrients: Nutrients,
  source: z.enum(['fatsecret', 'estimate']),
});

/** Persist a (possibly user-edited) analyzed meal. */
export const SaveMealInput = z.object({
  type: MealType,
  dishName: z.string(),
  photoKey: z.string().optional(),
  items: z.array(SaveMealItemInput),
  totals: Nutrients,
  score: MealScore,
});
export type SaveMealInput = z.infer<typeof SaveMealInput>;

/** Draft analysis result returned to the client (not yet saved). */
export const MealAnalysis = z.object({
  isFood: z.boolean(),
  dishName: z.string(),
  notes: z.string(),
  items: z.array(MealItem),
  totals: Nutrients,
  score: MealScore,
});
export type MealAnalysis = z.infer<typeof MealAnalysis>;

const clamp = (x: number) => Math.max(0, Math.min(100, x));

/**
 * Deterministic 0–100 nutrition score from a meal's totals (+ optional per-meal calorie target).
 * Weights re-normalize over whatever data is present, so it works with partial nutrients.
 */
export function scoreMeal(t: Nutrients, mealKcalTarget?: number): { value: number; band: ScoreBand; rationale: string } {
  const kcal = Math.max(1, t.kcal);
  const comps: { w: number; s: number; label: string }[] = [];

  const proteinPer100 = (t.proteinG * 100) / kcal;
  comps.push({ w: 30, s: clamp((proteinPer100 / 7.5) * 100), label: 'protein' });

  const fatPct = ((t.fatG * 9) / kcal) * 100;
  const fatScore = fatPct <= 35 ? clamp(100 - Math.max(0, 20 - fatPct) * 2) : clamp(100 - (fatPct - 35) * 3);
  comps.push({ w: 15, s: fatScore, label: 'fat balance' });

  if (t.fiberG != null) comps.push({ w: 20, s: clamp((((t.fiberG * 1000) / kcal) / 14) * 100), label: 'fiber' });
  if (t.sugarG != null) comps.push({ w: 20, s: clamp(100 - Math.max(0, ((t.sugarG * 4) / kcal) * 100 - 10) * 4), label: 'sugar' });
  if (t.sodiumMg != null) comps.push({ w: 10, s: clamp(100 - Math.max(0, t.sodiumMg / kcal - 1) * 50), label: 'sodium' });
  if (mealKcalTarget && mealKcalTarget > 0) {
    comps.push({ w: 10, s: clamp(100 - (Math.abs(kcal - mealKcalTarget) / mealKcalTarget) * 100), label: 'calorie fit' });
  }

  const totalW = comps.reduce((a, c) => a + c.w, 0);
  const value = Math.round(comps.reduce((a, c) => a + c.s * c.w, 0) / totalW);
  const band: ScoreBand = value >= 75 ? 'green' : value >= 50 ? 'amber' : 'red';

  const sorted = [...comps].sort((a, b) => b.s - a.s);
  const best = sorted[0]!;
  const worst = sorted[sorted.length - 1]!;
  const rationale = worst.s < 60 ? `Strong ${best.label}, low on ${worst.label}.` : `Strong ${best.label}.`;
  return { value, band, rationale };
}
