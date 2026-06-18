import { z } from "zod";

/** A daily reflection: optional mood (0-4) and free-text note. One per user per day. */
export const Checkin = z.object({
  date: z.string().date(),
  mood: z.number().int().min(0).max(4).nullable(),
  note: z.string().max(2000).nullable(),
});
export type Checkin = z.infer<typeof Checkin>;

export const UpsertCheckinInput = z.object({
  date: z.string().date(),
  mood: z.number().int().min(0).max(4).nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
});
export type UpsertCheckinInput = z.infer<typeof UpsertCheckinInput>;
