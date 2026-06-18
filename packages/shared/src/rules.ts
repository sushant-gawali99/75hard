import { z } from "zod";
import { RuleFrequency, RuleIconPalette, RuleState } from "./enums";

/** A daily process rule (e.g. "Drink 3L of water"). */
export const Rule = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80),
  icon: z.string().min(1), // Material Symbol name, e.g. "water_drop"
  palette: RuleIconPalette.default("green"),
  target: z.number().positive().optional(),
  unit: z.string().max(16).optional(),
  frequency: RuleFrequency.default("daily"),
  order: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});
export type Rule = z.infer<typeof Rule>;

/** One rule's outcome on one day. */
export const RuleLog = z.object({
  ruleId: z.string().uuid(),
  date: z.string().date(), // YYYY-MM-DD
  state: RuleState,
});
export type RuleLog = z.infer<typeof RuleLog>;

/** Per-rule streak summary. */
export const RuleStreak = z.object({
  ruleId: z.string().uuid(),
  current: z.number().int().nonnegative(),
  longest: z.number().int().nonnegative(),
});
export type RuleStreak = z.infer<typeof RuleStreak>;

// ---- DTOs ----
export const CreateRuleInput = Rule.pick({
  name: true,
  icon: true,
  palette: true,
  target: true,
  unit: true,
  frequency: true,
});
export type CreateRuleInput = z.infer<typeof CreateRuleInput>;

export const SetRuleStateInput = z.object({
  ruleId: z.string().uuid(),
  date: z.string().date(),
  state: RuleState,
});
export type SetRuleStateInput = z.infer<typeof SetRuleStateInput>;

/** Computed streak summary for the user. */
export const StreaksSummary = z.object({
  overall: z.object({
    current: z.number().int().nonnegative(),
    longest: z.number().int().nonnegative(),
    perfectDays: z.number().int().nonnegative(),
  }),
  rules: z.array(
    z.object({
      ruleId: z.string().uuid(),
      current: z.number().int().nonnegative(),
      longest: z.number().int().nonnegative(),
    }),
  ),
});
export type StreaksSummary = z.infer<typeof StreaksSummary>;

/** Per-day completion for a month (calendar heatmap). */
export const StreaksCalendar = z.object({
  days: z.array(z.object({ date: z.string().date(), pct: z.number().int().nonnegative() })),
});
export type StreaksCalendar = z.infer<typeof StreaksCalendar>;
