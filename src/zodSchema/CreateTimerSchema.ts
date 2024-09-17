import { z } from "zod";

export const CreateTimerSchema = z.object({
  name: z
    .string({ required_error: "Please Select" })
    .min(2, "It must be at least 2 characters long."),
  notionInfoId: z.string({ required_error: "Please Select" }),
  databaseId: z.string({ required_error: "Please Select" }),
  databaseName: z
    .string({ required_error: "Please Select" })
    .min(2, "It must be at least 2 characters long."),
});

export type CreateTimerType = z.infer<typeof CreateTimerSchema>;
