import { AuthForm } from "@/shared/auth/auth-form";
export const metadata = { title: "Регистрация — Предмет" };
export default function RegisterPage() {
  return (
    <>
      <p className="eyebrow">Ваше пространство</p>
      <h1>Создать аккаунт</h1>
      <p>Сохраните доступ к своему кабинету студии.</p>
      <AuthForm mode="register" />
    </>
  );
}
