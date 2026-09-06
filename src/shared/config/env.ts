import { z } from "zod";
export const envSchema = z.object({
  DATABASE_URL: z
    .url()
    .refine(
      (value) => /^postgres(ql)?:\/\//.test(value),
      "Требуется PostgreSQL URL",
    ),
  AI_PROVIDER: z.literal("mock").default("mock"),
});
export function parseEnv(input: Record<string, string | undefined>) {
  const parsed = envSchema.safeParse(input);
  if (!parsed.success) {
    const fields = [
      ...new Set(parsed.error.issues.map((issue) => issue.path.join("."))),
    ];
    throw new Error(
      `Проверьте переменные окружения: ${fields.join(", ")}. См. .env.example.`,
    );
  }
  return parsed.data;
}
