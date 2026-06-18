import { z } from "zod";

/** How often a rule must be followed. (weekly/custom may come later.) */
export const RuleFrequency = z.enum(["daily"]);
export type RuleFrequency = z.infer<typeof RuleFrequency>;

/** Daily state of a rule for a given day. */
export const RuleState = z.enum(["done", "skipped", "missed"]);
export type RuleState = z.infer<typeof RuleState>;

/** Icon-chip palette for a rule (maps to theme.ruleIconPalettes). */
export const RuleIconPalette = z.enum(["water", "green", "orange", "purple"]);
export type RuleIconPalette = z.infer<typeof RuleIconPalette>;

export const MealType = z.enum(["breakfast", "lunch", "dinner", "snack"]);
export type MealType = z.infer<typeof MealType>;

export const WeightUnit = z.enum(["kg", "lb"]);
export type WeightUnit = z.infer<typeof WeightUnit>;

export const Sex = z.enum(["male", "female"]);
export type Sex = z.infer<typeof Sex>;

export const ActivityLevel = z.enum(["sedentary", "light", "moderate", "very_active"]);
export type ActivityLevel = z.infer<typeof ActivityLevel>;

/** Nutrition-score colour band. */
export const ScoreBand = z.enum(["red", "amber", "green"]);
export type ScoreBand = z.infer<typeof ScoreBand>;

/** Confidence level for AI estimates. */
export const Confidence = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof Confidence>;
