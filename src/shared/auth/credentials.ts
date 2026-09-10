import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  // Do not trim passwords: spaces are part of the credential.
  password: z.string().min(12).max(128),
});

export type AuthState = { error?: string };
