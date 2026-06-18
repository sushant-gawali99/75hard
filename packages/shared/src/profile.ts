import { z } from "zod";
import { ActivityLevel, Sex, WeightUnit } from "./enums";

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
