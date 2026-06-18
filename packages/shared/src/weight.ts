import { z } from "zod";
import { WeightUnit } from "./enums";

/** A stored weight measurement (canonical unit: kg). */
export const WeightEntry = z.object({
  id: z.string().uuid(),
  date: z.string().date(),
  valueKg: z.number().positive(),
  note: z.string().max(280).optional(),
});
export type WeightEntry = z.infer<typeof WeightEntry>;

/** Add-weight request (value given in the user's chosen unit; server normalizes to kg). */
export const AddWeightInput = z.object({
  date: z.string().date(),
  value: z.number().positive(),
  unit: WeightUnit,
  note: z.string().max(280).optional(),
});
export type AddWeightInput = z.infer<typeof AddWeightInput>;
