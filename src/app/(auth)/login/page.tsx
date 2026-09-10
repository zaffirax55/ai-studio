import { AuthForm } from "@/shared/auth/auth-form";
export const metadata = { title: "Вход — Предмет" };
export default function LoginPage() {
  return (
    <>
      <p className="eyebrow">С возвращением</p>
      <h1>Вход в студию</h1>
      <AuthForm mode="login" />
    </>
  );
}
