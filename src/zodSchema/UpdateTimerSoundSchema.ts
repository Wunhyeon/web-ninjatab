import { z } from "zod";

export const UpdateTimerSoundSchema = z.object({
  alarmSoundId: z.string().nullable(), // 알람 id
  alarmSoundOn: z.boolean({}).default(true), // 기본적으로 알람소리 켜져있는 상태
  alarmSoundVolume: z.number().default(50),
  tickingSoundId: z.string().nullable(),
  tickingSoundOn: z.boolean().default(true),
  tickingSoundVolume: z.number().default(50),
});

export type UpdateTimerSoundType = z.infer<typeof UpdateTimerSoundSchema>;
