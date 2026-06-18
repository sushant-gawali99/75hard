import { z } from "zod";
import { ActivityLevel, Sex, WeightUnit } from "./enums";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
};

/** Daily calorie + macro budget. */
export const NutritionTargets = z.object({
  kcal: z.number().int().positive(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
});
export type NutritionTargets = z.infer<typeof NutritionTargets>;

/** App-side user profile (separate from Better Auth identity tables). */
export const Profile = z.object({
  userId: z.string(),
  unit: WeightUnit.default("kg"),
  sex: Sex.optional(),
  age: z.number().int().min(13).max(120).optional(),
  heightCm: z.number().positive().optional(),
  activity: ActivityLevel.optional(),
  startWeightKg: z.number().positive().optional(),
  goalWeightKg: z.number().positive().optional(),
  onboardingCompleted: z.boolean().default(false),
});
export type Profile = z.infer<typeof Profile>;

/** Challenge configuration. */
export const Challenge = z.object({
  id: z.string().uuid(),
  days: z.number().int().min(1).max(365),
  startDate: z.string().date(),
});
export type Challenge = z.infer<typeof Challenge>;

export const CreateChallengeInput = z.object({ days: z.number().int().min(1).max(365) });
export type CreateChallengeInput = z.infer<typeof CreateChallengeInput>;

/** Profile fields a client may set (e.g. during onboarding). */
export const UpsertProfileInput = z.object({
  unit: WeightUnit.optional(),
  sex: Sex.optional(),
  age: z.number().int().min(13).max(120).optional(),
  heightCm: z.number().positive().optional(),
  activity: ActivityLevel.optional(),
  startWeightKg: z.number().positive().optional(),
  goalWeightKg: z.number().positive().optional(),
  onboardingCompleted: z.boolean().optional(),
});
export type UpsertProfileInput = z.infer<typeof UpsertProfileInput>;

/** Mifflin-St Jeor BMR -> TDEE -> deficit + macro split. Returns null if data is incomplete. */
export function deriveNutritionTargets(p: {
  sex?: Sex;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  goalWeightKg?: number;
  activity?: ActivityLevel;
}): NutritionTargets | null {
  if (!p.sex || !p.age || !p.heightCm || !p.weightKg || !p.activity) return null;
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === "male" ? 5 : -161);
  const tdee = bmr * ACTIVITY_FACTORS[p.activity];
  const losing = p.goalWeightKg !== undefined && p.goalWeightKg < p.weightKg;
  const floor = p.sex === "male" ? 1500 : 1200;
  const kcal = Math.max(floor, Math.round(losing ? tdee - 500 : tdee));
  const proteinG = Math.round(1.8 * p.weightKg);
  const fatG = Math.round(0.8 * p.weightKg);
  const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));
  return { kcal, proteinG, carbsG, fatG };
}
