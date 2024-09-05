import { z } from "zod";
import { CreateTimerNotionInfoSchema } from "./CreateTimerNotionInfoSchema";

export const NotionDatabaseInfoSchema = z.object({
  timerId: z.string(),
  notionInfoId: z.string(),
  databaseId: z.string(),
  databaseName: z.string(),
});

export type CreateTimerType = z.infer<typeof NotionDatabaseInfoSchema>;
