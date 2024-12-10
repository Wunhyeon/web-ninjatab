import { z } from "zod";

export const UpdateTimerTimeSchema = z.object({
  workTime: z.number().gte(1), // 최소 1보다 커야함.
  breakTime: z.number().gte(1), // 최소 1보다 커야함.
});

export type UpdateTimerTimeType = z.infer<typeof UpdateTimerTimeSchema>;
