import { z } from "zod";

export const memberTierSchema = z.union([
  z.literal("citizen"),
  z.literal("resident"),
  z.literal("founder"),
]);

export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  skills: z.array(z.string()),
  tier: memberTierSchema,
  joinedAtISO: z.string(),
});

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string(),
  startsAtISO: z.string(),
  capacity: z.number().int().positive(),
  booked: z.number().int().nonnegative(),
});

export const referralSchema = z.object({
  code: z.string(),
  createdAtISO: z.string(),
  invitedCount: z.number().int().nonnegative(),
});
