import { z } from "zod";

export const UpdateTimerNameSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character long."),
});

export type UpdateTimerTimeType = z.infer<typeof UpdateTimerNameSchema>;
