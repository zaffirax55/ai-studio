"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, register } from "@/app/auth-actions";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const signingUp = mode === "register";
  const [state, action, pending] = useActionState(
    signingUp ? register : login,
    {},
  );
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="auth-form" aria-busy={pending}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <label htmlFor="password">Пароль</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete={signingUp ? "new-password" : "current-password"}
        required
        minLength={12}
        maxLength={128}
        aria-describedby="password-hint"
      />
      <p id="password-hint" className="field-hint">
        От 12 до 128 символов. Можно использовать пробелы.
      </p>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Подождите…" : signingUp ? "Создать аккаунт" : "Войти"}
      </button>
      <p>
        {signingUp ? "Уже есть аккаунт? " : "Ещё нет аккаунта? "}
        <Link href={signingUp ? "/login" : "/register"}>
          {signingUp ? "Войти" : "Зарегистрироваться"}
        </Link>
      </p>
    </form>
  );
}
