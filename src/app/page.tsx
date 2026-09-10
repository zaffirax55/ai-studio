import Link from "next/link";
import { ru } from "@/shared/i18n/ru";
export default function Home() {
  return (
    <main className="shell">
      <header className="masthead">
        <Link href="/" className="brand" aria-label={ru.brand}>
          {ru.brand}
          <span> / studio</span>
        </Link>
        <nav className="auth-nav" aria-label="Аккаунт">
          <Link href="/login">Войти</Link>
          <Link className="button" href="/register">
            Создать аккаунт
          </Link>
          <Link href="/dashboard">Кабинет</Link>
        </nav>
      </header>
      <section className="workspace" aria-labelledby="studio-title">
        <p className="eyebrow">{ru.eyebrow}</p>
        <h1 id="studio-title">{ru.title}</h1>
        <p className="intro">{ru.description}</p>
        <div className="notice" role="status">
          <span className="dot" />
          {ru.notice}
        </div>
        <ol className="steps">
          {ru.steps.map((step, index) => (
            <li key={step.title}>
              <span className="step-number">0{index + 1}</span>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
      <footer>{ru.footer}</footer>
    </main>
  );
}
