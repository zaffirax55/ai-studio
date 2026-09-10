"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/shared/db/client";
import { credentialsSchema, type AuthState } from "@/shared/auth/credentials";
import { hashPassword, verifyPassword } from "@/shared/auth/crypto";
import {
  createSession,
  deleteSession,
  getCurrentUser,
} from "@/shared/auth/session";
import { allowAuthAttempt } from "@/shared/auth/rate-limit";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";

async function authenticate(
  formData: FormData,
  register: boolean,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success)
    return {
      error: "Укажите корректный email и пароль длиной от 12 до 128 символов.",
    };
  const { email, password } = parsed.data;
  try {
    if (!(await allowAuthAttempt(email)))
      return { error: "Слишком много попыток. Попробуйте через 15 минут." };
    let userId: string;
    if (register) {
      const user = await getDb().user.create({
        data: { email, passwordHash: await hashPassword(password) },
        select: { id: true },
      });
      userId = user.id;
    } else {
      const user = await getDb().user.findUnique({
        where: { email },
        select: { id: true, passwordHash: true },
      });
      if (
        !(await verifyPassword(password, user?.passwordHash ?? null)) ||
        !user
      )
        return { error: "Неверный email или пароль." };
      userId = user.id;
    }
    await createSession(userId);
  } catch (error) {
    if (
      register &&
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        error:
          "Не удалось создать аккаунт. Если вы уже регистрировались, попробуйте войти.",
      };
    }
    // Never return database errors, credentials or connection strings to the client.
    return {
      error:
        "Сервис временно недоступен. Попробуйте позже. Если аккаунт уже создан, используйте вход.",
    };
  }
  redirect("/dashboard");
}

export async function register(_state: AuthState, formData: FormData) {
  return authenticate(formData, true);
}
export async function login(_state: AuthState, formData: FormData) {
  return authenticate(formData, false);
}
export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function createProject(formData: FormData) {
  const rawName = formData.get("name");
  const name = typeof rawName === "string" ? rawName.trim() : "";
  if (name.length < 2 || name.length > 80) return;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await getDb().project.create({ data: { name, userId: user.id } });
  redirect("/dashboard");
}

export async function renameProject(formData: FormData) {
  const id = formData.get("id");
  const rawName = formData.get("name");
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const user = await getCurrentUser();
  if (!user || typeof id !== "string" || name.length < 2 || name.length > 80)
    return;
  await getDb().project.updateMany({ where: { id, userId: user.id }, data: { name } });
  redirect(`/dashboard/${id}`);
}

export async function deleteProject(formData: FormData) {
  const id = formData.get("id");
  const user = await getCurrentUser();
  if (!user || typeof id !== "string") redirect("/dashboard");
  await getDb().project.deleteMany({ where: { id, userId: user.id } });
  redirect("/dashboard");
}

export async function uploadProjectAsset(formData: FormData) {
  const id = formData.get("projectId");
  const file = formData.get("file");
  const user = await getCurrentUser();
  if (!user || typeof id !== "string" || !(file instanceof File)) return;
  if (!file.type.startsWith("image/") || file.size === 0 || file.size > 10 * 1024 * 1024) return;
  const project = await getDb().project.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!project) return;
  const extension = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".bin";
  const fileName = `${randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", user.id, project.id);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));
  await getDb().projectAsset.create({ data: { projectId: project.id, originalName: file.name.slice(0, 255), fileName, mimeType: file.type, sizeBytes: file.size } });
  redirect(`/dashboard/${project.id}`);
}

export async function deleteProjectAsset(formData: FormData) {
  const assetId = formData.get("assetId");
  const user = await getCurrentUser();
  if (!user || typeof assetId !== "string") redirect("/dashboard");
  const asset = await getDb().projectAsset.findFirst({
    where: { id: assetId, project: { userId: user.id } },
    select: { id: true, fileName: true, projectId: true, project: { select: { id: true } } },
  });
  if (!asset) redirect("/dashboard");
  const filePath = path.join(process.cwd(), "public", "uploads", user.id, asset.projectId, asset.fileName);
  await unlink(filePath).catch(() => undefined);
  await getDb().projectAsset.delete({ where: { id: asset.id } });
  redirect(`/dashboard/${asset.project.id}`);
}

export async function saveProjectBrief(formData: FormData) {
  const id = formData.get("projectId");
  const user = await getCurrentUser();
  if (!user || typeof id !== "string") redirect("/dashboard");
  const values = {
    description: formData.get("description"),
    audience: formData.get("audience"),
    style: formData.get("style"),
  };
  const data = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === "string" ? value.trim().slice(0, 1000) || null : null]));
  await getDb().project.updateMany({ where: { id, userId: user.id }, data });
  redirect(`/dashboard/${id}`);
}
