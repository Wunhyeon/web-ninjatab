import { z } from "zod";
import { CreateTimerNotionInfoSchema } from "./CreateTimerNotionInfoSchema";

export const CreateTimerSchema = z.object({
  name: z.string().min(2, "It must be at least 2 characters long."),
  //   workTime: z.number().default(45),
  //   breakTime: z.number().default(10),
  //   alarmSound: z.string().optional(),
  //   alarmVolume: z.number().default(10).optional(),
  //   createTimerNotionInfo: CreateTimerNotionInfoSchema.optional(),
});

export type CreateTimerType = z.infer<typeof CreateTimerSchema>;
