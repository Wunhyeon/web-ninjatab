import { z } from "zod";

export const CreateTimerNotionInfoSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  workspaceId: z.string(),
  workspaceName: z.string(),
  databaseId: z.string(),
  databaseName: z.string(),
});

export type CreateTimerType = z.infer<typeof CreateTimerNotionInfoSchema>;
